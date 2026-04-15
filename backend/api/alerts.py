# backend/api/alerts.py
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

# Assume these are correctly imported from your core and models folders
from models.database import get_db, Alert, Transaction, Customer, User
from core.security import get_current_user  # Your JWT verification dependency
from core.risk_engine import run_risk_rules # The 3-rule logic function
from services.assignment import assign_alert_round_robin

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/{alert_id}")
def get_alert_detail(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    INVESTIGATION FETCH: 
    Returns the alert details, customer profile, and full transaction history.
    """
    # 1. Fetch case details
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert ID {alert_id} not found in intelligence database.")

    # 2. Fetch associated customer KYC
    customer = db.query(Customer).filter(Customer.customer_id == alert.customer_id).first()
    
    # 3. Fetch linked transaction network (for the visualization)
    transactions = db.query(Transaction).filter(Transaction.customer_id == alert.customer_id).all()
    
    # Return structured data for the InvestigationHub
    return {
        "alert": alert,
        "customer": customer,
        "transactions": transactions
    }

@router.get("/", status_code=status.HTTP_200_OK)
def get_analyst_queue(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """
    RBAC ENFORCED: Fetches ONLY the alerts assigned to the logged-in analyst.
    """
    if current_user["role"] != "Analyst":
        raise HTTPException(status_code=403, detail="Only Analysts can view this queue.")
        
    alerts = db.query(Alert).filter(
        Alert.assigned_analyst_id == current_user["sub"],
        Alert.status.in_(["ASSIGNED", "DRAFTING", "UNDER_REVIEW"])
    ).all()
    
    return alerts

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_transactions_csv(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    INGESTION LAYER: Parses CSV, saves transactions, and triggers the Risk Engine.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    try:
        # 1. Read and Parse the CSV with BOM handling (Excel standard)
        contents = await file.read()
        try:
            decoded_content = contents.decode('utf-8-sig') # Standard and handles BOM
        except UnicodeDecodeError:
            decoded_content = contents.decode('latin-1') # Fallback for legacy files
            
        csv_reader = csv.DictReader(io.StringIO(decoded_content))
        
        new_transactions = []
        for line_num, row in enumerate(csv_reader, start=1):
            try:
                # Defensive check for required columns
                required_cols = ['customer_id', 'tx_date', 'amount_inr', 'tx_type', 'channel']
                missing_cols = [col for col in required_cols if col not in row]
                if missing_cols:
                    raise KeyError(f"Missing columns: {', '.join(missing_cols)}")

                tx = Transaction(
                    customer_id=int(row['customer_id']),
                    tx_date=datetime.fromisoformat(row['tx_date'].strip()),
                    amount_inr=float(row['amount_inr']),
                    tx_type=row['tx_type'].strip(),
                    channel=row['channel'].strip(),
                    # Capture optional intelligence fields if present
                    counterparty_location=row.get('counterparty_location', '').strip() or None,
                    counterparty_name=row.get('counterparty_name', '').strip() or None,
                    tx_description=row.get('tx_description', '').strip() or None
                )
                new_transactions.append(tx)
                db.add(tx)
            except (ValueError, KeyError) as row_err:
                raise ValueError(f"Row {line_num} error: {str(row_err)}")
        
        if not new_transactions:
             raise ValueError("The uploaded CSV is empty or contains no valid rows.")

        db.commit() # Save transactions to the 'Truth' layer

        # 2. Trigger the Risk Engine
        new_alert_ids = run_risk_rules(db, new_transactions)

        # 3. Trigger Round-Robin Assignment
        assigned_count = 0
        for alert_id in new_alert_ids:
            assign_alert_round_robin(db, alert_id)
            assigned_count += 1

        return {
            "status": "success",
            "message": f"Successfully processed {len(new_transactions)} transactions.",
            "alerts_generated": assigned_count
        }

    except ValueError as val_err:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        db.rollback()
        # Log the full error to terminal but return a clean 400 to user
        print(f"CRITICAL UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Data ingestion failed: {str(e)}")
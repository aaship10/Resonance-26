# backend/api/alerts.py
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from models.database import get_db, Alert, Transaction, Customer # Added Customer
from core.security import get_current_user
from core.risk_engine import run_risk_rules
from services.assignment import assign_alert_round_robin
from models.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

# ==========================================
# 1. MAKER-CHECKER QUEUE ROUTING
# ==========================================

@router.get("/analyst", response_model=List[AlertResponse])
def get_analyst_queue(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "Analyst":
        raise HTTPException(status_code=403, detail="Only Analysts can view this queue.")
    return db.query(Alert).filter(
        Alert.assigned_analyst_id == current_user.get("sub"),
        Alert.status.in_(["PENDING_ASSIGNMENT", "ASSIGNED", "DRAFTING"])
    ).order_by(Alert.created_at.desc()).all()

@router.get("/approver", response_model=List[AlertResponse])
def get_approver_queue(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "Approver":
        raise HTTPException(status_code=403, detail="Only Approvers can view the review queue.")
    
    # Only return cases waiting for a decision. FILED cases are now moved to Archive.
    return db.query(Alert).filter(
        Alert.status == "UNDER_REVIEW"
    ).order_by(Alert.created_at.desc()).all()

@router.get("/archive", response_model=List[AlertResponse])
def get_archive_queue(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """
    HISTORICAL VAULT: Returns only cases that have been officially filed.
    """
    # Both Analysts and Approvers can usually view the archive for historical context
    return db.query(Alert).filter(
        Alert.status == "FILED"
    ).order_by(Alert.created_at.desc()).all()


# ==========================================
# 2. DATA INGESTION & RISK ENGINE
# ==========================================

@router.post("/run-engine", status_code=status.HTTP_201_CREATED)
def trigger_global_scan(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """ADMIN UTILITY: Scans all transactions and generates alerts."""
    if current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can trigger a global scan.")
    
    all_txs = db.query(Transaction).all()
    if not all_txs:
        return {"message": "No transactions found in database."}

    new_alert_ids = run_risk_rules(db, all_txs)
    for alert_id in new_alert_ids:
        assign_alert_round_robin(db, alert_id)
        
    return {"message": f"Scan complete. {len(new_alert_ids)} alerts generated."}

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_transactions_csv(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    UNIFIED INGESTION: Parses CSV, creates Customer if missing, and saves Transactions.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    try:
        contents = await file.read()
        decoded_content = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded_content))
        
        new_transactions = []
        for row in csv_reader:
            cust_id = int(row['customer_id'])
            
            # --- START KYC LOGIC ---
            # Check if customer exists; if not, create them using the extra CSV columns
            customer = db.query(Customer).filter(Customer.customer_id == cust_id).first()
            if not customer:
                customer = Customer(
                    customer_id=cust_id,
                    full_name=row['full_name'],
                    account_number=row['account_number'],
                    account_type=row['account_type'],
                    expected_monthly_income=float(row['expected_income']),
                    risk_category=row['risk_category']
                )
                db.add(customer)
                db.flush() # Send to DB so Transaction foreign key works immediately
            # --- END KYC LOGIC ---

            tx = Transaction(
                customer_id=cust_id,
                tx_date=datetime.fromisoformat(row['tx_date']),
                amount_inr=float(row['amount_inr']),
                tx_type=row['tx_type'],
                channel=row['channel']
            )
            new_transactions.append(tx)
            db.add(tx)
        
        db.commit() 

        # Trigger Risk Engine & Assignment
        new_alert_ids = run_risk_rules(db, new_transactions)
        for alert_id in new_alert_ids:
            assign_alert_round_robin(db, alert_id)

        return {"message": f"Processed {len(new_transactions)} rows.", "alerts_generated": len(new_alert_ids)}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Data ingestion failed: {str(e)}")

# ==========================================
# 3. NARRATIVE EDITOR SUPPORT ENDPOINTS
# ==========================================

@router.get("/{alert_id}")
def get_alert_details(alert_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return alert

@router.post("/{alert_id}/file")
def approve_and_file_sar(alert_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "Approver":
        raise HTTPException(status_code=403, detail="Only Approvers can file SARs.")
        
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
        
    alert.status = "FILED"
    db.commit()
    return {"message": "SAR successfully filed."}
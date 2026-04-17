# backend/api/generation.py
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

# DB & Security Imports
from models.database import get_db, Alert, Customer, Transaction
from core.security import get_current_user

# AI / Core Engine Imports
from core.retrieval import retrieve_context
from core.generator import generate_sar_report
from core.config import LLM_MODEL_NAME

# Schemas
from models.schemas import SAROutput, AuditRecord

router = APIRouter(prefix="/generate", tags=["SAR Generation"])

@router.post("/{alert_id}", response_model=SAROutput)
async def generate_sar_for_alert(
    alert_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 1. SECURITY & ASSIGNMENT CHECK
    if current_user["role"] != "Analyst":
        raise HTTPException(status_code=403, detail="Only Analysts can draft SARs.")
        
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
        
    if alert.assigned_analyst_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="You are not assigned to this case.")

    try:
        # 2. RELATIONAL DATA FETCH
        customer = db.query(Customer).filter(Customer.customer_id == alert.customer_id).first()
        transactions = db.query(Transaction).filter(Transaction.customer_id == alert.customer_id).all()
        
        # --- ENRICHED DATA FORMATTING FOR THE MASTER PROMPT ---
        
        # Format Customer Profile
        customer_str = (
            f"Full Name: {customer.full_name}\n"
            f"Account Number: {customer.account_number}\n"
            f"Account Type: {customer.account_type}\n"
            f"Date of Birth: {customer.dob}\n"
            f"Address: {customer.physical_address}\n"
            f"Phone: {customer.phone_number} | Email: {customer.email}\n"
            f"Tax ID / PAN: {customer.tax_id_pan}\n"
            f"Nationality: {customer.nationality}\n"
            f"Occupation: {customer.occupation}\n"
            f"Expected Monthly Income: INR {customer.expected_monthly_income}\n"
            f"Risk Category: {customer.risk_category}\n"
            f"Account Opened: {customer.account_opening_date}"
        )
        
        # Format Transactions (Now including Branch and Counterparties!)
        tx_str = "\n".join([
            f"TxID: {tx.tx_id} | Date: {tx.tx_date.strftime('%Y-%m-%d %H:%M:%S')} | "
            f"Amount: INR {tx.amount_inr} | Type: {tx.tx_type} | Channel: {tx.channel} | "
            f"Branch: {tx.branch_name or 'N/A'} | "
            f"Counterparty: {tx.counterparty_name or 'N/A'} (A/c: {tx.counterparty_acc_no or 'N/A'}, "
            f"Bank: {tx.counterparty_bank_name or 'N/A'}, Loc: {tx.counterparty_location or 'N/A'}) | "
            f"Desc: {tx.tx_description or 'N/A'}"
            for tx in transactions
        ])

        # Format Rule Engine Output
        engine_str = (
            f"Alert Type: {alert.alert_type}\n"
            f"Triggered Rules: {alert.alert_reasons}\n"
            f"Display Risk Score: {alert.risk_score}\n"
            f"Raw Risk Score: {alert.raw_risk_score}\n"
            f"Confidence Level: {alert.confidence_level}"
        )

        # 3. VECTOR SEARCH (RAG)
        search_query = f"Pattern: {alert.alert_type} | Rules: {alert.alert_reasons}"
        legal_context_raw, audit_trail_raw = retrieve_context(search_query)

        # --- NEW: ASSIGN IDs TO LAWS SO THE LLM CAN CITE THEM ---
        # We format the legal text so the LLM explicitly sees [ID: LAW-1], [ID: LAW-2], etc.
        formatted_legal_context = "REGULATORY/LEGAL CONTEXT:\n"
        for i, doc in enumerate(audit_trail_raw):
            formatted_legal_context += f"[ID: LAW-{i+1}] {doc.get('source_name', 'Doc')}: {doc.get('snippet', '')}\n"

        # 4. LLM GENERATION
        sar_draft = generate_sar_report(
            customer_data=customer_str,
            transaction_data=tx_str,
            engine_output=engine_str,
            legal_context=formatted_legal_context, # Pass the formatted context with IDs
            analyst_id=current_user["sub"]
        )

        # --- NEW: ASSEMBLE THE INTERACTIVE AUDIT TRAIL ---
        # We build the exact array your React frontend needs for the clickable sidebar
        interactive_audit_trail = [
            {
                "ref_id": "TXN",
                "type": "database",
                "source_name": "NeonDB - Transactions Table",
                "section": "Ledger Data",  # <--- ADDED REQUIRED FIELD
                "snippet": f"Analyzed {len(transactions)} transaction records."
            },
            {
                "ref_id": "CUST",
                "type": "database",
                "source_name": "NeonDB - Customer KYC",
                "section": "Profile Data", # <--- ADDED REQUIRED FIELD
                "snippet": f"Subject Profile: {customer.risk_category} Risk. Occupation: {customer.occupation}."
            },
            {
                "ref_id": "ENGINE",
                "type": "database",
                "source_name": "Sentinel Risk Engine",
                "section": "AI Alert Metadata", # <--- ADDED REQUIRED FIELD
                "snippet": f"Score: {alert.risk_score} | Flags: {alert.alert_reasons}"
            }
        ]

        # Add the ChromaDB laws into the interactive trail with matching REF IDs
        for i, doc in enumerate(audit_trail_raw):
            interactive_audit_trail.append({
                "ref_id": f"LAW-{i+1}",
                "type": "regulatory",
                "source_name": doc.get("source_name", "Compliance Document"),
                "section": doc.get("section", "General"),
                "snippet": doc.get("snippet", "No snippet available.")
            })

        # 5. SAVE DRAFT TO DATABASE
        alert.sar_narrative = sar_draft
        alert.audit_trail_json = json.dumps(interactive_audit_trail) # Save our new interactive array
        alert.status = "DRAFTING"
        db.commit()

        # 6. RETURN PAYLOAD TO FRONTEND
        return SAROutput(
            case_id=alert.case_id,
            generated_at=datetime.now(timezone.utc).isoformat() + "Z",
            model_used=LLM_MODEL_NAME,
            sar_narrative=sar_draft,
            audit_trail=interactive_audit_trail # Send directly to frontend
        )

    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR IN SAR GEN: {str(e)}")
        raise HTTPException(status_code=500, detail="AI Generation pipeline failed.")


@router.post("/{alert_id}/submit", status_code=status.HTTP_200_OK)
def submit_for_approval(
    alert_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert or alert.assigned_analyst_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Unauthorized action.")
    if not alert.sar_narrative:
        raise HTTPException(status_code=400, detail="Cannot submit an empty draft. Generate SAR first.")

    alert.status = "UNDER_REVIEW"
    db.commit()
    return {"message": "Case successfully submitted to the Approver queue."}
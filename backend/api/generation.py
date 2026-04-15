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

# Schemas (Assuming you have a SAROutput schema in models.schemas)
from models.schemas import SAROutput, AuditRecord

router = APIRouter(prefix="/generate", tags=["SAR Generation"])

@router.post("/{alert_id}", response_model=SAROutput)
async def generate_sar_for_alert(
    alert_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    RAG INTELLIGENCE LAYER: 
    Takes an Alert ID, fetches relational DB context, retrieves laws, and drafts a SAR.
    """
    # 1. SECURITY & ASSIGNMENT CHECK
    if current_user["role"] != "Analyst":
        raise HTTPException(status_code=403, detail="Only Analysts can draft SARs.")
        
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
        
    if alert.assigned_analyst_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="You are not assigned to this case.")

    try:
        # 2. RELATIONAL DATA FETCH (The "Bank-POV" approach)
        # Instead of the frontend sending data, we pull the "Truth" directly from NeonDB
        customer = db.query(Customer).filter(Customer.customer_id == alert.customer_id).first()
        transactions = db.query(Transaction).filter(Transaction.customer_id == alert.customer_id).all()
        
        # Format the DB data for the LLM prompt
        customer_str = f"Name: {customer.full_name}, Acc: {customer.account_number}, " \
                       f"Type: {customer.account_type}, Income: {customer.expected_monthly_income}"
        
        tx_str = "\n".join([
            f"Date: {tx.tx_date.date()} | Type: {tx.tx_type} | Channel: {tx.channel} | Amount: INR {tx.amount_inr}" 
            for tx in transactions
        ])

        # 3. VECTOR SEARCH (RAG)
        search_query = f"Pattern: {alert.alert_type} | Velocity: High | Context: {customer.account_type} account"
        legal_context, audit_trail_raw = retrieve_context(search_query)

        # 4. LLM GENERATION (Llama 3.3 via Groq)
        sar_draft = generate_sar_report(
            customer_data=customer_str,
            account_data=f"Risk Category: {customer.risk_category}",
            transaction_data=tx_str,
            legal_context=legal_context,
            case_notes=f"System generated alert. Score: {alert.risk_score}. Type: {alert.alert_type}",
            analyst_role="REVIEWER"
        )

        # 5. SAVE DRAFT TO DATABASE
        # We update the Alert row so the Approver can eventually see it
        alert.sar_narrative = sar_draft
        alert.audit_trail_json = json.dumps(audit_trail_raw)
        alert.status = "DRAFTING"
        db.commit()

        # 6. RETURN PAYLOAD TO FRONTEND
        formatted_audit = [AuditRecord(**record) for record in audit_trail_raw]
        return SAROutput(
            case_id=alert.case_id,
            generated_at=datetime.now(timezone.utc).isoformat() + "Z",
            model_used=LLM_MODEL_NAME,
            sar_narrative=sar_draft,
            audit_trail=formatted_audit
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
    """
    MAKER-CHECKER HANDOVER: 
    Moves the drafted SAR from the Analyst's queue to the Approver's queue.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert or alert.assigned_analyst_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Unauthorized action.")
        
    if not alert.sar_narrative:
        raise HTTPException(status_code=400, detail="Cannot submit an empty draft. Generate SAR first.")

    # Execute the workflow handover
    alert.status = "UNDER_REVIEW"
    db.commit()
    
    return {"message": "Case successfully submitted to the Approver queue."}
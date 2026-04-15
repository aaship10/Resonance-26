# backend/core/risk_engine.py
import uuid
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session

# Import our database models
from models.database import Customer, Transaction, Alert

# --- RISK THRESHOLDS (Configurable by Admin) ---
STRUCTURING_LOWER_BOUND = 45000.0  # Just under the 50k INR PAN card reporting limit
STRUCTURING_UPPER_BOUND = 49999.0
INCOME_VARIANCE_MULTIPLIER = 3.0   # Flag if spending is 300% of stated income
HIGH_RISK_LOCATIONS = ["Cayman Islands", "Panama", "Switzerland", "Syria", "North Korea"]

def generate_case_id() -> str:
    """Generates a professional, bank-style Case ID."""
    prefix = datetime.now().strftime("%Y%m%d")
    suffix = str(uuid.uuid4())[:6].upper()
    return f"SAR-{prefix}-{suffix}"

def run_risk_rules(db: Session, new_transactions: List[Transaction]) -> List[int]:
    """
    THE WATCHMAN ALGORITHM:
    Evaluates a batch of new transactions against static AML rules.
    If a customer breaches the threshold (Score >= 75), an Alert is generated.
    Returns a list of newly created Alert IDs for assignment.
    """
    if not new_transactions:
        return []

    # 1. Group transactions by Customer to evaluate behavior holistically
    tx_by_customer: Dict[int, List[Transaction]] = {}
    for tx in new_transactions:
        if tx.customer_id not in tx_by_customer:
            tx_by_customer[tx.customer_id] = []
        tx_by_customer[tx.customer_id].append(tx)

    generated_alert_ids = []

    # 2. Evaluate rules per customer
    for customer_id, transactions in tx_by_customer.items():
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer:
            continue # Skip if KYC data is missing (shouldn't happen in a clean DB)

        risk_score = 0
        trigger_reasons = []
        
        # --- RULE 1: INCOME VARIANCE (Velocity / Placement) ---
        total_tx_volume = sum(tx.amount_inr for tx in transactions)
        expected_income = customer.expected_monthly_income or 10000.0 # Fallback
        
        if total_tx_volume > (expected_income * INCOME_VARIANCE_MULTIPLIER):
            risk_score += 45
            trigger_reasons.append("High Income Variance")

        # --- RULE 2: STRUCTURING (Smurfing / Cash Placement) ---
        structuring_count = sum(
            1 for tx in transactions 
            if tx.channel and tx.channel.upper() == "CASH" 
            and STRUCTURING_LOWER_BOUND <= tx.amount_inr <= STRUCTURING_UPPER_BOUND
        )
        if structuring_count >= 2:
            risk_score += 50
            trigger_reasons.append("Structuring Pattern Detected")

        # --- RULE 3: HIGH-RISK GEOGRAPHY (Cross-Border Risk) ---
        has_high_risk_geo = any(
            tx.counterparty_location in HIGH_RISK_LOCATIONS 
            for tx in transactions if tx.counterparty_location
        )
        if has_high_risk_geo:
            risk_score += 35
            trigger_reasons.append("High-Risk Jurisdiction")

        # --- EVALUATION & ALERT CREATION ---
        # Cap the score at 100
        final_score = min(risk_score, 100)

        # Threshold check: Does this require human investigation?
        if final_score >= 75:
            # Determine primary alert type for the dashboard
            primary_type = trigger_reasons[0] if trigger_reasons else "Anomalous Activity"
            if len(trigger_reasons) > 1:
                primary_type = "Multiple AML Violations"

            # Create the Alert Record
            new_alert = Alert(
                case_id=generate_case_id(),
                customer_id=customer.customer_id,
                risk_score=final_score,
                alert_type=primary_type,
                status="PENDING_ASSIGNMENT" # Ready for Round-Robin
            )
            db.add(new_alert)
            db.commit() # Save to get the new_alert.id
            db.refresh(new_alert)
            
            generated_alert_ids.append(new_alert.id)

    return generated_alert_ids
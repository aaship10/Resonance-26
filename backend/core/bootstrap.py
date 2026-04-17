# backend/core/bootstrap.py
from sqlalchemy import text
from models.database import SessionLocal, Transaction, Alert
from core.risk_engine import run_risk_rules
from services.assignment import assign_alert_round_robin

def run_system_startup_sequence():
    db = SessionLocal()
    try:
        # 1. Check DB Connection
        db.execute(text("SELECT 1"))
        print("✅ STARTUP: Database Connection Verified.")

        # 2. Fetch Transactions from the 'Truth' Layer
        all_txs = db.query(Transaction).all()
        if not all_txs:
            print("ℹ️ STARTUP: Transaction table is empty. Skipping scan.")
            return

        print(f"🔍 STARTUP: Scanning {len(all_txs)} transactions for suspicious patterns...")

        # 3. Trigger Risk Engine
        # This calls your core/risk_engine.py logic
        new_alert_ids = run_risk_rules(db, all_txs)

        if not new_alert_ids:
            print("✅ STARTUP: No new alerts detected in existing data.")
            return

        # 4. Automated Round-Robin Assignment
        # This ensures Analysts have work waiting for them immediately
        for alert_id in new_alert_ids:
            assign_alert_round_robin(db, alert_id)

        print(f"🚀 STARTUP: {len(new_alert_ids)} Alerts generated and assigned via Round-Robin.")

    except Exception as e:
        print(f"❌ STARTUP CRITICAL ERROR: {str(e)}")
    finally:
        db.close()
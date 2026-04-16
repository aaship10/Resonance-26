# backend/services/assignment.py
from sqlalchemy.orm import Session
from sqlalchemy import func

# Import our database models
from models.database import User, Alert

def assign_alert_round_robin(db: Session, alert_id: int) -> str:
    """
    WORKFORCE ROUTING ALGORITHM:
    Finds the Analyst with the lightest current workload and assigns the new alert to them.
    Returns the employee_id of the assigned analyst.
    """
    # 1. Fetch the alert to ensure it exists and needs assignment
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return "ERROR: Alert not found"
        
    if alert.status != "PENDING_ASSIGNMENT":
        return f"IGNORED: Alert is already in status: {alert.status}"

    # 2. Fetch all employees who are officially 'Analysts'
    analysts = db.query(User).filter(User.role == "Analyst").all()
    
    # Fail-safe: If the bank has no analysts registered yet
    if not analysts:
        print("WARNING: No Analysts found in the system. Alert remains PENDING.")
        return "UNASSIGNED"

    # 3. The "Smart" Load Balancing Logic
    # We iterate through the analysts and count how many active cases they have.
    # Active cases are anything NOT 'FILED'.
    best_analyst = None
    lowest_case_count = float('inf')

    for analyst in analysts:
        active_count = db.query(Alert).filter(
            Alert.assigned_analyst_id == analyst.employee_id,
            Alert.status.in_(["ASSIGNED", "DRAFTING", "UNDER_REVIEW"])
        ).count()

        if active_count < lowest_case_count:
            lowest_case_count = active_count
            best_analyst = analyst

    # 4. Assign the case to the winning analyst
    if best_analyst:
        alert.assigned_analyst_id = best_analyst.employee_id
        alert.status = "ASSIGNED"
        db.commit()
        
        print(f"--> ROUTING: Alert {alert.case_id} assigned to {best_analyst.employee_id} (Active Cases: {lowest_case_count})")
        return best_analyst.employee_id
        
    return "UNASSIGNED"
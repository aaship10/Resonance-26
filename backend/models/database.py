# backend/models/database.py
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Date, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Import your database URL from your centralized config
from core.config import SQLALCHEMY_DATABASE_URL

# --- 1. CONNECTION SETUP ---
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency to yield a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 2. THE IDENTITY LAYER (Employees) ---
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(50), default="Analyst") # Roles: Analyst, Approver, Admin
    hashed_password = Column(String, nullable=False)

    # Relationships
    assigned_alerts = relationship("Alert", foreign_keys="Alert.assigned_analyst_id", back_populates="analyst")
    approved_alerts = relationship("Alert", foreign_keys="Alert.approver_id", back_populates="approver")


# --- 3. THE KYC LAYER (Customers) ---
class Customer(Base):
    __tablename__ = "customers"
    
    customer_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100))
    account_number = Column(String(20), unique=True, index=True)
    account_type = Column(String(20))          # Savings, Current, NRI
    dob = Column(Date, nullable=True)
    physical_address = Column(Text, nullable=True)
    phone_number = Column(String(15), nullable=True)
    email = Column(String(100), nullable=True)
    tax_id_pan = Column(String(20), nullable=True)
    nationality = Column(String(50), nullable=True)
    occupation = Column(String(100), nullable=True)
    expected_monthly_income = Column(Float, nullable=True) # CRITICAL for Risk Engine thresholds
    risk_category = Column(String(10), default="Low")      # Low, Medium, High
    account_opening_date = Column(Date, nullable=True)

    # Relationships
    transactions = relationship("Transaction", back_populates="customer")
    alerts = relationship("Alert", back_populates="customer")


# --- 4. THE BEHAVIOR LAYER (Transactions) ---
class Transaction(Base):
    __tablename__ = "transactions"
    
    tx_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), index=True)
    
    tx_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    amount_inr = Column(Float, nullable=False)
    tx_type = Column(String(10))               # CREDIT / DEBIT
    channel = Column(String(20))               # UPI, IMPS, CASH, CRYPTO
    
    # Counterparty details for cross-border/branch logic
    branch_name = Column(String(100), nullable=True)
    counterparty_name = Column(String(100), nullable=True)
    counterparty_acc_no = Column(String(20), nullable=True)
    counterparty_bank_name = Column(String(100), nullable=True)
    counterparty_location = Column(String(50), nullable=True)
    tx_description = Column(Text, nullable=True)

    # Relationship
    customer = relationship("Customer", back_populates="transactions")


# --- 5. THE CASE MANAGEMENT LAYER (Alerts & SARs) ---
class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(50), unique=True, index=True, nullable=False) # e.g., SAR-20261012-A8B9
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    
    # AI Risk Engine outputs
    risk_score = Column(Integer, nullable=False)
    alert_type = Column(String(100), nullable=False)
    
    # Status Workflow: PENDING_ASSIGNMENT -> ASSIGNED -> DRAFTING -> UNDER_REVIEW -> FILED
    status = Column(String(50), default="PENDING_ASSIGNMENT") 
    
    # Workflow Roles (Maker-Checker) linked back to Users table
    assigned_analyst_id = Column(String(50), ForeignKey("users.employee_id"), nullable=True)
    approver_id = Column(String(50), ForeignKey("users.employee_id"), nullable=True)
    
    # AI Generative Payload (RAG Output)
    sar_narrative = Column(Text, nullable=True)
    audit_trail_json = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    customer = relationship("Customer", back_populates="alerts")
    analyst = relationship("User", foreign_keys=[assigned_analyst_id], back_populates="assigned_alerts")
    approver = relationship("User", foreign_keys=[approver_id], back_populates="approved_alerts")

# --- Initialize Database ---
# When this file is imported, it automatically creates any missing tables in NeonDB safely.
Base.metadata.create_all(bind=engine)
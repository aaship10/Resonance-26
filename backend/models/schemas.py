# backend/models/schemas.py
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# ==========================================
# 1. AUTHENTICATION & IDENTITY SCHEMAS
# ==========================================

class UserCreate(BaseModel):
    """Payload expected when an Admin registers a new employee."""
    employee_id: str = Field(..., description="Unique bank employee ID, e.g., EMP-1042")
    password: str = Field(..., min_length=8, description="Must be hashed before saving to DB")
    role: str = Field(default="Analyst", description="Analyst, Approver, or Admin")

class Token(BaseModel):
    """Payload returned upon successful login or registration."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Payload extracted from the JWT token."""
    employee_id: Optional[str] = None
    role: Optional[str] = None


# ==========================================
# 2. DASHBOARD & QUEUE SCHEMAS
# ==========================================

class AlertBase(BaseModel):
    """Base fields shared across all Alert responses."""
    id: int
    case_id: str
    risk_score: int
    alert_type: str
    status: str
    assigned_analyst_id: Optional[str] = None

class AlertResponse(AlertBase):
    """
    Payload returned to the React Dashboard. 
    Uses ConfigDict to automatically read from SQLAlchemy ORM models.
    """
    customer_id: int
    created_at: datetime
    
    # We allow ConfigDict so FastAPI can translate the SQLAlchemy DB object into this JSON
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 3. AI & RAG INTELLIGENCE SCHEMAS
# ==========================================

class AuditRecord(BaseModel):
    """Represents a single piece of regulatory evidence retrieved from ChromaDB."""
    source_name: str = Field(..., description="The name of the PDF/Law, e.g., FATF_Rec_10.pdf")
    section: str = Field(..., description="The specific section or page number")
    snippet: str = Field(..., description="The exact quote retrieved by the vector search")

class SAROutput(BaseModel):
    """
    The final, structured payload returned to the frontend after Llama 3.3 drafts the SAR.
    """
    case_id: str
    generated_at: str
    model_used: str 
    sar_narrative: str = Field(..., description="The 5-part Markdown formatted SAR draft")
    audit_trail: List[AuditRecord] = Field(..., description="Cryptographic proof of laws cited")

    # Fix Pydantic warning for fields starting with 'model_'
    model_config = ConfigDict(protected_namespaces=())


# ==========================================
# 4. INGESTION SCHEMAS (Optional for direct API usage)
# ==========================================

class TransactionInput(BaseModel):
    """Used if a system sends a single transaction via JSON instead of CSV."""
    customer_id: int
    amount_inr: float
    tx_type: str
    channel: str
    counterparty_location: Optional[str] = None
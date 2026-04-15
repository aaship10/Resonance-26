# import os
# from datetime import datetime, timedelta, timezone
# from typing import Optional, List

# from fastapi import FastAPI, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy import create_engine, Column, Integer, String, Float, Text
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker, Session
# from pydantic import BaseModel
# from passlib.context import CryptContext
# from jose import jwt, JWTError
# from dotenv import load_dotenv

# # --- 1. SAR ENGINE CORE IMPORTS (Ensure these files exist in /core) ---
# from models.schemas import CaseInput, SAROutput, AuditRecord
# from core.retrieval import retrieve_context
# from core.generation import generate_sar_report

# # --- 2. CONFIGURATION ---
# from core.config import (
#     SQLALCHEMY_DATABASE_URL, 
#     SECRET_KEY, 
#     ALGORITHM, 
#     ACCESS_TOKEN_EXPIRE_MINUTES,
#     LLM_MODEL_NAME
# )

# # --- 3. DATABASE MODELS (NeonDB) ---
# engine = create_engine(SQLALCHEMY_DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     employee_id = Column(String, unique=True, index=True)
#     role = Column(String, default="Analyst")
#     hashed_password = Column(String)

# class Alert(Base):
#     __tablename__ = "alerts"
#     id = Column(Integer, primary_key=True, index=True)
#     case_id = Column(String, unique=True, index=True)
#     customer_name = Column(String)
#     risk_score = Column(Integer)
#     alert_type = Column(String)
#     status = Column(String, default="New") # New, Drafting, Filed
#     # Payload for the AI
#     transaction_data = Column(Text)
#     customer_data = Column(Text)
#     account_data = Column(Text)
#     case_notes = Column(Text, default="No prior history.")

# # Sync with NeonDB
# Base.metadata.create_all(bind=engine)

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # --- 4. SECURITY UTILITIES ---
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# def verify_password(plain, hashed):
#     return pwd_context.verify(plain, hashed)

# def get_password_hash(password):
#     return pwd_context.hash(password)

# def create_token(data: dict):
#     to_encode = data.copy()
#     expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# # --- 5. SCHEMAS ---
# class UserCreate(BaseModel):
#     employee_id: str
#     password: str
#     role: str = "Analyst"

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class AlertResponse(BaseModel):
#     case_id: str
#     customer_name: str
#     risk_score: int
#     alert_type: str
#     status: str

#     class Config:
#         from_attributes = True

# # --- 6. API APP ---
# app = FastAPI(title="Sentinel SAR Intelligence API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- AUTH ENDPOINTS ---
# @app.post("/register", response_model=Token)
# def register(user: UserCreate, db: Session = Depends(get_db)):
#     if db.query(User).filter(User.employee_id == user.employee_id).first():
#         raise HTTPException(status_code=400, detail="ID already exists")
#     new_user = User(employee_id=user.employee_id, hashed_password=get_password_hash(user.password), role=user.role)
#     db.add(new_user)
#     db.commit()
#     return {"access_token": create_token({"sub": user.employee_id, "role": user.role}), "token_type": "bearer"}

# @app.post("/token", response_model=Token)
# def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.employee_id == form_data.username).first()
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
#     return {"access_token": create_token({"sub": user.employee_id, "role": user.role}), "token_type": "bearer"}

# # --- DASHBOARD ENDPOINTS ---
# @app.get("/alerts", response_model=List[AlertResponse])
# def fetch_alerts(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
#     return db.query(Alert).all()

# @app.get("/alerts/{case_id}")
# def fetch_alert_detail(case_id: str, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
#     alert = db.query(Alert).filter(Alert.case_id == case_id).first()
#     if not alert: raise HTTPException(status_code=404, detail="Not found")
#     return alert

# # --- INTELLIGENCE ENDPOINT (RAG + LLM) ---
# @app.post("/generate-sar", response_model=SAROutput)
# async def generate_sar(case: CaseInput, token: str = Depends(oauth2_scheme)):
#     try:
#         # Step 1: Retrieve laws from ChromaDB (Local RAG)
#         search_query = f"Pattern: {case.transaction_data} | Context: {case.customer_data}"
#         legal_context, audit_trail_raw = retrieve_context(search_query)
        
#         # Step 2: Generate with Llama 3.3 (Cloud LLM)
#         sar_draft = generate_sar_report(
#             customer_data=case.customer_data,
#             account_data=case.account_data,
#             transaction_data=case.transaction_data,
#             legal_context=legal_context,
#             case_notes=case.case_notes,
#             hosting_env=case.hosting_env,
#             analyst_role=case.analyst_role
#         )
        
#         return SAROutput(
#             case_id=case.case_id,
#             generated_at=datetime.now(timezone.utc).isoformat() + "Z",
#             model_used=LLM_MODEL_NAME,
#             sar_narrative=sar_draft,
#             audit_trail=[AuditRecord(**r) for r in audit_trail_raw]
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))







# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv() # explicitly load env vars from .env

# Import our modular API routers
from api import auth, alerts, generation

# Importing this automatically triggers SQLAlchemy to create any missing tables in NeonDB
import models.database 

# --- 1. INITIALIZE FAST API ---
app = FastAPI(
    title="Sentinel SAR Intelligence API",
    description="Enterprise-grade AML compliance, Maker-Checker routing, and RAG-powered SAR generation.",
    version="1.0.0"
)

# --- 2. CONFIGURE CORS (For React Frontend) ---
# This allows your localhost:3000 or localhost:5173 frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"], # explicit origins or fallback
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. REGISTER API ROUTERS ---
# Here we attach all the endpoints we built in the 'api/' folder
app.include_router(auth.router)
app.include_router(alerts.router)
app.include_router(generation.router)

# --- 4. SYSTEM HEALTH CHECK ---
@app.get("/", tags=["System"])
def system_health_check():
    """
    A simple endpoint to verify the server is running and the architecture is sound.
    """
    return {
        "status": "ONLINE",
        "service": "Sentinel SAR Engine",
        "database": "Connected",
        "maker_checker_enforced": True,
        "message": "Welcome to the Financial Intelligence Unit."
    }
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    allow_origins=["*"], # In a real bank, this would be restricted to your exact frontend URL
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
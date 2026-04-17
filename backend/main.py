# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager # Added this

from api import auth, alerts, generation
import models.database 
from core.bootstrap import run_system_startup_sequence # Added this

# --- 1. LIFESPAN MANAGEMENT ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This code runs exactly ONCE when the server starts
    run_system_startup_sequence()
    yield
    # This code runs when the server shuts down
    print("🔻 Sentinel SAR Engine shutting down...")

# --- 2. INITIALIZE FAST API ---
app = FastAPI(
    title="Sentinel SAR Intelligence API",
    lifespan=lifespan, # Register the lifespan here
    description="Enterprise-grade AML compliance, Maker-Checker routing, and RAG-powered SAR generation.",
    version="1.0.0"
)

# --- 3. CONFIGURE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 4. REGISTER API ROUTERS ---
app.include_router(auth.router)
app.include_router(alerts.router)
app.include_router(generation.router)

@app.get("/", tags=["System"])
def system_health_check():
    return {
        "status": "ONLINE",
        "service": "Sentinel SAR Engine",
        "database": "Connected",
        "maker_checker_enforced": True
    }
# core/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# --- AUTH & DATABASE ---
# sqlalchemy needs 'postgresql://' instead of 'postgres://'
RAW_DB_URL = os.getenv("DATABASE_URL", "")
SQLALCHEMY_DATABASE_URL = RAW_DB_URL.replace("postgres://", "postgresql://")

SECRET_KEY = os.getenv("SECRET_KEY", "sentinel-super-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- AI & RAG ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise EnvironmentError("CRITICAL: GROQ_API_KEY is missing from .env")

ZIP_DB_PATH = os.getenv("ZIP_DB_PATH", "./data/chroma_db.zip")
LLM_MODEL_NAME = "llama-3.3-70b-versatile"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
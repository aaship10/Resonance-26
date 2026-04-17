# backend/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Import our unified configuration and database connection
from core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from models.database import get_db, User

# --- 1. CONFIGURATION ---
# This tells FastAPI where the login route is so it can generate the Swagger UI correctly
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# Setup Bcrypt for enterprise-grade password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- 2. UTILITY FUNCTIONS ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against the hashed version in the database."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a password for secure database storage."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a secure JSON Web Token (JWT).
    Payload typically contains {"sub": employee_id, "role": user_role}
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- 3. THE GATEKEEPER DEPENDENCY ---

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> dict:
    """
    The Maker-Checker Gatekeeper.
    Intercepts the JWT from the request header, validates it, and ensures the user still exists.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token has expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode the token cryptographically
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        employee_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if employee_id is None or role is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    # 2. Verify the user actually still exists in the database
    # (In case an Admin deleted their account 5 minutes ago)
    user = db.query(User).filter(User.employee_id == employee_id).first()
    if user is None:
        raise credentials_exception

    # 3. Return the verified data payload to the API route
    # We return a dict so routes can easily do: current_user["role"]
    return {
        "sub": user.employee_id,
        "role": user.role,
        "internal_id": user.id
    }
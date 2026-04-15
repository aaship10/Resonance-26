# backend/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Import our Database and Security tools
from models.database import get_db, User
from core.security import verify_password, get_password_hash, create_access_token

# Import Schemas (Ensure these exist in your models/schemas.py file)
from models.schemas import UserCreate, Token

router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_employee(user: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new bank employee (Analyst, Approver, Admin) into the system.
    Returns a JWT immediately so they are logged in upon creation.
    """
    # 1. Check if the Employee ID is already taken
    db_user = db.query(User).filter(User.employee_id == user.employee_id).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Employee ID is already registered."
        )
    
    # 2. Hash the password securely
    hashed_password = get_password_hash(user.password)
    
    # 3. Create and save the new user
    new_user = User(
        employee_id=user.employee_id, 
        hashed_password=hashed_password, 
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 4. Generate the JWT payload
    access_token = create_access_token(
        data={"sub": new_user.employee_id, "role": new_user.role}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Standard OAuth2 endpoint for login. 
    React frontend must send 'username' (which we map to employee_id) and 'password'.
    """
    # Note: OAuth2 strictly expects a field called 'username'. 
    # We map 'form_data.username' to our 'employee_id' column.
    user = db.query(User).filter(User.employee_id == form_data.username).first()
    
    # Verify User exists AND Password matches
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Employee ID or Passkey.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Generate the JWT Payload
    access_token = create_access_token(
        data={"sub": user.employee_id, "role": user.role}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
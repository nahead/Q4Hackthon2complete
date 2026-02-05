from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from jose import JWTError
from ..config import config
from ..database import SessionLocal
from ..models import User

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency to get database session
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# For compatibility with Better Auth, we'll maintain similar endpoints
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    # Truncate password to 72 bytes to avoid bcrypt limitation
    truncated_password = password[:72] if len(password) > 72 else password
    return pwd_context.hash(truncated_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire_delta_seconds = int(expires_delta.total_seconds())
    else:
        expire_delta_seconds = 15 * 60  # 15 minutes in seconds

    # Calculate expiration as current time + delta in seconds
    import time
    expire_timestamp = int(time.time()) + expire_delta_seconds
    to_encode.update({"exp": expire_timestamp})
    encoded_jwt = jwt.encode(to_encode, config.get_secret_key(), algorithm=config.get_algorithm())
    return encoded_jwt

@router.post("/auth/login")
async def login(login_request: LoginRequest, db: Session = Depends(get_session)):
    # Find user by email
    user = db.query(User).filter(User.email == login_request.email).first()

    if not user or not verify_password(login_request.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=config.get_access_token_expire_minutes())
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }

@router.post("/auth/register")
async def register(register_request: RegisterRequest, db: Session = Depends(get_session)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == register_request.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    hashed_password = get_password_hash(register_request.password)
    user = User(
        email=register_request.email,
        hashed_password=hashed_password,
        name=register_request.name,
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    access_token_expires = timedelta(minutes=config.get_access_token_expire_minutes())
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }

@router.get("/auth/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, config.get_secret_key(), algorithms=[config.get_algorithm()])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise credentials_exception

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name
    }
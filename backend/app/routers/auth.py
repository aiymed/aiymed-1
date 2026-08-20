# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.database import get_db
from app.models.user import User, UserRole
from passlib.context import CryptContext
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Autentifikatsiya"])

# Parol hash qilish
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "sales"
    region: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    region: Optional[str] = None

    class Config:
        from_attributes = True

# Login
@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Foydalanuvchini topish
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri email yoki parol"
        )
    
    # Parolni tekshirish
    if not pwd_context.verify(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri email yoki parol"
        )
    
    # User ma'lumotlarini qaytarish
    return {
        "message": "Login muvaffaqiyatli",
        "user": UserResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            region=user.region
        )
    }

# Ro'yxatdan o'tish
@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Email mavjudligini tekshirish
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu email allaqachon ro'yxatdan o'tgan"
        )
    
    # Yangi foydalanuvchi yaratish
    hashed_password = pwd_context.hash(request.password)
    
    new_user = User(
        full_name=request.full_name,
        email=request.email,
        hashed_password=hashed_password,
        role=request.role,
        region=request.region
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Foydalanuvchi muvaffaqiyatli yaratildi",
        "user": UserResponse(
            id=new_user.id,
            full_name=new_user.full_name,
            email=new_user.email,
            role=new_user.role,
            region=new_user.region
        )
    }

# Hozirgi foydalanuvchi ma'lumotlari
@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Foydalanuvchi topilmadi"
        )
    return user
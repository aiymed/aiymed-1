# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.auth import authenticate_user

router = APIRouter()

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Foydalanuvchini tekshirish
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri email yoki parol",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Muvaffaqiyatli login (Hozircha oddiy javob qaytaramiz, keyin token qo'shamiz)
    return {
        "xabar": "Muvaffaqiyatli kirdingiz!",
        "foydalanuvchi": user.email,
        "rol": "Admin" if user.is_admin else "Savdo vakili"
    }
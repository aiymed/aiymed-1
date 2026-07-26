# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.auth import get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin Paneli"])

@router.post("/users")
def create_sales_rep(user_data: UserCreate, db: Session = Depends(get_db)):
    # Email oldindan borligini tekshirish
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu email allaqachon mavjud")
    
    # Yangi foydalanuvchi yaratish
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        is_admin=user_data.is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Foydalanuvchi muvaffaqiyatli yaratildi", "email": new_user.email}
# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.utils.auth import get_password_hash  # ✅ O'ZGARGAN QATOR

router = APIRouter(prefix="/admin", tags=["Admin"])

# ✅ O'CHIRILDI: pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================================================
# SCHEMAS
# ==========================================================

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "sales"
    region: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    region: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    region: Optional[str] = None

    class Config:
        from_attributes = True

# ==========================================================
# ENDPOINTS
# ==========================================================

# 1. Barcha xodimlarni olish
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    """Barcha xodimlarni olish"""
    users = db.query(User).order_by(User.id.desc()).all()
    return users


# 2. Bitta xodimni olish (ID bo'yicha)
@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Bitta xodimni ID bo'yicha olish"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")
    return user


# 3. Yangi xodim yaratish
@router.post("/users")
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Yangi xodim yaratish"""
    # Email mavjudligini tekshirish
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan")
    
    # Parolni hash qilish
    hashed_password = get_password_hash(user_data.password)  # ✅ O'ZGARGAN QATOR
    
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role,
        region=user_data.region
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Xodim muvaffaqiyatli yaratildi", "id": new_user.id}


# 4. Xodimni tahrirlash
@router.put("/users/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    """Xodim ma'lumotlarini tahrirlash"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")
    
    # Email mavjudligini tekshirish (o'zidan tashqari)
    if user_data.email and user_data.email != user.email:
        existing = db.query(User).filter(User.email == user_data.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Bu email boshqa xodim tomonidan ishlatilmoqda")
    
    # Ma'lumotlarni yangilash
    update_data = user_data.model_dump(exclude_unset=True)
    
    # Parolni hash qilish (agar yangi parol berilgan bo'lsa)
    if 'password' in update_data and update_data['password']:
        update_data['hashed_password'] = get_password_hash(update_data['password'])  # ✅ O'ZGARGAN QATOR
        del update_data['password']
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return {"message": "Xodim muvaffaqiyatli yangilandi"}


# 5. Xodimni o'chirish
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Xodimni butunlay o'chirish"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")
    
    # O'zini o'chirishga ruxsat bermaslik
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Admin xodimni o'chirib bo'lmaydi")
    
    db.delete(user)
    db.commit()
    
    return {"message": "Xodim muvaffaqiyatli o'chirildi"}


# 6. Xodim statistikasi (Hisobot uchun)
@router.get("/users/{user_id}/stats")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Xodimning statistikasini olish"""
    from app.models.order import Order, OrderStatus
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")
    
    # Xodimning barcha buyurtmalari
    all_orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    # Status bo'yicha filtrlash
    approved_orders = [o for o in all_orders if o.status == OrderStatus.APPROVED]
    pending_orders = [o for o in all_orders if o.status == OrderStatus.PENDING]
    rejected_orders = [o for o in all_orders if o.status == OrderStatus.REJECTED]
    
    # Umumiy savdo (faqat tasdiqlangan)
    total_sales = sum(o.total_amount for o in approved_orders if o.total_amount)
    
    # Umumiy qarz (tasdiqlangan buyurtmalardan)
    total_debt = sum(o.remaining_amount for o in approved_orders if o.remaining_amount)
    
    return {
        "user_id": user_id,
        "full_name": user.full_name,
        "role": user.role,
        "region": user.region,
        "total_orders": len(all_orders),
        "approved_orders": [
            {
                "id": o.id,
                "client_name": o.client_name,
                "total_amount": o.total_amount,
                "remaining_amount": o.remaining_amount,
                "client_debt": o.remaining_amount,
                "created_at": o.created_at.isoformat() if o.created_at else None
            }
            for o in approved_orders
        ],
        "pending_orders": [
            {
                "id": o.id,
                "client_name": o.client_name,
                "total_amount": o.total_amount,
                "created_at": o.created_at.isoformat() if o.created_at else None
            }
            for o in pending_orders
        ],
        "rejected_orders": [
            {
                "id": o.id,
                "client_name": o.client_name,
                "total_amount": o.total_amount,
                "created_at": o.created_at.isoformat() if o.created_at else None
            }
            for o in rejected_orders
        ],
        "total_sales": total_sales,
        "total_debt": total_debt
    }
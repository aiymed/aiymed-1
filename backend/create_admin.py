# backend/create_admin.py
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from passlib.context import CryptContext

# Database jadvallarini yaratish
Base.metadata.create_all(bind=engine)

# Parol hash qilish
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin():
    db = SessionLocal()
    
    try:
        # Eski adminni o'chirish (agar bo'lsa)
        existing = db.query(User).filter(User.email == "admin@aiymed.uz").first()
        if existing:
            db.delete(existing)
            db.commit()
            print("✅ Eski admin o'chirildi")
        
        # Yangi admin yaratish
        hashed_password = pwd_context.hash("admin123")
        
        new_admin = User(
            full_name="Bosh Admin",
            email="admin@aiymed.uz",
            hashed_password=hashed_password,
            role=UserRole.ADMIN.value,  # "admin" string qiymati
            region=None
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        print("\n" + "="*50)
        print("✅ ADMIN MUVAFFAQIYATLI YARATILDI!")
        print("="*50)
        print(f"   Email: admin@aiymed.uz")
        print(f"   Parol: admin123")
        print(f"   ID: {new_admin.id}")
        print(f"   Rol: {new_admin.role}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"\n❌ Xatolik: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
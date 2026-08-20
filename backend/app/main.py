from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from app.database import engine, Base, SessionLocal  # ✅ SessionLocal qo'shildi
from app.models.user import User  # ✅ User modeli qo'shildi
from app.utils.auth import get_password_hash  # ✅ get_password_hash qo'shildi
from app.routers import auth, clients, products, orders, admin, notifications, inventory
import os

# Uploads papkasini yaratish
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Database jadvallarini yaratish
    Base.metadata.create_all(bind=engine)
    
    # Admin foydalanuvchini yaratish (agar yo'q bo'lsa)
    db = SessionLocal()
    try:
        admin_email = "admin@aiymed.uz"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                full_name="Administrator",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin foydalanuvchi yaratildi!")
            print(f"   Email: {admin_email}")
            print(f"   Parol: admin123")
        else:
            print("✅ Admin foydalanuvchi allaqachon mavjud!")
    except Exception as e:
        print(f"❌ Admin yaratishda xato: {e}")
    finally:
        db.close()
    
    print("✅ AIYMED API ishga tushdi!")
    yield

app = FastAPI(
    title="AIYMED API",
    description="AIYMED boshqaruv tizimi API",
    version="1.0.0",
    lifespan=lifespan
)

# STATIK FAYLLARNI SERVE QILISH (rasmlar uchun)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS (Eski kodni shu bilan almashtiring)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://joyful-macaron-f1ed26.netlify.app",  # Netlify saytingiz manzili
        "http://localhost:5173",                      # Lokal test uchun (Vite)
        "http://localhost:3000"                       # Lokal test uchun (React)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'lar
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(inventory.router)

@app.get("/")
def read_root():
    return {"message": "AIYMED API muvaffaqiyatli ishga tushdi!"}
# backend/app/main.py (Faqat bosh qismini yangilaymiz)
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.client import Client      # YANGI
from app.models.product import Product    
from app.models.order import Order, OrderItem 
from app.models.notification import Notification # YANGI
from app.utils.auth import get_password_hash
from app.routers import auth
from app.routers import orders
from app.routers import clients, products, admin
from app.routers import notifications

# 1. Ma'lumotlar bazasida jadvallarni yaratish
Base.metadata.create_all(bind=engine)

# 2. Dastur ishga tushishi va to'xtashi uchun zamonaviy boshqaruv (Lifespan)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Dastur ishga tushganda (Startup) ---
    db = SessionLocal()
    admin_email = "aiymed@example.com"
    
    # Agar admin hali yaratilmagan bo'lsa, uni yaratamiz
    if not db.query(User).filter(User.email == admin_email).first():
        admin_user = User(
            email=admin_email,
            hashed_password=get_password_hash("aiymed2026"),
            full_name="Super Admin",
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        print("✅ Admin foydalanuvchi muvaffaqiyatli yaratildi!")
    db.close()
    
    yield # Dastur shu yerda ishlaydi
    
    # --- Dastur to'xtaganda (Shutdown) ---
    print("🛑 AIYMED dasturi to'xtatildi.")

# 3. FastAPI ilovasini yaratish
app = FastAPI(
    title="AIYMED API",
    description="AIYMAN kompaniyasi uchun savdo va boshqaruv tizimi",
    version="1.0.0",
    lifespan=lifespan  # Yuqoridagi funksiyani ulaymiz
)

# CORS sozlamalari - Frontend bilan ishlash uchun
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend manzillari
    allow_credentials=True,
    allow_methods=["*"],  # Barcha HTTP metodlari (GET, POST, va h.k.)
    allow_headers=["*"],  # Barcha headerlar
)

# API yo'nalishlarini ulash
app.include_router(auth.router, tags=["Autentifikatsiya"])
app.include_router(orders.router, tags=["Buyurtmalar"]) # YANGI QO'SHILDI
app.include_router(clients.router, tags=["Mijozlar (Kontragentlar)"]) # YANGI QO'SHILDI
app.include_router(products.router, tags=["Mahsulotlar"]) # YANGI QO'SHILDI
app.include_router(admin.router, tags=["Admin Paneli"]) # YANGI QO'SHILDI
app.include_router(notifications.router, tags=["Habarnomalar"]) # YANGI QO'SHILDI
# 5. Asosiy sahifa
@app.get("/")
def read_root():
    return {"xabar": "AIYMED dasturi muvaffaqiyatli ishga tushdi!"}


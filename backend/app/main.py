# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # ✅ Qo'shildi
from fastapi.responses import FileResponse  # ✅ Qo'shildi
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.routers import auth, clients, products, orders, admin, notifications, inventory
import os

# Database jadvallarini yaratish
Base.metadata.create_all(bind=engine)

# Uploads papkasini yaratish
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("✅ AIYMED API ishga tushdi!")
    yield

app = FastAPI(
    title="AIYMED API",
    description="AIYMED boshqaruv tizimi API",
    version="1.0.0",
    lifespan=lifespan
)

# ✅ STATIK FAYLLARNI SERVE QILISH (rasmlar uchun)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
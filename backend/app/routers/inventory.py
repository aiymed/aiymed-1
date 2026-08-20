# backend/app/routers/inventory.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from pydantic import BaseModel

router = APIRouter(prefix="/inventory", tags=["Ombor"])

class InventoryCreate(BaseModel):
    product_id: int
    stock_quantity: int = 0
    price_30: float = 0
    price_50: float = 0
    price_100: float = 0
    price_retail: float = 0

class InventoryUpdate(BaseModel):
    stock_quantity: int = None
    price_30: float = None
    price_50: float = None
    price_100: float = None
    price_retail: float = None

# 1. Barcha ombor ma'lumotlari
@router.get("/")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()

# 2. Mahsulot bo'yicha ombor
@router.get("/{product_id}")
def get_inventory_by_product(product_id: int, db: Session = Depends(get_db)):
    inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inv:
        # Agar yo'q bo'lsa, bo'sh ob'ekt qaytarish (frontend uchun qulay)
        return {"product_id": product_id, "stock_quantity": 0, "price_30": 0, "price_50": 0, "price_100": 0, "price_retail": 0}
    return inv

# 3. Ombor ma'lumotini yaratish/yangilash
@router.post("/")
def create_or_update_inventory(inv_data: InventoryCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == inv_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
        
    inv = db.query(Inventory).filter(Inventory.product_id == inv_data.product_id).first()
    
    if inv:
        # Yangilash
        inv.stock_quantity = inv_data.stock_quantity
        inv.price_30 = inv_data.price_30
        inv.price_50 = inv_data.price_50
        inv.price_100 = inv_data.price_100
        inv.price_retail = inv_data.price_retail
        msg = "Ombor ma'lumoti yangilandi"
    else:
        # Yaratish
        inv = Inventory(**inv_data.model_dump())
        db.add(inv)
        msg = "Ombor ma'lumoti yaratildi"
        
    db.commit()
    db.refresh(inv)
    return {"message": msg, "id": inv.id}

# 4. Omborni o'chirish
@router.delete("/{product_id}")
def delete_inventory(product_id: int, db: Session = Depends(get_db)):
    inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Ombor ma'lumoti topilmadi")
    db.delete(inv)
    db.commit()
    return {"message": "Ombor ma'lumoti o'chirildi"}
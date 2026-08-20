# backend/app/routers/products.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.product import Product
from pydantic import BaseModel
import shutil
import os

router = APIRouter(prefix="/products", tags=["Mahsulotlar"])

UPLOAD_DIR = "uploads/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    instruction: Optional[str] = None
    characteristics: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    instruction: Optional[str] = None
    characteristics: Optional[str] = None

# 1. Barcha mahsulotlar
@router.get("/")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id.desc()).all()

# 2. Bitta mahsulot
@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    return product

# 3. Yangi mahsulot yaratish
@router.post("/")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"message": "Mahsulot yaratildi", "id": new_product.id}

# 4. Mahsulotni tahrirlash
@router.put("/{product_id}")
def update_product(product_id: int, product_data: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return {"message": "Mahsulot yangilandi"}

# 5. Mahsulotni o'chirish
@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    
    if product.image_url and os.path.exists(product.image_url):
        os.remove(product.image_url)
        
    db.delete(product)
    db.commit()
    return {"message": "Mahsulot o'chirildi"}

# 6. Rasm yuklash
@router.post("/{product_id}/upload-image")
async def upload_product_image(product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    
    file_extension = file.filename.split(".")[-1]
    file_path = f"{UPLOAD_DIR}/product_{product_id}.{file_extension}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    if product.image_url and os.path.exists(product.image_url):
        os.remove(product.image_url)
        
    product.image_url = file_path
    db.commit()
    
    return {"message": "Rasm yuklandi", "image_url": file_path}
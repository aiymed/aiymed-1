# backend/app/models/product.py
from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Mahsulot nomi
    description = Column(String, nullable=True)  # Tavsif
    price = Column(Float, nullable=False)  # QQS qo'shilgan narx
    stock_quantity = Column(Integer, default=0)  # Ombordagi qoldiq soni
    unit = Column(String, default="dona")  # O'lchov birligi (dona, quti, flakon)
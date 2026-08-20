# backend/app/models/product.py
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    unit = Column(String, default="dona")
    description = Column(Text, nullable=True)
    instruction = Column(Text, nullable=True)
    characteristics = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    
    # Relationships
    order_items = relationship("OrderItem", back_populates="product")
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
# backend/app/models/inventory.py
from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, unique=True)
    stock_quantity = Column(Integer, default=0)
    price_30 = Column(Float, default=0)
    price_50 = Column(Float, default=0)
    price_100 = Column(Float, default=0)
    price_retail = Column(Float, default=0)
    
    # Relationship
    product = relationship("Product", back_populates="inventory")
# backend/app/models/order.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

# Buyurtma holatlari
class OrderStatus(str, enum.Enum):
    PENDING = "pending"      # Kutilmoqda (Admin tasdiqlashi kerak)
    APPROVED = "approved"    # Tasdiqlangan (Ombordan ayirildi)
    REJECTED = "rejected"    # Rad etilgan

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Savdo vakili
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)  # Mijoz (kontragent)
    
    # Moliyaviy qismlar
    total_amount = Column(Float, nullable=False)
    vat_amount = Column(Float, nullable=False)
    payment_type = Column(Integer, nullable=False)  # 30, 50, 100
    prepayment_amount = Column(Float, nullable=False)
    remaining_amount = Column(Float, nullable=False)
    
    # Holat
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    
    created_at = Column(DateTime, default=datetime.now)
    
    # Bog'lanishlar
    client = relationship("Client", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)  # Mahsulotga havola
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String, default="dona")
    price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
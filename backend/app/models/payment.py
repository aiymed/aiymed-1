# backend/app/models/payment.py
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)  # ✅ Yangi ustun
    amount = Column(Float, nullable=False)
    note = Column(String, nullable=True)
    payment_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="payments")
    order = relationship("Order", back_populates="payments")  # ✅ Order bilan bog'lash
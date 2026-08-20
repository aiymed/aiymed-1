# backend/app/models/client.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    inn = Column(String, nullable=True)
    region = Column(String, nullable=True)
    contract_number = Column(String, nullable=True)
    
    orders = relationship("Order", back_populates="client")
    payments = relationship("Payment", back_populates="client")  # ✅ YANGI
# backend/app/models/client.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Do'kon yoki dorixona nomi
    address = Column(String, nullable=True)  # Manzil
    phone = Column(String, nullable=True)  # Telefon raqami
    inn = Column(String, nullable=True)  # STIR (INN)
    created_at = Column(DateTime, default=datetime.now)

    # Buyurtmalar bilan bog'lanish
    orders = relationship("Order", back_populates="client")
# backend/app/models/user.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DIRECTOR = "director"
    MARKETING = "marketing"
    SALES = "sales"
    EMPLOYEE = "employee"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.SALES.value)
    region = Column(String, nullable=True)
    
    # Relationships (back_populates ishlat  ilmoqda!)
    orders = relationship("Order", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "sales"  # admin, marketing, director, sales
    region: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: str
    role: str
    region: Optional[str] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    region: Optional[str] = None
    is_admin: bool

    class Config:
        from_attributes = True
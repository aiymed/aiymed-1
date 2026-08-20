# backend/app/schemas/product.py
from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price_30: float
    price_50: float
    price_100: float
    stock_quantity: int = 0
    unit: str = "dona"

class ProductUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    price_30: float
    price_50: float
    price_100: float
    stock_quantity: int
    unit: str = "dona"
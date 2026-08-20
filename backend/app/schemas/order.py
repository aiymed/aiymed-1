# backend/app/schemas/order.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemInput(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    client_id: int
    payment_type: str  # wholesale_30, wholesale_50, wholesale_100, retail
    items: List[OrderItemInput]
    user_id: Optional[int] = None

class PaymentCreate(BaseModel):
    client_id: int
    order_id: Optional[int] = None  # ✅ Yangi (ixtiyoriy)
    amount: float
    note: Optional[str] = None
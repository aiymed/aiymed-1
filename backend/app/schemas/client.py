# backend/app/schemas/client.py
from pydantic import BaseModel
from typing import Optional

class ClientCreate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    inn: Optional[str] = None
    region: str  # ✅ YANGI: Hudud majburiy
    contract_number: Optional[str] = None  # ✅ YANGI: Shartnoma raqami

class ClientUpdate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    inn: Optional[str] = None
    region: str  # ✅ YANGI: Hudud majburiy
    contract_number: Optional[str] = None  # ✅ YANGI: Shartnoma raqami
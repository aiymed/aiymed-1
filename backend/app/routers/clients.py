# backend/app/routers/clients.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.client import Client
from pydantic import BaseModel

router = APIRouter(prefix="/clients", tags=["Mijozlar"])

# ==========================================================
# SCHEMAS
# ==========================================================

class ClientCreate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    inn: Optional[str] = None
    region: str
    contract_number: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    inn: Optional[str] = None
    region: Optional[str] = None
    contract_number: Optional[str] = None

# ==========================================================
# ENDPOINTS
# ==========================================================

# 1. Yangi mijoz yaratish
@router.post("/")
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """Yangi mijoz qo'shish"""
    # INN + Hudud noyobligini tekshirish
    if client.inn:
        existing = db.query(Client).filter(
            Client.inn == client.inn,
            Client.region == client.region
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400, 
                detail=f"{client.region} hududida INN {client.inn} raqamli mijoz allaqachon mavjud!"
            )
    
    new_client = Client(**client.model_dump())
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return {"message": "Mijoz muvaffaqiyatli qo'shildi", "id": new_client.id}


# 2. Barcha mijozlarni olish (Ro'yxat)
@router.get("/")
def get_clients(region: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Barcha mijozlarni olish (hudud bo'yicha filtr bilan)"""
    query = db.query(Client)
    if region:
        query = query.filter(Client.region == region)
    return query.order_by(Client.id.desc()).all()


# 3. Bitta mijozni olish (ID bo'yicha)
@router.get("/{client_id}")
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Bitta mijozni ID bo'yicha olish"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    return client


# 4. Mijozni tahrirlash (PUT)
@router.put("/{client_id}")
def update_client(client_id: int, client_data: ClientUpdate, db: Session = Depends(get_db)):
    """Mijoz ma'lumotlarini tahrirlash"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    
    # INN + Hudud noyobligini tekshirish (o'zidan tashqari)
    update_data = client_data.model_dump(exclude_unset=True)
    
    if 'inn' in update_data and 'region' in update_data:
        if client.inn != update_data['inn'] or client.region != update_data['region']:
            existing = db.query(Client).filter(
                Client.inn == update_data['inn'],
                Client.region == update_data['region'],
                Client.id != client_id
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail=f"{update_data['region']} hududida INN {update_data['inn']} raqamli mijoz allaqachon mavjud!"
                )
    
    # Ma'lumotlarni yangilash
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    return {"message": "Mijoz muvaffaqiyatli yangilandi", "client": client}


# 5. Mijozni o'chirish (DELETE)
@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Mijozni butunlay o'chirish"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    
    db.delete(client)
    db.commit()
    return {"message": "Mijoz muvaffaqiyatli o'chirildi"}
# backend/app/routers/clients.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate

router = APIRouter(prefix="/clients", tags=["Mijozlar (Kontragentlar)"])

@router.post("/")
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    new_client = Client(**client.dict())
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return {"message": "Mijoz muvaffaqiyatli qo'shildi", "id": new_client.id}

@router.get("/")
def get_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Barcha mijozlarni olish (keyinchalik qidiruv qo'shamiz)
    clients = db.query(Client).offset(skip).limit(limit).all()
    return clients
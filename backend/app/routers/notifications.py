# backend/app/routers/notifications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Habarnomalar"])

@router.get("/user/{user_id}")
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    # Foydalanuvchining barcha habarnomalarini yangidan eskiga qarab saralash
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).all()
    
    # JSON xatoligi chiqmasligi uchun lug'at (dict) formatida qaytarish
    return [
        {
            "id": n.id,
            "user_id": n.user_id,
            "message": n.message,
            "is_read": n.is_read,
            "order_id": n.order_id,
            "created_at": n.created_at.isoformat() if n.created_at else None
        }
        for n in notifications
    ]

@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Habarnoma topilmadi")
    
    notif.is_read = True
    db.commit()
    return {"message": "Habarnoma o'qilgan deb belgilandi"}

@router.patch("/user/{user_id}/read-all")
def mark_all_as_read(user_id: int, db: Session = Depends(get_db)):
    """Barcha habarnomalarni o'qilgan deb belgilash"""
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).all()
    
    for n in notifications:
        n.is_read = True
    
    db.commit()
    return {"message": f"{len(notifications)} ta habarnoma o'qilgan deb belgilandi"}
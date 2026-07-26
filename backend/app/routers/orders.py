# backend/app/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.client import Client
from app.models.product import Product
from app.models.notification import Notification
from app.models.user import User
from app.services.calculation import calculate_order_details
from app.services.pdf_generator import generate_specification_pdf
from pydantic import BaseModel

router = APIRouter(prefix="/orders", tags=["Buyurtmalar"])

class OrderItemInput(BaseModel):
    product_id: int
    quantity: int
    price: float
    product_name: str
    unit: str = "dona"

class OrderCreate(BaseModel):
    client_id: int  # Endi client_name emas, client_id ishlatamiz
    payment_type: int
    items: List[OrderItemInput]
    user_id: int

@router.post("/")
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # 1. Mijoz mavjudligini tekshirish
    client = db.query(Client).filter(Client.id == order_data.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")

    try:
        # 2. Hisob-kitobni amalga oshirish
        items_dict = [{"product_id": item.product_id, "quantity": item.quantity, "price": item.price} for item in order_data.items]
        calculations = calculate_order_details(items_dict, order_data.payment_type)
        
        # 3. Buyurtmani bazaga saqlash
        new_order = Order(
            user_id=order_data.user_id,
            client_id=order_data.client_id,
            total_amount=calculations["total_amount"],
            vat_amount=calculations["vat_amount"],
            payment_type=calculations["payment_type"],
            prepayment_amount=calculations["prepayment_amount"],
            remaining_amount=calculations["remaining_amount"],
            status=OrderStatus.PENDING # Boshida holat "kutilmoqda"
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        # 4. Buyurtma ichidagi mahsulotlarni saqlash
        for item in order_data.items:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit=item.unit,
                price=item.price,
                total=item.quantity * item.price
            )
            db.add(order_item)
        db.commit()
        
        # 5. 🚨 AVTOMATIK HABARNOMA: Adminga xabar yuborish
        admins = db.query(User).filter(User.is_admin == True).all()
        for admin in admins:
            new_notif = Notification(
                user_id=admin.id,
                message=f"Yangi buyurtma! Mijoz: {client.name}, Summa: {calculations['total_amount']:,.0f} so'm. Tasdiqlashni kutyapti."
            )
            db.add(new_notif)
        db.commit()
        
        return {"message": "Buyurtma yaratildi va adminga habarnoma yuborildi", "order_id": new_order.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Xatolik: {str(e)}")

# 🌟 ENG MUHIM QISM: Admin buyurtmani tasdiqlashi
@router.patch("/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Faqat 'approved' yoki 'rejected' holatini o'zgartirish mumkin")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Bu buyurtma allaqachon ko'rib chiqilgan")

    if status == "approved":
        # Ombordan mahsulotlarni kamaytirish
        items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        for item in items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Mahsulot topilmadi: {item.product_name}")
            
            if product.stock_quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Omborda yetarli emas: {product.name}. Mavjud: {product.stock_quantity}, Kerak: {item.quantity}")
            
            # Ombordan ayirish
            product.stock_quantity -= item.quantity
        
        order.status = OrderStatus.APPROVED
        status_msg = "tasdiqlandi va ombordan mahsulot ayirildi"
    else:
        order.status = OrderStatus.REJECTED
        status_msg = "rad etildi"
    
    db.commit()
    
    # Savdo vakiliga habarnoma yuborish
    notif = Notification(
        user_id=order.user_id,
        message=f"Sizning #{order_id}-buyurtmangiz {status_msg}."
    )
    db.add(notif)
    db.commit()
    
    return {"message": f"Buyurtma muvaffaqiyatli {status_msg}"}

@router.get("/{order_id}/pdf")
def download_order_pdf(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    
    client = db.query(Client).filter(Client.id == order.client_id).first()
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    
    order_data = {
        "client_name": client.name if client else "Noma'lum mijoz",
        "total_amount": order.total_amount,
        "vat_amount": order.vat_amount,
        "payment_type": order.payment_type,
        "prepayment_amount": order.prepayment_amount,
        "remaining_amount": order.remaining_amount,
        "items": [{"product_name": i.product_name, "quantity": i.quantity, "unit": i.unit, "price": i.price, "total": i.total} for i in items]
    }
    
    file_path = generate_specification_pdf(order_data, order.id)
    return FileResponse(path=file_path, filename=f"Spetsifikatsiya_{order.id}.pdf", media_type='application/pdf')
@router.get("/")
def get_orders(db: Session = Depends(get_db)):
    """Barcha buyurtmalarni olish"""
    orders = db.query(Order).all()
    return orders

@router.get("/report/{user_id}")
def get_sales_report(user_id: int, db: Session = Depends(get_db)):
    """Savdo vakili uchun hisobot"""
    from datetime import datetime, timedelta
    
    # Oy boshidan beri
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Barcha buyurtmalar
    all_orders = db.query(Order).filter(
        Order.user_id == user_id,
        Order.created_at >= month_start
    ).all()
    
    # Tasdiqlangan buyurtmalar
    approved_orders = [o for o in all_orders if o.status == OrderStatus.APPROVED]
    
    # Umumiy savdo summasi (tasdiqlangan)
    total_sales = sum(o.total_amount for o in approved_orders)
    
    # Qarzdorlik (qolgan qarz)
    total_debt = sum(o.remaining_amount for o in approved_orders)
    
    return {
        "total_orders": len(all_orders),
        "approved_orders": len(approved_orders),
        "pending_orders": len([o for o in all_orders if o.status == OrderStatus.PENDING]),
        "total_sales": total_sales,
        "total_debt": total_debt,
        "month": now.strftime("%B %Y")
    }
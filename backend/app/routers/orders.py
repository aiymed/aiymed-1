# backend/app/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.client import Client
from app.models.product import Product
from app.models.user import User, UserRole
from app.models.notification import Notification
from app.models.payment import Payment  # ✅ Aniq shu yerda bo'lishi shart!

router = APIRouter(prefix="/orders", tags=["Buyurtmalar"])

# Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    client_id: int
    user_id: int
    payment_type: str = "wholesale_50"
    items: List[OrderItemCreate]

# 1. Yangi buyurtma yaratish
@router.post("/")
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == order_data.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    
    user = db.query(User).filter(User.id == order_data.user_id).first()
    
    # Hudud tekshiruvi (agar savdo vakili bo'lsa)
    if user and user.role == UserRole.SALES and user.region != client.region:
        raise HTTPException(status_code=403, detail=f"Siz faqat {user.region} hududidagi mijozlar bilan ishlashingiz mumkin!")
    
    # Buyurtma yaratish
    db_order = Order(
        client_id=order_data.client_id,
        user_id=order_data.user_id,
        payment_type=order_data.payment_type,
        status=OrderStatus.PENDING
    )
    db.add(db_order)
    db.flush() # ID olish uchun
    
    total_amount = 0
    
    for item_data in order_data.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Mahsulot topilmadi: ID {item_data.product_id}")
        
        # ✅ YANGI: Narxni Inventory dan olish
        inv = product.inventory
        if not inv:
            raise HTTPException(status_code=400, detail=f"'{product.name}' mahsuloti uchun ombor narxlari kiritilmagan!")
        
        # Narxni to'lov turiga qarab tanlash
        if order_data.payment_type == "wholesale_30":
            price = inv.price_30
        elif order_data.payment_type == "wholesale_100":
            price = inv.price_100
        elif order_data.payment_type == "retail":
            price = inv.price_retail if inv.price_retail > 0 else inv.price_50
        else:
            price = inv.price_50 # Default wholesale_50
        
        item_total = price * item_data.quantity
        total_amount += item_total
        
        db.add(OrderItem(
            order_id=db_order.id,
            product_id=item_data.product_id,
            product_name=product.name,
            quantity=item_data.quantity,
            unit=product.unit,
            price=price,
            total=item_total
        ))
    
    # Hisob-kitob
    db_order.total_amount = total_amount
    db_order.vat_amount = total_amount * 12 / 112
    
    percent = 30 if order_data.payment_type == "wholesale_30" else (100 if order_data.payment_type == "wholesale_100" else 50)
    if order_data.payment_type == "retail":
        percent = 100
        
    db_order.prepayment_amount = total_amount * (percent / 100)
    db_order.remaining_amount = total_amount - db_order.prepayment_amount
    
    db.commit()
    db.refresh(db_order)
    
    return {"message": "Buyurtma yaratildi", "order_id": db_order.id}

# 2. Barcha buyurtmalar (region filtri bilan)
@router.get("/")
def get_orders(
    region: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Barcha buyurtmalarni olish (region va status filtri bilan)"""
    
    # Asosiy so'rov
    query = db.query(Order)
    
    # ✅ Region filtri
    if region:
        # Bu hududdagi barcha mijozlarning ID larini topamiz
        clients_in_region = db.query(Client.id).filter(Client.region == region).all()
        client_ids = [c[0] for c in clients_in_region]
        
        if client_ids:
            query = query.filter(Order.client_id.in_(client_ids))
        else:
            # Agar bu hududda mijoz yo'q bo'lsa, bo'sh natija
            return []
    
    # ✅ Status filtri
    if status:
        query = query.filter(Order.status == status)
    
    # Natijani olish
    orders = query.order_by(Order.id.desc()).all()
    
    result = []
    for order in orders:
        client = db.query(Client).filter(Client.id == order.client_id).first()
        result.append({
            "id": order.id,
            "client_name": client.name if client else "Noma'lum",
            "client_inn": client.inn if client else None,
            "region": client.region if client else None,  # ✅ Region qo'shildi
            "total_amount": order.total_amount,
            "payment_type": order.payment_type,
            "status": order.status.value if hasattr(order.status, 'value') else order.status,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": [
                {
                    "product_name": i.product_name,
                    "quantity": i.quantity,
                    "unit": i.unit,
                    "price": i.price,
                    "total": i.total
                } for i in order.items
            ]
        })
    return result

# --- BITTA BUYURTMA OLISH ---
@router.get("/{order_id}")
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    """Bitta buyurtmani ID bo'yicha olish"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    
    client = db.query(Client).filter(Client.id == order.client_id).first()
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    
    return {
        "id": order.id,
        "client_id": order.client_id,
        "client_name": client.name if client else "Noma'lum",
        "client_inn": client.inn if client else None,
        "total_amount": order.total_amount,
        "vat_amount": order.vat_amount,
        "payment_type": order.payment_type,
        "prepayment_amount": order.prepayment_amount,
        "remaining_amount": order.remaining_amount,
        "status": order.status.value if hasattr(order.status, 'value') else order.status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit": item.unit,
                "price": item.price,
                "total": item.total
            } for item in items
        ]
    }

# 3. Buyurtma holatini o'zgartirish (Tasdiqlash/Rad etish)
@router.patch("/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    """Buyurtma holatini o'zgartirish"""
    
    # ✅ Ruxsat etilgan holatlar
    if status not in ["approved", "rejected", "cancelled", "pending"]:
        raise HTTPException(status_code=400, detail="Noto'g'ri holat")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    
    # ✅ Bekor qilish (pending holatiga qaytarish)
    if status == "pending":
        order.status = OrderStatus.PENDING
        db.commit()
        return {"message": "Buyurtma kutilmoqda holatiga qaytarildi"}
    
    # ✅ Bekor qilingan buyurtma
    if status == "cancelled":
        order.status = OrderStatus.CANCELLED
        db.commit()
        return {"message": "Buyurtma bekor qilindi"}
    
    # ✅ Tasdiqlash
    if status == "approved" and order.status != OrderStatus.APPROVED:
        # Ombordan mahsulot sonini ayirish
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product and product.inventory:
                if product.inventory.stock_quantity < item.quantity:
                    raise HTTPException(status_code=400, detail=f"Omborda '{product.name}' yetarli emas! (Mavjud: {product.inventory.stock_quantity})")
                product.inventory.stock_quantity -= item.quantity
    
    order.status = OrderStatus.APPROVED if status == "approved" else OrderStatus.REJECTED
    db.commit()
    
    return {"message": f"Holat '{status}' ga o'zgartirildi"}

# --- BUYURTMA TAHRIRLASH ---
@router.put("/{order_id}")
def edit_order(order_id: int, order_data: dict, db: Session = Depends(get_db)):
    """Buyurtmani tahrirlash (faqat pending yoki cancelled holatda)"""
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    
    # Faqat pending yoki cancelled holatdagi buyurtmalarni tahrirlash mumkin
    if order.status not in [OrderStatus.PENDING, OrderStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail="Faqat kutilayotgan yoki bekor qilingan buyurtmalarni tahrirlash mumkin")
    
    # Mijozni tekshirish
    client = db.query(Client).filter(Client.id == order_data.get("client_id")).first()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    
    # Buyurtma ma'lumotlarini yangilash
    order.client_id = order_data.get("client_id")
    order.payment_type = order_data.get("payment_type", "wholesale_50")
    
    # Eski mahsulotlarni o'chirish
    db.query(OrderItem).filter(OrderItem.order_id == order_id).delete()
    
    # Yangi mahsulotlarni qo'shish
    total_amount = 0
    items = order_data.get("items", [])
    
    for item_data in items:
        product = db.query(Product).filter(Product.id == item_data.get("product_id")).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Mahsulot topilmadi: {item_data.get('product_id')}")
        
        # Inventory dan narxni olish
        inv = product.inventory
        if not inv:
            raise HTTPException(status_code=400, detail=f"'{product.name}' mahsuloti uchun ombor ma'lumotlari yo'q!")
        
        # Narxni to'lov turiga qarab tanlash
        payment_type = order_data.get("payment_type", "wholesale_50")
        if payment_type == "wholesale_30":
            price = inv.price_30
        elif payment_type == "wholesale_100":
            price = inv.price_100
        elif payment_type == "retail":
            price = inv.price_retail if inv.price_retail > 0 else inv.price_50
        else:
            price = inv.price_50
        
        quantity = item_data.get("quantity", 1)
        item_total = price * quantity
        total_amount += item_total
        
        db.add(OrderItem(
            order_id=order_id,
            product_id=item_data.get("product_id"),
            quantity=quantity,
            price=price,
            product_name=product.name,
            unit=product.unit or "dona",
            total=item_total
        ))
    
    # Hisob-kitob
    order.total_amount = total_amount
    order.vat_amount = total_amount * 12 / 112
    
    percent = 30 if payment_type == "wholesale_30" else (100 if payment_type == "wholesale_100" else 50)
    if payment_type == "retail":
        percent = 100
    
    order.prepayment_amount = total_amount * (percent / 100)
    order.remaining_amount = total_amount - order.prepayment_amount
    
    # Agar bekor qilingan buyurtma tahrirlansa, pending holatiga qaytarish
    if order.status == OrderStatus.CANCELLED:
        order.status = OrderStatus.PENDING
    
    db.commit()
    db.refresh(order)
    
    return {"message": "Buyurtma muvaffaqiyatli tahrirlandi", "order_id": order.id}

# --- BUYURTMANI BUTUNLAY O'CHIRISH ---
@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Buyurtmani butunlay o'chirish (Faqat cancelled holatdagilarni)"""
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    
    # Xavfsizlik: Faqat bekor qilingan (cancelled) buyurtmalarni o'chirishga ruxsat beramiz
    if order.status != OrderStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Faqat bekor qilingan (cancelled) buyurtmalarni o'chirish mumkin!")
    
    # 1. Avval buyurtma tarkibidagi mahsulotlarni (OrderItem) o'chiramiz
    db.query(OrderItem).filter(OrderItem.order_id == order_id).delete()
    
    # 2. Asosiy buyurtmani o'chiramiz
    db.delete(order)
    db.commit()
    
    return {"message": "Buyurtma muvaffaqiyatli o'chirildi"}

# --- ADMIN HISOBOT (FILTRLAR BILAN - ISHONCHLI USUL) ---
@router.get("/report/all-admin")
def get_admin_report(
    year: int = None,
    month: int = None,
    employee_id: int = None,
    region: str = None,
    db: Session = Depends(get_db)
):
    from datetime import datetime
    now = datetime.now()
    
    # Agar parametr berilmasa, joriy yil va oyni olamiz
    year = year or now.year
    month = month or now.month
    
    # Sana oralig'ini hisoblash
    month_start = datetime(year, month, 1)
    if month == 12:
        month_end = datetime(year + 1, 1, 1)
    else:
        month_end = datetime(year, month + 1, 1)
    
    # 1. Asosiy so'rovni boshlaymiz (faqat shu oy uchun)
    query = db.query(Order).filter(
        Order.created_at >= month_start,
        Order.created_at < month_end
    )
    
    # 2. Xodim bo'yicha filtr
    if employee_id:
        query = query.filter(Order.user_id == employee_id)
        
    # 3. Hudud bo'yicha filtr (ENG ISHONCHLI USUL)
    if region:
        # Avval shu hududdagi barcha mijozlarning ID larini topamiz
        clients_in_region = db.query(Client.id).filter(Client.region == region).all()
        # Natijani oddiy ro'yxatga aylantiramiz: [(1,), (2,)] -> [1, 2]
        client_ids = [c[0] for c in clients_in_region]
        
        if client_ids:
            # Buyurtmalarni faqat shu mijozlarning ID lari orasidan qidiramiz
            query = query.filter(Order.client_id.in_(client_ids))
        else:
            # Agar bu hududda umuman mijoz yo'q bo'lsa, bo'sh natija qaytaramiz
            return {
                "total_orders": 0,
                "approved_orders": 0,
                "pending_orders": 0,
                "rejected_orders": 0,
                "total_sales": 0,
                "total_debt": 0,
                "year": year,
                "month": month,
                "month_name": month_start.strftime("%B %Y")
            }
    
    # 4. Ma'lumotlarni olamiz
    all_orders = query.all()
    approved = [o for o in all_orders if o.status == OrderStatus.APPROVED]
    
    total_sales = sum(o.total_amount for o in approved)
    
    # 5. Qarzdorlikni hisoblash (Faqat shu filtrlangan mijozlar uchun)
    total_debt = 0
    unique_client_ids = list(set(o.client_id for o in approved))
    
    for client_id in unique_client_ids:
        # Mijozning shu filtrlangan buyurtmalari
        client_orders = [o for o in approved if o.client_id == client_id]
        total_expected = sum(o.total_amount for o in client_orders)
        
        # Mijozning shu davrdagi to'lovlari
        client_payments = db.query(Payment).filter(
            Payment.client_id == client_id,
            Payment.payment_date >= month_start,
            Payment.payment_date < month_end
        ).all()
        total_paid = sum(p.amount for p in client_payments)
        
        if total_paid < total_expected:
            total_debt += (total_expected - total_paid)
    
    return {
        "total_orders": len(all_orders),
        "approved_orders": len(approved),
        "pending_orders": len([o for o in all_orders if o.status == OrderStatus.PENDING]),
        "rejected_orders": len([o for o in all_orders if o.status == OrderStatus.REJECTED]),
        "total_sales": total_sales,
        "total_debt": total_debt,
        "year": year,
        "month": month,
        "month_name": month_start.strftime("%B %Y")
    }

# --- XODIM HISOBOTI ---
@router.get("/report/employee/{employee_id}")
def get_employee_report(employee_id: int, db: Session = Depends(get_db)):
    """Xodimning (savdo vakili) shaxsiy hisoboti"""
    
    # Xodimni tekshirish
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")
    
    from datetime import datetime
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Xodimning barcha buyurtmalari (oy boshidan)
    all_orders = db.query(Order).filter(
        Order.user_id == employee_id,
        Order.created_at >= month_start
    ).all()
    
    # Tasdiqlangan buyurtmalar
    approved_orders = [o for o in all_orders if o.status == OrderStatus.APPROVED]
    
    # Umumiy savdo
    total_sales = sum(o.total_amount for o in approved_orders)
    
    # ✅ Xodimning mijozlari (takrorlanmas)
    unique_client_ids = list(set(o.client_id for o in approved_orders))
    total_clients = len(unique_client_ids)
    
    # ✅ Xodim orqali yaratilgan buyurtmalarning qarzi
    total_debt = 0
    for client_id in unique_client_ids:
        # Mijozning shu xodim orqali yaratilgan buyurtmalari
        client_orders = [o for o in approved_orders if o.client_id == client_id]
        client_total = sum(o.total_amount for o in client_orders)
        
        # Mijozning barcha to'lovlari
        client_payments = db.query(Payment).filter(Payment.client_id == client_id).all()
        client_paid = sum(p.amount for p in client_payments)
        
        # Qarz
        if client_paid < client_total:
            total_debt += (client_total - client_paid)
    
    # Holatlar bo'yicha
    pending_count = len([o for o in all_orders if o.status == OrderStatus.PENDING])
    approved_count = len(approved_orders)
    rejected_count = len([o for o in all_orders if o.status == OrderStatus.REJECTED])
    cancelled_count = len([o for o in all_orders if o.status == OrderStatus.CANCELLED])
    
    return {
        "employee_id": employee_id,
        "employee_name": employee.full_name,
        "employee_role": employee.role,
        "employee_region": employee.region,
        "total_orders": len(all_orders),
        "approved_orders": approved_count,
        "pending_orders": pending_count,
        "rejected_orders": rejected_count,
        "cancelled_orders": cancelled_count,
        "total_sales": total_sales,
        "total_debt": total_debt,
        "total_clients": total_clients,
        "month": now.strftime("%B %Y")
    }


# --- MIJOZLAR QARZDORLIGI ---
# --- MIJOZLAR QARZDORLIGI ---
@router.get("/payments/clients-debt")
def get_clients_debt(
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Barcha mijozlarning aniq debitor va kreditor holati (region filtri bilan)"""
    
    all_clients = db.query(Client).all()
    result = []
    
    for client in all_clients:
        # ✅ Region filtri: Agar region parametri berilgan bo'lsa, faqat shu hududni ko'rsatamiz
        if region and client.region != region:
            continue
        
        approved_orders = db.query(Order).filter(
            Order.client_id == client.id,
            Order.status == OrderStatus.APPROVED
        ).all()
        
        total_expected = sum(o.total_amount for o in approved_orders)
        
        # Payment modeli shu yerda ishlatiladi
        payments = db.query(Payment).filter(Payment.client_id == client.id).all()
        total_paid = sum(p.amount for p in payments)
        
        if total_paid < total_expected:
            total_debt = total_expected - total_paid
            overpayment = 0
        else:
            total_debt = 0
            overpayment = total_paid - total_expected
        
        if total_debt > 0 or overpayment > 0 or total_expected > 0:  # ✅ Shart biroz kengaytirildi
            result.append({
                "client_id": client.id,
                "client_name": client.name,
                "client_inn": client.inn,
                "region": client.region,
                "total_sales": total_expected,  # ✅ YANGI QO'SHILDI: Mijoz bo'yicha umumiy savdo hajmi
                "total_debt": total_debt,
                "overpayment": overpayment,
                "orders_count": len(approved_orders)
            })
    
    result.sort(key=lambda x: (x["total_debt"], x["overpayment"]), reverse=True)
    return result

# --- MIJOZNING TO'LOV MA'LUMOTLARI ---
@router.get("/payments/client/{client_id}")
def get_client_payment_data(client_id: int, db: Session = Depends(get_db)):
    """Mijozning to'lovlar va buyurtmalar ma'lumotlarini olish - REAL qarzdorlik bilan"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    
    # Tasdiqlangan buyurtmalar
    approved_orders = db.query(Order).filter(
        Order.client_id == client_id,
        Order.status == OrderStatus.APPROVED
    ).all()
    
    # Barcha to'lovlar (buyurtmaga bog'langan va bog'lanmagan)
    all_payments = db.query(Payment).filter(Payment.client_id == client_id).all()
    
    # Buyurtmaga bog'langan to'lovlar
    payments_for_orders = [p for p in all_payments if p.order_id is not None]
    # Umumiy to'lovlar (buyurtmaga bog'lanmagan)
    general_payments = [p for p in all_payments if p.order_id is None]
    
    total_expected = sum(o.total_amount for o in approved_orders)
    total_paid = sum(p.amount for p in all_payments)
    
    # ✅ YANGI: Har bir buyurtma uchun REAL qarzni hisoblash
    orders_with_debt = []
    
    # Birinchi navbatda, buyurtmaga bog'langan to'lovlarni hisoblaymiz
    for order in approved_orders:
        # Shu buyurtmaga to'g'ridan-to'g'ri bog'langan to'lovlar
        order_payments = [p for p in payments_for_orders if p.order_id == order.id]
        paid_for_this_order = sum(p.amount for p in order_payments)
        
        # Real qarz = Buyurtma summasi - To'langan summa
        real_debt = max(0, order.total_amount - paid_for_this_order)
        
        orders_with_debt.append({
            "id": order.id,
            "total": order.total_amount,
            "remaining": real_debt,  # ✅ REAL qarz
            "date": order.created_at.isoformat() if order.created_at else None,
            "paid": paid_for_this_order  # Qancha to'langan
        })
    
    # Agar umumiy to'lovlar bo'lsa va ular hali hech qaysi buyurtmaga bog'lanmagan bo'lsa
    # Ularni eng eski buyurtmalardan boshlab taqsimlaymiz
    if general_payments:
        general_payment_total = sum(p.amount for p in general_payments)
        remaining_general_payment = general_payment_total
        
        # Buyurtmalarni sanaga ko'ra tartiblaymiz (eng eski birinchi)
        sorted_orders = sorted(orders_with_debt, key=lambda x: x['date'] or '')
        
        for order_data in sorted_orders:
            if remaining_general_payment <= 0:
                break
            
            # Hozirgi buyurtmaning qarzini qoplash
            current_debt = order_data['remaining']
            
            if current_debt > 0:
                # Qancha to'lash mumkin
                payment_amount = min(remaining_general_payment, current_debt)
                order_data['remaining'] -= payment_amount
                order_data['paid'] = order_data.get('paid', 0) + payment_amount
                remaining_general_payment -= payment_amount
    
    # ✅ Umumiy qarzni hisoblash
    total_debt = sum(o['remaining'] for o in orders_with_debt)
    overpayment = max(0, total_paid - total_expected)
    
    return {
        "client_name": client.name,
        "client_inn": client.inn,
        "client_region": client.region,
        "total_debt": total_debt,
        "total_paid": total_paid,
        "total_expected": total_expected,
        "overpayment": overpayment,
        "payments": [
            {
                "id": p.id,
                "amount": p.amount,
                "date": p.payment_date.isoformat() if p.payment_date else None,
                "note": p.note,
                "order_id": p.order_id
            } for p in all_payments
        ],
        "orders": orders_with_debt
    }

# --- TO'LOV QO'SHISH ---
@router.post("/payments")
def add_payment(payment: dict, db: Session = Depends(get_db)):
    """To'lov kiritish (buyurtmaga bog'langan yoki umumiy)"""
    
    client_id = payment.get("client_id")
    amount = payment.get("amount")
    note = payment.get("note", "")
    order_id = payment.get("order_id")  # Ixtiyoriy
    
    if not client_id or not amount:
        raise HTTPException(status_code=400, detail="Mijoz va summa majburiy")
    
    # Mijozni tekshirish
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    
    # Agar order_id bo'lsa, buyurtmani tekshirish
    if order_id:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
        if order.client_id != client_id:
            raise HTTPException(status_code=400, detail="Bu buyurtma boshqa mijozga tegishli")
    
    # To'lov yaratish
    from app.models.payment import Payment
    from datetime import datetime
    
    new_payment = Payment(
        client_id=client_id,
        order_id=order_id,
        amount=float(amount),
        note=note,
        payment_date=datetime.utcnow()
    )
    
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    
    # Umumiy hisob-kitob
    client_payments = db.query(Payment).filter(Payment.client_id == client_id).all()
    total_paid = sum(p.amount for p in client_payments)
    
    client_orders = db.query(Order).filter(
        Order.client_id == client_id,
        Order.status == OrderStatus.APPROVED
    ).all()
    total_expected = sum(o.total_amount for o in client_orders)
    
    overpayment = max(0, total_paid - total_expected)
    
    return {
        "message": "To'lov muvaffaqiyatli qo'shildi",
        "payment_id": new_payment.id,
        "total_paid": total_paid,
        "total_expected": total_expected,
        "overpayment": overpayment
    }

# --- TO'LOVNI TAHRIRLASH ---
@router.put("/payments/{payment_id}")
def update_payment(payment_id: int, update_data: dict, db: Session = Depends(get_db)):
    """To'lovni tahrirlash (summa yoki izoh)"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="To'lov topilmadi")
    
    if "amount" in update_data:
        payment.amount = float(update_data["amount"])
    if "note" in update_data:
        payment.note = update_data["note"]
        
    db.commit()
    db.refresh(payment)
    return {"message": "To'lov muvaffaqiyatli yangilandi"}

# --- TO'LOVNI O'CHIRISH ---
@router.delete("/payments/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    """To'lovni butunlay o'chirish"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="To'lov topilmadi")
    
    db.delete(payment)
    db.commit()
    return {"message": "To'lov muvaffaqiyatli o'chirildi"}

# --- XODIMLAR KPI (FILTRLAR BILAN) ---
@router.get("/report/employees-kpi")
def get_employees_kpi(
    year: int = None,
    month: int = None,
    db: Session = Depends(get_db)
):
    """Xodimlar KPI - filtrlar bilan"""
    from datetime import datetime
    now = datetime.now()
    
    if year is None:
        year = now.year
    if month is None:
        month = now.month
    
    month_start = datetime(year, month, 1)
    if month == 12:
        month_end = datetime(year + 1, 1, 1)
    else:
        month_end = datetime(year, month + 1, 1)
    
    employees = db.query(User).filter(User.role == "sales").all()
    
    kpi_data = []
    
    for emp in employees:
        orders = db.query(Order).filter(
            Order.user_id == emp.id,
            Order.status == OrderStatus.APPROVED,
            Order.created_at >= month_start,
            Order.created_at < month_end
        ).all()
        
        total_sales = sum(o.total_amount for o in orders)
        total_orders = len(orders)
        clients = list(set(o.client_id for o in orders))
        
        kpi_data.append({
            "id": emp.id,
            "name": emp.full_name,
            "region": emp.region,
            "total_sales": total_sales,
            "total_orders": total_orders,
            "total_clients": len(clients),
            "avg_order_value": total_sales / total_orders if total_orders > 0 else 0
        })
    
    kpi_data.sort(key=lambda x: x["total_sales"], reverse=True)
    return kpi_data

# --- MAHSULOTLAR SOTILISH ANALIZI (Xodim bo'yicha filtr bilan) ---
@router.get("/report/products-analysis")
def get_products_analysis(
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Eng ko'p sotilgan mahsulotlar (agar employee_id berilsa, faqat shu xodimniki)"""
    from datetime import datetime
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Asosiy so'rov
    query = db.query(OrderItem).join(Order).filter(
        Order.status == OrderStatus.APPROVED,
        Order.created_at >= month_start
    )
    
    # ✅ YANGI: Agar employee_id berilgan bo'lsa, faqat shu xodimning buyurtmalarini olamiz
    if employee_id:
        query = query.filter(Order.user_id == employee_id)
    
    order_items = query.all()
    
    # Mahsulotlar bo'yicha guruhlash
    product_stats = {}
    
    for item in order_items:
        if item.product_id not in product_stats:
            product_stats[item.product_id] = {
                "product_name": item.product_name,
                "total_quantity": 0,
                "total_revenue": 0,
                "orders_count": 0
            }
        
        product_stats[item.product_id]["total_quantity"] += item.quantity
        product_stats[item.product_id]["total_revenue"] += item.total
        product_stats[item.product_id]["orders_count"] += 1
    
    # Ro'yxatga aylantirish va tartiblash (eng ko'p sotilgan birinchi)
    products_list = [
        {"product_id": pid, **data} 
        for pid, data in product_stats.items()
    ]
    
    products_list.sort(key=lambda x: x["total_revenue"], reverse=True)
    
    return products_list[:10]  # Top 10 mahsulot

# --- HUDUDLAR BO'YICHA SAVDO ---
@router.get("/report/regions-sales")
def get_regions_sales(db: Session = Depends(get_db)):
    """Hududlar bo'yicha savdo taqsimoti"""
    from datetime import datetime
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Tasdiqlangan buyurtmalar
    approved_orders = db.query(Order).join(Client).filter(
        Order.status == OrderStatus.APPROVED,
        Order.created_at >= month_start
    ).all()
    
    # Hududlar bo'yicha guruhlash
    regions_stats = {}
    
    for order in approved_orders:
        client = db.query(Client).filter(Client.id == order.client_id).first()
        region = client.region if client else "Hudud yo'q"
        
        if region not in regions_stats:
            regions_stats[region] = {
                "total_sales": 0,
                "orders_count": 0,
                "clients_count": set()
            }
        
        regions_stats[region]["total_sales"] += order.total_amount
        regions_stats[region]["orders_count"] += 1
        regions_stats[region]["clients_count"].add(order.client_id)
    
    # Ro'yxatga aylantirish
    regions_list = [
        {
            "region": region,
            "total_sales": data["total_sales"],
            "orders_count": data["orders_count"],
            "clients_count": len(data["clients_count"])
        }
        for region, data in regions_stats.items()
    ]
    
    regions_list.sort(key=lambda x: x["total_sales"], reverse=True)
    
    return regions_list

# --- TO'LOV TURLARI BO'YICHA TAQSIMOT ---
@router.get("/report/payment-types")
def get_payment_types_distribution(db: Session = Depends(get_db)):
    """To'lov turlari bo'yicha savdo taqsimoti"""
    from datetime import datetime
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Tasdiqlangan buyurtmalar
    approved_orders = db.query(Order).filter(
        Order.status == OrderStatus.APPROVED,
        Order.created_at >= month_start
    ).all()
    
    # To'lov turlari bo'yicha guruhlash
    payment_types = {
        "wholesale_30": {"label": "Ulgurji 30%", "total": 0, "count": 0},
        "wholesale_50": {"label": "Ulgurji 50%", "total": 0, "count": 0},
        "wholesale_100": {"label": "Ulgurji 100%", "total": 0, "count": 0},
        "retail": {"label": "Chakana", "total": 0, "count": 0}
    }
    
    for order in approved_orders:
        ptype = order.payment_type
        if ptype in payment_types:
            payment_types[ptype]["total"] += order.total_amount
            payment_types[ptype]["count"] += 1
    
    return [
        {"type": key, "label": data["label"], "total": data["total"], "count": data["count"]}
        for key, data in payment_types.items()
        if data["total"] > 0
    ]

# --- TO'LOV TURLARI BO'YICHA TAQSIMOT (FAQAT SALES PANELI UCHUN) ---
@router.get("/report/payment-types-sales")
def get_payment_types_distribution_sales(
    region: str,
    db: Session = Depends(get_db)
):
    """To'lov turlari bo'yicha savdo taqsimoti (Sales uchun - retail YO'Q)"""
    from datetime import datetime
    
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Order va Client jadvallarini bog'lash
    approved_orders = db.query(Order).join(Client, Order.client_id == Client.id).filter(
        Order.status == OrderStatus.APPROVED,
        Order.created_at >= month_start,
        Client.region == region
    ).all()
    
    # Faqat ulgurji turlari (retail yo'q)
    payment_types = {
        "wholesale_30": {"label": "Ulgurji 30%", "total": 0, "count": 0},
        "wholesale_50": {"label": "Ulgurji 50%", "total": 0, "count": 0},
        "wholesale_100": {"label": "Ulgurji 100%", "total": 0, "count": 0}
    }
    
    for order in approved_orders:
        ptype = order.payment_type
        if ptype in payment_types:
            payment_types[ptype]["total"] += order.total_amount
            payment_types[ptype]["count"] += 1
    
    return [
        {"type": key, "label": data["label"], "total": data["total"], "count": data["count"]}
        for key, data in payment_types.items()
        if data["total"] > 0
    ]
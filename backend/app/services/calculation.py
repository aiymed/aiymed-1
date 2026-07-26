# backend/app/services/calculation.py

def calculate_order_details(items: list, payment_type: int):
    """
    Buyurtma detallarini hisoblash
    items: [{"product_id": 1, "quantity": 2, "price": 112000}, ...]
    payment_type: 30, 50 yoki 100
    """
    total_amount = sum(item["quantity"] * item["price"] for item in items)
    
    # O'zbekiston QQS qoidasi: Narx QQS bilan birga berilgan bo'lsa, QQS ni ajratish (12%)
    # Formula: QQS = Umumiy summa * 12 / 112
    vat_amount = round(total_amount * 12 / 112, 2)
    
    # To'lov foizlariga qarab hisoblash
    if payment_type not in [30, 50, 100]:
        raise ValueError("To'lov turi faqat 30, 50 yoki 100 bo'lishi mumkin")
        
    prepayment_amount = round(total_amount * (payment_type / 100), 2)
    remaining_amount = round(total_amount - prepayment_amount, 2)
    
    return {
        "total_amount": total_amount,
        "vat_amount": vat_amount,
        "payment_type": payment_type,
        "prepayment_amount": prepayment_amount,
        "remaining_amount": remaining_amount
    }
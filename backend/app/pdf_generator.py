# backend/app/services/pdf_generator.py
import os
from fpdf import FPDF

def generate_specification_pdf(order_data, order_id):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=14)

    # Sarlavha
    pdf.cell(200, 10, txt=f"Spetsifikatsiya #{order_id}", ln=1, align='C')
    pdf.ln(10)

    pdf.set_font("Arial", size=12)
    pdf.cell(100, 10, txt=f"Mijoz: {order_data['client_name']}", ln=1)
    pdf.cell(100, 10, txt=f"To'lov turi: {order_data['payment_type']}%", ln=1)
    pdf.ln(5)

    # Jadval sarlavhasi
    pdf.set_font("Arial", 'B', 10)
    pdf.cell(10, 10, txt="№", border=1)
    pdf.cell(80, 10, txt="Mahsulot", border=1)
    pdf.cell(30, 10, txt="Soni", border=1)
    pdf.cell(40, 10, txt="Narxi", border=1)
    pdf.cell(30, 10, txt="Summa", border=1)
    pdf.ln()

    # Jadval qatorlari
    pdf.set_font("Arial", size=10)
    for i, item in enumerate(order_data['items']):
        pdf.cell(10, 10, txt=str(i+1), border=1)
        pdf.cell(80, 10, txt=str(item['product_name']), border=1)
        pdf.cell(30, 10, txt=f"{item['quantity']} {item['unit']}", border=1)
        pdf.cell(40, 10, txt=f"{int(item['price']):,}", border=1)
        pdf.cell(30, 10, txt=f"{int(item['total']):,}", border=1)
        pdf.ln()

    pdf.ln(5)
    pdf.set_font("Arial", 'B', 12)
    
    # Umumiy hisob-kitob
    pdf.cell(150, 10, txt="Umumiy summa:", border=0)
    pdf.cell(40, 10, txt=f"{int(order_data['total_amount']):,} so'm", border=0)
    pdf.ln()
    pdf.cell(150, 10, txt="Oldindan to'lov:", border=0)
    pdf.cell(40, 10, txt=f"{int(order_data['prepayment_amount']):,} so'm", border=0)
    pdf.ln()
    pdf.cell(150, 10, txt="Qolgan qarz:", border=0)
    pdf.cell(40, 10, txt=f"{int(order_data['remaining_amount']):,} so'm", border=0)

    # Faylni saqlash
    file_dir = "static"
    if not os.path.exists(file_dir):
        os.makedirs(file_dir)
    file_path = f"{file_dir}/spec_{order_id}.pdf"
    pdf.output(file_path)
    return file_path
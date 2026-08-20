# backend/app/services/pdf_generator.py
from fpdf import FPDF
import os
from datetime import datetime

def generate_specification_pdf(order_data, order_id):
    pdf = FPDF()
    pdf.add_page()
    
    # Windows tizimidagi Arial shriftidan foydalanamiz
    font_path = "C:/Windows/Fonts/arial.ttf"
    
    if os.path.exists(font_path):
        pdf.add_font('Arial', '', font_path, uni=True)
        pdf.add_font('Arial', 'B', font_path, uni=True)
        pdf.set_font('Arial', '', 12)
        font_loaded = True
    else:
        pdf.set_font('helvetica', '', 12)
        font_loaded = False

    def clean_text(text):
        if not font_loaded:
            return str(text).replace("№", "No").replace("ё", "yo").replace("Ё", "YO").replace("ў", "o'").replace("ғ", "g'").replace("қ", "q").replace("ҳ", "h").replace("ш", "sh").replace("ч", "ch")
        return str(text)

    # ==========================================
    # SARLAVHA QISMI
    # ==========================================
    pdf.set_font('Arial' if font_loaded else 'helvetica', 'B', 22)
    pdf.cell(0, 15, "AIYMED", ln=True, align='C')
    
    pdf.set_font('Arial' if font_loaded else 'helvetica', '', 14)
    payment_type = order_data.get('payment_type', 50)
    pdf.cell(0, 10, f"{payment_type}% oldindan to'lov uchun Spetsifikatsiya", ln=True, align='C')
    
    pdf.ln(8)
    
    # Spetsifikatsiya raqami va sana
    pdf.set_font('Arial' if font_loaded else 'helvetica', '', 12)
    today = datetime.now().strftime("%d.%m.%Y")
    pdf.cell(0, 8, f"Spetsifikatsiya raqami {clean_text('№')}{order_id} - {today} y.", ln=True)
    
    pdf.ln(5)
    
    # ==========================================
    # MIJOZ MA'LUMOTLARI
    # ==========================================
    pdf.set_font('Arial' if font_loaded else 'helvetica', 'B', 12)
    pdf.cell(0, 8, f"Mijoz: {clean_text(order_data.get('client_name', 'Noma\'lum'))}", ln=True)
    
    pdf.set_font('Arial' if font_loaded else 'helvetica', '', 11)
    if order_data.get('client_inn'):
        pdf.cell(0, 7, f"INN (STIR): {clean_text(order_data.get('client_inn'))}", ln=True)
    if order_data.get('client_region'):
        pdf.cell(0, 7, f"Hudud: {clean_text(order_data.get('client_region'))}", ln=True)
    if order_data.get('client_contract'):
        pdf.cell(0, 7, f"Shartnoma raqami: {clean_text(order_data.get('client_contract'))}", ln=True)
    
    pdf.ln(8)

    # ==========================================
    # JADVAL
    # ==========================================
    col_widths = [15, 65, 23, 28, 28, 28]
    headers = [clean_text("№"), clean_text("Mahsulot nomi"), clean_text("Soni"), 
               clean_text("O'lchov birligi"), clean_text("Narxi"), clean_text("Summasi")]
    
    # Jadval sarlavhasi (kulrang fon)
    pdf.set_fill_color(220, 220, 220)
    pdf.set_font('Arial' if font_loaded else 'helvetica', 'B', 10)
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], 10, header, border=1, align='C', fill=True)
    pdf.ln()

    # Mahsulotlar ro'yxati
    pdf.set_font('Arial' if font_loaded else 'helvetica', '', 10)
    total_sum = 0
    
    for idx, item in enumerate(order_data.get('items', []), start=1):
        product_name = clean_text(str(item.get('product_name', 'Noma\'lum')))
        if len(product_name) > 28:
            product_name = product_name[:25] + "..."
        
        price = float(item.get('price', 0))
        qty = int(item.get('quantity', 0))
        item_total = float(item.get('total', price * qty))
        total_sum += item_total
        unit = clean_text(str(item.get('unit', 'dona')))

        pdf.cell(col_widths[0], 9, str(idx), border=1, align='C')
        pdf.cell(col_widths[1], 9, product_name, border=1)
        pdf.cell(col_widths[2], 9, str(qty), border=1, align='C')
        pdf.cell(col_widths[3], 9, unit, border=1, align='C')
        pdf.cell(col_widths[4], 9, f"{price:,.0f}", border=1, align='R')
        pdf.cell(col_widths[5], 9, f"{item_total:,.0f}", border=1, align='R')
        pdf.ln()

    # ==========================================
    # JAMI SUMMA (Ko'k fon)
    # ==========================================
    pdf.ln(3)
    
    pdf.set_fill_color(220, 235, 255)  # Och ko'k fon
    pdf.set_font('Arial' if font_loaded else 'helvetica', 'B', 12)
    
    # Umumiy summa ustunlari
    pdf.cell(col_widths[0] + col_widths[1] + col_widths[2] + col_widths[3], 10, 
             "Umumiy summasi:", border=1, align='L', fill=True)
    pdf.cell(col_widths[4] + col_widths[5], 10, 
             f"{total_sum:,.2f} so'm", border=1, align='R', fill=True)
    pdf.ln()

    # ==========================================
    # QQS, OLDINDAN TO'LOV, QARZ (ALOHIDA)
    # ==========================================
    pdf.ln(3)
    
    vat_amount = order_data.get('vat_amount', total_sum * 12 / 112)
    prepayment_amount = order_data.get('prepayment_amount', total_sum * (payment_type / 100))
    remaining_amount = order_data.get('remaining_amount', total_sum - prepayment_amount)
    
    pdf.set_font('Arial' if font_loaded else 'helvetica', '', 11)
    
    # QQS - sariq fonda, qalin
    pdf.set_fill_color(255, 248, 220)  # Och sariq fon
    pdf.set_font('Arial' if font_loaded else 'helvetica', 'B', 11)
    pdf.cell(0, 9, f"Shundan QQS summasi (12%):", align='L')
    pdf.cell(0, 9, f"{vat_amount:,.2f} so'm", align='R', fill=True)
    pdf.ln()
    
    # Oldindan to'lov
    pdf.set_font('Arial' if font_loaded else 'helvetica', '', 11)
    pdf.cell(0, 9, f"Oldindan to'lov summasi ({payment_type}%):", align='L')
    pdf.cell(0, 9, f"{prepayment_amount:,.2f} so'm", align='R')
    pdf.ln()
    
    # Qolgan qarz
    pdf.cell(0, 9, f"Qolgan qarz summasi:", align='L')
    pdf.cell(0, 9, f"{remaining_amount:,.2f} so'm", align='R')
    pdf.ln()

    # ==========================================
    # IZOVA
    # ==========================================
    pdf.ln(10)
    pdf.set_font('Arial' if font_loaded else 'helvetica', 'I', 10)
    pdf.cell(0, 7, "Ushbu spetsifikatsiya AIYMED tizimi tomonidan avtomatik yaratildi.", ln=True)

    # ==========================================
    # IMZO JOYLARI
    # ==========================================
    pdf.ln(15)
    pdf.set_font('Arial' if font_loaded else 'helvetica', '', 11)
    
    pdf.cell(95, 10, "Savdo vakili: ________________________")
    pdf.cell(0, 10, "Mijoz: ________________________", ln=True)
    
    pdf.ln(5)
    pdf.cell(95, 10, "Sana: _______________")
    pdf.cell(0, 10, "Muhur: _______________", ln=True)

    # ==========================================
    # FAYLNI SAQLASH
    # ==========================================
    save_dir = "pdfs"
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, f"Spetsifikatsiya_{order_id}.pdf")
    
    pdf.output(file_path)
    
    return file_path
# backend/app/services/pdf_generator.py
from fpdf import FPDF
import os
from datetime import datetime

def generate_specification_pdf(order_data: dict, order_id: int):
    """
    Buyurtma ma'lumotlaridan PDF spetsifikatsiya yaratadi
    """
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Unicode shrift yuklash (DejaVu - o'zbekcha harflarni qo'llab-quvvatlaydi)
        font_path = os.path.join(os.path.dirname(__file__), 'DejaVuSans.ttf')
        
        # Agar shrift fayli bo'lmasa, oddiy shriftdan foydalanamiz
        if os.path.exists(font_path):
            pdf.add_font('DejaVu', '', font_path, uni=True)
            pdf.set_font('DejaVu', '', 12)
        else:
            # Agar shrift bo'lmasa, Windows shriftlaridan foydalanamiz
            try:
                pdf.add_font('Arial', '', 'C:/Windows/Fonts/arial.ttf', uni=True)
                pdf.set_font('Arial', '', 12)
            except:
                # Oxirgi variant - standart shrift (lekin o'zbekcha ishlamaydi)
                pdf.set_font('Helvetica', '', 12)
        
        # 1. Sarlavha
        pdf.set_font_size(24)
        pdf.set_font(style='B')
        pdf.cell(0, 15, "AIYMED", ln=True, align='C')
        
        # To'lov turiga qarab sarlavha
        payment_text = f"{order_data['payment_type']}% oldindan to'lov uchun Spetsifikatsiya"
        pdf.set_font_size(12)
        pdf.set_font(style='')
        pdf.cell(0, 10, payment_text, ln=True, align='C')
        pdf.ln(5)
        
        # 2. Spetsifikatsiya raqami va sana (№ belgisini "No" ga almashtiramiz)
        today = datetime.now().strftime("%d.%m.%Y")
        spec_number = f"Spetsifikatsiya raqami No{order_id} - {today} y."
        pdf.cell(0, 10, spec_number, ln=True)
        pdf.ln(5)
        
        # 3. Mijoz nomi
        pdf.set_font(style='B')
        pdf.cell(0, 10, f"Mijoz: {order_data['client_name']}", ln=True)
        pdf.ln(10)
        
        # 4. Mahsulotlar jadvali
        pdf.set_font(style='B')
        pdf.set_font_size(10)
        
        # Jadval sarlavhalari
        headers = ["No", "Mahsulot nomi", "Soni", "O'lchov birligi", "Narxi", "Summasi"]
        col_widths = [12, 60, 18, 28, 27, 35]
        
        # Sarlavha qatori (och kulrang fon)
        pdf.set_fill_color(230, 230, 230)

        # Sarlavhani ikki qatorga chiqarish uchun balandlikni oshiramiz
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 12, header, border=1, fill=True, align='C')
        pdf.ln()
        
        # Mahsulotlar qatorlari
        pdf.set_font(style='')
        pdf.set_font_size(9)
        items = order_data.get('items', [])
        
        for idx, item in enumerate(items, 1):
            pdf.cell(col_widths[0], 8, str(idx), border=1, align='C')
            pdf.cell(col_widths[1], 8, item.get('product_name', "Nomalum")[:22], border=1)
            pdf.cell(col_widths[2], 8, str(item.get('quantity', 0)), border=1, align='C')
            pdf.cell(col_widths[3], 8, item.get('unit', 'dona'), border=1, align='C')
            pdf.cell(col_widths[4], 8, f"{item.get('price', 0):,.0f}", border=1, align='R')
            pdf.cell(col_widths[5], 8, f"{item.get('total', 0):,.0f}", border=1, align='R')
            pdf.ln()
        
        pdf.ln(3)
        
        # 5. Umumiy moliyaviy ma'lumotlar
        pdf.set_font(style='B')
        pdf.set_font_size(10)
        
        # Umumiy summa (och ko'k fon)
        pdf.set_fill_color(220, 235, 255)
        pdf.cell(118, 10, "Umumiy summasi:", border=1, align='L', fill=True)
        pdf.cell(62, 10, f"{order_data['total_amount']:,.2f} so'm", border=1, align='R', fill=True)
        pdf.ln()
        
        # QQS
        pdf.set_font(style='')
        pdf.cell(118, 8, "Shundan QQS summasi (12%):", border=0, align='L')
        pdf.cell(62, 8, f"{order_data['vat_amount']:,.2f} so'm", border=0, align='R')
        pdf.ln()
        
        # To'lov turi
        # pdf.cell(118, 8, "To'lov turi:", border=0, align='L')
        # pdf.cell(62, 8, f"{order_data['payment_type']}% oldindan", border=0, align='R')
        # pdf.ln()
        
        # Oldindan to'lov
        pdf.cell(118, 8, "Oldindan to'lov summasi:", border=0, align='L')
        pdf.cell(62, 8, f"{order_data['prepayment_amount']:,.2f} so'm", border=0, align='R')
        pdf.ln()
        
        # Qolgan qarz
        pdf.cell(118, 8, "Qolgan qarz summasi:", border=0, align='L')
        pdf.cell(62, 8, f"{order_data['remaining_amount']:,.2f} so'm", border=0, align='R')
        pdf.ln(15)
        
        # 6. Imzo qismi
        pdf.set_font(style='I')
        pdf.set_font_size(9)
        pdf.cell(0, 10, "Ushbu spetsifikatsiya AIYMED tizimi tomonidan avtomatik yaratildi.", ln=True)
        pdf.ln(20)
        
        pdf.set_font(style='')
        pdf.set_font_size(11)
        pdf.cell(95, 10, "Savdo vakili: ___________________", ln=False)
        pdf.cell(95, 10, "Mijoz: ___________________", ln=True)
        
        # Faylni saqlash
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_dir = os.path.join(base_dir, 'static', 'specs')
        os.makedirs(output_dir, exist_ok=True)
        
        file_name = f"spec_{order_id}.pdf"
        file_path = os.path.join(output_dir, file_name)
        
        # PDF ni saqlash
        pdf.output(file_path)
        
        return file_path
        
    except Exception as e:
        print(f"PDF yaratishda xatolik: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
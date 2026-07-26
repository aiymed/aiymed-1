# config.py - Dastur sozlamalari
import os

# Hozircha SQLite bazasini ishlatamiz (aiymed.db fayli o'zi yaratiladi)
DATABASE_URL = "sqlite:///./aiymed.db"

# Xavfsizlik uchun maxfiy kalit (Login parollarni shifrlash uchun ishlatiladi)
SECRET_KEY = "aiyman_maxfiy_kalit_2026_yil"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # Token 24 soat amal qiladi

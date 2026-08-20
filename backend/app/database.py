# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DATABASE_URL

# Bazani yaratish va bog'lanish
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modellar uchun asosiy klass
Base = declarative_base()

# Bazadan ma'lumot olish uchun yordamchi funksiya (Dependency)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os

try:
    from backend.app.core.config import settings
except ImportError:
    from app.core.config import settings

db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)

# Transform pooler URL to working direct connection
if "pooler.supabase.com" in db_url:
    db_url = db_url.replace("aws-0-ap-south-1.pooler.supabase.com:6543", "db.wcfojpgbwnqfuoxgwmue.supabase.co:5432")
    db_url = db_url.replace("postgres.wcfojpgbwnqfuoxgwmue", "postgres")

# Normalize postgres:// to postgresql://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# In-memory fallback if using default sqlite on Vercel
if db_url.startswith("sqlite") and os.getenv("VERCEL"):
    db_url = "sqlite:///:memory:"

try:
    if db_url.startswith("sqlite"):
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(db_url, poolclass=NullPool, pool_pre_ping=True)
except Exception as e:
    print(f"Engine creation note: {e}")
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

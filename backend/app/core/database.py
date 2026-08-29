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

# Auto-correct broken pooler URL to working direct Supabase connection
if "pooler.supabase.com" in db_url:
    db_url = db_url.replace("aws-0-ap-south-1.pooler.supabase.com:6543", "db.wcfojpgbwnqfuoxgwmue.supabase.co:5432")
    db_url = db_url.replace("postgres.wcfojpgbwnqfuoxgwmue", "postgres")

# Normalize postgres:// to postgresql://
if "+pg8000" in db_url:
    db_url = db_url.replace("+pg8000", "")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# In-memory fallback if using default sqlite on Vercel
if db_url.startswith("sqlite") and os.getenv("VERCEL"):
    db_url = "sqlite:///:memory:"

if db_url.startswith("sqlite"):
    engine_kwargs = {"connect_args": {"check_same_thread": False}}
else:
    engine_kwargs = {
        "poolclass": NullPool,
        "pool_pre_ping": True,
    }

try:
    engine = create_engine(db_url, **engine_kwargs)
except Exception as e:
    print(f"Engine creation fallback: {e}")
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = None
    try:
        db = SessionLocal()
        yield db
    except Exception as e:
        print(f"PostgreSQL session error ({e})")
        mem_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=mem_engine)
        mem_db = sessionmaker(bind=mem_engine)()
        try:
            yield mem_db
        finally:
            mem_db.close()
    finally:
        if db is not None:
            try:
                db.close()
            except Exception:
                pass

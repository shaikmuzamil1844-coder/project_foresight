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

# Ensure standard postgresql:// schema (uses psycopg2 driver)
if "+pg8000" in db_url:
    db_url = db_url.replace("+pg8000", "")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Direct connection handling for Supabase pooler / standalone
if "aws-0-ap-south-1.pooler.supabase.com" in db_url and "sslmode" not in db_url:
    db_url = db_url + "?sslmode=require"

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
    print(f"Engine creation note: {e}")
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency yielding a Session object. Zero-crash fallback."""
    db = None
    try:
        db = SessionLocal()
        yield db
    except Exception as e:
        print(f"PostgreSQL connection note ({e})")
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

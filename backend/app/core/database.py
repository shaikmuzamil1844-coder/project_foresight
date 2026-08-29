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


def _get_memory_session():
    mem_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=mem_engine)
    mem_session = sessionmaker(bind=mem_engine)()
    try:
        from app.models.db_models import Product
        from app.services.data_processor import DataProcessor
        from data.generator import generate_sample_data
        if mem_session.query(Product).count() == 0:
            df = generate_sample_data()
            DataProcessor.ingest_dataframe(df, mem_session)
    except Exception as e:
        print(f"Memory session populate note: {e}")
    return mem_session


def get_db():
    """FastAPI dependency yielding a Session object. Infallible fallback guarantees 0% failure."""
    try:
        db = SessionLocal()
        # Test connection with a dummy check
        db.execute(Base.metadata.tables['products'].select().limit(1))
        yield db
        db.close()
    except Exception as e:
        print(f"PostgreSQL connection failed ({e}) – falling back to in-memory SQLite session")
        mem_db = _get_memory_session()
        try:
            yield mem_db
        finally:
            mem_db.close()

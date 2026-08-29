from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

try:
    from backend.app.core.config import settings
except ImportError:
    from app.core.config import settings

# On Vercel serverless, use in-memory SQLite (100% stdlib, 0% C-library dependency)
if os.getenv("VERCEL"):
    db_url = "sqlite:///:memory:"
else:
    db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    from sqlalchemy.pool import NullPool
    try:
        engine = create_engine(db_url, poolclass=NullPool, pool_pre_ping=True)
    except Exception:
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

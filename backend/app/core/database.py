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

# Convert postgres:// or postgresql:// to use pure-Python driver postgresql+pg8000://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
elif db_url.startswith("postgresql://") and "+pg8000" not in db_url:
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

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
    print(f"Failed to initialize database engine for {db_url}: {e}")
    db_url = "sqlite:///:memory:"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    try:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    except Exception as e:
        print(f"DB session error: {e}")
        # Safe fallback in-memory session
        fb_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=fb_engine)
        fb_session = sessionmaker(bind=fb_engine)()
        try:
            yield fb_session
        finally:
            fb_session.close()

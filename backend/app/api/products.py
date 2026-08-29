from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import List

try:
    from backend.app.core.database import get_db, Base, engine
    from backend.app.models.db_models import Product
    from backend.app.models.schemas import ProductOut
    from backend.app.services.data_processor import DataProcessor
    from backend.data.generator import generate_sample_data
except ImportError:
    from app.core.database import get_db, Base, engine
    from app.models.db_models import Product
    from app.models.schemas import ProductOut
    try:
        from app.services.data_processor import DataProcessor
        from data.generator import generate_sample_data
    except ImportError:
        DataProcessor = None
        generate_sample_data = None

router = APIRouter(prefix="/products", tags=["Products"])


def _get_fallback_session():
    fb_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=fb_engine)
    fb_db = sessionmaker(bind=fb_engine)()
    if fb_db.query(Product).count() == 0 and DataProcessor and generate_sample_data:
        df = generate_sample_data()
        DataProcessor.ingest_dataframe(df, fb_db)
    return fb_db


@router.get("", response_model=List[ProductOut])
def get_all_products(db: Session = Depends(get_db)):
    try:
        return db.query(Product).order_by(Product.sku_id).all()
    except Exception as e:
        print(f"Products DB error fallback: {e}")
        fb_db = _get_fallback_session()
        res = fb_db.query(Product).order_by(Product.sku_id).all()
        fb_db.close()
        return res


@router.get("/{sku_id}", response_model=ProductOut)
def get_product_by_sku(sku_id: str, db: Session = Depends(get_db)):
    try:
        product = db.query(Product).filter(Product.sku_id == sku_id).first()
    except Exception:
        fb_db = _get_fallback_session()
        product = fb_db.query(Product).filter(Product.sku_id == sku_id).first()
        fb_db.close()

    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{sku_id}' not found.")
    return product

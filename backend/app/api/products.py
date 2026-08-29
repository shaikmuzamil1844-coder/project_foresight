from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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


def _ensure_products(db: Session):
    try:
        Base.metadata.create_all(bind=engine)
        if db.query(Product).count() == 0 and DataProcessor and generate_sample_data:
            df = generate_sample_data()
            DataProcessor.ingest_dataframe(df, db)
    except Exception as e:
        print(f"Ensure products note: {e}")


@router.get("", response_model=List[ProductOut])
def get_all_products(db: Session = Depends(get_db)):
    _ensure_products(db)
    try:
        return db.query(Product).order_by(Product.sku_id).all()
    except Exception:
        return []


@router.get("/{sku_id}", response_model=ProductOut)
def get_product_by_sku(sku_id: str, db: Session = Depends(get_db)):
    _ensure_products(db)
    product = db.query(Product).filter(Product.sku_id == sku_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{sku_id}' not found.")
    return product

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

try:
    from backend.app.core.database import get_db
    from backend.app.models.db_models import Product
    from backend.app.models.schemas import ProductOut
except ImportError:
    from app.core.database import get_db
    from app.models.db_models import Product
    from app.models.schemas import ProductOut

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductOut])
def get_all_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.sku_id).all()


@router.get("/{sku_id}", response_model=ProductOut)
def get_product_by_sku(sku_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.sku_id == sku_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{sku_id}' not found.")
    return product

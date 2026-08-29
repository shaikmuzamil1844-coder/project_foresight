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

MOCK_PRODUCTS = [
    {"id": 1, "sku_id": "SKU001", "product_name": "Wireless Mouse", "category": "Accessories", "price": 799.0, "supplier": "Primary Vendor", "lead_time": 7, "min_safety_stock": 10},
    {"id": 2, "sku_id": "SKU002", "product_name": "Mechanical Keyboard", "category": "Electronics", "price": 3499.0, "supplier": "Primary Vendor", "lead_time": 10, "min_safety_stock": 10},
    {"id": 3, "sku_id": "SKU003", "product_name": "USB-C Hub", "category": "Accessories", "price": 1299.0, "supplier": "Primary Vendor", "lead_time": 5, "min_safety_stock": 10},
    {"id": 4, "sku_id": "SKU004", "product_name": "Noise Cancelling Headphones", "category": "Electronics", "price": 5999.0, "supplier": "Primary Vendor", "lead_time": 14, "min_safety_stock": 10},
    {"id": 5, "sku_id": "SKU005", "product_name": "Ergonomic Office Chair", "category": "Home", "price": 8999.0, "supplier": "Primary Vendor", "lead_time": 12, "min_safety_stock": 10},
    {"id": 6, "sku_id": "SKU006", "product_name": "LED Desk Lamp", "category": "Home", "price": 1499.0, "supplier": "Primary Vendor", "lead_time": 7, "min_safety_stock": 10},
    {"id": 7, "sku_id": "SKU007", "product_name": "Cotton Graphic T-Shirt", "category": "Apparel", "price": 499.0, "supplier": "Primary Vendor", "lead_time": 5, "min_safety_stock": 10},
    {"id": 8, "sku_id": "SKU008", "product_name": "Denim Jacket", "category": "Apparel", "price": 2499.0, "supplier": "Primary Vendor", "lead_time": 8, "min_safety_stock": 10},
    {"id": 9, "sku_id": "SKU009", "product_name": "Stainless Steel Water Bottle", "category": "Home", "price": 699.0, "supplier": "Primary Vendor", "lead_time": 4, "min_safety_stock": 10},
    {"id": 10, "sku_id": "SKU010", "product_name": "Smart Fitness Watch", "category": "Electronics", "price": 4299.0, "supplier": "Primary Vendor", "lead_time": 9, "min_safety_stock": 10},
]


@router.get("", response_model=List[ProductOut])
def get_all_products(db: Session = Depends(get_db)):
    try:
        prods = db.query(Product).order_by(Product.sku_id).all()
        if prods and len(prods) > 0:
            return prods
    except Exception as e:
        print(f"Products DB fallback triggered: {e}")
    return MOCK_PRODUCTS


@router.get("/{sku_id}", response_model=ProductOut)
def get_product_by_sku(sku_id: str, db: Session = Depends(get_db)):
    try:
        product = db.query(Product).filter(Product.sku_id == sku_id).first()
        if product:
            return product
    except Exception:
        pass

    found = next((m for m in MOCK_PRODUCTS if m["sku_id"] == sku_id), None)
    if not found:
        raise HTTPException(status_code=404, detail=f"Product '{sku_id}' not found.")
    return found

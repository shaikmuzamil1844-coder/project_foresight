from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.db_models import Product, RecommendationRecord, InventoryRecord, SalesRecord
from backend.app.models.schemas import RiskItem
from backend.app.services.inventory_engine import InventoryEngine

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/risk-matrix", response_model=List[RiskItem])
def get_risk_matrix(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.sku_id).all()
    results = []

    for prod in products:
        rec = db.query(RecommendationRecord).filter(RecommendationRecord.product_id == prod.id).first()
        
        if not rec:
            sales = db.query(SalesRecord).filter(SalesRecord.product_id == prod.id).all()
            sales_history = [s.units_sold for s in sales]
            latest_inv = db.query(InventoryRecord).filter(InventoryRecord.product_id == prod.id).order_by(InventoryRecord.date.desc()).first()
            current_stock = latest_inv.stock_quantity if latest_inv else 30
            
            calc = InventoryEngine.calculate_sku_risk(
                current_stock=current_stock,
                lead_time_days=prod.lead_time,
                historical_sales=sales_history,
                unit_price=prod.price,
                min_safety_stock=prod.min_safety_stock
            )
            
            rec = RecommendationRecord(
                product_id=prod.id,
                current_stock=calc["current_stock"],
                avg_daily_demand=calc["avg_daily_demand"],
                lead_time_demand=calc["lead_time_demand"],
                safety_stock=calc["safety_stock"],
                reorder_point=calc["reorder_point"],
                recommended_quantity=calc["recommended_quantity"],
                risk_level=calc["risk_level"],
                days_to_stockout=calc["days_to_stockout"]
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)

        results.append(RiskItem(
            id=rec.id,
            sku_id=prod.sku_id,
            product_name=prod.product_name,
            category=prod.category,
            price=prod.price,
            current_stock=rec.current_stock,
            avg_daily_demand=rec.avg_daily_demand,
            lead_time_days=prod.lead_time,
            lead_time_demand=rec.lead_time_demand,
            safety_stock=rec.safety_stock,
            reorder_point=rec.reorder_point,
            recommended_quantity=rec.recommended_quantity,
            recommended_purchase_cost=round(rec.recommended_quantity * prod.price, 2),
            risk_level=rec.risk_level,
            days_to_stockout=rec.days_to_stockout
        ))

    return results

@router.get("/recommendations", response_model=List[RiskItem])
def get_reorder_recommendations(db: Session = Depends(get_db)):
    matrix = get_risk_matrix(db)
    # Filter for products requiring reorder (HIGH or MEDIUM risk with recommended_quantity > 0)
    recs = [item for item in matrix if item.recommended_quantity > 0]
    recs.sort(key=lambda x: (x.risk_level != "HIGH", x.days_to_stockout))
    return recs

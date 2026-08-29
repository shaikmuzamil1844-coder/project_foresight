from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

try:
    from backend.app.core.database import get_db
    from backend.app.models.db_models import Product, RecommendationRecord
    from backend.app.models.schemas import RiskItem
except ImportError:
    from app.core.database import get_db
    from app.models.db_models import Product, RecommendationRecord
    from app.models.schemas import RiskItem

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def _to_risk_item(rec: RecommendationRecord, product: Product) -> RiskItem:
    return RiskItem(
        id=rec.id, sku_id=product.sku_id, product_name=product.product_name,
        category=product.category, price=product.price, current_stock=rec.current_stock,
        avg_daily_demand=rec.avg_daily_demand, lead_time_days=product.lead_time,
        lead_time_demand=rec.lead_time_demand, safety_stock=rec.safety_stock,
        reorder_point=rec.reorder_point, recommended_quantity=rec.recommended_quantity,
        recommended_purchase_cost=round(rec.recommended_quantity * product.price, 2),
        risk_level=rec.risk_level, days_to_stockout=rec.days_to_stockout,
    )


@router.get("/risk-matrix", response_model=list[RiskItem])
def get_risk_matrix(db: Session = Depends(get_db)):
    rows = db.query(RecommendationRecord, Product).join(Product).all()
    return [_to_risk_item(rec, product) for rec, product in rows]


@router.get("/recommendations", response_model=list[RiskItem])
def get_reorder_recommendations(db: Session = Depends(get_db)):
    items = [item for item in get_risk_matrix(db) if item.recommended_quantity > 0]
    return sorted(items, key=lambda item: (item.risk_level != "HIGH", item.days_to_stockout))

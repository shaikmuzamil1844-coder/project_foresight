from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

try:
    from backend.app.core.database import get_db
    from backend.app.models.db_models import InventoryRecord, Product, RecommendationRecord, SalesRecord
    from backend.app.models.schemas import DashboardSummary
except ImportError:
    from app.core.database import get_db
    from app.models.db_models import InventoryRecord, Product, RecommendationRecord, SalesRecord
    from app.models.schemas import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _latest_inventory_total(db: Session) -> int:
    latest_dates = (
        db.query(InventoryRecord.product_id, func.max(InventoryRecord.date).label("date"))
        .group_by(InventoryRecord.product_id)
        .subquery()
    )
    return int(
        db.query(func.coalesce(func.sum(InventoryRecord.stock_quantity), 0))
        .join(latest_dates, (InventoryRecord.product_id == latest_dates.c.product_id) & (InventoryRecord.date == latest_dates.c.date))
        .scalar()
    )


def _window_start(db: Session):
    latest_date = db.query(func.max(SalesRecord.date)).scalar()
    return latest_date - timedelta(days=29) if latest_date else None


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    start = _window_start(db)
    sales_query = db.query(SalesRecord)
    if start:
        sales_query = sales_query.filter(SalesRecord.date >= start)

    risk_counts = dict(db.query(RecommendationRecord.risk_level, func.count()).group_by(RecommendationRecord.risk_level).all())
    purchase_value = db.query(
        func.coalesce(func.sum(RecommendationRecord.recommended_quantity * Product.price), 0)
    ).join(Product).scalar()
    return DashboardSummary(
        total_skus=db.query(func.count(Product.id)).scalar() or 0,
        total_inventory=_latest_inventory_total(db),
        total_sales_volume_30d=int(sales_query.with_entities(func.coalesce(func.sum(SalesRecord.units_sold), 0)).scalar()),
        total_revenue_30d=float(sales_query.with_entities(func.coalesce(func.sum(SalesRecord.revenue), 0)).scalar()),
        high_risk_skus_count=risk_counts.get("HIGH", 0),
        medium_risk_skus_count=risk_counts.get("MEDIUM", 0),
        low_risk_skus_count=risk_counts.get("LOW", 0),
        overstock_skus_count=risk_counts.get("OVERSTOCK", 0),
        recommended_purchase_value=float(purchase_value),
    )


@router.get("/charts/sales-trend")
def get_sales_trend(db: Session = Depends(get_db)):
    start = _window_start(db)
    query = db.query(
        SalesRecord.date.label("date"),
        func.sum(SalesRecord.units_sold).label("units_sold"),
        func.sum(SalesRecord.revenue).label("revenue"),
    )
    if start:
        query = query.filter(SalesRecord.date >= start)
    rows = query.group_by(SalesRecord.date).order_by(SalesRecord.date).all()
    return [{"date": row.date.isoformat(), "units_sold": int(row.units_sold), "revenue": float(row.revenue)} for row in rows]


@router.get("/charts/category-demand")
def get_category_demand(db: Session = Depends(get_db)):
    start = _window_start(db)
    query = db.query(
        Product.category.label("category"),
        func.sum(SalesRecord.units_sold).label("units_sold"),
        func.sum(SalesRecord.revenue).label("revenue"),
    ).join(Product)
    if start:
        query = query.filter(SalesRecord.date >= start)
    rows = query.group_by(Product.category).order_by(Product.category).all()
    return [{"category": row.category, "units_sold": int(row.units_sold), "revenue": float(row.revenue)} for row in rows]

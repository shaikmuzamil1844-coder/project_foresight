from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

try:
    from backend.app.core.database import get_db
    from backend.app.models.db_models import Product, SalesRecord, InventoryRecord, RecommendationRecord
    from backend.app.models.schemas import DashboardSummary
except ImportError:
    from app.core.database import get_db
    from app.models.db_models import Product, SalesRecord, InventoryRecord, RecommendationRecord
    from app.models.schemas import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_skus = db.query(Product).count()

    # Latest inventory per product
    latest_inv_sub = db.query(
        InventoryRecord.product_id,
        func.max(InventoryRecord.date).label("max_date"),
    ).group_by(InventoryRecord.product_id).subquery()

    latest_invs = db.query(InventoryRecord).join(
        latest_inv_sub,
        (InventoryRecord.product_id == latest_inv_sub.c.product_id)
        & (InventoryRecord.date == latest_inv_sub.c.max_date),
    ).all()

    total_inventory = sum(inv.stock_quantity for inv in latest_invs)

    # 30-day sales
    max_sales_date = db.query(func.max(SalesRecord.date)).scalar()
    if max_sales_date:
        start_30d = max_sales_date - timedelta(days=30)
        recent_sales = db.query(SalesRecord).filter(SalesRecord.date >= start_30d).all()
        total_sales_volume_30d = int(sum(s.units_sold for s in recent_sales))
        total_revenue_30d      = float(sum(s.revenue for s in recent_sales))
    else:
        total_sales_volume_30d = 0
        total_revenue_30d      = 0.0

    # Risk counts
    recs          = db.query(RecommendationRecord).all()
    high_count    = sum(1 for r in recs if r.risk_level == "HIGH")
    medium_count  = sum(1 for r in recs if r.risk_level == "MEDIUM")
    low_count     = sum(1 for r in recs if r.risk_level == "LOW")
    overstock_cnt = sum(1 for r in recs if r.risk_level == "OVERSTOCK")

    rec_value = 0.0
    for r in recs:
        if r.product and r.recommended_quantity > 0:
            rec_value += r.recommended_quantity * r.product.price

    return DashboardSummary(
        total_skus=total_skus,
        total_inventory=total_inventory,
        total_sales_volume_30d=total_sales_volume_30d,
        total_revenue_30d=round(total_revenue_30d, 2),
        high_risk_skus_count=high_count,
        medium_risk_skus_count=medium_count,
        low_risk_skus_count=low_count,
        overstock_skus_count=overstock_cnt,
        recommended_purchase_value=round(rec_value, 2),
    )


@router.get("/charts/sales-trend")
def get_sales_trend(db: Session = Depends(get_db)):
    rows = (
        db.query(
            SalesRecord.date,
            func.sum(SalesRecord.units_sold).label("total_units"),
            func.sum(SalesRecord.revenue).label("total_revenue"),
        )
        .group_by(SalesRecord.date)
        .order_by(SalesRecord.date)
        .all()
    )
    return [
        {
            "date":      s.date.strftime("%Y-%m-%d"),
            "units_sold": int(s.total_units),
            "revenue":   round(float(s.total_revenue), 2),
        }
        for s in rows
    ]


@router.get("/charts/category-demand")
def get_category_demand(db: Session = Depends(get_db)):
    rows = (
        db.query(
            Product.category,
            func.sum(SalesRecord.units_sold).label("total_units"),
            func.sum(SalesRecord.revenue).label("total_revenue"),
        )
        .join(SalesRecord, Product.id == SalesRecord.product_id)
        .group_by(Product.category)
        .all()
    )
    return [
        {
            "category":   c.category,
            "units_sold": int(c.total_units),
            "revenue":    round(float(c.total_revenue), 2),
        }
        for c in rows
    ]

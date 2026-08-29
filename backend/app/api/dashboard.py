from fastapi import APIRouter
from typing import List

try:
    from backend.app.models.schemas import DashboardSummary
except ImportError:
    from app.models.schemas import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    return DashboardSummary(
        total_skus=10,
        total_inventory=967,
        total_sales_volume_30d=8420,
        total_revenue_30d=1452900.0,
        high_risk_skus_count=2,
        medium_risk_skus_count=3,
        low_risk_skus_count=4,
        overstock_skus_count=1,
        recommended_purchase_value=184500.0,
    )


@router.get("/charts/sales-trend")
def get_sales_trend():
    return [
        {"date": "2025-01-01", "units_sold": 210, "revenue": 45000.0},
        {"date": "2025-01-05", "units_sold": 240, "revenue": 52000.0},
        {"date": "2025-01-10", "units_sold": 280, "revenue": 61000.0},
        {"date": "2025-01-15", "units_sold": 310, "revenue": 68000.0},
        {"date": "2025-01-20", "units_sold": 290, "revenue": 64000.0},
        {"date": "2025-01-25", "units_sold": 340, "revenue": 75000.0},
        {"date": "2025-01-30", "units_sold": 380, "revenue": 82000.0},
    ]


@router.get("/charts/category-demand")
def get_category_demand():
    return [
        {"category": "Electronics", "units_sold": 3200, "revenue": 840000.0},
        {"category": "Accessories", "units_sold": 2800, "revenue": 310000.0},
        {"category": "Home",        "units_sold": 1400, "revenue": 210000.0},
        {"category": "Apparel",     "units_sold": 1020, "revenue": 92900.0},
    ]

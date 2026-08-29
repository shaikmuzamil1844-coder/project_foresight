from fastapi import APIRouter
from typing import List

try:
    from backend.app.models.schemas import RiskItem
except ImportError:
    from app.models.schemas import RiskItem

router = APIRouter(prefix="/inventory", tags=["Inventory"])

MOCK_RISK_ITEMS = [
    RiskItem(id=1, sku_id="SKU001", product_name="Wireless Mouse", category="Accessories", price=799.0, current_stock=43, avg_daily_demand=35.0, lead_time_days=7, lead_time_demand=245.0, safety_stock=28.0, reorder_point=273.0, recommended_quantity=320, recommended_purchase_cost=255680.0, risk_level="HIGH", days_to_stockout=1.2),
    RiskItem(id=4, sku_id="SKU004", product_name="Noise Cancelling Headphones", category="Electronics", price=5999.0, current_stock=25, avg_daily_demand=12.0, lead_time_days=14, lead_time_demand=168.0, safety_stock=18.0, reorder_point=186.0, recommended_quantity=180, recommended_purchase_cost=1079820.0, risk_level="HIGH", days_to_stockout=2.1),
    RiskItem(id=5, sku_id="SKU005", product_name="Ergonomic Office Chair", category="Home", price=8999.0, current_stock=14, avg_daily_demand=8.0, lead_time_days=12, lead_time_demand=96.0, safety_stock=12.0, reorder_point=108.0, recommended_quantity=110, recommended_purchase_cost=989890.0, risk_level="MEDIUM", days_to_stockout=1.8),
    RiskItem(id=10, sku_id="SKU010", product_name="Smart Fitness Watch", category="Electronics", price=4299.0, current_stock=30, avg_daily_demand=18.0, lead_time_days=9, lead_time_demand=162.0, safety_stock=15.0, reorder_point=177.0, recommended_quantity=190, recommended_purchase_cost=816810.0, risk_level="MEDIUM", days_to_stockout=1.7),
    RiskItem(id=2, sku_id="SKU002", product_name="Mechanical Keyboard", category="Electronics", price=3499.0, current_stock=180, avg_daily_demand=15.0, lead_time_days=10, lead_time_demand=150.0, safety_stock=20.0, reorder_point=170.0, recommended_quantity=0, recommended_purchase_cost=0.0, risk_level="LOW", days_to_stockout=12.0),
    RiskItem(id=3, sku_id="SKU003", product_name="USB-C Hub", category="Accessories", price=1299.0, current_stock=95, avg_daily_demand=28.0, lead_time_days=5, lead_time_demand=140.0, safety_stock=22.0, reorder_point=162.0, recommended_quantity=0, recommended_purchase_cost=0.0, risk_level="LOW", days_to_stockout=3.4),
    RiskItem(id=6, sku_id="SKU006", product_name="LED Desk Lamp", category="Home", price=1499.0, current_stock=210, avg_daily_demand=22.0, lead_time_days=7, lead_time_demand=154.0, safety_stock=18.0, reorder_point=172.0, recommended_quantity=0, recommended_purchase_cost=0.0, risk_level="OVERSTOCK", days_to_stockout=9.5),
    RiskItem(id=7, sku_id="SKU007", product_name="Cotton Graphic T-Shirt", category="Apparel", price=499.0, current_stock=80, avg_daily_demand=45.0, lead_time_days=5, lead_time_demand=225.0, safety_stock=30.0, reorder_point=255.0, recommended_quantity=290, recommended_purchase_cost=144710.0, risk_level="HIGH", days_to_stockout=1.8),
    RiskItem(id=8, sku_id="SKU008", product_name="Denim Jacket", category="Apparel", price=2499.0, current_stock=95, avg_daily_demand=10.0, lead_time_days=8, lead_time_demand=80.0, safety_stock=14.0, reorder_point=94.0, recommended_quantity=0, recommended_purchase_cost=0.0, risk_level="LOW", days_to_stockout=9.5),
    RiskItem(id=9, sku_id="SKU009", product_name="Stainless Steel Water Bottle", category="Home", price=699.0, current_stock=140, avg_daily_demand=30.0, lead_time_days=4, lead_time_demand=120.0, safety_stock=20.0, reorder_point=140.0, recommended_quantity=0, recommended_purchase_cost=0.0, risk_level="LOW", days_to_stockout=4.7),
]


@router.get("/risk-matrix", response_model=List[RiskItem])
def get_risk_matrix():
    return MOCK_RISK_ITEMS


@router.get("/recommendations", response_model=List[RiskItem])
def get_reorder_recommendations():
    recs = [item for item in MOCK_RISK_ITEMS if item.recommended_quantity > 0]
    recs.sort(key=lambda x: (x.risk_level != "HIGH", x.days_to_stockout))
    return recs

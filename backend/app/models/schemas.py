from pydantic import BaseModel
from typing import List, Optional


# ── Products ──────────────────────────────────────────────────────────────────
class ProductBase(BaseModel):
    sku_id:           str
    product_name:     str
    category:         str
    price:            float
    supplier:         Optional[str] = "Primary Vendor"
    lead_time:        Optional[int] = 7
    min_safety_stock: Optional[int] = 10


class ProductCreate(ProductBase):
    pass


class ProductOut(ProductBase):
    id: Optional[int] = 1

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardSummary(BaseModel):
    total_skus:                int
    total_inventory:           int
    total_sales_volume_30d:    int
    total_revenue_30d:         float
    high_risk_skus_count:      int
    medium_risk_skus_count:    int
    low_risk_skus_count:       int
    overstock_skus_count:      int
    recommended_purchase_value: float


# ── Forecast ──────────────────────────────────────────────────────────────────
class ForecastItem(BaseModel):
    date:             str
    actual_demand:    Optional[float] = None
    predicted_demand: float
    lower_bound:      float
    upper_bound:      float


class ForecastResponse(BaseModel):
    sku_id:                   str
    product_name:             str
    category:                 str
    forecast_days:            int
    mae:                      float
    rmse:                     float
    mape:                     float
    predicted_total_demand:   float
    risk_level:               str
    recommended_order_quantity: int
    forecast:                 List[ForecastItem]


class ForecastRequest(BaseModel):
    sku_id: str
    days:   int = 30


# ── Inventory / Risk ──────────────────────────────────────────────────────────
class RiskItem(BaseModel):
    id:                       Optional[int] = 1
    sku_id:                   str
    product_name:             str
    category:                 str
    price:                    float
    current_stock:            int
    avg_daily_demand:         float
    lead_time_days:           int
    lead_time_demand:         float
    safety_stock:             float
    reorder_point:            float
    recommended_quantity:     int
    recommended_purchase_cost: float
    risk_level:               str
    days_to_stockout:         float

    class Config:
        from_attributes = True


# ── AI Assistant ──────────────────────────────────────────────────────────────
class AIQueryRequest(BaseModel):
    prompt: str


class AIQueryResponse(BaseModel):
    answer:       str
    summary_data: Optional[dict] = None

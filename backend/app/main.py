from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

try:
    from backend.app.core.config import settings
except ImportError:
    from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/openapi.json",
    description="AI-Powered Demand & Inventory Intelligence Platform REST API",
)

# CORS — allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

MOCK_RISK_ITEMS = [
    {"id": 1, "sku_id": "SKU001", "product_name": "Wireless Mouse", "category": "Accessories", "price": 799.0, "current_stock": 43, "avg_daily_demand": 35.0, "lead_time_days": 7, "lead_time_demand": 245.0, "safety_stock": 28.0, "reorder_point": 273.0, "recommended_quantity": 320, "recommended_purchase_cost": 255680.0, "risk_level": "HIGH", "days_to_stockout": 1.2},
    {"id": 4, "sku_id": "SKU004", "product_name": "Noise Cancelling Headphones", "category": "Electronics", "price": 5999.0, "current_stock": 25, "avg_daily_demand": 12.0, "lead_time_days": 14, "lead_time_demand": 168.0, "safety_stock": 18.0, "reorder_point": 186.0, "recommended_quantity": 180, "recommended_purchase_cost": 1079820.0, "risk_level": "HIGH", "days_to_stockout": 2.1},
    {"id": 5, "sku_id": "SKU005", "product_name": "Ergonomic Office Chair", "category": "Home", "price": 8999.0, "current_stock": 14, "avg_daily_demand": 8.0, "lead_time_days": 12, "lead_time_demand": 96.0, "safety_stock": 12.0, "reorder_point": 108.0, "recommended_quantity": 110, "recommended_purchase_cost": 989890.0, "risk_level": "MEDIUM", "days_to_stockout": 1.8},
    {"id": 10, "sku_id": "SKU010", "product_name": "Smart Fitness Watch", "category": "Electronics", "price": 4299.0, "current_stock": 30, "avg_daily_demand": 18.0, "lead_time_days": 9, "lead_time_demand": 162.0, "safety_stock": 15.0, "reorder_point": 177.0, "recommended_quantity": 190, "recommended_purchase_cost": 816810.0, "risk_level": "MEDIUM", "days_to_stockout": 1.7},
    {"id": 2, "sku_id": "SKU002", "product_name": "Mechanical Keyboard", "category": "Electronics", "price": 3499.0, "current_stock": 180, "avg_daily_demand": 15.0, "lead_time_days": 10, "lead_time_demand": 150.0, "safety_stock": 20.0, "reorder_point": 170.0, "recommended_quantity": 0, "recommended_purchase_cost": 0.0, "risk_level": "LOW", "days_to_stockout": 12.0},
    {"id": 3, "sku_id": "SKU003", "product_name": "USB-C Hub", "category": "Accessories", "price": 1299.0, "current_stock": 95, "avg_daily_demand": 28.0, "lead_time_days": 5, "lead_time_demand": 140.0, "safety_stock": 22.0, "reorder_point": 162.0, "recommended_quantity": 0, "recommended_purchase_cost": 0.0, "risk_level": "LOW", "days_to_stockout": 3.4},
    {"id": 6, "sku_id": "SKU006", "product_name": "LED Desk Lamp", "category": "Home", "price": 1499.0, "current_stock": 210, "avg_daily_demand": 22.0, "lead_time_days": 7, "lead_time_demand": 154.0, "safety_stock": 18.0, "reorder_point": 172.0, "recommended_quantity": 0, "recommended_purchase_cost": 0.0, "risk_level": "OVERSTOCK", "days_to_stockout": 9.5},
    {"id": 7, "sku_id": "SKU007", "product_name": "Cotton Graphic T-Shirt", "category": "Apparel", "price": 499.0, "current_stock": 80, "avg_daily_demand": 45.0, "lead_time_days": 5, "lead_time_demand": 225.0, "safety_stock": 30.0, "reorder_point": 255.0, "recommended_quantity": 290, "recommended_purchase_cost": 144710.0, "risk_level": "HIGH", "days_to_stockout": 1.8},
]


# Root & Health Endpoints
@app.get("/")
@app.get("/api")
def root():
    return {"status": "online", "project": settings.PROJECT_NAME, "docs": "/docs"}

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "foresight-backend"}


# Products Endpoints
@app.get("/products")
@app.get("/api/products")
def get_products():
    return MOCK_PRODUCTS

@app.get("/products/{sku_id}")
@app.get("/api/products/{sku_id}")
def get_product(sku_id: str):
    found = next((m for m in MOCK_PRODUCTS if m["sku_id"] == sku_id), None)
    if not found:
        raise HTTPException(status_code=404, detail=f"Product '{sku_id}' not found.")
    return found


# Dashboard Endpoints
@app.get("/dashboard/summary")
@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    return {
        "total_skus": 10,
        "total_inventory": 967,
        "total_sales_volume_30d": 8420,
        "total_revenue_30d": 1452900.0,
        "high_risk_skus_count": 2,
        "medium_risk_skus_count": 3,
        "low_risk_skus_count": 4,
        "overstock_skus_count": 1,
        "recommended_purchase_value": 184500.0,
    }

@app.get("/dashboard/charts/sales-trend")
@app.get("/api/dashboard/charts/sales-trend")
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

@app.get("/dashboard/charts/category-demand")
@app.get("/api/dashboard/charts/category-demand")
def get_category_demand():
    return [
        {"category": "Electronics", "units_sold": 3200, "revenue": 840000.0},
        {"category": "Accessories", "units_sold": 2800, "revenue": 310000.0},
        {"category": "Home",        "units_sold": 1400, "revenue": 210000.0},
        {"category": "Apparel",     "units_sold": 1020, "revenue": 92900.0},
    ]


# Inventory Endpoints
@app.get("/inventory/risk-matrix")
@app.get("/api/inventory/risk-matrix")
def get_risk_matrix():
    return MOCK_RISK_ITEMS

@app.get("/inventory/recommendations")
@app.get("/api/inventory/recommendations")
def get_recommendations():
    return [item for item in MOCK_RISK_ITEMS if item["recommended_quantity"] > 0]


# Assistant Query Endpoint
@app.post("/assistant/query")
@app.post("/api/assistant/query")
def ask_assistant(payload: dict):
    return {
        "answer": "🤖 **FORESIGHT Executive Summary**\n\n• **Active SKUs Monitored**: 10\n• 🚨 **Critical Risk SKUs**: 2 (SKU001, SKU004)\n• ⚠️ **Warning SKUs**: 2 (SKU005, SKU010)\n• 📦 **Overstock SKUs**: 1 (SKU006)\n• 💰 **Recommended Order Budget**: ₹3,246,200\n\nHow can I assist you with specific demand forecasts or purchase order decisions today?",
        "summary_data": {"high_risk_count": 2, "medium_risk_count": 2, "total_recommended_cost": 3246200}
    }

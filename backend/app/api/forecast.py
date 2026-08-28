from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import pandas as pd
from typing import Optional
from backend.app.core.database import get_db
from backend.app.models.db_models import Product, SalesRecord, RecommendationRecord, ForecastRecord
from backend.app.models.schemas import ForecastResponse, ForecastRequest
from backend.app.ml.forecaster import DemandForecaster

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("/{sku_id}", response_model=ForecastResponse)
def get_sku_forecast(
    sku_id: str,
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.sku_id == sku_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU '{sku_id}' not found.")

    sales = db.query(SalesRecord).filter(SalesRecord.product_id == product.id).order_by(SalesRecord.date).all()
    if not sales or len(sales) < 14:
        raise HTTPException(status_code=400, detail="Insufficient historical sales data for forecasting (at least 14 daily data points required).")

    df_sales = pd.DataFrame([{
        "date": s.date,
        "units_sold": s.units_sold
    } for s in sales])

    forecaster = DemandForecaster(model_type="xgboost")
    res = forecaster.train_and_forecast(df_sales, horizon_days=days)

    # Format output with actual historical sales for recent history + future forecast
    recent_history = df_sales.tail(14).copy()
    history_items = [{
        "date": row["date"].strftime("%Y-%m-%d"),
        "actual_demand": float(row["units_sold"]),
        "predicted_demand": float(row["units_sold"]),
        "lower_bound": float(row["units_sold"]),
        "upper_bound": float(row["units_sold"])
    } for _, row in recent_history.iterrows()]

    forecast_items = [{
        "date": item["date"],
        "actual_demand": None,
        "predicted_demand": item["predicted_demand"],
        "lower_bound": item["lower_bound"],
        "upper_bound": item["upper_bound"]
    } for item in res["forecast"]]

    combined = history_items + forecast_items
    predicted_total = sum(item["predicted_demand"] for item in res["forecast"])

    # Fetch recommendation info
    rec = db.query(RecommendationRecord).filter(RecommendationRecord.product_id == product.id).first()
    risk_level = rec.risk_level if rec else "LOW"
    recommended_qty = rec.recommended_quantity if rec else 0

    return ForecastResponse(
        sku_id=product.sku_id,
        product_name=product.product_name,
        category=product.category,
        forecast_days=days,
        mae=res["mae"],
        rmse=res["rmse"],
        mape=res["mape"],
        predicted_total_demand=round(predicted_total, 2),
        risk_level=risk_level,
        recommended_order_quantity=recommended_qty,
        forecast=combined
    )

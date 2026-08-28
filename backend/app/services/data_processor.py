import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.db_models import Product, SalesRecord, InventoryRecord, ForecastRecord, RecommendationRecord
from backend.app.services.inventory_engine import InventoryEngine
from backend.app.ml.forecaster import DemandForecaster

class DataProcessor:
    @staticmethod
    def ingest_dataframe(df: pd.DataFrame, db: Session):
        """
        Ingest CSV dataframe into database models.
        """
        # Ensure required columns
        required_cols = {'date', 'sku_id', 'product_name', 'category', 'units_sold', 'price'}
        if not required_cols.issubset(df.columns):
            missing = required_cols - set(df.columns)
            raise ValueError(f"Missing required CSV columns: {missing}")

        df['date'] = pd.to_datetime(df['date']).dt.date
        
        # 1. Upsert Products
        unique_skus = df[['sku_id', 'product_name', 'category', 'price']].drop_duplicates('sku_id')
        for _, row in unique_skus.iterrows():
            lead_time = int(df[df['sku_id'] == row['sku_id']]['supplier_lead_time'].iloc[0]) if 'supplier_lead_time' in df.columns else 7
            
            product = db.query(Product).filter(Product.sku_id == row['sku_id']).first()
            if not product:
                product = Product(
                    sku_id=row['sku_id'],
                    product_name=row['product_name'],
                    category=row['category'],
                    price=float(row['price']),
                    supplier="Primary Vendor",
                    lead_time=lead_time,
                    min_safety_stock=10
                )
                db.add(product)
            else:
                product.product_name = row['product_name']
                product.category = row['category']
                product.price = float(row['price'])
                product.lead_time = lead_time
        
        db.commit()

        # Build product mapping
        products = db.query(Product).all()
        sku_to_prod = {p.sku_id: p for p in products}

        # Clear existing sales and inventory records for clean seed/ingest
        db.query(SalesRecord).delete()
        db.query(InventoryRecord).delete()
        db.query(RecommendationRecord).delete()
        db.query(ForecastRecord).delete()
        db.commit()

        # 2. Add Sales and Inventory Records
        sales_records = []
        inventory_records = []

        for _, row in df.iterrows():
            prod = sku_to_prod.get(row['sku_id'])
            if not prod:
                continue

            units = int(row['units_sold'])
            price = float(row['price'])
            stock = int(row['inventory']) if 'inventory' in row and pd.notna(row['inventory']) else 50

            sales_records.append(SalesRecord(
                product_id=prod.id,
                date=row['date'],
                units_sold=units,
                revenue=units * price
            ))
            
            inventory_records.append(InventoryRecord(
                product_id=prod.id,
                date=row['date'],
                stock_quantity=stock
            ))

        db.bulk_save_objects(sales_records)
        db.bulk_save_objects(inventory_records)
        db.commit()

        # 3. Generate Initial Risk Matrix & Recommendations for all SKUs
        forecaster = DemandForecaster(model_type="xgboost")

        for prod in products:
            prod_sales = db.query(SalesRecord).filter(SalesRecord.product_id == prod.id).order_by(SalesRecord.date).all()
            sales_history = [s.units_sold for s in prod_sales]
            
            latest_inv = db.query(InventoryRecord).filter(InventoryRecord.product_id == prod.id).order_by(InventoryRecord.date.desc()).first()
            current_stock = latest_inv.stock_quantity if latest_inv else 30

            risk_info = InventoryEngine.calculate_sku_risk(
                current_stock=current_stock,
                lead_time_days=prod.lead_time,
                historical_sales=sales_history,
                unit_price=prod.price,
                min_safety_stock=prod.min_safety_stock
            )

            rec = RecommendationRecord(
                product_id=prod.id,
                current_stock=risk_info["current_stock"],
                avg_daily_demand=risk_info["avg_daily_demand"],
                lead_time_demand=risk_info["lead_time_demand"],
                safety_stock=risk_info["safety_stock"],
                reorder_point=risk_info["reorder_point"],
                recommended_quantity=risk_info["recommended_quantity"],
                risk_level=risk_info["risk_level"],
                days_to_stockout=risk_info["days_to_stockout"]
            )
            db.add(rec)

            # Generate initial 30-day forecast for each product
            if len(prod_sales) >= 14:
                df_prod_sales = pd.DataFrame([{
                    "date": s.date,
                    "units_sold": s.units_sold
                } for s in prod_sales])
                
                try:
                    f_res = forecaster.train_and_forecast(df_prod_sales, horizon_days=30)
                    for item in f_res["forecast"]:
                        db.add(ForecastRecord(
                            product_id=prod.id,
                            forecast_date=datetime.strptime(item["date"], "%Y-%m-%d").date(),
                            predicted_demand=item["predicted_demand"],
                            lower_bound=item["lower_bound"],
                            upper_bound=item["upper_bound"],
                            model_version="XGBoost_v1",
                            mae=f_res["mae"],
                            mape=f_res["mape"],
                            rmse=f_res["rmse"]
                        ))
                except Exception as e:
                    print(f"Skipping initial forecast for {prod.sku_id}: {e}")

        db.commit()
        return len(products)

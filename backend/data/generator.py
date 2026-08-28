import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_sample_data(filepath="backend/data/sample_retail_sales.csv", days=365):
    np.random.seed(42)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')

    products = [
        {"sku_id": "SKU001", "product_name": "Wireless Mouse", "category": "Accessories", "price": 799, "lead_time": 7, "base_demand": 35, "current_stock": 43},
        {"sku_id": "SKU002", "product_name": "Mechanical Keyboard", "category": "Electronics", "price": 3499, "lead_time": 10, "base_demand": 15, "current_stock": 180},
        {"sku_id": "SKU003", "product_name": "USB-C Hub", "category": "Accessories", "price": 1299, "lead_time": 5, "base_demand": 28, "current_stock": 95},
        {"sku_id": "SKU004", "product_name": "Noise Cancelling Headphones", "category": "Electronics", "price": 5999, "lead_time": 14, "base_demand": 12, "current_stock": 25},
        {"sku_id": "SKU005", "product_name": "Ergonomic Office Chair", "category": "Home", "price": 8999, "lead_time": 12, "base_demand": 8, "current_stock": 14},
        {"sku_id": "SKU006", "product_name": "LED Desk Lamp", "category": "Home", "price": 1499, "lead_time": 7, "base_demand": 22, "current_stock": 210},
        {"sku_id": "SKU007", "product_name": "Cotton Graphic T-Shirt", "category": "Apparel", "price": 499, "lead_time": 5, "base_demand": 45, "current_stock": 80},
        {"sku_id": "SKU008", "product_name": "Denim Jacket", "category": "Apparel", "price": 2499, "lead_time": 8, "base_demand": 10, "current_stock": 95},
        {"sku_id": "SKU009", "product_name": "Stainless Steel Water Bottle", "category": "Home", "price": 699, "lead_time": 4, "base_demand": 30, "current_stock": 140},
        {"sku_id": "SKU010", "product_name": "Smart Fitness Watch", "category": "Electronics", "price": 4299, "lead_time": 9, "base_demand": 18, "current_stock": 30},
    ]

    rows = []
    for prod in products:
        sku = prod["sku_id"]
        name = prod["product_name"]
        cat = prod["category"]
        price = prod["price"]
        lead_time = prod["lead_time"]
        base_demand = prod["base_demand"]
        stock = prod["current_stock"]

        for d in dates:
            # Day of week seasonality: Friday/Saturday +30%
            day_mult = 1.3 if d.weekday() in [4, 5] else 1.0
            # Monthly seasonality: November/December holiday surge +40%
            month_mult = 1.4 if d.month in [11, 12] else 1.0
            # Random noise
            noise = np.random.normal(1.0, 0.15)

            demand = int(max(0, round(base_demand * day_mult * month_mult * noise)))
            
            rows.append({
                "date": d.strftime("%Y-%m-%d"),
                "sku_id": sku,
                "product_name": name,
                "category": cat,
                "units_sold": demand,
                "price": price,
                "inventory": stock,
                "supplier_lead_time": lead_time
            })

    df = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"Generated sample retail dataset at {filepath} with {len(df)} rows.")
    return df

if __name__ == "__main__":
    generate_sample_data()

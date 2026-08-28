import pandas as pd
import numpy as np

class InventoryEngine:
    @staticmethod
    def calculate_sku_risk(
        current_stock: int,
        lead_time_days: int,
        historical_sales: list, # list of daily units_sold floats/ints
        unit_price: float,
        min_safety_stock: int = 10
    ) -> dict:
        """
        Calculate Safety Stock, Reorder Point, Risk Level, and Recommended Order Quantity.
        Returns pure Python float and int types compatible with PostgreSQL/psycopg2.
        """
        if not historical_sales or len(historical_sales) == 0:
            avg_daily_demand = 1.0
            std_daily_demand = 0.5
        else:
            recent_sales = historical_sales[-30:] if len(historical_sales) >= 30 else historical_sales
            avg_daily_demand = max(0.1, float(np.mean(recent_sales)))
            std_daily_demand = float(np.std(recent_sales)) if len(recent_sales) > 1 else 0.5

        # 1. Lead Time Demand
        lead_time_demand = float(avg_daily_demand * lead_time_days)

        # 2. Safety Stock (Service level Z = 1.65 for 95% service level)
        safety_stock = float(1.65 * std_daily_demand * float(np.sqrt(lead_time_days)))
        safety_stock = max(float(min_safety_stock), safety_stock)

        # 3. Reorder Point (ROP)
        reorder_point = float(lead_time_demand + safety_stock)

        # 4. Days to Stockout
        days_to_stockout = float(current_stock / avg_daily_demand if avg_daily_demand > 0 else 999.0)

        # 5. Risk Assessment
        if current_stock <= reorder_point or days_to_stockout <= lead_time_days:
            risk_level = "HIGH"
        elif current_stock <= (reorder_point * 1.25):
            risk_level = "MEDIUM"
        elif current_stock > (avg_daily_demand * 60):
            risk_level = "OVERSTOCK"
        else:
            risk_level = "LOW"

        # 6. Recommended Order Quantity (Target inventory = ROP + 30 days of demand)
        target_inventory = reorder_point + (avg_daily_demand * 30)
        recommended_quantity = int(max(0, int(np.ceil(target_inventory - current_stock)))) if risk_level in ["HIGH", "MEDIUM"] else 0
        recommended_purchase_cost = float(round(recommended_quantity * unit_price, 2))

        return {
            "current_stock": int(current_stock),
            "avg_daily_demand": float(round(avg_daily_demand, 2)),
            "lead_time_days": int(lead_time_days),
            "lead_time_demand": float(round(lead_time_demand, 2)),
            "safety_stock": float(round(safety_stock, 2)),
            "reorder_point": float(round(reorder_point, 2)),
            "recommended_quantity": int(recommended_quantity),
            "recommended_purchase_cost": float(recommended_purchase_cost),
            "risk_level": str(risk_level),
            "days_to_stockout": float(round(days_to_stockout, 1))
        }

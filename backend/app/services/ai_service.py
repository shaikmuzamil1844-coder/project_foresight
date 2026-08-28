from sqlalchemy.orm import Session
from backend.app.models.db_models import Product, RecommendationRecord, ForecastRecord, SalesRecord
import numpy as np

class AIAssistantService:
    @staticmethod
    def answer_query(prompt: str, db: Session) -> dict:
        prompt_lower = prompt.lower()
        
        recs = db.query(RecommendationRecord, Product).join(Product, RecommendationRecord.product_id == Product.id).all()
        
        high_risk = [r for r, p in recs if r.risk_level == "HIGH"]
        medium_risk = [r for r, p in recs if r.risk_level == "MEDIUM"]
        overstock = [r for r, p in recs if r.risk_level == "OVERSTOCK"]
        
        total_rec_cost = sum(r.recommended_quantity * p.price for r, p in recs)
        total_rec_items = sum(r.recommended_quantity for r, p in recs)

        if "reorder" in prompt_lower or "buy" in prompt_lower or "purchase" in prompt_lower:
            high_risk_details = []
            for r, p in recs:
                if r.risk_level in ["HIGH", "MEDIUM"] and r.recommended_quantity > 0:
                    high_risk_details.append(
                        f"• **{p.product_name} ({p.sku_id})**: Projected stockout in **{r.days_to_stockout:.1f} days**. Reorder **{r.recommended_quantity} units** (Est. Cost: ₹{r.recommended_quantity * p.price:,.2f})."
                    )
            
            if not high_risk_details:
                answer = "✅ **Inventory Status Healthy**: No immediate reorders required. All SKUs are within safe operating stock levels."
            else:
                answer = f"📦 **Executive Reorder Recommendations**\n\nFound **{len(high_risk_details)} products** requiring purchase orders:\n\n" + "\n".join(high_risk_details) + f"\n\n💰 **Total Investment Required**: ₹{total_rec_cost:,.2f} ({total_rec_items} units)."

        elif "risk" in prompt_lower or "critical" in prompt_lower or "stockout" in prompt_lower:
            critical_details = []
            for r, p in recs:
                if r.risk_level == "HIGH":
                    critical_details.append(
                        f"🚨 **CRITICAL**: **{p.product_name} ({p.sku_id})** - Stock: {r.current_stock} units | Daily Demand: {r.avg_daily_demand:.1f} units | Lead Time: {p.lead_time} days. Expected stockout in **{r.days_to_stockout:.1f} days**."
                    )
            if not critical_details:
                answer = "🟢 **Low Risk**: No SKUs are currently in critical stockout danger."
            else:
                answer = f"🚨 **Critical Stockout Risk Alert**\n\nThere are **{len(critical_details)} SKUs** at urgent stockout risk:\n\n" + "\n".join(critical_details)

        elif "overstock" in prompt_lower or "excess" in prompt_lower:
            overstock_details = []
            for r, p in recs:
                if r.risk_level == "OVERSTOCK":
                    overstock_details.append(
                        f"⚠️ **OVERSTOCK**: **{p.product_name} ({p.sku_id})** - Current Stock: {r.current_stock} units vs 30-Day Forecast: {r.avg_daily_demand * 30:.0f} units. Holding excess capital."
                    )
            if not overstock_details:
                answer = "✅ **Optimized Holding**: No severe overstock situations detected."
            else:
                answer = f"⚠️ **Overstock & Excess Capital Warning**\n\nFound **{len(overstock_details)} SKUs** with excess inventory:\n\n" + "\n".join(overstock_details)

        else:
            answer = f"🤖 **FORESIGHT Executive Summary**\n\n" \
                     f"• **Active SKUs Monitored**: {len(recs)}\n" \
                     f"• 🚨 **Critical Risk SKUs**: {len(high_risk)}\n" \
                     f"• ⚠️ **Warning Risk SKUs**: {len(medium_risk)}\n" \
                     f"• 📦 **Overstock SKUs**: {len(overstock)}\n" \
                     f"• 💰 **Recommended Order Budget**: ₹{total_rec_cost:,.2f}\n\n" \
                     f"How can I assist you with specific demand forecasts or supply chain decisions today?"

        return {
            "answer": answer,
            "summary_data": {
                "high_risk_count": len(high_risk),
                "medium_risk_count": len(medium_risk),
                "total_recommended_cost": total_rec_cost
            }
        }

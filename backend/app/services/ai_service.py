from sqlalchemy.orm import Session
from backend.app.models.db_models import Product, RecommendationRecord, ForecastRecord, SalesRecord
import os
import json

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

class AIAssistantService:
    @staticmethod
    def answer_query(prompt: str, db: Session) -> dict:
        prompt_lower = prompt.lower()
        
        # 1. Fetch real-time Database Ground Truth Context
        recs = db.query(RecommendationRecord, Product).join(Product, RecommendationRecord.product_id == Product.id).all()
        
        db_context = []
        high_risk = []
        medium_risk = []
        overstock = []
        
        total_rec_cost = 0.0
        total_rec_items = 0

        for r, p in recs:
            item_data = {
                "sku_id": p.sku_id,
                "product_name": p.product_name,
                "category": p.category,
                "price": p.price,
                "current_stock": r.current_stock,
                "avg_daily_demand": round(r.avg_daily_demand, 1),
                "lead_time_days": p.lead_time,
                "safety_stock": round(r.safety_stock, 1),
                "reorder_point": round(r.reorder_point, 1),
                "recommended_quantity": r.recommended_quantity,
                "risk_level": r.risk_level,
                "days_to_stockout": round(r.days_to_stockout, 1)
            }
            db_context.append(item_data)
            
            if r.risk_level == "HIGH":
                high_risk.append(item_data)
            elif r.risk_level == "MEDIUM":
                medium_risk.append(item_data)
            elif r.risk_level == "OVERSTOCK":
                overstock.append(item_data)

            if r.recommended_quantity > 0:
                total_rec_cost += r.recommended_quantity * p.price
                total_rec_items += r.recommended_quantity

        # 2. Check for Gemini API Key in Environment
        gemini_key = os.getenv("GEMINI_API_KEY")
        if HAS_GEMINI and gemini_key:
            try:
                genai.configure(api_key=gemini_key)
                try:
                    model = genai.GenerativeModel("gemini-3.6-flash")
                except Exception:
                    model = genai.GenerativeModel("gemini-flash-latest")
                
                system_prompt = (


                    "You are FORESIGHT AI, an expert executive supply chain and inventory intelligence advisor.\n"
                    "Use the following real-time database ground truth context to answer the user's question concisely, professionally, and accurately.\n"
                    "Formatting Rules:\n"
                    "- Use GitHub Markdown bullet points and bold highlights.\n"
                    "- Always ground your answers strictly in the provided database context.\n\n"
                    f"DATABASE GROUND TRUTH CONTEXT:\n{json.dumps(db_context, indent=2)}\n\n"
                    f"USER QUESTION: {prompt}"
                )
                
                response = model.generate_content(system_prompt)
                if response and response.text:
                    return {
                        "answer": response.text,
                        "summary_data": {
                            "high_risk_count": len(high_risk),
                            "medium_risk_count": len(medium_risk),
                            "total_recommended_cost": total_rec_cost
                        }
                    }
            except Exception as e:
                print(f"Gemini API fallback to deterministic engine: {e}")

        # 3. Ground-Truth Deterministic Engine (Fallback / Zero-Hallucination)
        if "reorder" in prompt_lower or "buy" in prompt_lower or "purchase" in prompt_lower:
            high_risk_details = []
            for item in db_context:
                if item["risk_level"] in ["HIGH", "MEDIUM"] and item["recommended_quantity"] > 0:
                    cost = item["recommended_quantity"] * item["price"]
                    high_risk_details.append(
                        f"• **{item['product_name']} ({item['sku_id']})**: Stockout in **{item['days_to_stockout']} days**. Reorder **{item['recommended_quantity']} units** (Est: ₹{cost:,.2f})."
                    )
            
            if not high_risk_details:
                answer = "✅ **Inventory Status Healthy**: No immediate reorders required. All SKUs operate within optimal safety thresholds."
            else:
                answer = f"📦 **Executive Reorder Recommendations**\n\nFound **{len(high_risk_details)} products** requiring purchase orders:\n\n" + "\n".join(high_risk_details) + f"\n\n💰 **Total Investment Required**: ₹{total_rec_cost:,.2f} ({total_rec_items} units)."

        elif "risk" in prompt_lower or "critical" in prompt_lower or "stockout" in prompt_lower:
            critical_details = []
            for item in high_risk:
                critical_details.append(
                    f"🚨 **CRITICAL**: **{item['product_name']} ({item['sku_id']})** - Stock: {item['current_stock']} | Daily Demand: {item['avg_daily_demand']} | Lead Time: {item['lead_time_days']}d. Stockout in **{item['days_to_stockout']} days**."
                )
            if not critical_details:
                answer = "🟢 **Low Risk**: No SKUs are currently in critical stockout danger."
            else:
                answer = f"🚨 **Critical Stockout Risk Alert**\n\nThere are **{len(critical_details)} SKUs** at urgent stockout risk:\n\n" + "\n".join(critical_details)

        elif "overstock" in prompt_lower or "excess" in prompt_lower:
            overstock_details = []
            for item in overstock:
                overstock_details.append(
                    f"⚠️ **OVERSTOCK**: **{item['product_name']} ({item['sku_id']})** - Current Stock: {item['current_stock']} units vs 30-Day Demand: {item['avg_daily_demand'] * 30:.0f} units. Holding excess capital."
                )
            if not overstock_details:
                answer = "✅ **Optimized Holding**: No severe overstock situations detected."
            else:
                answer = f"⚠️ **Overstock & Excess Capital Warning**\n\nFound **{len(overstock_details)} SKUs** with excess inventory:\n\n" + "\n".join(overstock_details)

        else:
            answer = f"🤖 **FORESIGHT Executive Summary**\n\n" \
                     f"• **Active SKUs Monitored**: {len(db_context)}\n" \
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

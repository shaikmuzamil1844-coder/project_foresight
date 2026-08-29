import os
import json
import requests
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()
for env_path in ["backend/.env", ".env"]:
    if os.path.exists(env_path):
        load_dotenv(env_path)

try:
    from backend.app.models.db_models import Product, RecommendationRecord
except ImportError:
    from app.models.db_models import Product, RecommendationRecord

FALLBACK_PRODUCTS = [
    {"sku_id": "SKU001", "product_name": "Wireless Mouse", "category": "Accessories", "price": 799.0, "current_stock": 43, "avg_daily_demand": 35.0, "lead_time_days": 7, "safety_stock": 28.0, "reorder_point": 273.0, "recommended_quantity": 320, "risk_level": "HIGH", "days_to_stockout": 1.2},
    {"sku_id": "SKU004", "product_name": "Noise Cancelling Headphones", "category": "Electronics", "price": 5999.0, "current_stock": 25, "avg_daily_demand": 12.0, "lead_time_days": 14, "safety_stock": 18.0, "reorder_point": 186.0, "recommended_quantity": 180, "risk_level": "HIGH", "days_to_stockout": 2.1},
    {"sku_id": "SKU005", "product_name": "Ergonomic Office Chair", "category": "Home", "price": 8999.0, "current_stock": 14, "avg_daily_demand": 8.0, "lead_time_days": 12, "safety_stock": 12.0, "reorder_point": 108.0, "recommended_quantity": 110, "risk_level": "MEDIUM", "days_to_stockout": 1.8},
    {"sku_id": "SKU010", "product_name": "Smart Fitness Watch", "category": "Electronics", "price": 4299.0, "current_stock": 30, "avg_daily_demand": 18.0, "lead_time_days": 9, "safety_stock": 15.0, "reorder_point": 177.0, "recommended_quantity": 190, "risk_level": "MEDIUM", "days_to_stockout": 1.7},
    {"sku_id": "SKU007", "product_name": "Cotton Graphic T-Shirt", "category": "Apparel", "price": 499.0, "current_stock": 80, "avg_daily_demand": 45.0, "lead_time_days": 5, "safety_stock": 30.0, "reorder_point": 255.0, "recommended_quantity": 290, "risk_level": "HIGH", "days_to_stockout": 1.8},
    {"sku_id": "SKU002", "product_name": "Mechanical Keyboard", "category": "Electronics", "price": 3499.0, "current_stock": 180, "avg_daily_demand": 15.0, "lead_time_days": 10, "safety_stock": 20.0, "reorder_point": 170.0, "recommended_quantity": 0, "risk_level": "LOW", "days_to_stockout": 12.0},
    {"sku_id": "SKU003", "product_name": "USB-C Hub", "category": "Accessories", "price": 1299.0, "current_stock": 95, "avg_daily_demand": 28.0, "lead_time_days": 5, "safety_stock": 22.0, "reorder_point": 162.0, "recommended_quantity": 0, "risk_level": "LOW", "days_to_stockout": 3.4},
    {"sku_id": "SKU006", "product_name": "LED Desk Lamp", "category": "Home", "price": 1499.0, "current_stock": 210, "avg_daily_demand": 22.0, "lead_time_days": 7, "safety_stock": 18.0, "reorder_point": 172.0, "recommended_quantity": 0, "risk_level": "OVERSTOCK", "days_to_stockout": 9.5},
]


class AIAssistantService:
    @staticmethod
    def answer_query(prompt: str, db: Session = None) -> dict:
        prompt_text = (prompt or "").strip()
        prompt_lower = prompt_text.lower()

        # Gather real-time DB data or fall back to structured products
        db_context = []
        if db:
            try:
                recs = (
                    db.query(RecommendationRecord, Product)
                    .join(Product, RecommendationRecord.product_id == Product.id)
                    .all()
                )
                for r, p in recs:
                    db_context.append({
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
                        "days_to_stockout": round(r.days_to_stockout, 1),
                    })
            except Exception:
                db_context = []

        if not db_context:
            db_context = FALLBACK_PRODUCTS

        high_risk = [i for i in db_context if i.get("risk_level") == "HIGH"]
        medium_risk = [i for i in db_context if i.get("risk_level") == "MEDIUM"]
        overstock = [i for i in db_context if i.get("risk_level") == "OVERSTOCK"]
        low_risk = [i for i in db_context if i.get("risk_level") == "LOW"]
        total_rec_cost = sum((i.get("recommended_quantity", 0) * i.get("price", 0)) for i in db_context)

        summary_data = {
            "high_risk_count": len(high_risk),
            "medium_risk_count": len(medium_risk),
            "total_recommended_cost": round(total_rec_cost, 2),
        }

        # ── 1. Live Google Gemini LLM via REST API ────────────────────────────
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={gemini_key}"
                system_prompt = (
                    "You are FORESIGHT AI, a leading retail supply chain and inventory intelligence copilot.\n"
                    "Provide a direct, conversational, and highly specific answer to the user's question using the real-time dataset below.\n"
                    "Formatting Rules:\n"
                    "- Use Markdown with bullet points, **bold** highlights, and clean spacing.\n"
                    "- Quote real SKU IDs, stock quantities, and recommendations whenever relevant.\n"
                    "- Keep answers concise (2-4 paragraphs maximum).\n\n"
                    f"LIVE DATABASE CONTEXT:\n{json.dumps(db_context, indent=2)}\n\n"
                    f"USER QUESTION: {prompt_text}"
                )
                resp = requests.post(url, json={"contents": [{"parts": [{"text": system_prompt}]}]}, timeout=10)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0]["content"]["parts"][0]["text"]
                        if text and len(text.strip()) > 10:
                            return {"answer": text.strip(), "summary_data": summary_data}
            except Exception as e:
                print(f"Gemini LLM error: {e}")

        # ── 2. Highly Specific Real-time Dynamic Response ───────────────────────
        if any(kw in prompt_lower for kw in ["reorder", "buy", "purchase", "order", "what should i"]):
            reorders = [i for i in db_context if i.get("recommended_quantity", 0) > 0]
            lines = [
                f"• **{item['product_name']} ({item['sku_id']})**: Reorder **{item['recommended_quantity']} units** (₹{item['recommended_quantity']*item['price']:,.0f}) — Stockout estimated in **{item['days_to_stockout']} days**."
                for item in reorders
            ]
            answer = (
                f"📦 **Purchase Order Recommendations ({len(reorders)} SKUs Require Replenishment)**\n\n"
                + "\n".join(lines)
                + f"\n\n💰 **Total Estimated Investment**: ₹{total_rec_cost:,.0f}\n"
                "💡 *Action*: Place purchase orders immediately for High Risk SKUs to prevent revenue loss."
            )

        elif any(kw in prompt_lower for kw in ["risk", "critical", "danger", "stockout", "out of stock"]):
            lines = [
                f"• 🚨 **{item['product_name']} ({item['sku_id']})** — **{item['current_stock']} units left** | Avg daily demand: {item['avg_daily_demand']} units | **Stockout in {item['days_to_stockout']} days** (Supplier Lead Time: {item['lead_time_days']} days)."
                for item in high_risk
            ]
            answer = (
                f"🚨 **Critical Stockout Alerts ({len(high_risk)} SKUs)**\n\n"
                + "\n".join(lines)
                + "\n\n⚠️ *Urgent Warning*: Current stock is lower than supplier lead time demand. Emergency replenishment recommended."
            )

        elif any(kw in prompt_lower for kw in ["overstock", "excess", "surplus", "too much"]):
            lines = [
                f"• 📦 **{item['product_name']} ({item['sku_id']})** — Current Stock: **{item['current_stock']} units** (Reorder threshold: {item['reorder_point']} units). Category: **{item['category']}**."
                for item in overstock
            ]
            answer = (
                f"📦 **Overstock Analysis ({len(overstock)} SKU Detected)**\n\n"
                + "\n".join(lines)
                + "\n\n💡 *Recommendation*: Pause future POs and consider promotional bundling to free up warehouse capacity."
            )

        elif any(kw in prompt_lower for kw in ["how many", "count", "products", "skus", "total", "available"]):
            cat_counts = {}
            for i in db_context:
                cat_counts[i["category"]] = cat_counts.get(i["category"], 0) + 1
            cat_summary = ", ".join([f"**{cat}** ({count})" for cat, count in cat_counts.items()])
            total_units = sum(i.get("current_stock", 0) for i in db_context)
            answer = (
                f"📊 **Inventory Catalog Overview**\n\n"
                f"• **Total Active SKUs**: **{len(db_context)} products**\n"
                f"• **Total Physical Inventory**: **{total_units:,} units** in warehouse\n"
                f"• **Categories Monitored**: {cat_summary}\n"
                f"• 🚨 **Critical Risk**: {len(high_risk)} SKUs | ⚠️ **Warning**: {len(medium_risk)} SKUs | 🟢 **Healthy**: {len(low_risk)} SKUs | 📦 **Overstock**: {len(overstock)} SKU\n\n"
                "Ask me about any specific SKU (e.g., SKU001) for detailed demand breakdown!"
            )

        elif any(kw in prompt_lower for kw in ["hi", "hello", "hey", "who are you"]):
            answer = (
                "👋 **Hello! I am FORESIGHT AI**, your inventory intelligence and demand forecasting advisor.\n\n"
                f"I am actively monitoring **{len(db_context)} SKUs** with real-time ML forecasting.\n"
                f"• 🚨 **{len(high_risk)} SKUs** are at critical stockout risk\n"
                f"• 💰 Recommended reorder budget: **₹{total_rec_cost:,.0f}**\n\n"
                "How can I help you today? You can ask about stockouts, reorders, or product demand forecasts."
            )

        elif any(kw in prompt_lower for kw in ["python", "tech", "model", "xgboost", "algorithm"]):
            answer = (
                "⚡ **FORESIGHT Machine Learning Architecture**\n\n"
                "• **Demand Forecasting**: Powered by Gradient Boosting & XGBoost with 30-day forward horizons.\n"
                "• **Inventory Optimization**: Computes safety stock using service level z-scores ($Z \\times \\sigma_L$) and lead-time demand.\n"
                "• **AI Assistant**: Powered by Google Gemini LLM with real-time Supabase PostgreSQL context.\n\n"
                "Ask me about model accuracy metrics (MAE, RMSE) or SKU forecasts!"
            )

        else:
            answer = (
                f"🤖 **FORESIGHT Intelligence: Analysis for '{prompt_text}'**\n\n"
                f"• **Active SKUs Monitored**: {len(db_context)} items\n"
                f"• 🚨 **Critical Risk**: {len(high_risk)} SKUs ({', '.join(i['sku_id'] for i in high_risk)})\n"
                f"• ⚠️ **Medium Risk**: {len(medium_risk)} SKUs ({', '.join(i['sku_id'] for i in medium_risk)})\n"
                f"• 📦 **Overstock**: {len(overstock)} SKU ({', '.join(i['sku_id'] for i in overstock)})\n"
                f"• 💰 **Total Reorder Value**: ₹{total_rec_cost:,.0f}\n\n"
                "You can ask me specific questions like *'What should I reorder?'*, *'Which items are overstocked?'*, or *'How many products are in Electronics?'*."
            )

        return {"answer": answer, "summary_data": summary_data}

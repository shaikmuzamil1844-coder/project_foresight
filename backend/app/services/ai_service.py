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
    {"id": 4, "sku_id": "SKU004", "product_name": "Noise Cancelling Headphones", "category": "Electronics", "price": 5999.0, "current_stock": 25, "avg_daily_demand": 12.0, "lead_time_days": 14, "safety_stock": 18.0, "reorder_point": 186.0, "recommended_quantity": 180, "risk_level": "HIGH", "days_to_stockout": 2.1},
    {"id": 5, "sku_id": "SKU005", "product_name": "Ergonomic Office Chair", "category": "Home", "price": 8999.0, "current_stock": 14, "avg_daily_demand": 8.0, "lead_time_days": 12, "safety_stock": 12.0, "reorder_point": 108.0, "recommended_quantity": 110, "risk_level": "MEDIUM", "days_to_stockout": 1.8},
    {"id": 10, "sku_id": "SKU010", "product_name": "Smart Fitness Watch", "category": "Electronics", "price": 4299.0, "current_stock": 30, "avg_daily_demand": 18.0, "lead_time_days": 9, "safety_stock": 15.0, "reorder_point": 177.0, "recommended_quantity": 190, "risk_level": "MEDIUM", "days_to_stockout": 1.7},
    {"id": 2, "sku_id": "SKU002", "product_name": "Mechanical Keyboard", "category": "Electronics", "price": 3499.0, "current_stock": 180, "avg_daily_demand": 15.0, "lead_time_days": 10, "safety_stock": 20.0, "reorder_point": 170.0, "recommended_quantity": 0, "risk_level": "LOW", "days_to_stockout": 12.0},
    {"id": 3, "sku_id": "SKU003", "product_name": "USB-C Hub", "category": "Accessories", "price": 1299.0, "current_stock": 95, "avg_daily_demand": 28.0, "lead_time_days": 5, "safety_stock": 22.0, "reorder_point": 162.0, "recommended_quantity": 0, "risk_level": "LOW", "days_to_stockout": 3.4},
    {"id": 6, "sku_id": "SKU006", "product_name": "LED Desk Lamp", "category": "Home", "price": 1499.0, "current_stock": 210, "avg_daily_demand": 22.0, "lead_time_days": 7, "safety_stock": 18.0, "reorder_point": 172.0, "recommended_quantity": 0, "risk_level": "OVERSTOCK", "days_to_stockout": 9.5},
    {"id": 7, "sku_id": "SKU007", "product_name": "Cotton Graphic T-Shirt", "category": "Apparel", "price": 499.0, "current_stock": 80, "avg_daily_demand": 45.0, "lead_time_days": 5, "safety_stock": 30.0, "reorder_point": 255.0, "recommended_quantity": 290, "risk_level": "HIGH", "days_to_stockout": 1.8},
]


class AIAssistantService:
    @staticmethod
    def answer_query(prompt: str, db: Session = None) -> dict:
        prompt_lower = (prompt or "").lower()

        # Build DB context
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
        total_rec_cost = sum((i.get("recommended_quantity", 0) * i.get("price", 0)) for i in db_context)

        summary_data = {
            "high_risk_count": len(high_risk),
            "medium_risk_count": len(medium_risk),
            "total_recommended_cost": round(total_rec_cost, 2),
        }

        # ── 1. Call Google Gemini via REST API ─────────────────────────────────
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            models_to_try = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-flash-latest"]
            for model_name in models_to_try:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key}"
                    system_prompt = (
                        "You are FORESIGHT AI, an intelligent, helpful retail supply chain and inventory advisor.\n"
                        "Answer the user question accurately using the real-time inventory and demand context below.\n"
                        "Formatting guidelines:\n"
                        "- Use clean Markdown bullet points and **bold** highlights.\n"
                        "- Keep responses clear, professional, concise, and actionable.\n"
                        "- If the user asks a general question (like 'hi', 'about python', etc.), respond politely and relate back to how FORESIGHT AI can help.\n\n"
                        f"REAL-TIME INVENTORY DATABASE CONTEXT:\n{json.dumps(db_context, indent=2)}\n\n"
                        f"USER QUESTION: {prompt}"
                    )
                    payload = {"contents": [{"parts": [{"text": system_prompt}]}]}
                    resp = requests.post(url, json=payload, timeout=8)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        if text:
                            return {"answer": text, "summary_data": summary_data}
                except Exception as ex:
                    print(f"Gemini {model_name} error: {ex}")

        # ── 2. Dynamic Rule-Based Fallback ────────────────────────────────────
        if any(kw in prompt_lower for kw in ["reorder", "buy", "purchase", "order"]):
            details = [
                f"• **{item['product_name']} ({item['sku_id']})**: Stockout in **{item['days_to_stockout']} days**. Order **{item['recommended_quantity']} units** (₹{item['recommended_quantity']*item['price']:,.0f})."
                for item in db_context if item.get("recommended_quantity", 0) > 0
            ]
            answer = f"📦 **Reorder Recommendations** — {len(details)} products need action:\n\n" + "\n".join(details) + f"\n\n💰 **Total Investment**: ₹{total_rec_cost:,.0f}"

        elif any(kw in prompt_lower for kw in ["risk", "critical", "stockout", "danger"]):
            details = [
                f"🚨 **{i['product_name']} ({i['sku_id']})** — Current Stock: {i['current_stock']} | Stockout in **{i['days_to_stockout']} days**"
                for i in high_risk
            ]
            answer = f"🚨 **{len(details)} SKUs at Critical Risk:**\n\n" + "\n".join(details)

        elif any(kw in prompt_lower for kw in ["overstock", "excess", "surplus"]):
            details = [
                f"📦 **{i['product_name']} ({i['sku_id']})** — Current Stock: {i['current_stock']} | Category: {i['category']}"
                for i in overstock
            ]
            answer = f"⚠️ **{len(details)} Overstocked Products:**\n\n" + "\n".join(details)

        elif any(kw in prompt_lower for kw in ["hi", "hello", "hey", "who are you", "help"]):
            answer = (
                "👋 **Hello! I am FORESIGHT AI**, your real-time demand and inventory intelligence copilot.\n\n"
                f"• Currently monitoring **{len(db_context)} active SKUs**\n"
                f"• 🚨 **{len(high_risk)} Critical Stockout Risks** detected\n"
                f"• 📦 **{len(overstock)} Overstocked items**\n"
                f"• 💰 Recommended Purchase Order Budget: **₹{total_rec_cost:,.0f}**\n\n"
                "Ask me about any product, reorder priorities, or 30-day demand forecasts!"
            )
        else:
            answer = (
                f"🤖 **FORESIGHT AI Insights for: '{prompt}'**\n\n"
                f"• **Active SKUs Monitored**: {len(db_context)}\n"
                f"• 🚨 **Critical Risk SKUs**: {len(high_risk)} ({', '.join(i['sku_id'] for i in high_risk)})\n"
                f"• ⚠️ **Warning SKUs**: {len(medium_risk)} ({', '.join(i['sku_id'] for i in medium_risk)})\n"
                f"• 📦 **Overstock SKUs**: {len(overstock)} ({', '.join(i['sku_id'] for i in overstock)})\n"
                f"• 💰 **Recommended Order Budget**: ₹{total_rec_cost:,.0f}\n\n"
                "You can ask me to evaluate specific items, explain demand spikes, or create reorder plans!"
            )

        return {"answer": answer, "summary_data": summary_data}


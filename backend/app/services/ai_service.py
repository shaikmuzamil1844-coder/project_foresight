from sqlalchemy.orm import Session
import os
import json
from dotenv import load_dotenv

load_dotenv()
# Try loading from both possible .env locations
for env_path in ["backend/.env", ".env"]:
    if os.path.exists(env_path):
        load_dotenv(env_path)

try:
    from backend.app.models.db_models import Product, RecommendationRecord
except ImportError:
    from app.models.db_models import Product, RecommendationRecord

try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# Correct Gemini model name
GEMINI_MODEL = "gemini-1.5-flash"


class AIAssistantService:
    @staticmethod
    def answer_query(prompt: str, db: Session) -> dict:
        prompt_lower = prompt.lower()

        # Fetch all real-time DB data
        recs = (
            db.query(RecommendationRecord, Product)
            .join(Product, RecommendationRecord.product_id == Product.id)
            .all()
        )

        db_context = []
        high_risk, medium_risk, overstock = [], [], []
        total_rec_cost, total_rec_items = 0.0, 0

        for r, p in recs:
            item = {
                "sku_id":               p.sku_id,
                "product_name":         p.product_name,
                "category":             p.category,
                "price":                p.price,
                "current_stock":        r.current_stock,
                "avg_daily_demand":     round(r.avg_daily_demand, 1),
                "lead_time_days":       p.lead_time,
                "safety_stock":         round(r.safety_stock, 1),
                "reorder_point":        round(r.reorder_point, 1),
                "recommended_quantity": r.recommended_quantity,
                "risk_level":           r.risk_level,
                "days_to_stockout":     round(r.days_to_stockout, 1),
            }
            db_context.append(item)
            if r.risk_level == "HIGH":
                high_risk.append(item)
            elif r.risk_level == "MEDIUM":
                medium_risk.append(item)
            elif r.risk_level == "OVERSTOCK":
                overstock.append(item)
            if r.recommended_quantity > 0:
                total_rec_cost  += r.recommended_quantity * p.price
                total_rec_items += r.recommended_quantity

        summary_data = {
            "high_risk_count":        len(high_risk),
            "medium_risk_count":      len(medium_risk),
            "total_recommended_cost": round(total_rec_cost, 2),
        }

        # --- Try Gemini LLM first ---
        gemini_key = os.getenv("GEMINI_API_KEY")
        if HAS_GENAI and gemini_key:
            try:
                client = genai.Client(api_key=gemini_key)
                system_prompt = (
                    "You are FORESIGHT AI, an expert supply chain and inventory intelligence advisor.\n"
                    "Answer using the real-time database context below. Be concise and professional.\n"
                    "Formatting: Use Markdown bullet points and **bold** highlights.\n"
                    "Ground all answers strictly in the data provided.\n\n"
                    f"DATABASE CONTEXT:\n{json.dumps(db_context, indent=2)}\n\n"
                    f"USER QUESTION: {prompt}"
                )
                response = client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=system_prompt,
                )
                if response and response.text:
                    return {"answer": response.text, "summary_data": summary_data}
            except Exception as e:
                print(f"Gemini API error: {e}")

        # --- Deterministic fallback (zero-hallucination) ---
        if any(kw in prompt_lower for kw in ["reorder", "buy", "purchase", "order"]):
            details = []
            for item in db_context:
                if item["risk_level"] in ["HIGH", "MEDIUM"] and item["recommended_quantity"] > 0:
                    cost = item["recommended_quantity"] * item["price"]
                    details.append(
                        f"• **{item['product_name']} ({item['sku_id']})**: "
                        f"Stockout in **{item['days_to_stockout']} days**. "
                        f"Order **{item['recommended_quantity']} units** (₹{cost:,.0f})."
                    )
            if not details:
                answer = "✅ **All Clear**: No reorders required right now. All SKUs are within safety thresholds."
            else:
                answer = (
                    f"📦 **Reorder Recommendations** — {len(details)} products need action:\n\n"
                    + "\n".join(details)
                    + f"\n\n💰 **Total Investment**: ₹{total_rec_cost:,.0f} ({total_rec_items} units)"
                )

        elif any(kw in prompt_lower for kw in ["risk", "critical", "stockout", "danger"]):
            details = [
                f"🚨 **{i['product_name']} ({i['sku_id']})** — Stock: {i['current_stock']} | "
                f"Stockout in **{i['days_to_stockout']}d** | Lead time: {i['lead_time_days']}d"
                for i in high_risk
            ]
            if not details:
                answer = "🟢 **No Critical Risk**: All SKUs are within safe stock levels."
            else:
                answer = f"🚨 **{len(details)} SKUs at Critical Risk:**\n\n" + "\n".join(details)

        elif any(kw in prompt_lower for kw in ["overstock", "excess", "too much"]):
            details = [
                f"⚠️ **{i['product_name']} ({i['sku_id']})** — Stock: {i['current_stock']} | "
                f"30d Demand: {i['avg_daily_demand'] * 30:.0f} units"
                for i in overstock
            ]
            if not details:
                answer = "✅ **Optimized**: No overstock situations detected."
            else:
                answer = f"⚠️ **{len(details)} Overstock SKUs:**\n\n" + "\n".join(details)

        else:
            answer = (
                f"🤖 **FORESIGHT Executive Summary**\n\n"
                f"• **Active SKUs**: {len(db_context)}\n"
                f"• 🚨 **Critical Risk**: {len(high_risk)} SKUs\n"
                f"• ⚠️ **Warning**: {len(medium_risk)} SKUs\n"
                f"• 📦 **Overstock**: {len(overstock)} SKUs\n"
                f"• 💰 **Recommended Order Budget**: ₹{total_rec_cost:,.0f}\n\n"
                f"Ask me about specific SKUs, reorder priorities, or demand forecasts!"
            )

        return {"answer": answer, "summary_data": summary_data}

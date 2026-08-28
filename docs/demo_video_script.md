# Project FORESIGHT - Demo Video Script (3-5 Minutes)

---

## 🎬 Video Overview & Outline

- **Target Duration**: 3 to 4 Minutes
- **Structure**:
  1. **0:00 - 0:30**: Introduction & Business Problem (Stockouts vs Overstock)
  2. **0:30 - 1:15**: Executive Dashboard Overview (KPIs, Sales Trend, Risk Breakdown)
  3. **1:15 - 2:00**: Interactive Dataset Ingestion & Validation
  4. **2:00 - 2:45**: SKU Demand Forecasting Engine (7/14/30 Days, Confidence Bounds, MAE/RMSE/MAPE)
  5. **2:45 - 3:30**: Inventory Intelligence & Purchase Order Recommendations
  6. **3:30 - 4:00**: "Ask Foresight" AI Assistant & Conclusion

---

## 🎙️ Script Transcript

### 1. Introduction (0:00 - 0:30)
> *"Hello everyone! Welcome to Project FORESIGHT – an AI-Powered Demand Forecasting & Inventory Intelligence Platform designed to eliminate retail stockouts and prevent overstock capital waste."*
> *"Traditional retailers lose billions every year because reordering relies on static gut feeling. Foresight solves this by turning raw sales history into real-time, predictive supply chain decisions."*

### 2. Dashboard Overview (0:30 - 1:15)
> *"Here on our main dashboard, supply chain managers get an immediate executive snapshot of total SKUs, active inventory counts, 30-day sales volume, and our real-time Stockout Risk breakdown."*
> *"Notice our risk indicators: we currently have critical SKUs flagged in Red (High Risk), Yellow (Medium Warning), Green (Healthy), and Blue (Overstock)."*

### 3. Data Upload & Ingestion (1:15 - 2:00)
> *"Foresight makes data ingestion seamless. You can upload any CSV or Excel transaction file containing SKU IDs, dates, units sold, prices, and lead times. Watch as our automated data processor cleans the schema and instantly updates our database models."*

### 4. Demand Forecasting Engine (2:00 - 2:45)
> *"Let's dive into SKU-level forecasting. I'll select Wireless Mouse (SKU001) and choose a 30-day forecast horizon."*
> *"Foresight trains an XGBoost time-series regression model on lag features and rolling window statistics. On the chart, you can see historical demand alongside our 30-day predicted trajectory complete with 95% confidence lower and upper uncertainty bounds."*
> *"We also display empirical evaluation metrics: an MAE of 2.45 units and a MAPE under 9%, giving supply chain planners true confidence."*

### 5. Inventory Intelligence & Reorder Recommendations (2:45 - 3:30)
> *"This is where Foresight transforms AI into real business value. In our Reorder Engine, we calculate Lead Time Demand, Safety Stock using a 95% service level factor, and exact Reorder Points."*
> *"For Wireless Mouse, with current stock at 43 units and lead time of 7 days, Foresight flags a Critical Stockout Risk in 4.8 days and recommends an exact purchase order of 35 units, estimating the purchase budget."*

### 6. AI Executive Assistant & Wrap-Up (3:30 - 4:00)
> *"Finally, planners can talk directly with 'Ask Foresight'—our embedded AI assistant that synthesizes database risk records into clear, actionable natural language summaries."*
> *"Thank you for watching! Foresight is fully deployed and ready to empower modern retail operations."*

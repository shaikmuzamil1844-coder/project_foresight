# Project FORESIGHT - Demo Video Script

## Recording setup

- Target duration: 3-4 minutes
- Open the deployed app and use the sample-data seed action before recording.
- Record at 1080p. Keep browser zoom at 100%.

## 0:00-0:25 - Introduction

> Hello everyone. This is Project FORESIGHT, a demand forecasting and inventory intelligence platform for retail operations. It helps supply-chain teams turn historical sales data into practical stock-risk and replenishment decisions.

Show the dashboard landing page.

## 0:25-0:55 - Dashboard

> The dashboard provides the executive view: active SKUs, current inventory, recent sales, stockout risk, and a purchase-value estimate. These values are calculated from the data stored in the platform, not fixed display values.

Point to the KPI cards, sales chart, and risk breakdown.

## 0:55-1:35 - Data ingestion

Navigate to **Data Management**.

> Users can import a CSV or Excel sales-history file, or load the included sample dataset. During ingestion, FORESIGHT validates the schema, stores products and transaction records, refreshes inventory snapshots, and recalculates recommendations.

Click **Load Sample Dataset** or demonstrate a CSV import. Wait for the success message.

## 1:35-2:10 - Inventory risk and recommendations

Navigate to **Inventory** and then **Recommendations**.

> The inventory engine calculates lead-time demand, safety stock, reorder point, projected days to stockout, and a recommended order quantity for each SKU. This gives planners a ranked list of items that need attention first.

Highlight one high-risk SKU and explain the risk badge and order quantity.

## 2:10-2:50 - Forecasting

Navigate to **Forecast** and select a seeded SKU, such as SKU001.

> FORESIGHT uses a Gradient Boosting demand model with calendar features, demand lags, and rolling demand statistics. The forecast is bounded from 7 to 90 days and includes MAE, RMSE, MAPE, and 95 percent confidence bounds.

Switch the horizon and point to the historical versus predicted series.

## 2:50-3:20 - AI assistant and conclusion

Navigate to **Ask FORESIGHT**.

> The assistant summarizes the stored inventory context into direct operational guidance. With Gemini configured it can produce natural-language answers; otherwise it still returns deterministic, data-grounded inventory summaries.

Ask: “What should I reorder?” Then close:

> Project FORESIGHT brings data ingestion, forecasting, inventory optimization, and decision support into one retail workflow. Thank you.

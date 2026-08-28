# PROJECT FORESIGHT: AI-Powered Demand & Inventory Intelligence Platform

**Project FORESIGHT** is a full-stack, enterprise-grade demand forecasting and inventory optimization platform. Built with **Next.js 14, Tailwind CSS, FastAPI, SQLAlchemy, and XGBoost/LightGBM**, FORESIGHT converts raw transactional sales history into precise SKU-level forecasts, evaluates stockout and overstock risks, calculates exact Reorder Points ($ROP$) and Safety Stock ($SS$), and generates automated purchase order recommendations alongside an interactive AI Assistant.

---

## 🌟 Key Features

1. **Executive Intelligence Dashboard**: Real-time snapshot of active SKUs, total inventory, 30-day revenue, stockout risks, and recommended procurement budget.
2. **SKU Demand Forecasting Engine**: Multi-horizon ($7, 14, 30$ days) time-series ML forecasting using XGBoost with lag features, rolling statistics, and 95% confidence bounds ($\pm 1.96 \times \text{RMSE}$).
3. **Inventory Risk & Intelligence Matrix**: Automated calculation of Lead Time Demand ($LTD$), Safety Stock ($SS$), Reorder Point ($ROP = LTD + SS$), and days-to-stockout countdown.
4. **Purchase Order Recommendations**: Calculates exact recommended reorder quantities ($\text{Units} = ROP + \text{Demand}_{30d} - \text{Stock}$) and financial cost estimates with 1-click supplier transmission.
5. **Dataset Upload & Seeder**: Drag-and-drop CSV dataset ingestion with schema validation and 1-click demo dataset seeder.
6. **Ask Foresight AI Executive Assistant**: Embedded natural language query interface providing structured supply chain insights.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Python FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn.
- **Machine Learning**: XGBoost, LightGBM, Scikit-Learn, Pandas, NumPy.
- **Database**: SQLite (Local Dev) / Supabase PostgreSQL (Cloud Production).

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone & Setup Backend
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server (auto-seeds sample retail dataset)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Backend API interactive documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Setup & Launch Frontend
```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start Next.js dev server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 📁 Repository Structure

```text
Project FORESIGHT/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints
│   │   ├── core/            # Database session & configuration
│   │   ├── models/          # ORM models & Pydantic schemas
│   │   ├── ml/              # Feature engineering & XGBoost forecaster
│   │   ├── services/        # Data ingestion & inventory risk engine
│   │   └── main.py          # Application entry point
│   ├── data/                # Sample retail sales dataset generator
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Glassmorphic UI & Recharts components
│   │   └── lib/             # API client & TypeScript interfaces
│   └── package.json
│
├── docs/                    # Project report, video scripts & submission checklist
└── README.md
```

---

## 📄 Documentation & Submission Deliverables
- [Technical Project Report](docs/project_report.md)
- [Demo Video Script](docs/demo_video_script.md)
- [Walkthrough & Screenshots](file:///C:/Users/Lenovo/.gemini/antigravity-ide/brain/85c1f472-1b5b-4401-b8e1-69a35b7ea906/walkthrough.md)

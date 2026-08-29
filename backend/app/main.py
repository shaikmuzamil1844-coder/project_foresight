from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

try:
    from backend.app.core.config import settings
    from backend.app.core.database import engine, Base, SessionLocal
    from backend.app.api import upload, products, dashboard, forecast, inventory, ai_assistant
except ImportError:
    from app.core.config import settings
    from app.core.database import engine, Base, SessionLocal
    from app.api import upload, products, dashboard, forecast, inventory, ai_assistant

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/openapi.json",
    description="AI-Powered Demand & Inventory Intelligence Platform REST API",
)

# CORS — allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under BOTH "" and "/api" so Vercel path prefix stripping works seamlessly
for prefix in ["", "/api"]:
    app.include_router(upload.router,       prefix=prefix)
    app.include_router(products.router,     prefix=prefix)
    app.include_router(dashboard.router,    prefix=prefix)
    app.include_router(forecast.router,     prefix=prefix)
    app.include_router(inventory.router,    prefix=prefix)
    app.include_router(ai_assistant.router, prefix=prefix)


@app.on_event("startup")
def startup_event():
    """Create database tables and auto-seed on startup."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Table creation note: {e}")

    try:
        db = SessionLocal()
        try:
            from backend.app.models.db_models import Product
            from backend.app.services.data_processor import DataProcessor
        except ImportError:
            from app.models.db_models import Product
            from app.services.data_processor import DataProcessor
        import pandas as pd

        if db.query(Product).count() == 0:
            print("Database empty – attempting auto-seed...")
            candidates = [
                "backend/data/sample_retail_sales.csv",
                "data/sample_retail_sales.csv",
                os.path.join(os.path.dirname(__file__), "..", "data", "sample_retail_sales.csv"),
            ]
            filepath = next((p for p in candidates if os.path.exists(p)), None)

            if filepath and os.path.exists(filepath):
                df = pd.read_csv(filepath)
                DataProcessor.ingest_dataframe(df, db)
                print("Sample dataset loaded successfully.")
        db.close()
    except Exception as e:
        print(f"Startup auto-seed note: {e}")


@app.get("/")
@app.get("/api")
def root():
    return {"status": "online", "project": settings.PROJECT_NAME, "docs": "/docs"}


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "foresight-backend"}

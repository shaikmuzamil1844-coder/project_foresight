from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.api import upload, products, dashboard, forecast, inventory, ai_assistant
from backend.data.generator import generate_sample_data
from backend.app.services.data_processor import DataProcessor

import pandas as pd
import os

# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="AI-Powered Demand & Inventory Intelligence Platform REST API"
)

# Enable CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(upload.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(forecast.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    # Auto-seed database if empty
    db = SessionLocal()
    try:
        from backend.app.models.db_models import Product
        if db.query(Product).count() == 0:
            print("Database is empty. Initializing sample retail dataset...")
            filepath = "backend/data/sample_retail_sales.csv"
            if not os.path.exists(filepath):
                generate_sample_data(filepath)
            df = pd.read_csv(filepath)
            DataProcessor.ingest_dataframe(df, db)
            print("Sample dataset successfully loaded into database!")
    except Exception as e:
        print(f"Startup data auto-seed note: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "foresight-backend"}

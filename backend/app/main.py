from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os

try:
    from backend.app.core.config import settings
    from backend.app.core.database import engine, Base
    from backend.app.api import upload, products, dashboard, forecast, inventory, ai_assistant
except ImportError:
    from app.core.config import settings
    from app.core.database import engine, Base
    from app.api import upload, products, dashboard, forecast, inventory, ai_assistant

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/openapi.json",
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

# Register API Routers under /api prefix for Vercel zero-config compatibility
app.include_router(upload.router,       prefix="/api")
app.include_router(products.router,     prefix="/api")
app.include_router(dashboard.router,    prefix="/api")
app.include_router(forecast.router,     prefix="/api")
app.include_router(inventory.router,    prefix="/api")
app.include_router(ai_assistant.router, prefix="/api")


@app.on_event("startup")
def startup_event():
    """Create database tables on startup."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Table creation note: {e}")


@app.get("/")
@app.get("/api")
def root():
    return {"status": "online", "project": settings.PROJECT_NAME, "docs": "/docs"}


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "foresight-backend"}

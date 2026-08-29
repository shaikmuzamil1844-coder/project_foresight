from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
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

# Global Exception Handler – catches all runtime errors and returns detailed JSON diagnostics
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=200,
        content={
            "status": "runtime_error",
            "error": str(exc),
            "traceback": traceback.format_exc(),
            "path": request.url.path,
        }
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


@app.get("/")
@app.get("/api")
def root():
    return {"status": "online", "project": settings.PROJECT_NAME, "docs": "/docs"}


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "foresight-backend"}

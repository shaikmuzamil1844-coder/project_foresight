from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.app.api import ai_assistant, dashboard, forecast, inventory, products, upload
    from backend.app.core.config import settings
    from backend.app.core.database import init_db
except ImportError:
    from app.api import ai_assistant, dashboard, forecast, inventory, products, upload
    from app.core.config import settings
    from app.core.database import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/openapi.json",
    description="AI-Powered Demand & Inventory Intelligence Platform REST API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/")
@app.get("/api")
def root():
    return {"status": "online", "project": settings.PROJECT_NAME, "docs": "/docs"}


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "foresight-backend"}


for router in (products.router, dashboard.router, inventory.router, forecast.router, upload.router, ai_assistant.router):
    app.include_router(router, prefix=settings.API_V1_STR)

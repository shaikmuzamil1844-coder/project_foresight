from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

try:
    from backend.app.core.database import Base
except ImportError:
    from app.core.database import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = {'extend_existing': True}

    id               = Column(Integer, primary_key=True, index=True)
    sku_id           = Column(String, unique=True, index=True, nullable=False)
    product_name     = Column(String, nullable=False)
    category         = Column(String, nullable=False)
    price            = Column(Float, nullable=False, default=0.0)
    supplier         = Column(String, nullable=True,  default="Default Supplier")
    lead_time        = Column(Integer, nullable=False, default=7)
    min_safety_stock = Column(Integer, nullable=False, default=10)

    sales           = relationship("SalesRecord",        back_populates="product", cascade="all, delete-orphan")
    inventory       = relationship("InventoryRecord",    back_populates="product", cascade="all, delete-orphan")
    forecasts       = relationship("ForecastRecord",     back_populates="product", cascade="all, delete-orphan")
    recommendations = relationship("RecommendationRecord", back_populates="product", cascade="all, delete-orphan")


class SalesRecord(Base):
    __tablename__ = "sales"
    __table_args__ = {'extend_existing': True}

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    date       = Column(Date,    index=True, nullable=False)
    units_sold = Column(Integer, nullable=False, default=0)
    revenue    = Column(Float,   nullable=False, default=0.0)

    product = relationship("Product", back_populates="sales")


class InventoryRecord(Base):
    __tablename__ = "inventory"
    __table_args__ = {'extend_existing': True}

    id             = Column(Integer, primary_key=True, index=True)
    product_id     = Column(Integer, ForeignKey("products.id"), nullable=False)
    date           = Column(Date,    index=True, nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)

    product = relationship("Product", back_populates="inventory")


class ForecastRecord(Base):
    __tablename__ = "forecasts"
    __table_args__ = {'extend_existing': True}

    id               = Column(Integer, primary_key=True, index=True)
    product_id       = Column(Integer, ForeignKey("products.id"), nullable=False)
    forecast_date    = Column(Date,    index=True, nullable=False)
    predicted_demand = Column(Float,   nullable=False)
    lower_bound      = Column(Float,   nullable=False)
    upper_bound      = Column(Float,   nullable=False)
    model_version    = Column(String,  nullable=False, default="GBM_v1")
    mae              = Column(Float,   nullable=True)
    mape             = Column(Float,   nullable=True)
    rmse             = Column(Float,   nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="forecasts")


class RecommendationRecord(Base):
    __tablename__ = "recommendations"
    __table_args__ = {'extend_existing': True}

    id                  = Column(Integer, primary_key=True, index=True)
    product_id          = Column(Integer, ForeignKey("products.id"), nullable=False)
    current_stock       = Column(Integer, nullable=False)
    avg_daily_demand    = Column(Float,   nullable=False)
    lead_time_demand    = Column(Float,   nullable=False)
    safety_stock        = Column(Float,   nullable=False)
    reorder_point       = Column(Float,   nullable=False)
    recommended_quantity = Column(Integer, nullable=False)
    risk_level          = Column(String,  nullable=False)   # HIGH | MEDIUM | LOW | OVERSTOCK
    days_to_stockout    = Column(Float,   nullable=False)
    created_at          = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="recommendations")


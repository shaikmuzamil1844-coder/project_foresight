from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import io
import os

try:
    from backend.app.core.database import get_db
    from backend.app.services.data_processor import DataProcessor
except ImportError:
    from app.core.database import get_db
    from app.services.data_processor import DataProcessor

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV and XLSX files are supported.")
    try:
        contents = await file.read()
        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.BytesIO(contents))
        count = DataProcessor.ingest_dataframe(df, db)
        return {
            "message": f"Ingested {len(df)} records across {count} SKUs.",
            "sku_count": count,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")


@router.post("/seed")
def seed_sample_data(db: Session = Depends(get_db)):
    try:
        # Resolve path relative to this file so it works on both local and Vercel
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        candidates = [
            os.path.join(base_dir, "data", "sample_retail_sales.csv"),
            os.path.join(base_dir, "backend", "data", "sample_retail_sales.csv"),
            "backend/data/sample_retail_sales.csv",
            "data/sample_retail_sales.csv",
        ]
        filepath = next((p for p in candidates if os.path.exists(p)), None)

        if filepath is None:
            # Try to generate
            try:
                from data.generator import generate_sample_data
            except ImportError:
                try:
                    from backend.data.generator import generate_sample_data
                except ImportError:
                    generate_sample_data = None

            if generate_sample_data:
                filepath = candidates[0]
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                generate_sample_data(filepath)
            else:
                raise HTTPException(status_code=500, detail="Sample data file not found and generator unavailable.")

        df = pd.read_csv(filepath)
        count = DataProcessor.ingest_dataframe(df, db)
        return {
            "message": f"Seeded {len(df)} records across {count} SKUs.",
            "sku_count": count,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")

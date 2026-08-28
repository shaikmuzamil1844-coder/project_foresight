from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import io
from backend.app.core.database import get_db
from backend.app.services.data_processor import DataProcessor
from backend.data.generator import generate_sample_data
import os


router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        count = DataProcessor.ingest_dataframe(df, db)
        return {"message": f"Successfully ingested {len(df)} sales records across {count} SKUs.", "sku_count": count}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {str(e)}")

@router.post("/seed")
def seed_sample_data(db: Session = Depends(get_db)):
    try:
        filepath = "backend/data/sample_retail_sales.csv"
        if not os.path.exists(filepath):
            generate_sample_data(filepath)
        
        df = pd.read_csv(filepath)
        count = DataProcessor.ingest_dataframe(df, db)
        return {"message": f"Successfully seeded sample dataset with {len(df)} records across {count} SKUs.", "sku_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed sample dataset: {str(e)}")

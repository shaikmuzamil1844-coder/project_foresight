import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Project FORESIGHT"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:Muzamil%403101@db.wcfojpgbwnqfuoxgwmue.supabase.co:5432/postgres")
    
    class Config:
        case_sensitive = True

settings = Settings()

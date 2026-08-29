from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Project FORESIGHT"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./foresight.db"
    CORS_ORIGINS: str = "http://localhost:3000"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()

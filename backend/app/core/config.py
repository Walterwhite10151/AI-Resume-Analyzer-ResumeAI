from pydantic_settings import BaseSettings
from typing import List
import os
pip install groq

class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Resume Analyzer"
    DEBUG: bool = False
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/resume_analyzer"

    # Anthropic
    GROQ_API_KEY: str
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx"]

    # CORS
    ALLOWED_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://main.d37oqief8o78ft.amplifyapp.com",
]  

    # Admin
    ADMIN_EMAIL: str = "admin@resumeanalyzer.com"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

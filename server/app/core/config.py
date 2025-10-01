"""
Core configuration and settings for the Nimora API
"""
import os
from typing import List, Optional
from pydantic import validator
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support"""

    # Application
    app_name: str = "Nimora API"
    app_version: str = "2.0.0"
    debug: bool = False

    # Environment
    environment: str = "development"

    # Security
    payload_salt: str = "nimora_secure_payload_2025"
    secret_key: str = "your-secret-key-here"  # Should be overridden in production

    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "https://nimora.duvarakesh.xyz",
        "*"  # For development only
    ]

    # Logging
    log_level: str = "INFO"

    # Rate limiting
    rate_limit_per_minute: int = 60
    rate_limit_burst: int = 10

    # Cache settings
    cache_ttl: int = 300  # 5 minutes default cache
    redis_url: Optional[str] = None

    # External services
    psg_tech_base_url: str = "https://ecampus.psgtech.ac.in"

    # Vercel deployment detection
    @validator('environment', pre=True)
    def set_environment(cls, v):
        vercel_env = os.environ.get("VERCEL_ENV")
        if vercel_env:
            return vercel_env
        return v or "development"

    @validator('debug', pre=True)
    def set_debug(cls, v):
        return os.environ.get("VERCEL_ENV") != "production"

    @validator('log_level', pre=True)
    def set_log_level(cls, v):
        if os.environ.get("VERCEL_ENV") == "production":
            return "WARNING"
        return v or "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Convenience function to get settings
settings = get_settings()

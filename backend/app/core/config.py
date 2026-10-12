"""
Central application configuration.
Values are loaded from environment variables (see .env.example at repo root).
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "ResQLink"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api"

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12  # 12 hours

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://resqlink:resqlink@postgres:5432/resqlink"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    REDIS_AVAILABILITY_TTL_SECONDS: int = 300

    # RabbitMQ
    RABBITMQ_URL: str = "amqp://guest:guest@rabbitmq:5672/"
    QUEUE_REQUEST_CREATED: str = "request.created"
    QUEUE_MATCH_CREATED: str = "match.created"
    QUEUE_RESERVATION_CREATED: str = "reservation.created"
    QUEUE_RESERVATION_EXPIRED: str = "reservation.expired"
    QUEUE_REQUEST_RESOLVED: str = "request.resolved"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Reservation
    RESERVATION_HOLD_MINUTES: int = 15


@lru_cache
def get_settings() -> Settings:
    return Settings()

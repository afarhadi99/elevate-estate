"""Application configuration via pydantic-settings."""
from __future__ import annotations

import json
from typing import Literal

from pydantic import AnyHttpUrl, EmailStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Core ──────────────────────────────────────────────────────────────────
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    SECRET_KEY: str = "insecure-dev-secret-change-in-production"
    DEBUG: bool = False

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/elevate_estate"

    @property
    def sync_database_url(self) -> str:
        """Synchronous URL for Alembic migrations."""
        return self.DATABASE_URL.replace("+asyncpg", "")

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v

    # ── Session ───────────────────────────────────────────────────────────────
    SESSION_COOKIE_NAME: str = "ee_session"
    SESSION_TTL_SECONDS: int = 604800  # 7 days
    SESSION_SECURE_COOKIE: bool = False

    # ── Email / SMTP ──────────────────────────────────────────────────────────
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 25
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: EmailStr = "noreply@example.com"  # type: ignore[assignment]
    SMTP_FROM_NAME: str = "Elevate Estate"
    SMTP_USE_TLS: bool = True

    # ── AWS S3 ────────────────────────────────────────────────────────────────
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "elevate-estate-media"
    S3_PRESIGNED_URL_EXPIRY: int = 3600  # seconds

    # ── Invitation tokens ─────────────────────────────────────────────────────
    INVITATION_SECRET: str = "insecure-invitation-secret"
    INVITATION_TTL_HOURS: int = 72

    # ── Sentry ────────────────────────────────────────────────────────────────
    SENTRY_DSN: str = ""

    # ── Feature flags ─────────────────────────────────────────────────────────
    REQUIRE_EMAIL_VERIFICATION: bool = True

    # ── App metadata ──────────────────────────────────────────────────────────
    APP_NAME: str = "Elevate Estate API"
    APP_VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY.startswith("insecure"):
                raise ValueError("SECRET_KEY must be changed in production")
            if not self.SESSION_SECURE_COOKIE:
                raise ValueError("SESSION_SECURE_COOKIE must be True in production")
        return self


settings = Settings()

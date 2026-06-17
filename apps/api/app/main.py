"""FastAPI application factory and lifespan."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import sentry_sdk
import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import close_db, init_db

logger = structlog.get_logger(__name__)


# ── Logging configuration ─────────────────────────────────────────────────────

def _configure_logging() -> None:
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.dev.ConsoleRenderer()
            if settings.ENVIRONMENT == "development"
            else structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            10 if settings.DEBUG else 20  # DEBUG vs INFO
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
    )


# ── Sentry ────────────────────────────────────────────────────────────────────

def _configure_sentry() -> None:
    if settings.SENTRY_DSN:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.ENVIRONMENT,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            traces_sample_rate=0.2 if settings.ENVIRONMENT == "production" else 1.0,
            send_default_pii=False,
        )
        logger.info("sentry.initialized")


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    _configure_logging()
    _configure_sentry()
    logger.info("startup", environment=settings.ENVIRONMENT)
    await init_db()
    logger.info("database.connected")
    yield
    await close_db()
    logger.info("shutdown")


# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
        openapi_url="/openapi.json" if settings.ENVIRONMENT != "production" else None,
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,  # required for HttpOnly cookie auth
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # ── Global exception handler ──────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_exception", path=request.url.path, error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal error occurred"},
        )

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["system"], include_in_schema=False)
    async def health() -> dict:
        return {"status": "ok", "version": settings.APP_VERSION}

    @app.get("/", tags=["system"], include_in_schema=False)
    async def root() -> dict:
        return {"name": settings.APP_NAME, "version": settings.APP_VERSION}

    # ── API v1 ────────────────────────────────────────────────────────────────
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_app()

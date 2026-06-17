"""pytest fixtures: test DB, async client, pre-created user/org."""
from __future__ import annotations

import asyncio
from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app

# ── Test database ─────────────────────────────────────────────────────────────

TEST_DATABASE_URL = settings.DATABASE_URL.replace(
    "/elevate_estate", "/elevate_estate_test"
)

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


@pytest.fixture(scope="session")
def event_loop():
    """Single event loop for the whole test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_test_db():
    """Create all tables once per test session; drop them afterwards."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture()
async def db() -> AsyncGenerator[AsyncSession, None]:
    """A clean transaction-wrapped session for each test (rolls back after)."""
    async with test_engine.connect() as conn:
        await conn.begin()
        session = AsyncSession(bind=conn, expire_on_commit=False)
        try:
            yield session
        finally:
            await session.close()
            await conn.rollback()


@pytest_asyncio.fixture()
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client that uses the test DB session."""

    async def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


# ── Helpers ───────────────────────────────────────────────────────────────────

SIGNUP_PAYLOAD: dict[str, Any] = {
    "email": "owner@example.com",
    "password": "SecurePass1",
    "full_name": "Test Owner",
    "org_name": "Test Realty",
    "org_slug": "test-realty",
}


@pytest_asyncio.fixture()
async def authenticated_client(client: AsyncClient) -> AsyncClient:
    """Client pre-authenticated as the test owner."""
    resp = await client.post("/api/v1/auth/signup", json=SIGNUP_PAYLOAD)
    assert resp.status_code == 201, resp.text
    # Cookie is set automatically by httpx
    return client

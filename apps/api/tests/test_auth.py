"""Auth flow integration tests."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

from tests.conftest import SIGNUP_PAYLOAD


# ── Sign-up ────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_signup_creates_user_and_session(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/auth/signup", json=SIGNUP_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["email"] == SIGNUP_PAYLOAD["email"]
    assert data["user"]["full_name"] == SIGNUP_PAYLOAD["full_name"]
    # HttpOnly cookie must be set
    assert "ee_session" in resp.cookies


@pytest.mark.asyncio
async def test_signup_duplicate_email_returns_409(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/signup", json=SIGNUP_PAYLOAD)
    resp = await client.post("/api/v1/auth/signup", json=SIGNUP_PAYLOAD)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_signup_duplicate_slug_returns_409(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/signup", json=SIGNUP_PAYLOAD)
    payload2 = {**SIGNUP_PAYLOAD, "email": "other@example.com"}
    resp = await client.post("/api/v1/auth/signup", json=payload2)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_signup_weak_password_returns_422(client: AsyncClient) -> None:
    payload = {**SIGNUP_PAYLOAD, "email": "weak@example.com", "password": "tooshort"}
    resp = await client.post("/api/v1/auth/signup", json=payload)
    assert resp.status_code == 422


# ── Login ──────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/signup", json=SIGNUP_PAYLOAD)
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": SIGNUP_PAYLOAD["email"], "password": SIGNUP_PAYLOAD["password"]},
    )
    assert resp.status_code == 200
    assert resp.json()["user"]["email"] == SIGNUP_PAYLOAD["email"]
    assert "ee_session" in resp.cookies


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/signup", json=SIGNUP_PAYLOAD)
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": SIGNUP_PAYLOAD["email"], "password": "WrongPass1"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email_returns_401(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "AnyPass1"},
    )
    assert resp.status_code == 401


# ── /me ────────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_me_returns_user(authenticated_client: AsyncClient) -> None:
    resp = await authenticated_client.get("/api/v1/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == SIGNUP_PAYLOAD["email"]


@pytest.mark.asyncio
async def test_me_unauthenticated_returns_401(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401


# ── Logout ─────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_logout_invalidates_session(authenticated_client: AsyncClient) -> None:
    # Verify we're in
    me_before = await authenticated_client.get("/api/v1/auth/me")
    assert me_before.status_code == 200

    # Logout
    logout_resp = await authenticated_client.post("/api/v1/auth/logout")
    assert logout_resp.status_code == 200

    # Cookie should be cleared – subsequent request must 401
    me_after = await authenticated_client.get("/api/v1/auth/me")
    assert me_after.status_code == 401


# ── Forgot / reset password ────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_forgot_password_always_200(client: AsyncClient) -> None:
    """Never reveals whether an email exists."""
    resp = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "notregistered@example.com"},
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_reset_password_invalid_token_returns_400(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": "not-a-real-token", "new_password": "NewPass1"},
    )
    assert resp.status_code == 400


# ── Health check ───────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

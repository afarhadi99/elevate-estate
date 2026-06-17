"""Authentication routes."""
from __future__ import annotations

import structlog
from fastapi import APIRouter, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, DbSession
from app.core.config import settings
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MeResponse,
    MessageResponse,
    ResetPasswordRequest,
    SessionResponse,
    SignUpRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.SESSION_SECURE_COOKIE,
        samesite="lax",
        max_age=settings.SESSION_TTL_SECONDS,
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.SESSION_SECURE_COOKIE,
        samesite="lax",
    )


@router.post(
    "/signup",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def signup(
    body: SignUpRequest,
    request: Request,
    response: Response,
    db: DbSession,
) -> SessionResponse:
    svc = AuthService(db)
    user, token = await svc.signup(
        email=body.email,
        password=body.password,
        full_name=body.full_name,
        org_name=body.org_name,
        org_slug=body.org_slug,
        request=request,
    )
    _set_session_cookie(response, token)
    return SessionResponse(
        user=UserResponse.model_validate(user),
        message="Account created successfully",
    )


@router.post("/login", response_model=SessionResponse)
async def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: DbSession,
) -> SessionResponse:
    svc = AuthService(db)
    user, token = await svc.login(
        email=body.email,
        password=body.password,
        request=request,
    )
    _set_session_cookie(response, token)
    return SessionResponse(user=UserResponse.model_validate(user))


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    response: Response,
    db: DbSession,
) -> MessageResponse:
    token: str | None = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if token:
        svc = AuthService(db)
        await svc.logout(token)
    _clear_session_cookie(response)
    return MessageResponse(message="Logged out")


@router.get("/verify-email/{token}", response_model=MessageResponse)
async def verify_email(token: str, db: DbSession) -> MessageResponse:
    svc = AuthService(db)
    await svc.verify_email(token)
    return MessageResponse(message="Email verified successfully")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(body: ForgotPasswordRequest, db: DbSession) -> MessageResponse:
    svc = AuthService(db)
    await svc.forgot_password(body.email)
    return MessageResponse(message="If that email is registered, a reset link has been sent")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(body: ResetPasswordRequest, db: DbSession) -> MessageResponse:
    svc = AuthService(db)
    await svc.reset_password(body.token, body.new_password)
    return MessageResponse(message="Password updated successfully")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)

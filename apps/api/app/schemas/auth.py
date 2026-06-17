"""Auth-related Pydantic v2 schemas."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    org_name: str = Field(min_length=1, max_length=255, description="Name of the new organization")
    org_slug: str = Field(
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9][a-z0-9\-]*[a-z0-9]$",
        description="URL-safe slug for the organization",
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str
    is_active: bool
    is_email_verified: bool
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime


class SessionResponse(BaseModel):
    """Returned on successful login/signup (token set in HttpOnly cookie)."""

    user: UserResponse
    message: str = "Authenticated successfully"


class MeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user: UserResponse
    org_id: UUID | None = None
    role: str | None = None


class MessageResponse(BaseModel):
    message: str

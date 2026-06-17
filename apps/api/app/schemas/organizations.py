"""Organization Pydantic v2 schemas."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl


class OrgCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9][a-z0-9\-]*[a-z0-9]$",
    )
    website: str | None = None
    phone: str | None = None
    address: str | None = None


class OrgUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    website: str | None = None
    phone: str | None = None
    address: str | None = None
    logo_url: str | None = None


class OrgResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    logo_url: str | None
    website: str | None
    phone: str | None
    address: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class OrgSettingsUpdate(BaseModel):
    listing_stages: list[str] | None = None
    currency: str | None = Field(None, max_length=10)
    locale: str | None = Field(None, max_length=10)
    extra: dict | None = None


class OrgSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    listing_stages: list | None
    currency: str
    locale: str
    extra: dict | None


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    joined_at: datetime


class InvitationCreate(BaseModel):
    email: EmailStr
    role: str = Field(default="agent", pattern=r"^(owner|admin|agent|viewer)$")


class InvitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    role: str
    expires_at: datetime
    accepted_at: datetime | None
    created_at: datetime

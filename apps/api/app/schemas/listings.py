"""Listing Pydantic v2 schemas."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ListingAddressCreate(BaseModel):
    street_1: str = Field(min_length=1, max_length=255)
    street_2: str | None = None
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    postal_code: str = Field(min_length=1, max_length=20)
    country: str = Field(default="US", max_length=10)
    latitude: Decimal | None = None
    longitude: Decimal | None = None


class ListingAddressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    street_1: str
    street_2: str | None
    city: str
    state: str
    postal_code: str
    country: str
    latitude: Decimal | None
    longitude: Decimal | None


class ListingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=512)
    description: str | None = None
    property_type: str = Field(
        default="residential",
        pattern=r"^(residential|commercial|land|rental)$",
    )
    listing_type: str = Field(
        default="for_sale",
        pattern=r"^(for_sale|for_rent|sold|off_market)$",
    )
    stage: str = Field(default="Lead", max_length=100)
    asking_price: Decimal | None = Field(None, ge=0)
    sale_price: Decimal | None = Field(None, ge=0)
    bedrooms: int | None = Field(None, ge=0)
    bathrooms: Decimal | None = Field(None, ge=0)
    square_feet: int | None = Field(None, ge=0)
    lot_size_sqft: int | None = Field(None, ge=0)
    year_built: int | None = Field(None, ge=1800, le=2100)
    mls_number: str | None = Field(None, max_length=100)
    listed_at: datetime | None = None
    agent_id: UUID | None = None
    address: ListingAddressCreate | None = None


class ListingUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=512)
    description: str | None = None
    property_type: str | None = Field(
        None, pattern=r"^(residential|commercial|land|rental)$"
    )
    listing_type: str | None = Field(
        None, pattern=r"^(for_sale|for_rent|sold|off_market)$"
    )
    asking_price: Decimal | None = Field(None, ge=0)
    sale_price: Decimal | None = Field(None, ge=0)
    bedrooms: int | None = Field(None, ge=0)
    bathrooms: Decimal | None = Field(None, ge=0)
    square_feet: int | None = Field(None, ge=0)
    lot_size_sqft: int | None = Field(None, ge=0)
    year_built: int | None = Field(None, ge=1800, le=2100)
    mls_number: str | None = Field(None, max_length=100)
    listed_at: datetime | None = None
    closed_at: datetime | None = None
    agent_id: UUID | None = None
    address: ListingAddressCreate | None = None


class ListingStageUpdate(BaseModel):
    stage: str = Field(min_length=1, max_length=100)


class ListingNoteCreate(BaseModel):
    body: str = Field(min_length=1)


class ListingNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    body: str
    author_id: UUID | None
    created_at: datetime
    updated_at: datetime


class ListingStageHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    from_stage: str | None
    to_stage: str
    changed_by_id: UUID | None
    changed_at: datetime


class ListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    agent_id: UUID | None
    title: str
    description: str | None
    property_type: str
    listing_type: str
    stage: str
    asking_price: Decimal | None
    sale_price: Decimal | None
    bedrooms: int | None
    bathrooms: Decimal | None
    square_feet: int | None
    lot_size_sqft: int | None
    year_built: int | None
    mls_number: str | None
    listed_at: datetime | None
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    address: ListingAddressResponse | None = None


class ListingDetailResponse(ListingResponse):
    """Full listing response including notes and stage history."""

    notes: list[ListingNoteResponse] = []
    stage_history: list[ListingStageHistoryResponse] = []


class PaginatedListings(BaseModel):
    items: list[ListingResponse]
    total: int
    page: int
    page_size: int
    pages: int


class ListingFilter(BaseModel):
    stage: str | None = None
    property_type: str | None = None
    listing_type: str | None = None
    agent_id: UUID | None = None
    min_price: Decimal | None = None
    max_price: Decimal | None = None
    search: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=100)

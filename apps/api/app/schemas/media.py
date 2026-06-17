"""Media Pydantic v2 schemas."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PresignedUploadRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=512)
    content_type: str = Field(min_length=1, max_length=100)
    file_size_bytes: int = Field(gt=0, le=100_000_000)  # 100 MB max


class PresignedUploadResponse(BaseModel):
    asset_id: UUID
    upload_url: str
    fields: dict  # S3 presigned POST fields
    expires_in: int  # seconds


class MediaAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    s3_key: str
    s3_bucket: str
    original_filename: str
    content_type: str
    file_size_bytes: int
    width: int | None
    height: int | None
    upload_confirmed_at: datetime | None
    created_at: datetime


class AttachToListingRequest(BaseModel):
    listing_id: UUID
    caption: str | None = None
    is_cover: bool = False


class MediaReorderRequest(BaseModel):
    """Ordered list of listing_media IDs to define new sort order."""

    ordered_ids: list[UUID] = Field(min_length=1)


class ListingMediaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    asset_id: UUID
    listing_id: UUID
    sort_order: int
    caption: str | None
    is_cover: bool
    attached_at: datetime

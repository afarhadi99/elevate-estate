"""Media asset models: S3-backed assets, variants, and listing attachments."""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.listings import Listing
    from app.models.organizations import Organization
    from app.models.users import User


class MediaAsset(Base):
    """A single uploaded file stored in S3."""

    __tablename__ = "media_assets"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    organization_id: Mapped[UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    uploaded_by_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # S3 storage info
    s3_key: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    s3_bucket: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)

    # Derived metadata (filled after upload confirmation)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Lifecycle
    upload_confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="media_assets"
    )
    uploaded_by: Mapped["User | None"] = relationship("User")
    variants: Mapped[list["MediaVariant"]] = relationship(
        "MediaVariant", back_populates="asset", cascade="all, delete-orphan"
    )
    listing_media: Mapped[list["ListingMedia"]] = relationship(
        "ListingMedia", back_populates="asset"
    )

    def __repr__(self) -> str:
        return f"<MediaAsset id={self.id} key={self.s3_key!r}>"


class MediaVariant(Base):
    """Resized/transcoded variant of a MediaAsset (e.g., thumbnail, webp)."""

    __tablename__ = "media_variants"
    __table_args__ = (
        UniqueConstraint("asset_id", "variant_name", name="uq_media_variants_asset_variant"),
    )

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    asset_id: Mapped[UUID] = mapped_column(
        ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # e.g. "thumb_200x200", "webp_1200", "hls_720p"
    variant_name: Mapped[str] = mapped_column(String(100), nullable=False)
    s3_key: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    asset: Mapped["MediaAsset"] = relationship("MediaAsset", back_populates="variants")


class ListingMedia(Base):
    """Join table: attaches MediaAssets to Listings with ordering."""

    __tablename__ = "listing_media"
    __table_args__ = (
        UniqueConstraint("listing_id", "asset_id", name="uq_listing_media_listing_asset"),
    )

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    listing_id: Mapped[UUID] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    asset_id: Mapped[UUID] = mapped_column(
        ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    organization_id: Mapped[UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_cover: Mapped[bool] = mapped_column(default=False, nullable=False)
    attached_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    listing: Mapped["Listing"] = relationship("Listing", back_populates="media")
    asset: Mapped["MediaAsset"] = relationship("MediaAsset", back_populates="listing_media")

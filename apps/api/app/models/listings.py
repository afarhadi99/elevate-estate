"""Listing, address, notes, and stage history models."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.media import ListingMedia
    from app.models.organizations import Organization
    from app.models.users import User


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    organization_id: Mapped[UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Agent who owns this listing
    agent_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Core fields
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    property_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="residential"
    )  # residential | commercial | land | rental
    listing_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="for_sale"
    )  # for_sale | for_rent | sold | off_market

    # Stage in the pipeline
    stage: Mapped[str] = mapped_column(String(100), nullable=False, default="Lead")

    # Pricing
    asking_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    sale_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)

    # Physical attributes
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[Decimal | None] = mapped_column(Numeric(4, 1), nullable=True)
    square_feet: Mapped[int | None] = mapped_column(Integer, nullable=True)
    lot_size_sqft: Mapped[int | None] = mapped_column(Integer, nullable=True)
    year_built: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # MLS
    mls_number: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    # Dates
    listed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="listings"
    )
    agent: Mapped["User | None"] = relationship("User")
    address: Mapped["ListingAddress | None"] = relationship(
        "ListingAddress",
        back_populates="listing",
        uselist=False,
        cascade="all, delete-orphan",
    )
    notes: Mapped[list["ListingNote"]] = relationship(
        "ListingNote", back_populates="listing", cascade="all, delete-orphan"
    )
    stage_history: Mapped[list["ListingStageHistory"]] = relationship(
        "ListingStageHistory", back_populates="listing", cascade="all, delete-orphan"
    )
    media: Mapped[list["ListingMedia"]] = relationship(
        "ListingMedia", back_populates="listing", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Listing id={self.id} title={self.title!r}>"


class ListingAddress(Base):
    __tablename__ = "listing_addresses"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    listing_id: Mapped[UUID] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    street_1: Mapped[str] = mapped_column(String(255), nullable=False)
    street_2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)
    country: Mapped[str] = mapped_column(String(10), nullable=False, default="US")
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)

    listing: Mapped["Listing"] = relationship("Listing", back_populates="address")


class ListingNote(Base):
    __tablename__ = "listing_notes"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    listing_id: Mapped[UUID] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    organization_id: Mapped[UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    listing: Mapped["Listing"] = relationship("Listing", back_populates="notes")
    author: Mapped["User | None"] = relationship("User")


class ListingStageHistory(Base):
    """Immutable audit log of stage transitions."""

    __tablename__ = "listing_stage_history"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    listing_id: Mapped[UUID] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    organization_id: Mapped[UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    changed_by_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    from_stage: Mapped[str | None] = mapped_column(String(100), nullable=True)
    to_stage: Mapped[str] = mapped_column(String(100), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    listing: Mapped["Listing"] = relationship("Listing", back_populates="stage_history")
    changed_by: Mapped["User | None"] = relationship("User")

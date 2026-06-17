"""Organization, membership, and settings models."""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    JSON,
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
    from app.models.media import MediaAsset
    from app.models.roles import Role
    from app.models.users import User

OrgMemberRole = Enum(
    "owner",
    "admin",
    "agent",
    "viewer",
    name="org_member_role",
)


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    logo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    website: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
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
    memberships: Mapped[list["OrgMembership"]] = relationship(
        "OrgMembership", back_populates="organization", cascade="all, delete-orphan"
    )
    settings: Mapped["OrgSettings | None"] = relationship(
        "OrgSettings", back_populates="organization", uselist=False, cascade="all, delete-orphan"
    )
    listings: Mapped[list["Listing"]] = relationship(
        "Listing", back_populates="organization"
    )
    media_assets: Mapped[list["MediaAsset"]] = relationship(
        "MediaAsset", back_populates="organization"
    )
    roles: Mapped[list["Role"]] = relationship(
        "Role", back_populates="organization", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Organization id={self.id} slug={self.slug}>"


class OrgMembership(Base):
    __tablename__ = "org_memberships"
    __table_args__ = (
        UniqueConstraint("organization_id", "user_id", name="uq_org_memberships_org_user"),
    )

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    organization_id: Mapped[UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="agent")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="memberships"
    )
    user: Mapped["User"] = relationship("User", back_populates="memberships")

    def __repr__(self) -> str:
        return f"<OrgMembership org={self.organization_id} user={self.user_id} role={self.role}>"


class OrgSettings(Base):
    __tablename__ = "org_settings"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    organization_id: Mapped[UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    # Listing pipeline stages (JSON array of stage name strings)
    listing_stages: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
        default=lambda: [
            "Lead",
            "Prospect",
            "Active Listing",
            "Under Contract",
            "Closed",
            "Archived",
        ],
    )
    # Currency / locale
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="USD")
    locale: Mapped[str] = mapped_column(String(10), nullable=False, default="en-US")
    # Arbitrary extra config
    extra: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="settings"
    )

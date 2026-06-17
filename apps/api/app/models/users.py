"""User model."""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, DateTime, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.auth import AuthSession, EmailVerification, Invitation, PasswordReset
    from app.models.organizations import OrgMembership


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    memberships: Mapped[list["OrgMembership"]] = relationship(
        "OrgMembership", back_populates="user", cascade="all, delete-orphan"
    )
    sessions: Mapped[list["AuthSession"]] = relationship(
        "AuthSession", back_populates="user", cascade="all, delete-orphan"
    )
    email_verifications: Mapped[list["EmailVerification"]] = relationship(
        "EmailVerification", back_populates="user", cascade="all, delete-orphan"
    )
    password_resets: Mapped[list["PasswordReset"]] = relationship(
        "PasswordReset", back_populates="user", cascade="all, delete-orphan"
    )
    sent_invitations: Mapped[list["Invitation"]] = relationship(
        "Invitation",
        back_populates="invited_by",
        foreign_keys="Invitation.invited_by_id",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"

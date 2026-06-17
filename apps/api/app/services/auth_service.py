"""Authentication business logic."""
from __future__ import annotations

import re
from datetime import UTC, datetime, timedelta
from uuid import UUID

import structlog
from fastapi import HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_email_verification_token,
    create_password_reset_token,
    decode_email_verification_token,
    decode_password_reset_token,
    generate_session_token,
    hash_password,
    hash_token,
    password_needs_rehash,
    verify_password,
)
from app.models.auth import AuthSession, EmailVerification, Invitation, PasswordReset
from app.models.organizations import OrgMembership, OrgSettings, Organization
from app.models.users import User

logger = structlog.get_logger(__name__)


def _make_slug(name: str, desired: str) -> str:
    """Normalize *desired* slug or derive one from *name*."""
    slug = desired.lower().strip() if desired else re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug[:100]


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── Sign-up ───────────────────────────────────────────────────────────────

    async def signup(
        self,
        email: str,
        password: str,
        full_name: str,
        org_name: str,
        org_slug: str,
        request: Request | None = None,
    ) -> tuple[User, str]:
        """Create a new user + org, return (user, raw_session_token)."""

        # Check email uniqueness
        existing = await self.db.execute(select(User).where(User.email == email.lower()))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        # Check slug uniqueness
        existing_org = await self.db.execute(
            select(Organization).where(Organization.slug == org_slug)
        )
        if existing_org.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Organization slug is already taken",
            )

        # Create user
        user = User(
            email=email.lower(),
            full_name=full_name,
            hashed_password=hash_password(password),
            is_active=True,
            is_email_verified=not settings.REQUIRE_EMAIL_VERIFICATION,
        )
        self.db.add(user)
        await self.db.flush()  # get user.id

        # Create org
        org = Organization(name=org_name, slug=org_slug, is_active=True)
        self.db.add(org)
        await self.db.flush()

        # Create default org settings
        org_settings = OrgSettings(
            organization_id=org.id,
            listing_stages=["Lead", "Prospect", "Active Listing", "Under Contract", "Closed", "Archived"],
            currency="USD",
            locale="en-US",
        )
        self.db.add(org_settings)

        # Add membership (owner)
        membership = OrgMembership(
            organization_id=org.id,
            user_id=user.id,
            role="owner",
            is_active=True,
        )
        self.db.add(membership)

        # Email verification token
        if settings.REQUIRE_EMAIL_VERIFICATION:
            ev_token_raw = create_email_verification_token(str(user.id), user.email)
            ev = EmailVerification(
                user_id=user.id,
                token_hash=hash_token(ev_token_raw),
                expires_at=datetime.now(UTC) + timedelta(hours=24),
            )
            self.db.add(ev)
            # TODO: enqueue email sending via procrastinate
            logger.info("auth.signup.verification_email", user_id=str(user.id), email=user.email)

        # Create session
        raw_token = await self._create_session(user.id, request)

        await self.db.flush()
        logger.info("auth.signup.success", user_id=str(user.id), org_id=str(org.id))
        return user, raw_token

    # ── Login ─────────────────────────────────────────────────────────────────

    async def login(
        self,
        email: str,
        password: str,
        request: Request | None = None,
    ) -> tuple[User, str]:
        result = await self.db.execute(
            select(User).where(User.email == email.lower())
        )
        user: User | None = result.scalar_one_or_none()

        # Constant-time: always run verify even if user not found
        dummy_hash = "$argon2id$v=19$m=65536,t=2,p=1$fake$fake"
        hashed = user.hashed_password if user else dummy_hash
        ok = verify_password(password, hashed)

        if not user or not ok:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )

        # Rehash on-the-fly if params changed
        if ok and password_needs_rehash(user.hashed_password):
            await self.db.execute(
                update(User)
                .where(User.id == user.id)
                .values(hashed_password=hash_password(password))
            )

        raw_token = await self._create_session(user.id, request)
        logger.info("auth.login.success", user_id=str(user.id))
        return user, raw_token

    # ── Logout ────────────────────────────────────────────────────────────────

    async def logout(self, raw_token: str) -> None:
        await self.db.execute(
            update(AuthSession)
            .where(AuthSession.token_hash == hash_token(raw_token))
            .values(is_active=False)
        )
        logger.info("auth.logout")

    # ── Email verification ────────────────────────────────────────────────────

    async def verify_email(self, token: str) -> User:
        from jose import JWTError

        try:
            data = decode_email_verification_token(token)
        except JWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            ) from exc

        user_id = UUID(data["sub"])
        token_hash = hash_token(token)

        result = await self.db.execute(
            select(EmailVerification).where(
                EmailVerification.user_id == user_id,
                EmailVerification.token_hash == token_hash,
                EmailVerification.used_at == None,  # noqa: E711
            )
        )
        ev: EmailVerification | None = result.scalar_one_or_none()
        if ev is None or ev.expires_at < datetime.now(UTC):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            )

        # Mark used
        ev.used_at = datetime.now(UTC)

        # Activate user
        result2 = await self.db.execute(select(User).where(User.id == user_id))
        user: User | None = result2.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        user.is_email_verified = True
        logger.info("auth.email_verified", user_id=str(user.id))
        return user

    # ── Password reset ────────────────────────────────────────────────────────

    async def forgot_password(self, email: str) -> None:
        """Always returns 200 to prevent user enumeration."""
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        user: User | None = result.scalar_one_or_none()
        if user is None or not user.is_active:
            return  # Silently succeed

        raw_token = create_password_reset_token(str(user.id), user.email)
        pr = PasswordReset(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=datetime.now(UTC) + timedelta(hours=1),
        )
        self.db.add(pr)
        # TODO: enqueue email via procrastinate
        logger.info("auth.forgot_password", user_id=str(user.id))

    async def reset_password(self, token: str, new_password: str) -> None:
        from jose import JWTError

        try:
            data = decode_password_reset_token(token)
        except JWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            ) from exc

        user_id = UUID(data["sub"])
        token_hash = hash_token(token)

        result = await self.db.execute(
            select(PasswordReset).where(
                PasswordReset.user_id == user_id,
                PasswordReset.token_hash == token_hash,
                PasswordReset.used_at == None,  # noqa: E711
            )
        )
        pr: PasswordReset | None = result.scalar_one_or_none()
        if pr is None or pr.expires_at < datetime.now(UTC):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            )

        pr.used_at = datetime.now(UTC)

        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(hashed_password=hash_password(new_password))
        )
        # Revoke all active sessions
        await self.db.execute(
            update(AuthSession)
            .where(AuthSession.user_id == user_id, AuthSession.is_active == True)  # noqa: E712
            .values(is_active=False)
        )
        logger.info("auth.password_reset", user_id=str(user_id))

    # ── Internal helpers ──────────────────────────────────────────────────────

    async def _create_session(self, user_id: UUID, request: Request | None) -> str:
        raw_token = generate_session_token()
        session = AuthSession(
            user_id=user_id,
            token_hash=hash_token(raw_token),
            expires_at=datetime.now(UTC) + timedelta(seconds=settings.SESSION_TTL_SECONDS),
            ip_address=request.client.host if request and request.client else None,
            user_agent=request.headers.get("user-agent") if request else None,
            is_active=True,
        )
        self.db.add(session)
        return raw_token

"""Shared FastAPI dependencies: session resolution, org context, RBAC."""
from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

import structlog
from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_token
from app.models.auth import AuthSession
from app.models.organizations import OrgMembership, Organization
from app.models.users import User

logger = structlog.get_logger(__name__)

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    request: Request,
    db: DbSession,
) -> User:
    """
    Resolve the current user from the HttpOnly session cookie.

    Raises 401 if the cookie is missing, the token is invalid, the session
    is expired, or the user is inactive.
    """
    token: str | None = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token_hash = hash_token(token)
    now = datetime.now(UTC)

    result = await db.execute(
        select(AuthSession)
        .where(
            AuthSession.token_hash == token_hash,
            AuthSession.is_active == True,  # noqa: E712
            AuthSession.expires_at > now,
        )
        .options(selectinload(AuthSession.user))
    )
    session: AuthSession | None = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalid or expired",
        )

    # Bump last_seen_at (fire-and-forget style; don't block the response)
    await db.execute(
        update(AuthSession)
        .where(AuthSession.id == session.id)
        .values(last_seen_at=now)
    )

    user: User = session.user
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_current_org(
    current_user: CurrentUser,
    db: DbSession,
) -> Organization:
    """
    Resolve the organization context for the current user.

    A user may eventually belong to multiple orgs; for now we pick the
    first active membership ordered by join date (single-tenant flow).
    Future: accept an X-Org-ID header or org_slug path param.
    """
    result = await db.execute(
        select(OrgMembership)
        .where(
            OrgMembership.user_id == current_user.id,
            OrgMembership.is_active == True,  # noqa: E712
        )
        .options(selectinload(OrgMembership.organization))
        .order_by(OrgMembership.joined_at.asc())
        .limit(1)
    )
    membership: OrgMembership | None = result.scalar_one_or_none()

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to any organization",
        )

    org: Organization = membership.organization
    if not org.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organization is inactive",
        )

    return org


CurrentOrg = Annotated[Organization, Depends(get_current_org)]


async def get_current_membership(
    current_user: CurrentUser,
    current_org: CurrentOrg,
    db: DbSession,
) -> OrgMembership:
    result = await db.execute(
        select(OrgMembership).where(
            OrgMembership.user_id == current_user.id,
            OrgMembership.organization_id == current_org.id,
            OrgMembership.is_active == True,  # noqa: E712
        )
    )
    membership: OrgMembership | None = result.scalar_one_or_none()
    if membership is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member")
    return membership


CurrentMembership = Annotated[OrgMembership, Depends(get_current_membership)]


def require_role(*allowed_roles: str):
    """
    Dependency factory: raises 403 if the user's role isn't in *allowed_roles*.

    Usage::

        @router.delete("/{id}", dependencies=[Depends(require_role("owner", "admin"))])
    """

    async def _check(membership: CurrentMembership) -> None:
        if membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of: {', '.join(allowed_roles)}",
            )

    return Depends(_check)

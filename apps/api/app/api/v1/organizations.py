"""Organization management routes."""
from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import (
    CurrentMembership,
    CurrentOrg,
    CurrentUser,
    DbSession,
    require_role,
)
from app.core.config import settings
from app.core.security import create_invitation_token, hash_token
from app.models.auth import Invitation
from app.models.organizations import OrgMembership, OrgSettings
from app.models.users import User
from app.schemas.auth import MessageResponse
from app.schemas.organizations import (
    InvitationCreate,
    InvitationResponse,
    MemberResponse,
    OrgResponse,
    OrgSettingsResponse,
    OrgSettingsUpdate,
    OrgUpdate,
)

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/current", response_model=OrgResponse)
async def get_current_org(current_org: CurrentOrg) -> OrgResponse:
    return OrgResponse.model_validate(current_org)


@router.patch("/current", response_model=OrgResponse)
async def update_current_org(
    body: OrgUpdate,
    current_org: CurrentOrg,
    db: DbSession,
    _: None = require_role("owner", "admin"),
) -> OrgResponse:
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(current_org, field, value)
    await db.flush()
    return OrgResponse.model_validate(current_org)


@router.get("/current/settings", response_model=OrgSettingsResponse)
async def get_org_settings(current_org: CurrentOrg, db: DbSession) -> OrgSettingsResponse:
    result = await db.execute(
        select(OrgSettings).where(OrgSettings.organization_id == current_org.id)
    )
    s = result.scalar_one_or_none()
    if s is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings not found")
    return OrgSettingsResponse.model_validate(s)


@router.patch("/current/settings", response_model=OrgSettingsResponse)
async def update_org_settings(
    body: OrgSettingsUpdate,
    current_org: CurrentOrg,
    db: DbSession,
    _: None = require_role("owner", "admin"),
) -> OrgSettingsResponse:
    result = await db.execute(
        select(OrgSettings).where(OrgSettings.organization_id == current_org.id)
    )
    s = result.scalar_one_or_none()
    if s is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    await db.flush()
    return OrgSettingsResponse.model_validate(s)


@router.get("/current/members", response_model=list[MemberResponse])
async def list_members(current_org: CurrentOrg, db: DbSession) -> list[MemberResponse]:
    result = await db.execute(
        select(OrgMembership)
        .where(OrgMembership.organization_id == current_org.id)
        .options(selectinload(OrgMembership.user))
    )
    memberships = result.scalars().all()
    return [
        MemberResponse(
            user_id=m.user_id,
            email=m.user.email,
            full_name=m.user.full_name,
            role=m.role,
            is_active=m.is_active,
            joined_at=m.joined_at,
        )
        for m in memberships
    ]


@router.post(
    "/current/invitations",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_invitation(
    body: InvitationCreate,
    current_org: CurrentOrg,
    current_user: CurrentUser,
    db: DbSession,
    _: None = require_role("owner", "admin"),
) -> InvitationResponse:
    # Check if already a member
    result = await db.execute(
        select(OrgMembership)
        .join(User, OrgMembership.user_id == User.id)
        .where(
            OrgMembership.organization_id == current_org.id,
            User.email == body.email.lower(),
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a member",
        )

    expires_at = datetime.now(UTC) + timedelta(hours=settings.INVITATION_TTL_HOURS)
    raw_token = create_invitation_token(
        {
            "org_id": str(current_org.id),
            "email": body.email.lower(),
            "role": body.role,
            "type": "invitation",
        }
    )
    invitation = Invitation(
        organization_id=current_org.id,
        email=body.email.lower(),
        role=body.role,
        invited_by_id=current_user.id,
        token_hash=hash_token(raw_token),
        expires_at=expires_at,
    )
    db.add(invitation)
    await db.flush()
    # TODO: enqueue email via procrastinate
    logger.info(
        "invitation.created",
        org_id=str(current_org.id),
        email=body.email,
        role=body.role,
    )
    return InvitationResponse.model_validate(invitation)


@router.delete(
    "/current/members/{user_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
)
async def remove_member(
    user_id: UUID,
    current_org: CurrentOrg,
    current_user: CurrentUser,
    db: DbSession,
    _: None = require_role("owner", "admin"),
) -> MessageResponse:
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove yourself from the organization",
        )

    result = await db.execute(
        select(OrgMembership)
        .where(
            OrgMembership.organization_id == current_org.id,
            OrgMembership.user_id == user_id,
        )
    )
    membership: OrgMembership | None = result.scalar_one_or_none()
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    if membership.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the organization owner",
        )

    await db.delete(membership)
    logger.info("member.removed", org_id=str(current_org.id), user_id=str(user_id))
    return MessageResponse(message="Member removed")

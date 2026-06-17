"""RBAC management routes."""
from __future__ import annotations

from uuid import UUID

import structlog
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select

from app.api.deps import CurrentOrg, CurrentUser, DbSession, require_role
from app.models.roles import Permission, Role, RolePermission

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/roles", tags=["roles"])


# ── Schemas (small, kept here for locality) ───────────────────────────────────


class RoleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    is_system: bool
    permissions: list[str] = []


class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    codename: str
    description: str | None


# ── Routes ────────────────────────────────────────────────────────────────────


@router.get("/permissions", response_model=list[PermissionResponse])
async def list_permissions(db: DbSession) -> list[PermissionResponse]:
    result = await db.execute(select(Permission).order_by(Permission.codename))
    return [PermissionResponse.model_validate(p) for p in result.scalars().all()]


@router.get("", response_model=list[RoleResponse])
async def list_roles(current_org: CurrentOrg, db: DbSession) -> list[RoleResponse]:
    result = await db.execute(
        select(Role)
        .where(
            (Role.organization_id == current_org.id) | (Role.organization_id == None)  # noqa: E711
        )
        .order_by(Role.is_system.desc(), Role.name)
    )
    roles = result.scalars().all()

    # Fetch permissions per role
    out = []
    for role in roles:
        perm_result = await db.execute(
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role_id == role.id)
        )
        perms = [p.codename for p in perm_result.scalars().all()]
        r = RoleResponse(
            id=role.id,
            name=role.name,
            description=role.description,
            is_system=role.is_system,
            permissions=perms,
        )
        out.append(r)
    return out


@router.post(
    "",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[require_role("owner", "admin")],
)
async def create_role(
    body: RoleCreate,
    current_org: CurrentOrg,
    db: DbSession,
) -> RoleResponse:
    role = Role(
        organization_id=current_org.id,
        name=body.name,
        description=body.description,
        is_system=False,
    )
    db.add(role)
    await db.flush()
    logger.info("role.created", role_id=str(role.id), org_id=str(current_org.id))
    return RoleResponse(id=role.id, name=role.name, description=role.description, is_system=False)


@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[require_role("owner")],
)
async def delete_role(
    role_id: UUID,
    current_org: CurrentOrg,
    db: DbSession,
) -> None:
    result = await db.execute(
        select(Role).where(
            Role.id == role_id,
            Role.organization_id == current_org.id,
            Role.is_system == False,  # noqa: E712
        )
    )
    role: Role | None = result.scalar_one_or_none()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found or cannot delete a system role",
        )
    await db.delete(role)


@router.post("/{role_id}/permissions/{permission_codename}", status_code=status.HTTP_204_NO_CONTENT)
async def grant_permission(
    role_id: UUID,
    permission_codename: str,
    current_org: CurrentOrg,
    db: DbSession,
    _: None = require_role("owner", "admin"),
) -> None:
    role_result = await db.execute(
        select(Role).where(Role.id == role_id, Role.organization_id == current_org.id)
    )
    role: Role | None = role_result.scalar_one_or_none()
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    perm_result = await db.execute(
        select(Permission).where(Permission.codename == permission_codename)
    )
    perm: Permission | None = perm_result.scalar_one_or_none()
    if perm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")

    existing = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == perm.id,
        )
    )
    if existing.scalar_one_or_none() is None:
        db.add(RolePermission(role_id=role_id, permission_id=perm.id))
        await db.flush()


@router.delete(
    "/{role_id}/permissions/{permission_codename}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def revoke_permission(
    role_id: UUID,
    permission_codename: str,
    current_org: CurrentOrg,
    db: DbSession,
    _: None = require_role("owner", "admin"),
) -> None:
    perm_result = await db.execute(
        select(Permission).where(Permission.codename == permission_codename)
    )
    perm: Permission | None = perm_result.scalar_one_or_none()
    if perm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")

    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == perm.id,
        )
    )
    rp: RolePermission | None = result.scalar_one_or_none()
    if rp:
        await db.delete(rp)
        await db.flush()

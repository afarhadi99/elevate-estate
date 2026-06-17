"""Listing CRUD routes."""
from __future__ import annotations

from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentOrg, CurrentUser, DbSession, require_role
from app.schemas.listings import (
    ListingCreate,
    ListingDetailResponse,
    ListingFilter,
    ListingNoteCreate,
    ListingNoteResponse,
    ListingResponse,
    ListingStageHistoryResponse,
    ListingStageUpdate,
    ListingUpdate,
    PaginatedListings,
)
from app.services.listing_service import ListingService

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=PaginatedListings)
async def list_listings(
    current_org: CurrentOrg,
    db: DbSession,
    stage: str | None = Query(None),
    property_type: str | None = Query(None),
    listing_type: str | None = Query(None),
    agent_id: UUID | None = Query(None),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
) -> PaginatedListings:
    filters = ListingFilter(
        stage=stage,
        property_type=property_type,
        listing_type=listing_type,
        agent_id=agent_id,
        min_price=min_price,
        max_price=max_price,
        search=search,
        page=page,
        page_size=page_size,
    )
    svc = ListingService(db)
    return await svc.list_listings(current_org.id, filters)


@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    body: ListingCreate,
    current_user: CurrentUser,
    current_org: CurrentOrg,
    db: DbSession,
) -> ListingResponse:
    svc = ListingService(db)
    listing = await svc.create_listing(current_org.id, current_user, body)
    return ListingResponse.model_validate(listing)


@router.get("/{listing_id}", response_model=ListingDetailResponse)
async def get_listing(
    listing_id: UUID,
    current_org: CurrentOrg,
    db: DbSession,
) -> ListingDetailResponse:
    svc = ListingService(db)
    listing = await svc.get_listing_or_404(listing_id, current_org.id)
    return ListingDetailResponse.model_validate(listing)


@router.patch("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: UUID,
    body: ListingUpdate,
    current_org: CurrentOrg,
    db: DbSession,
) -> ListingResponse:
    svc = ListingService(db)
    listing = await svc.update_listing(listing_id, current_org.id, body)
    return ListingResponse.model_validate(listing)


@router.delete(
    "/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[require_role("owner", "admin", "agent")],
)
async def delete_listing(
    listing_id: UUID,
    current_org: CurrentOrg,
    db: DbSession,
) -> None:
    svc = ListingService(db)
    await svc.delete_listing(listing_id, current_org.id)


@router.post(
    "/{listing_id}/notes",
    response_model=ListingNoteResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_note(
    listing_id: UUID,
    body: ListingNoteCreate,
    current_user: CurrentUser,
    current_org: CurrentOrg,
    db: DbSession,
) -> ListingNoteResponse:
    svc = ListingService(db)
    note = await svc.add_note(listing_id, current_org.id, current_user, body)
    return ListingNoteResponse.model_validate(note)


@router.patch("/{listing_id}/stage", response_model=ListingResponse)
async def update_stage(
    listing_id: UUID,
    body: ListingStageUpdate,
    current_user: CurrentUser,
    current_org: CurrentOrg,
    db: DbSession,
) -> ListingResponse:
    svc = ListingService(db)
    listing = await svc.update_stage(listing_id, current_org.id, current_user, body)
    return ListingResponse.model_validate(listing)


@router.get("/{listing_id}/activity", response_model=list[ListingStageHistoryResponse])
async def get_activity(
    listing_id: UUID,
    current_org: CurrentOrg,
    db: DbSession,
) -> list[ListingStageHistoryResponse]:
    svc = ListingService(db)
    history = await svc.get_activity(listing_id, current_org.id)
    return [ListingStageHistoryResponse.model_validate(h) for h in history]

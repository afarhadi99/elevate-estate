"""Listing business logic."""
from __future__ import annotations

import math
from uuid import UUID

import structlog
from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.listings import Listing, ListingAddress, ListingNote, ListingStageHistory
from app.models.users import User
from app.schemas.listings import (
    ListingCreate,
    ListingDetailResponse,
    ListingFilter,
    ListingNoteCreate,
    ListingResponse,
    ListingStageUpdate,
    ListingUpdate,
    PaginatedListings,
)

logger = structlog.get_logger(__name__)


class ListingService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_listing_or_404(self, listing_id: UUID, org_id: UUID) -> Listing:
        result = await self.db.execute(
            select(Listing)
            .where(Listing.id == listing_id, Listing.organization_id == org_id)
            .options(
                selectinload(Listing.address),
                selectinload(Listing.notes),
                selectinload(Listing.stage_history),
            )
        )
        listing: Listing | None = result.scalar_one_or_none()
        if listing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found",
            )
        return listing

    async def list_listings(
        self, org_id: UUID, filters: ListingFilter
    ) -> PaginatedListings:
        q = select(Listing).where(Listing.organization_id == org_id)

        if filters.stage:
            q = q.where(Listing.stage == filters.stage)
        if filters.property_type:
            q = q.where(Listing.property_type == filters.property_type)
        if filters.listing_type:
            q = q.where(Listing.listing_type == filters.listing_type)
        if filters.agent_id:
            q = q.where(Listing.agent_id == filters.agent_id)
        if filters.min_price is not None:
            q = q.where(Listing.asking_price >= filters.min_price)
        if filters.max_price is not None:
            q = q.where(Listing.asking_price <= filters.max_price)
        if filters.search:
            term = f"%{filters.search}%"
            q = q.where(
                or_(
                    Listing.title.ilike(term),
                    Listing.mls_number.ilike(term),
                )
            )

        # Count
        count_q = select(func.count()).select_from(q.subquery())
        total: int = (await self.db.execute(count_q)).scalar_one()

        # Paginate
        offset = (filters.page - 1) * filters.page_size
        q = (
            q.options(selectinload(Listing.address))
            .order_by(Listing.created_at.desc())
            .offset(offset)
            .limit(filters.page_size)
        )
        rows = (await self.db.execute(q)).scalars().all()

        return PaginatedListings(
            items=[ListingResponse.model_validate(r) for r in rows],
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            pages=max(1, math.ceil(total / filters.page_size)),
        )

    async def create_listing(
        self, org_id: UUID, current_user: User, data: ListingCreate
    ) -> Listing:
        listing = Listing(
            organization_id=org_id,
            agent_id=data.agent_id or current_user.id,
            title=data.title,
            description=data.description,
            property_type=data.property_type,
            listing_type=data.listing_type,
            stage=data.stage,
            asking_price=data.asking_price,
            sale_price=data.sale_price,
            bedrooms=data.bedrooms,
            bathrooms=data.bathrooms,
            square_feet=data.square_feet,
            lot_size_sqft=data.lot_size_sqft,
            year_built=data.year_built,
            mls_number=data.mls_number,
            listed_at=data.listed_at,
        )
        self.db.add(listing)
        await self.db.flush()

        if data.address:
            address = ListingAddress(
                listing_id=listing.id,
                **data.address.model_dump(),
            )
            self.db.add(address)

        # Initial stage history entry
        hist = ListingStageHistory(
            listing_id=listing.id,
            organization_id=org_id,
            changed_by_id=current_user.id,
            from_stage=None,
            to_stage=data.stage,
        )
        self.db.add(hist)
        await self.db.flush()

        logger.info("listing.created", listing_id=str(listing.id), org_id=str(org_id))
        return listing

    async def update_listing(
        self, listing_id: UUID, org_id: UUID, data: ListingUpdate
    ) -> Listing:
        listing = await self.get_listing_or_404(listing_id, org_id)

        for field, value in data.model_dump(exclude_unset=True, exclude={"address"}).items():
            setattr(listing, field, value)

        if data.address is not None:
            if listing.address:
                for field, value in data.address.model_dump().items():
                    setattr(listing.address, field, value)
            else:
                addr = ListingAddress(listing_id=listing.id, **data.address.model_dump())
                self.db.add(addr)

        await self.db.flush()
        logger.info("listing.updated", listing_id=str(listing_id))
        return listing

    async def delete_listing(self, listing_id: UUID, org_id: UUID) -> None:
        listing = await self.get_listing_or_404(listing_id, org_id)
        await self.db.delete(listing)
        logger.info("listing.deleted", listing_id=str(listing_id))

    async def update_stage(
        self,
        listing_id: UUID,
        org_id: UUID,
        current_user: User,
        data: ListingStageUpdate,
    ) -> Listing:
        listing = await self.get_listing_or_404(listing_id, org_id)
        old_stage = listing.stage
        listing.stage = data.stage

        hist = ListingStageHistory(
            listing_id=listing.id,
            organization_id=org_id,
            changed_by_id=current_user.id,
            from_stage=old_stage,
            to_stage=data.stage,
        )
        self.db.add(hist)
        await self.db.flush()
        logger.info(
            "listing.stage_changed",
            listing_id=str(listing_id),
            from_stage=old_stage,
            to_stage=data.stage,
        )
        return listing

    async def add_note(
        self,
        listing_id: UUID,
        org_id: UUID,
        current_user: User,
        data: ListingNoteCreate,
    ) -> ListingNote:
        # Verify listing exists and belongs to org
        await self.get_listing_or_404(listing_id, org_id)

        note = ListingNote(
            listing_id=listing_id,
            organization_id=org_id,
            author_id=current_user.id,
            body=data.body,
        )
        self.db.add(note)
        await self.db.flush()
        return note

    async def get_activity(
        self, listing_id: UUID, org_id: UUID
    ) -> list[ListingStageHistory]:
        result = await self.db.execute(
            select(ListingStageHistory)
            .where(
                ListingStageHistory.listing_id == listing_id,
                ListingStageHistory.organization_id == org_id,
            )
            .order_by(ListingStageHistory.changed_at.desc())
        )
        return list(result.scalars().all())

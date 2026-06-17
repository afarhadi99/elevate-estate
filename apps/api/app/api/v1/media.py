"""Media upload and management routes."""
from __future__ import annotations

from uuid import UUID

import boto3
import structlog
from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update

from app.api.deps import CurrentOrg, CurrentUser, DbSession
from app.core.config import settings
from app.models.media import ListingMedia, MediaAsset
from app.schemas.auth import MessageResponse
from app.schemas.media import (
    AttachToListingRequest,
    ListingMediaResponse,
    MediaAssetResponse,
    MediaReorderRequest,
    PresignedUploadRequest,
    PresignedUploadResponse,
)

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "application/pdf",
}


def _s3_client():
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


@router.post(
    "/presigned-upload",
    response_model=PresignedUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def presigned_upload(
    body: PresignedUploadRequest,
    current_user: CurrentUser,
    current_org: CurrentOrg,
    db: DbSession,
) -> PresignedUploadResponse:
    if body.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Content type {body.content_type!r} is not allowed",
        )

    # Create the MediaAsset record first (so we have the ID for the S3 key)
    asset = MediaAsset(
        organization_id=current_org.id,
        uploaded_by_id=current_user.id,
        s3_key="",  # filled after flush
        s3_bucket=settings.S3_BUCKET_NAME,
        original_filename=body.filename,
        content_type=body.content_type,
        file_size_bytes=body.file_size_bytes,
    )
    db.add(asset)
    await db.flush()

    s3_key = f"orgs/{current_org.id}/media/{asset.id}/{body.filename}"
    asset.s3_key = s3_key
    await db.flush()

    # Generate S3 presigned POST
    try:
        s3 = _s3_client()
        presigned = s3.generate_presigned_post(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key,
            Fields={
                "Content-Type": body.content_type,
                "x-amz-meta-organization-id": str(current_org.id),
            },
            Conditions=[
                {"Content-Type": body.content_type},
                ["content-length-range", 1, body.file_size_bytes],
            ],
            ExpiresIn=settings.S3_PRESIGNED_URL_EXPIRY,
        )
    except ClientError as exc:
        logger.error("s3.presigned_post.failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not generate upload URL",
        ) from exc

    logger.info("media.presigned_upload.created", asset_id=str(asset.id))
    return PresignedUploadResponse(
        asset_id=asset.id,
        upload_url=presigned["url"],
        fields=presigned["fields"],
        expires_in=settings.S3_PRESIGNED_URL_EXPIRY,
    )


@router.post("/{asset_id}/confirm", response_model=MediaAssetResponse)
async def confirm_upload(
    asset_id: UUID,
    current_org: CurrentOrg,
    db: DbSession,
) -> MediaAssetResponse:
    """Client calls this after the S3 PUT/POST completes to confirm the upload."""
    from datetime import UTC, datetime

    result = await db.execute(
        select(MediaAsset).where(
            MediaAsset.id == asset_id,
            MediaAsset.organization_id == current_org.id,
        )
    )
    asset: MediaAsset | None = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    asset.upload_confirmed_at = datetime.now(UTC)
    await db.flush()
    return MediaAssetResponse.model_validate(asset)


@router.post("/{asset_id}/attach-to-listing", response_model=ListingMediaResponse)
async def attach_to_listing(
    asset_id: UUID,
    body: AttachToListingRequest,
    current_org: CurrentOrg,
    db: DbSession,
) -> ListingMediaResponse:
    # Verify asset ownership
    result = await db.execute(
        select(MediaAsset).where(
            MediaAsset.id == asset_id,
            MediaAsset.organization_id == current_org.id,
        )
    )
    asset: MediaAsset | None = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    if asset.upload_confirmed_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload has not been confirmed yet",
        )

    # Determine next sort_order
    from sqlalchemy import func

    max_order_result = await db.execute(
        select(func.coalesce(func.max(ListingMedia.sort_order), -1)).where(
            ListingMedia.listing_id == body.listing_id
        )
    )
    next_order: int = max_order_result.scalar_one() + 1

    lm = ListingMedia(
        listing_id=body.listing_id,
        asset_id=asset.id,
        organization_id=current_org.id,
        sort_order=next_order,
        caption=body.caption,
        is_cover=body.is_cover,
    )
    db.add(lm)
    await db.flush()
    return ListingMediaResponse.model_validate(lm)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: UUID,
    current_org: CurrentOrg,
    db: DbSession,
) -> None:
    result = await db.execute(
        select(MediaAsset).where(
            MediaAsset.id == asset_id,
            MediaAsset.organization_id == current_org.id,
        )
    )
    asset: MediaAsset | None = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    # Attempt S3 deletion (best-effort)
    try:
        s3 = _s3_client()
        s3.delete_object(Bucket=asset.s3_bucket, Key=asset.s3_key)
    except ClientError as exc:
        logger.warning("s3.delete.failed", asset_id=str(asset_id), error=str(exc))

    await db.delete(asset)


@router.patch("/listings/{listing_id}/media/reorder", response_model=list[ListingMediaResponse])
async def reorder_listing_media(
    listing_id: UUID,
    body: MediaReorderRequest,
    current_org: CurrentOrg,
    db: DbSession,
) -> list[ListingMediaResponse]:
    # Verify all IDs belong to this listing & org
    result = await db.execute(
        select(ListingMedia).where(
            ListingMedia.listing_id == listing_id,
            ListingMedia.organization_id == current_org.id,
        )
    )
    existing = {lm.id: lm for lm in result.scalars().all()}

    for idx, media_id in enumerate(body.ordered_ids):
        if media_id not in existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ListingMedia {media_id} not found",
            )
        existing[media_id].sort_order = idx

    await db.flush()
    return [ListingMediaResponse.model_validate(existing[mid]) for mid in body.ordered_ids]

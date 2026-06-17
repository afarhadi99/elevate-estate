"""v1 API router – mounts all sub-routers."""
from fastapi import APIRouter

from app.api.v1 import auth, listings, media, organizations, roles

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(organizations.router)
api_router.include_router(listings.router)
api_router.include_router(media.router)
api_router.include_router(roles.router)

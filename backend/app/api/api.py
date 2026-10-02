"""PyQuest API Router Aggregator."""
from fastapi import APIRouter
from app.api.routes import health, worlds, progress, profile

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(worlds.router)
api_router.include_router(progress.router)
api_router.include_router(profile.router)

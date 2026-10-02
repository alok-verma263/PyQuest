"""Health check API route."""
from fastapi import APIRouter
from app.schemas.health import HealthResponse
from app.core.config import settings

router = APIRouter(tags=["health"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    """Returns the operational status of the PyQuest API."""
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        message="PyQuest Backend API is operational and ready for quests."
    )

"""World and level catalog API routes."""
from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.world import WorldSchema, LevelSchema
from app.services.content_service import content_service

router = APIRouter(prefix="/worlds", tags=["worlds"])

@router.get("", response_model=List[WorldSchema])
def get_all_worlds():
    """Retrieve all available Python adventure worlds."""
    return content_service.list_worlds()

@router.get("/{world_id}", response_model=WorldSchema)
def get_world_by_id(world_id: str):
    """Retrieve details and levels for a specific world."""
    world = content_service.get_world(world_id)
    if not world:
        raise HTTPException(status_code=404, detail=f"World '{world_id}' not found.")
    return world

@router.get("/{world_id}/levels/{level_id}", response_model=LevelSchema)
def get_level_by_id(world_id: str, level_id: str):
    """Retrieve lesson and challenge details for a specific level."""
    level = content_service.get_level(world_id, level_id)
    if not level:
        raise HTTPException(status_code=404, detail=f"Level '{level_id}' in world '{world_id}' not found.")
    return level

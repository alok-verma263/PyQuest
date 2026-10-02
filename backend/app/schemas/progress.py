"""Progress tracking schemas."""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class LevelProgressSchema(BaseModel):
    level_id: str = Field(..., alias="levelId")
    status: str = "LOCKED"  # LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED, MASTERED
    score: int = 0
    stars: int = 0
    completed_at: Optional[str] = Field(None, alias="completedAt")

    class Config:
        populate_by_name = True

class ProgressStateSchema(BaseModel):
    user_id: str = Field("player-1", alias="userId")
    active_world_id: str = Field("python-basics", alias="activeWorldId")
    current_level_id: str = Field("level-1-print", alias="currentLevelId")
    completed_levels: List[str] = Field(default_factory=list, alias="completedLevels")
    level_states: Dict[str, LevelProgressSchema] = Field(default_factory=dict, alias="levelStates")

    class Config:
        populate_by_name = True

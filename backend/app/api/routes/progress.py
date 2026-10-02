"""Player quest progress API routes."""
from fastapi import APIRouter
from app.schemas.progress import ProgressStateSchema, LevelProgressSchema

router = APIRouter(prefix="/progress", tags=["progress"])

# In-memory store for dev demo, with default unlocked level 1
_progress_store: dict[str, ProgressStateSchema] = {
    "player-1": ProgressStateSchema(
        userId="player-1",
        activeWorldId="python-basics",
        currentLevelId="level-1-first-program",
        completedLevels=[],
        levelStates={
            "level-1-first-program": LevelProgressSchema(
                levelId="level-1-first-program",
                status="AVAILABLE",
                score=0,
                stars=0
            ),
            "level-2-variables-data": LevelProgressSchema(
                levelId="level-2-variables-data",
                status="LOCKED",
                score=0,
                stars=0
            ),
            "level-3-user-input": LevelProgressSchema(
                levelId="level-3-user-input",
                status="LOCKED",
                score=0,
                stars=0
            )
        }
    )
}

@router.get("/{user_id}", response_model=ProgressStateSchema)
def get_user_progress(user_id: str):
    """Retrieve current level progress for a player."""
    if user_id not in _progress_store:
        _progress_store[user_id] = ProgressStateSchema(
            userId=user_id,
            activeWorldId="python-basics",
            currentLevelId="level-1-first-program",
            completedLevels=[],
            levelStates={
                "level-1-first-program": LevelProgressSchema(
                    levelId="level-1-first-program",
                    status="AVAILABLE",
                    score=0,
                    stars=0
                )
            }
        )

    return _progress_store[user_id]

@router.post("", response_model=ProgressStateSchema)
def save_user_progress(progress: ProgressStateSchema):
    """Save or update player progression."""
    _progress_store[progress.user_id] = progress
    return progress

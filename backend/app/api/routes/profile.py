"""Player profile API routes."""
from fastapi import APIRouter
from app.schemas.profile import PlayerProfileSchema, BadgeSchema

router = APIRouter(prefix="/profile", tags=["profile"])

_profile_store: dict[str, PlayerProfileSchema] = {
    "player-1": PlayerProfileSchema(
        id="player-1",
        username="PyQuest Apprentice",
        title="Code Wanderer",
        level=1,
        xp=0,
        xpToNextLevel=100,
        coins=25,
        energy=100,
        badges=[
            BadgeSchema(
                id="first-step",
                name="Novice Conjurer",
                description="Began the PyQuest adventure",
                icon="Sparkles",
                unlockedAt="2026-10-03T00:00:00Z"
            )
        ]
    )
}

@router.get("/{user_id}", response_model=PlayerProfileSchema)
def get_user_profile(user_id: str):
    """Retrieve player stats, level, XP, coins, and badges."""
    if user_id not in _profile_store:
        _profile_store[user_id] = PlayerProfileSchema(id=user_id)
    return _profile_store[user_id]

@router.post("", response_model=PlayerProfileSchema)
def update_user_profile(profile: PlayerProfileSchema):
    """Update player stats, XP, and rewards."""
    _profile_store[profile.id] = profile
    return profile

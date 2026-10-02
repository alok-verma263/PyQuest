"""Player profile schemas."""
from typing import List, Optional
from pydantic import BaseModel, Field

class BadgeSchema(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    unlocked_at: Optional[str] = Field(None, alias="unlockedAt")

    class Config:
        populate_by_name = True

class PlayerProfileSchema(BaseModel):
    id: str = "player-1"
    username: str = "PyQuest Apprentice"
    avatar_id: Optional[str] = Field("char-a", alias="avatarId")
    title: str = "Code Wanderer"
    level: int = 1
    xp: int = 0
    xp_to_next_level: int = Field(100, alias="xpToNextLevel")
    coins: int = 25
    energy: int = 100
    badges: List[BadgeSchema] = Field(default_factory=list)


    class Config:
        populate_by_name = True

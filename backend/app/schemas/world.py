"""World and level content schemas."""
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class TestCaseSchema(BaseModel):
    input: str = ""
    expected_output: str = Field(..., alias="expectedOutput")
    hidden: bool = False

    class Config:
        populate_by_name = True

class ChallengeSchema(BaseModel):
    id: str
    title: str
    type: str  # multiple-choice, predict-output, fix-bug, write-code, fill-blank
    instructions: str
    question: Optional[str] = None
    options: Optional[List[str]] = None
    answer: Optional[Any] = None
    starter_code: Optional[str] = Field(None, alias="starterCode")
    solution: Optional[str] = None
    test_cases: Optional[List[TestCaseSchema]] = Field(default_factory=list, alias="testCases")
    hints: List[str] = Field(default_factory=list)
    explanation: Optional[str] = None
    xp_reward: int = Field(20, alias="xpReward")
    coin_reward: int = Field(5, alias="coinReward")

    class Config:
        populate_by_name = True

class LessonSlideSchema(BaseModel):
    title: str
    content: str
    code_example: Optional[str] = Field(None, alias="codeExample")
    tip: Optional[str] = None

    class Config:
        populate_by_name = True

class LevelSchema(BaseModel):
    id: str
    world_id: str = Field(..., alias="worldId")
    order: int
    title: str
    description: str
    map_x: int = Field(..., alias="mapX")
    map_y: int = Field(..., alias="mapY")
    xp_reward: int = Field(50, alias="xpReward")
    coin_reward: int = Field(15, alias="coinReward")
    topics: List[str] = Field(default_factory=list)
    lessons: List[LessonSlideSchema] = Field(default_factory=list)
    challenges: List[ChallengeSchema] = Field(default_factory=list)

    class Config:
        populate_by_name = True

class WorldSchema(BaseModel):
    id: str
    title: str
    tagline: str
    description: str
    order: int
    theme_color: str = Field("#3b82f6", alias="themeColor")
    levels: List[LevelSchema] = Field(default_factory=list)

    class Config:
        populate_by_name = True

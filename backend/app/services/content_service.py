"""Service for loading and managing curriculum content."""
import json
from pathlib import Path
from typing import List, Optional, Dict
from app.schemas.world import WorldSchema, LevelSchema, ChallengeSchema

# Base path for content definitions
CONTENT_DIR = Path(__file__).resolve().parent.parent.parent.parent / "content" / "worlds"

class ContentService:
    def __init__(self, content_dir: Path = CONTENT_DIR):
        self.content_dir = content_dir
        self._worlds_cache: Dict[str, WorldSchema] = {}
        self.reload_content()

    def reload_content(self) -> None:
        """Reads all JSON files in the content/worlds directory."""
        self._worlds_cache.clear()
        if not self.content_dir.exists():
            return

        for filepath in self.content_dir.glob("*.json"):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    world = WorldSchema.model_validate(data)
                    self._worlds_cache[world.id] = world
            except Exception as e:
                print(f"[ContentService] Warning: Failed to load {filepath.name}: {e}")

    def list_worlds(self) -> List[WorldSchema]:
        """Returns all loaded worlds sorted by order."""
        return sorted(list(self._worlds_cache.values()), key=lambda w: w.order)

    def get_world(self, world_id: str) -> Optional[WorldSchema]:
        """Retrieves a single world by ID."""
        return self._worlds_cache.get(world_id)

    def get_level(self, world_id: str, level_id: str) -> Optional[LevelSchema]:
        """Retrieves a specific level within a world."""
        world = self.get_world(world_id)
        if not world:
            return None
        for lvl in world.levels:
            if lvl.id == level_id:
                return lvl
        return None

content_service = ContentService()

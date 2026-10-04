/**
 * PyQuest World Map Layout & Landmark Coordinates
 * Defines the tilemap layout (42 cols x 80 rows = 1344 x 2560 px),
 * collision boundaries, and interactive quest trigger locations.
 */

export const MAP_COLS = 42;
export const MAP_ROWS = 80;
export const TILE_SIZE = 32;

export interface LandmarkZone {
  order: number;
  questId: string;
  name: string;
  buildingType: string;
  // Tile coordinates
  tileX: number;
  tileY: number;
  // Trigger area in front of the door
  triggerX: number;
  triggerY: number;
  triggerW: number;
  triggerH: number;
}

export const QUEST_LANDMARKS_MAP: LandmarkZone[] = [
  {
    order: 1,
    questId: 'quest-1-meet-the-data',
    name: 'Meet the Data',
    buildingType: 'building_data_village',
    tileX: 19,
    tileY: 6,
    triggerX: 19 * TILE_SIZE,
    triggerY: 9 * TILE_SIZE,
    triggerW: 96,
    triggerH: 48,
  },
  {
    order: 2,
    questId: 'quest-2-import-forge',
    name: 'Data Import Forge',
    buildingType: 'building_import_forge',
    tileX: 19,
    tileY: 20,
    triggerX: 19 * TILE_SIZE,
    triggerY: 23 * TILE_SIZE,
    triggerW: 96,
    triggerH: 48,
  },
  {
    order: 3,
    questId: 'quest-3-export-workshop',
    name: 'Data Export Workshop',
    buildingType: 'building_export_workshop',
    tileX: 19,
    tileY: 30,
    triggerX: 19 * TILE_SIZE,
    triggerY: 33 * TILE_SIZE,
    triggerW: 96,
    triggerH: 48,
  },
  {
    order: 4,
    questId: 'quest-4-missing-value-dungeon',
    name: 'Missing Value Dungeon',
    buildingType: 'building_missing_cave',
    tileX: 19,
    tileY: 40,
    triggerX: 19 * TILE_SIZE,
    triggerY: 43 * TILE_SIZE,
    triggerW: 96,
    triggerH: 48,
  },
  {
    order: 5,
    questId: 'quest-5-category-forge',
    name: 'Category Forge',
    buildingType: 'building_category_forge',
    tileX: 19,
    tileY: 50,
    triggerX: 19 * TILE_SIZE,
    triggerY: 53 * TILE_SIZE,
    triggerW: 96,
    triggerH: 48,
  },
  {
    order: 6,
    questId: 'quest-6-visualization-tower',
    name: 'Visualization Tower',
    buildingType: 'building_vis_tower',
    tileX: 19,
    tileY: 60,
    triggerX: 19 * TILE_SIZE,
    triggerY: 64 * TILE_SIZE,
    triggerW: 96,
    triggerH: 48,
  },
  {
    order: 7,
    questId: 'quest-7-clean-data-boss',
    name: 'The Clean Data Trial',
    buildingType: 'building_clean_trial',
    tileX: 19,
    tileY: 70,
    triggerX: 19 * TILE_SIZE,
    triggerY: 74 * TILE_SIZE,
    triggerW: 96,
    triggerH: 48,
  },
];

/**
 * Builds the map matrix for:
 * 1. Ground tiles (grass, path, stone, water, bridge)
 * 2. Static object placements (trees, fences, bushes, flowers, signs)
 * 3. Collisions (boolean grid)
 */
export function buildWorldMap() {
  const ground: string[][] = Array.from({ length: MAP_ROWS }, () =>
    Array(MAP_COLS).fill('tile_grass')
  );

  const objects: Array<{ x: number; y: number; texture: string; collides: boolean }> = [];

  // Helper to place object
  const placeObject = (x: number, y: number, texture: string, collides = true) => {
    objects.push({ x: x * TILE_SIZE, y: y * TILE_SIZE, texture, collides });
  };

  // 1. BOUNDARY PERIMETER (Dense forest of trees along left & right borders)
  for (let r = 0; r < MAP_ROWS; r += 2) {
    placeObject(0, r, 'tile_tree', true);
    placeObject(2, r, 'tile_tree', true);
    placeObject(MAP_COLS - 4, r, 'tile_tree', true);
    placeObject(MAP_COLS - 2, r, 'tile_tree', true);
  }
  // Top boundary trees
  for (let c = 0; c < MAP_COLS; c += 2) {
    placeObject(c, 0, 'tile_tree', true);
    placeObject(c, 2, 'tile_tree', true);
  }
  // Bottom boundary trees
  for (let c = 0; c < MAP_COLS; c += 2) {
    placeObject(c, MAP_ROWS - 2, 'tile_tree', true);
  }

  // 2. MAIN NORTH-SOUTH ADVENTURE ROAD (Columns 19..22)
  for (let r = 4; r < MAP_ROWS - 4; r++) {
    for (let c = 19; c <= 22; c++) {
      ground[r][c] = 'tile_path';
    }
  }

  // 3. PLAZAS around each landmark
  const plazaRows = [8, 9, 22, 23, 32, 33, 42, 43, 52, 53, 62, 63, 72, 73];
  plazaRows.forEach((r) => {
    for (let c = 17; c <= 24; c++) {
      ground[r][c] = 'tile_stone_path';
    }
  });

  // 4. SCENIC RIVER & WATERFALL (Row 14 to 17)
  for (let r = 14; r <= 16; r++) {
    for (let c = 3; c < MAP_COLS - 3; c++) {
      // If within bridge columns, place wooden bridge planks!
      if (c >= 18 && c <= 23) {
        ground[r][c] = 'tile_bridge';
      } else {
        ground[r][c] = 'tile_water';
      }
    }
  }

  // Bridge railings (Left rail at c=18, Right rail at c=23)
  for (let r = 14; r <= 16; r++) {
    placeObject(18, r, 'tile_bridge_rail', true);
    placeObject(23, r, 'tile_bridge_rail', true);
  }

  // 5. WHITE FENCES & BUSHES (around Village at Row 6 to 12)
  // Left garden fence
  for (let c = 10; c <= 16; c++) {
    placeObject(c, 7, 'tile_fence', true);
    placeObject(c, 11, 'tile_fence', true);
  }
  // Left flower garden inside fences
  for (let r = 8; r <= 10; r++) {
    for (let c = 11; c <= 15; c++) {
      placeObject(c, r, (r + c) % 2 === 0 ? 'tile_flower_red' : 'tile_flower_yellow', false);
    }
  }

  // Right garden / bushes (matching reference image)
  for (let r = 7; r <= 11; r++) {
    placeObject(25, r, 'tile_bush', true);
    placeObject(27, r, 'tile_bush', true);
  }
  for (let r = 8; r <= 10; r++) {
    placeObject(29, r, 'tile_flower_red', false);
  }

  // Welcome signpost in village
  placeObject(18, 9, 'tile_sign', true);
  // Street lamps
  placeObject(18, 12, 'tile_lamp', true);
  placeObject(23, 12, 'tile_lamp', true);

  // 6. DECORATIONS ALONG ROUTE
  // Between River & Import Forge (Rows 18-20)
  placeObject(16, 18, 'tile_bush', true);
  placeObject(25, 18, 'tile_bush', true);
  placeObject(17, 19, 'tile_flower_yellow', false);
  placeObject(24, 19, 'tile_flower_red', false);

  // Around Export Workshop (Rows 28-31)
  placeObject(16, 29, 'tile_bush', true);
  placeObject(25, 29, 'tile_bush', true);
  placeObject(17, 31, 'tile_lamp', true);
  placeObject(24, 31, 'tile_lamp', true);

  // Around Missing Value Dungeon (Rows 38-41)
  // Darker grass around dungeon
  for (let r = 38; r <= 44; r++) {
    for (let c = 6; c <= 35; c++) {
      if (ground[r][c] === 'tile_grass') {
        ground[r][c] = 'tile_grass_dark';
      }
    }
  }

  // Around Visualization Tower (Rows 58-61)
  placeObject(16, 59, 'tile_lamp', true);
  placeObject(25, 59, 'tile_lamp', true);

  // Around Clean Data Trial (Rows 68-71)
  placeObject(16, 69, 'tile_bush', true);
  placeObject(25, 69, 'tile_bush', true);
  placeObject(17, 71, 'tile_flower_yellow', false);
  placeObject(24, 71, 'tile_flower_yellow', false);

  return {
    ground,
    objects,
    landmarks: QUEST_LANDMARKS_MAP,
  };
}

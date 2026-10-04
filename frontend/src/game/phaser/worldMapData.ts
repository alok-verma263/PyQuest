/**
 * PyQuest World Map Layout & Landmark Coordinates
 * Defines the tilemap layout (42 cols x 80 rows = 1344 x 2560 px),
 * collision boundaries, river/bridge, and quest trigger locations.
 * Optimized with tree variants, clover ground patches, rocks, and consolidated colliders.
 */

export const MAP_COLS = 42;
export const MAP_ROWS = 80;
export const TILE_SIZE = 32;

export interface LandmarkZone {
  order: number;
  questId: string;
  name: string;
  buildingType: string;
  tileX: number;
  tileY: number;
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

export interface WorldMapDataResult {
  ground: string[][];
  objects: Array<{ x: number; y: number; texture: string; collides: boolean; isTree?: boolean }>;
  waterColliders: Array<{ x: number; y: number; w: number; h: number }>;
  landmarks: LandmarkZone[];
}

let cachedWorldMap: WorldMapDataResult | null = null;

/**
 * Builds and caches the map matrix:
 * 1. Ground tiles (grass, clover, path, stone, water, bridge)
 * 2. Static object placements (varied trees, fences, bushes, flowers, signs, rocks)
 * 3. Consolidated water colliders (2 large blocks instead of 100+ separate bodies)
 */
export function buildWorldMap(): WorldMapDataResult {
  if (cachedWorldMap) return cachedWorldMap;

  const ground: string[][] = Array.from({ length: MAP_ROWS }, () =>
    Array(MAP_COLS).fill('tile_grass')
  );

  const objects: Array<{ x: number; y: number; texture: string; collides: boolean; isTree?: boolean }> = [];

  const placeObject = (x: number, y: number, texture: string, collides = true, isTree = false) => {
    objects.push({ x: x * TILE_SIZE, y: y * TILE_SIZE, texture, collides, isTree });
  };

  // 1. BOUNDARY PERIMETER (Forest of varied Oak, Pine, and Autumn Trees)
  for (let r = 0; r < MAP_ROWS; r += 2) {
    const tree1 = (r / 2) % 3 === 0 ? 'tile_tree_pine' : (r / 2) % 3 === 1 ? 'tile_tree_oak' : 'tile_tree_autumn';
    const tree2 = (r / 2 + 1) % 3 === 0 ? 'tile_tree_oak' : 'tile_tree_pine';
    placeObject(0, r, tree1, true, true);
    placeObject(2, r, tree2, true, true);
    placeObject(MAP_COLS - 4, r, tree2, true, true);
    placeObject(MAP_COLS - 2, r, tree1, true, true);
  }
  // Top boundary trees
  for (let c = 0; c < MAP_COLS; c += 2) {
    const treeT = (c / 2) % 2 === 0 ? 'tile_tree_pine' : 'tile_tree_oak';
    placeObject(c, 0, treeT, true, true);
    placeObject(c, 2, treeT, true, true);
  }
  // Bottom boundary trees
  for (let c = 0; c < MAP_COLS; c += 2) {
    placeObject(c, MAP_ROWS - 2, 'tile_tree_pine', true, true);
  }

  // 2. MAIN ADVENTURE TRAIL (Columns 19..22)
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

  // 4. SCENIC RIVER & WATERFALL (Rows 14 to 16)
  for (let r = 14; r <= 16; r++) {
    for (let c = 3; c < MAP_COLS - 3; c++) {
      if (c >= 18 && c <= 23) {
        ground[r][c] = 'tile_bridge';
      } else {
        ground[r][c] = 'tile_water';
      }
    }
  }

  // Bridge railings (Left at c=18, Right at c=23)
  for (let r = 14; r <= 16; r++) {
    placeObject(18, r, 'tile_bridge_rail', true);
    placeObject(23, r, 'tile_bridge_rail', true);
  }

  // Rocks along riverbanks
  placeObject(6, 13, 'tile_rock', true);
  placeObject(16, 13, 'tile_rock', true);
  placeObject(25, 17, 'tile_rock', true);
  placeObject(34, 13, 'tile_rock', true);

  // 5. CLOVER GROUND PATCHES (Natural terrain variety)
  for (let r = 5; r < MAP_ROWS - 5; r += 3) {
    for (let c = 5; c < MAP_COLS - 5; c += 4) {
      if (ground[r][c] === 'tile_grass' && (r + c) % 5 === 0) {
        ground[r][c] = 'tile_grass_clover';
      }
    }
  }

  // 6. WHITE FENCES & BUSHES (around Village at Row 6 to 12)
  for (let c = 10; c <= 16; c++) {
    placeObject(c, 7, 'tile_fence', true);
    placeObject(c, 11, 'tile_fence', true);
  }
  for (let r = 8; r <= 10; r++) {
    for (let c = 11; c <= 15; c++) {
      placeObject(c, r, (r + c) % 2 === 0 ? 'tile_flower_red' : 'tile_flower_yellow', false);
    }
  }

  // Village right garden bushes & flowers
  for (let r = 7; r <= 11; r++) {
    placeObject(25, r, 'tile_bush', true);
    placeObject(27, r, 'tile_bush', true);
  }
  for (let r = 8; r <= 10; r++) {
    placeObject(29, r, 'tile_flower_red', false);
  }

  // Village signs & street lamps
  placeObject(18, 9, 'tile_sign', true);
  placeObject(18, 12, 'tile_lamp', true);
  placeObject(23, 12, 'tile_lamp', true);

  // 7. DECORATIONS ALONG ROUTE
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

  // Around Missing Value Dungeon (Rows 38-44) - darker woodland grass
  for (let r = 38; r <= 44; r++) {
    for (let c = 6; c <= 35; c++) {
      if (ground[r][c] === 'tile_grass' || ground[r][c] === 'tile_grass_clover') {
        ground[r][c] = 'tile_grass_dark';
      }
    }
  }
  placeObject(15, 41, 'tile_rock', true);
  placeObject(26, 41, 'tile_rock', true);

  // Around Visualization Tower (Rows 58-61)
  placeObject(16, 59, 'tile_lamp', true);
  placeObject(25, 59, 'tile_lamp', true);

  // Around Clean Data Trial (Rows 68-71)
  placeObject(16, 69, 'tile_bush', true);
  placeObject(25, 69, 'tile_bush', true);
  placeObject(17, 71, 'tile_flower_yellow', false);
  placeObject(24, 71, 'tile_flower_yellow', false);

  // 8. CONSOLIDATED WATER COLLIDERS (Left water bank and Right water bank)
  // River is at rows 14..16 (height 3 tiles = 96px)
  // Left bank: cols 3..17 (15 tiles = 480px)
  // Right bank: cols 24..38 (15 tiles = 480px)
  const waterColliders = [
    {
      x: 3 * TILE_SIZE,
      y: 14 * TILE_SIZE,
      w: (18 - 3) * TILE_SIZE,
      h: 3 * TILE_SIZE,
    },
    {
      x: 24 * TILE_SIZE,
      y: 14 * TILE_SIZE,
      w: (MAP_COLS - 3 - 24) * TILE_SIZE,
      h: 3 * TILE_SIZE,
    },
  ];

  cachedWorldMap = {
    ground,
    objects,
    waterColliders,
    landmarks: QUEST_LANDMARKS_MAP,
  };

  return cachedWorldMap;
}

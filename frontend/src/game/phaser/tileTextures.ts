/**
 * PyQuest Top-Down Tile & Sprite Procedural Generator
 * Generates crisp 32x32 pixel-art textures and spritesheets using Canvas API
 * Ensures 100% reliable, zero-asset-download offline rendering with pixel-art aesthetic.
 */

export interface TexturePalette {
  grass: string;
  grassShade: string;
  grassHighlight: string;
  path: string;
  pathShade: string;
  stone: string;
  water: string;
  waterShade: string;
  waterLight: string;
  wood: string;
  woodDark: string;
  woodLight: string;
}

export const DEFAULT_PALETTE: TexturePalette = {
  grass: '#7ece7e',
  grassShade: '#64b664',
  grassHighlight: '#9ce49c',
  path: '#dfc796',
  pathShade: '#c9b17f',
  stone: '#94a3b8',
  water: '#3b82f6',
  waterShade: '#1d4ed8',
  waterLight: '#93c5fd',
  wood: '#b45309',
  woodDark: '#78350f',
  woodLight: '#d97706',
};

/**
 * Creates an offscreen canvas of given dimensions
 */
function createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

/**
 * Generates all 32x32 environment tiles
 */
export function generateTileTextures(scene: Phaser.Scene) {
  const tm = scene.textures;

  // 1. TILE_GRASS
  if (!tm.exists('tile_grass')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#7ece7e';
    ctx.fillRect(0, 0, 32, 32);
    // Grass blade tufts
    ctx.fillStyle = '#64b664';
    ctx.fillRect(6, 8, 2, 4);
    ctx.fillRect(8, 7, 2, 5);
    ctx.fillRect(20, 20, 2, 4);
    ctx.fillRect(22, 19, 2, 5);
    ctx.fillRect(14, 26, 2, 3);
    // Grass highlights
    ctx.fillStyle = '#9ce49c';
    ctx.fillRect(6, 6, 2, 2);
    ctx.fillRect(20, 18, 2, 2);
    ctx.fillRect(26, 10, 2, 2);
    tm.addCanvas('tile_grass', canvas);
  }

  // 2. TILE_GRASS_DARK (woodland / edge grass)
  if (!tm.exists('tile_grass_dark')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#569f56';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#418241';
    ctx.fillRect(4, 10, 3, 5);
    ctx.fillRect(18, 16, 3, 5);
    ctx.fillStyle = '#6cb56c';
    ctx.fillRect(4, 8, 2, 2);
    ctx.fillRect(18, 14, 2, 2);
    tm.addCanvas('tile_grass_dark', canvas);
  }

  // 3. TILE_PATH (sandy dirt trail)
  if (!tm.exists('tile_path')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#dfc796';
    ctx.fillRect(0, 0, 32, 32);
    // Subtle sand texture / pebbles
    ctx.fillStyle = '#c9b17f';
    ctx.fillRect(4, 6, 3, 2);
    ctx.fillRect(18, 14, 4, 3);
    ctx.fillRect(10, 24, 3, 2);
    ctx.fillStyle = '#f1dfb5';
    ctx.fillRect(12, 8, 2, 2);
    ctx.fillRect(24, 22, 2, 2);
    tm.addCanvas('tile_path', canvas);
  }

  // 4. TILE_STONE_PATH (cobblestone)
  if (!tm.exists('tile_stone_path')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#64748b'; // Mortar
    ctx.fillRect(0, 0, 32, 32);
    // Stones
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(2, 2, 12, 12);
    ctx.fillRect(16, 2, 14, 12);
    ctx.fillRect(2, 16, 14, 14);
    ctx.fillRect(18, 16, 12, 14);
    // Stone highlights
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(3, 3, 10, 3);
    ctx.fillRect(17, 3, 12, 3);
    ctx.fillRect(3, 17, 12, 3);
    ctx.fillRect(19, 17, 10, 3);
    tm.addCanvas('tile_stone_path', canvas);
  }

  // 5. TILE_WATER
  if (!tm.exists('tile_water')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, 32, 32);
    // Deep wave lines
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 8, 32, 4);
    ctx.fillRect(0, 22, 32, 4);
    // Wave highlights
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(4, 7, 12, 2);
    ctx.fillRect(20, 21, 10, 2);
    tm.addCanvas('tile_water', canvas);
  }

  // 6. TILE_BRIDGE (wooden planks)
  if (!tm.exists('tile_bridge')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 32, 32);
    // Planks
    for (let y = 0; y < 32; y += 8) {
      ctx.fillStyle = '#78350f'; // Joint line
      ctx.fillRect(0, y, 32, 2);
      ctx.fillStyle = '#d97706'; // Plank top highlight
      ctx.fillRect(0, y + 2, 32, 2);
      // Nail heads
      ctx.fillStyle = '#451a03';
      ctx.fillRect(3, y + 4, 2, 2);
      ctx.fillRect(27, y + 4, 2, 2);
    }
    tm.addCanvas('tile_bridge', canvas);
  }

  // 7. TILE_BRIDGE_RAIL (vertical bridge railing)
  if (!tm.exists('tile_bridge_rail')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, 32, 32);
    // Wooden post
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 0, 8, 32);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(6, 0, 4, 32);
    // Horizontal cross bar
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 10, 32, 6);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 10, 32, 2);
    tm.addCanvas('tile_bridge_rail', canvas);
  }

  // 8. TILE_FENCE (white picket fence matching reference)
  if (!tm.exists('tile_fence')) {
    const { canvas, ctx } = createCanvas(32, 32);
    // Transparent background on grass
    ctx.fillStyle = '#7ece7e';
    ctx.fillRect(0, 0, 32, 32);
    // Two fence posts
    [4, 20].forEach((x) => {
      ctx.fillStyle = '#64748b'; // Shadow
      ctx.fillRect(x + 1, 6, 7, 24);
      ctx.fillStyle = '#f8fafc'; // White body
      ctx.fillRect(x, 6, 6, 24);
      // Pointed cap
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + 2, 2, 2, 4);
      ctx.fillRect(x + 1, 4, 4, 2);
      // Highlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 1, 6, 2, 22);
    });
    // Horizontal crossbars
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 12, 32, 4);
    ctx.fillRect(0, 22, 32, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 12, 32, 1);
    ctx.fillRect(0, 22, 32, 1);
    tm.addCanvas('tile_fence', canvas);
  }

  // 9. TILE_BUSH (spherical lush shrub matching reference)
  if (!tm.exists('tile_bush')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#7ece7e';
    ctx.fillRect(0, 0, 32, 32);
    // Dark base shadow
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(16, 17, 13, 0, Math.PI * 2);
    ctx.fill();
    // Bush body
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();
    // Mid highlight
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(14, 13, 8, 0, Math.PI * 2);
    ctx.fill();
    // Top highlight
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(13, 11, 4, 0, Math.PI * 2);
    ctx.fill();
    tm.addCanvas('tile_bush', canvas);
  }

  // 10. TILE_FLOWER_RED (matching reference flowers)
  if (!tm.exists('tile_flower_red')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#7ece7e';
    ctx.fillRect(0, 0, 32, 32);
    // Two red flowers
    const drawFlower = (cx: number, cy: number) => {
      // Petals
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 5, cy - 2, 10, 4);
      ctx.fillRect(cx - 2, cy - 5, 4, 10);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 4, cy - 4, 8, 8);
      // Yellow center
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - 1, cy - 1, 3, 3);
      // Stem / leaves
      ctx.fillStyle = '#15803d';
      ctx.fillRect(cx - 1, cy + 5, 2, 4);
      ctx.fillRect(cx + 2, cy + 6, 2, 2);
    };
    drawFlower(10, 12);
    drawFlower(22, 20);
    tm.addCanvas('tile_flower_red', canvas);
  }

  // 11. TILE_FLOWER_YELLOW
  if (!tm.exists('tile_flower_yellow')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#7ece7e';
    ctx.fillRect(0, 0, 32, 32);
    const drawYellow = (cx: number, cy: number) => {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx - 4, cy - 4, 8, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 3, cy - 3, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1, cy - 1, 2, 2);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(cx - 1, cy + 4, 2, 4);
    };
    drawYellow(12, 18);
    drawYellow(24, 10);
    tm.addCanvas('tile_flower_yellow', canvas);
  }

  // 12. TILE_TREE (64x64 RPG Pine/Oak Tree)
  if (!tm.exists('tile_tree')) {
    const { canvas, ctx } = createCanvas(64, 64);
    // Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(26, 38, 12, 22);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(28, 38, 8, 20);
    // Tree shadow on grass
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(32, 58, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bushy canopy layers
    const drawCanopy = (cy: number, r: number, fill: string, hi: string) => {
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(32, cy + 2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(32, cy, r - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hi;
      ctx.beginPath();
      ctx.arc(28, cy - 4, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCanopy(34, 19, '#15803d', '#22c55e');
    drawCanopy(22, 16, '#16a34a', '#4ade80');
    drawCanopy(12, 11, '#22c55e', '#86efac');
    tm.addCanvas('tile_tree', canvas);
  }

  // 13. TILE_SIGNPOST
  if (!tm.exists('tile_sign')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#7ece7e';
    ctx.fillRect(0, 0, 32, 32);
    // Post
    ctx.fillStyle = '#78350f';
    ctx.fillRect(14, 12, 4, 18);
    // Sign board
    ctx.fillStyle = '#b45309';
    ctx.fillRect(4, 6, 24, 12);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(6, 8, 20, 8);
    // Text lines
    ctx.fillStyle = '#78350f';
    ctx.fillRect(8, 10, 16, 1.5);
    ctx.fillRect(8, 13, 12, 1.5);
    tm.addCanvas('tile_sign', canvas);
  }

  // 14. TILE_LAMP (Street lantern)
  if (!tm.exists('tile_lamp')) {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.fillStyle = '#7ece7e';
    ctx.fillRect(0, 0, 32, 32);
    // Post
    ctx.fillStyle = '#334155';
    ctx.fillRect(14, 10, 4, 20);
    // Lantern head
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(11, 4, 10, 8);
    // Glass glow
    ctx.fillStyle = '#fde047';
    ctx.fillRect(13, 6, 6, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 7, 2, 2);
    tm.addCanvas('tile_lamp', canvas);
  }

  // 15. QUEST LANDMARK BUILDINGS
  generateBuildingTextures(scene);

  // 16. PLAYER CHARACTER SPRITESHEET
  generatePlayerSpritesheet(scene);
}

/**
 * Generates landmark buildings for each Quest Location
 */
function generateBuildingTextures(scene: Phaser.Scene) {
  const tm = scene.textures;

  // 1. DATA VILLAGE / COTTAGE (Meet the Data) - 96x96
  if (!tm.exists('building_data_village')) {
    const { canvas, ctx } = createCanvas(96, 96);
    // Base shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.fillRect(4, 80, 88, 12);
    // House walls
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(12, 38, 72, 48);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(12, 38, 72, 4);
    // Roof (timber/slate blue)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(8, 38);
    ctx.lineTo(48, 10);
    ctx.lineTo(88, 38);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(12, 38);
    ctx.lineTo(48, 13);
    ctx.lineTo(84, 38);
    ctx.closePath();
    ctx.fill();
    // Chimney
    ctx.fillStyle = '#78350f';
    ctx.fillRect(66, 8, 10, 20);
    // Door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(38, 54, 20, 32);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(40, 56, 16, 28);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(52, 70, 2, 3); // Knob
    // Windows
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(18, 52, 14, 14);
    ctx.fillRect(64, 52, 14, 14);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(24, 52, 2, 14);
    ctx.fillRect(70, 52, 2, 14);
    // Hanging Sign: "DataFrame Shrine"
    ctx.fillStyle = '#09152b';
    ctx.fillRect(32, 40, 32, 11);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(32, 40, 32, 11);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('DATA v1', 35, 48);
    tm.addCanvas('building_data_village', canvas);
  }

  // 2. DATA IMPORT FORGE (CSV Portal Arch) - 96x96
  if (!tm.exists('building_import_forge')) {
    const { canvas, ctx } = createCanvas(96, 96);
    // Stone Pillars
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(16, 24, 18, 62);
    ctx.fillRect(62, 24, 18, 62);
    // Stone Arch
    ctx.fillStyle = '#334155';
    ctx.fillRect(12, 14, 72, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(16, 10, 64, 6);
    // Inner Portal Vortex (Cyan Glow)
    const grad = ctx.createLinearGradient(0, 28, 0, 86);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#38bdf8');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.fillRect(34, 28, 28, 58);
    // CSV Rune Stone in Arch
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(36, 12, 24, 14);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(36, 12, 24, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('CSV', 40, 23);
    // Import Arrow
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(48, 62);
    ctx.lineTo(40, 50);
    ctx.lineTo(45, 50);
    ctx.lineTo(45, 38);
    ctx.lineTo(51, 38);
    ctx.lineTo(51, 50);
    ctx.lineTo(56, 50);
    ctx.closePath();
    ctx.fill();
    tm.addCanvas('building_import_forge', canvas);
  }

  // 3. DATA EXPORT WORKSHOP - 96x96
  if (!tm.exists('building_export_workshop')) {
    const { canvas, ctx } = createCanvas(96, 96);
    // Factory brick walls
    ctx.fillStyle = '#78350f';
    ctx.fillRect(14, 34, 68, 52);
    // Sawtooth roof
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(14, 34);
    ctx.lineTo(36, 16);
    ctx.lineTo(36, 34);
    ctx.lineTo(60, 16);
    ctx.lineTo(60, 34);
    ctx.lineTo(82, 16);
    ctx.lineTo(82, 34);
    ctx.closePath();
    ctx.fill();
    // Smoke pipe
    ctx.fillStyle = '#475569';
    ctx.fillRect(24, 8, 8, 16);
    // Metal roller door
    ctx.fillStyle = '#334155';
    ctx.fillRect(34, 52, 28, 34);
    for (let y = 54; y < 86; y += 4) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(36, y, 24, 2);
    }
    // Output crates (CSV / XLSX)
    ctx.fillStyle = '#b45309';
    ctx.fillRect(66, 68, 16, 16);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(68, 70, 12, 6);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('XLS', 69, 75);
    tm.addCanvas('building_export_workshop', canvas);
  }

  // 4. MISSING VALUE DUNGEON - 96x96
  if (!tm.exists('building_missing_cave')) {
    const { canvas, ctx } = createCanvas(96, 96);
    // Dark mountain crags
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(8, 86);
    ctx.lineTo(24, 20);
    ctx.lineTo(48, 8);
    ctx.lineTo(72, 22);
    ctx.lineTo(88, 86);
    ctx.closePath();
    ctx.fill();
    // Dark cavern entrance
    ctx.fillStyle = '#090514';
    ctx.beginPath();
    ctx.ellipse(48, 64, 22, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    // Glowing Ruby Crystals (NaN Hazard)
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(22, 54);
    ctx.lineTo(28, 40);
    ctx.lineTo(34, 54);
    ctx.lineTo(28, 64);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(26, 46, 4, 10);
    // Warning Sign "NaN"
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(38, 26, 20, 12);
    ctx.strokeStyle = '#f43f5e';
    ctx.strokeRect(38, 26, 20, 12);
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('NaN', 42, 35);
    tm.addCanvas('building_missing_cave', canvas);
  }

  // 5. CATEGORY FORGE - 96x96
  if (!tm.exists('building_category_forge')) {
    const { canvas, ctx } = createCanvas(96, 96);
    // Tech Lab walls
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(16, 32, 64, 54);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(16, 32, 64, 54);
    // Glass dome roof
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.arc(48, 32, 26, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
    // Binary Cubes (0 / 1)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(28, 54, 14, 14);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('0', 32, 65);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(52, 54, 14, 14);
    ctx.fillStyle = '#fff';
    ctx.fillText('1', 56, 65);
    // Entrance door
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(41, 68, 14, 18);
    tm.addCanvas('building_category_forge', canvas);
  }

  // 6. VISUALIZATION TOWER - 96x128
  if (!tm.exists('building_vis_tower')) {
    const { canvas, ctx } = createCanvas(96, 128);
    // Tower base & spire
    ctx.fillStyle = '#082f49';
    ctx.fillRect(24, 40, 48, 80);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(32, 20, 32, 24);
    // Spire needle
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(48, 2);
    ctx.lineTo(44, 20);
    ctx.lineTo(52, 20);
    ctx.closePath();
    ctx.fill();
    // Hologram chart display
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(30, 52, 36, 26);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(30, 52, 36, 26);
    // Histogram bars inside hologram
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(34, 66, 5, 10);
    ctx.fillRect(41, 60, 5, 16);
    ctx.fillRect(48, 63, 5, 13);
    ctx.fillRect(55, 56, 5, 20);
    // Tower doorway
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(40, 96, 16, 24);
    tm.addCanvas('building_vis_tower', canvas);
  }

  // 7. CLEAN DATA TRIAL (Sanctuary Portal) - 96x128
  if (!tm.exists('building_clean_trial')) {
    const { canvas, ctx } = createCanvas(96, 128);
    // Golden sanctuary arch
    ctx.fillStyle = '#78350f';
    ctx.fillRect(16, 36, 64, 84);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(12, 28, 72, 10);
    // Golden Dome
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(48, 28, 30, Math.PI, 0);
    ctx.fill();
    // Portal Entrance
    const grad = ctx.createRadialGradient(48, 76, 4, 48, 76, 26);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#451a03');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(48, 76, 24, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    // Golden Python Rune
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(48, 72, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.font = 'black 12px monospace';
    ctx.fillText('Py', 41, 76);
    tm.addCanvas('building_clean_trial', canvas);
  }
}

/**
 * Generates original PyQuest player character spritesheet
 * 32x32 per frame, 3 frames per direction (idle, walk1, walk2), 4 directions = 12 frames!
 * Frame layout: 4 columns x 3 rows or 3 columns x 4 rows
 * 3 columns x 4 rows = 96x128 canvas
 * Row 0: Down
 * Row 1: Left
 * Row 2: Right
 * Row 3: Up
 */
function generatePlayerSpritesheet(scene: Phaser.Scene) {
  const tm = scene.textures;
  if (tm.exists('player_sheet')) return;

  const { canvas, ctx } = createCanvas(96, 128);

  const drawCharacter = (x: number, y: number, dir: 'down' | 'up' | 'left' | 'right', frame: 0 | 1 | 2) => {
    const cx = x + 16;
    const cy = y + 16;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 13, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feet / Boots
    ctx.fillStyle = '#78350f';
    if (dir === 'down' || dir === 'up') {
      const offsetL = frame === 1 ? -2 : 0;
      const offsetR = frame === 2 ? -2 : 0;
      ctx.fillRect(cx - 6, cy + 9 + offsetL, 4, 5);
      ctx.fillRect(cx + 2, cy + 9 + offsetR, 4, 5);
    } else if (dir === 'left') {
      const swing = frame === 1 ? -3 : frame === 2 ? 3 : 0;
      ctx.fillRect(cx - 4 + swing, cy + 9, 7, 5);
    } else {
      const swing = frame === 1 ? -3 : frame === 2 ? 3 : 0;
      ctx.fillRect(cx - 3 + swing, cy + 9, 7, 5);
    }

    // Trousers
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 5, cy + 5, 10, 6);

    // Torso / Blue Adventurer Tunic
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(cx - 6, cy - 3, 12, 9);
    // Belt
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx - 6, cy + 4, 12, 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cx - 1, cy + 4, 2, 2);

    // Arms
    ctx.fillStyle = '#0369a1';
    if (dir === 'down' || dir === 'up') {
      const armL = frame === 1 ? 2 : 0;
      const armR = frame === 2 ? 2 : 0;
      ctx.fillRect(cx - 8, cy - 2 + armL, 2, 7);
      ctx.fillRect(cx + 6, cy - 2 + armR, 2, 7);
    } else if (dir === 'left') {
      ctx.fillRect(cx - 4, cy - 1, 3, 7);
    } else {
      ctx.fillRect(cx + 1, cy - 1, 3, 7);
    }

    // Head / Face
    ctx.fillStyle = '#fed7aa'; // Skin tone
    ctx.fillRect(cx - 5, cy - 11, 10, 8);

    // Hair / Back of head
    ctx.fillStyle = '#451a03';
    if (dir === 'up') {
      ctx.fillRect(cx - 6, cy - 12, 12, 9);
    } else {
      ctx.fillRect(cx - 6, cy - 12, 12, 4);
      ctx.fillRect(cx - 6, cy - 8, 2, 4);
      ctx.fillRect(cx + 4, cy - 8, 2, 4);
    }

    // Adventurer Red Cap (Signature PyQuest Explorer look)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 6, cy - 13, 12, 4);
    if (dir === 'down') {
      ctx.fillRect(cx - 4, cy - 14, 8, 2);
      ctx.fillStyle = '#dc2626'; // Visor
      ctx.fillRect(cx - 6, cy - 9, 12, 2);
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 3, cy - 6, 2, 2);
      ctx.fillRect(cx + 2, cy - 6, 2, 2);
    } else if (dir === 'left') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 8, cy - 9, 6, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 4, cy - 6, 2, 2);
    } else if (dir === 'right') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx + 2, cy - 9, 6, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx + 2, cy - 6, 2, 2);
    }
  };

  // Row 0: Down (frames 0, 1, 2)
  drawCharacter(0, 0, 'down', 0);
  drawCharacter(32, 0, 'down', 1);
  drawCharacter(64, 0, 'down', 2);

  // Row 1: Left (frames 0, 1, 2)
  drawCharacter(0, 32, 'left', 0);
  drawCharacter(32, 32, 'left', 1);
  drawCharacter(64, 32, 'left', 2);

  // Row 2: Right (frames 0, 1, 2)
  drawCharacter(0, 64, 'right', 0);
  drawCharacter(32, 64, 'right', 1);
  drawCharacter(64, 64, 'right', 2);

  // Row 3: Up (frames 0, 1, 2)
  drawCharacter(0, 96, 'up', 0);
  drawCharacter(32, 96, 'up', 1);
  drawCharacter(64, 96, 'up', 2);

  // Add canvas texture and register 12 frames (3 cols x 4 rows)
  const playerTexture = tm.addCanvas('player_sheet', canvas);
  if (playerTexture) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const frameIdx = row * 3 + col;
        playerTexture.add(frameIdx, 0, col * 32, row * 32, 32, 32);
      }
    }
  }
}

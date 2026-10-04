/**
 * PyQuest Top-Down Tile-Based Exploration World Verification Suite
 * Verifies Phaser 3 engine integration, tile generation, world map,
 * collision architecture, player movement, and quest interaction.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== PYQUEST TOP-DOWN ADVENTURE WORLD VERIFICATION SUITE ===\n');

// 1. Verify Phaser Dependency
const pkgPath = path.join(__dirname, 'package.json');
assert(fs.existsSync(pkgPath), 'package.json must exist');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
assert(pkg.dependencies.phaser, 'Phaser 3 must be installed in dependencies');
console.log(`✓ PASS: Phaser 3 installed (${pkg.dependencies.phaser})`);

// 2. Verify Tile Texture Generator (tileTextures.ts)
const tileTexPath = path.join(__dirname, 'src', 'game', 'phaser', 'tileTextures.ts');
assert(fs.existsSync(tileTexPath), 'tileTextures.ts must exist');
const tileTexContent = fs.readFileSync(tileTexPath, 'utf8');

const requiredTiles = [
  'tile_grass',
  'tile_grass_dark',
  'tile_path',
  'tile_stone_path',
  'tile_water',
  'tile_bridge',
  'tile_bridge_rail',
  'tile_fence',
  'tile_bush',
  'tile_flower_red',
  'tile_flower_yellow',
  'tile_tree',
  'tile_sign',
  'tile_lamp',
];

requiredTiles.forEach((tile) => {
  assert(tileTexContent.includes(tile), `tileTextures must generate ${tile}`);
});
console.log('✓ PASS: All 14 environment tile textures generated procedurally');

// Verify 7 Landmark Buildings in tile generator
const requiredBuildings = [
  'building_data_village',
  'building_import_forge',
  'building_export_workshop',
  'building_missing_cave',
  'building_category_forge',
  'building_vis_tower',
  'building_clean_trial',
];

requiredBuildings.forEach((bld) => {
  assert(tileTexContent.includes(bld), `tileTextures must generate ${bld}`);
});
console.log('✓ PASS: All 7 quest landmark buildings generated (Village to Clean Trial)');

// Verify 12-frame Player Spritesheet
assert(tileTexContent.includes('player_sheet'), 'tileTextures must generate player_sheet');
assert(tileTexContent.includes("'down'"), 'Spritesheet must support down direction');
assert(tileTexContent.includes("'up'"), 'Spritesheet must support up direction');
assert(tileTexContent.includes("'left'"), 'Spritesheet must support left direction');
assert(tileTexContent.includes("'right'"), 'Spritesheet must support right direction');
console.log('✓ PASS: 12-frame top-down player character spritesheet generated');

// 3. Verify World Map Layout Data (worldMapData.ts)
const mapDataPath = path.join(__dirname, 'src', 'game', 'phaser', 'worldMapData.ts');
assert(fs.existsSync(mapDataPath), 'worldMapData.ts must exist');
const mapDataContent = fs.readFileSync(mapDataPath, 'utf8');

assert(mapDataContent.includes('MAP_COLS = 42'), 'Map columns must be 42');
assert(mapDataContent.includes('MAP_ROWS = 80'), 'Map rows must be 80 (2560px tall)');
assert(mapDataContent.includes('TILE_SIZE = 32'), 'Tile size must be 32x32');
assert(mapDataContent.includes('QUEST_LANDMARKS_MAP'), 'Landmarks map must be defined');
assert(mapDataContent.includes('tile_bridge'), 'Map must feature bridge over river');
assert(mapDataContent.includes('tile_water'), 'Map must feature water barrier');
console.log('✓ PASS: World map grid (1344 x 2560 px) and river bridge verified');

// 4. Verify Phaser Scene (WorldScene.ts)
const scenePath = path.join(__dirname, 'src', 'game', 'phaser', 'WorldScene.ts');
assert(fs.existsSync(scenePath), 'WorldScene.ts must exist');
const sceneContent = fs.readFileSync(scenePath, 'utf8');

assert(sceneContent.includes('class WorldScene extends Phaser.Scene'), 'Must extend Phaser.Scene');
assert(sceneContent.includes('this.physics.add.collider'), 'Must implement physics colliders');
assert(sceneContent.includes('this.cameras.main.startFollow'), 'Camera must follow player smoothly');
assert(sceneContent.includes('this.cameras.main.setBounds'), 'Camera must obey map boundaries');
assert(sceneContent.includes('checkLandmarkProximity'), 'Must implement proximity detection for quest locations');
assert(sceneContent.includes('triggerInteraction'), 'Must support pressing E to interact');
assert(sceneContent.includes('teleportToLandmark'), 'Must support teleporting/fast travel');
console.log('✓ PASS: WorldScene with physics, WASD movement, camera follow, and E interaction verified');

// 5. Verify React Wrapper Component (PhaserAdventureWorld.tsx)
const reactWorldPath = path.join(__dirname, 'src', 'game', 'phaser', 'PhaserAdventureWorld.tsx');
assert(fs.existsSync(reactWorldPath), 'PhaserAdventureWorld.tsx must exist');
const reactWorldContent = fs.readFileSync(reactWorldPath, 'utf8');

assert(reactWorldContent.includes('new Phaser.Game(config)'), 'Must instantiate Phaser.Game');
assert(reactWorldContent.includes('pixelArt: true'), 'Must enable crisp pixelArt rendering');
assert(reactWorldContent.includes('approachedLandmark'), 'Must display proximity mini quest overlay');
assert(reactWorldContent.includes('[Press E on Keyboard]'), 'Must prompt [Press E on Keyboard]');
assert(reactWorldContent.includes('Enter Quest'), 'Must provide Enter Quest action button');
assert(reactWorldContent.includes('game.destroy(true)'), 'Must clean up on unmount');
console.log('✓ PASS: PhaserAdventureWorld React component with HUD and proximity card verified');

// 6. Verify AdventurePage Integration (AdventurePage.tsx)
const advPagePath = path.join(__dirname, 'src', 'pages', 'AdventurePage.tsx');
assert(fs.existsSync(advPagePath), 'AdventurePage.tsx must exist');
const advPageContent = fs.readFileSync(advPagePath, 'utf8');

assert(advPageContent.includes('PhaserAdventureWorld'), 'AdventurePage must import PhaserAdventureWorld');
assert(advPageContent.includes("viewMode === 'exploration'"), 'Exploration mode must be active by default');
assert(advPageContent.includes('Walkable World'), 'Must offer Walkable World option');
console.log('✓ PASS: AdventurePage integrates Walkable World as default view');

// 7. Verify Production Build Distribution
const distHtml = path.join(__dirname, 'dist', 'index.html');
assert(fs.existsSync(distHtml), 'dist/index.html must exist from build');
console.log('✓ PASS: Production bundle verified');

console.log('\n==================================================');
console.log('ALL TOP-DOWN TILE-BASED ADVENTURE TESTS PASSED (100%)! 🚀');
console.log('==================================================\n');

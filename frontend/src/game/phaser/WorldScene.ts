import Phaser from 'phaser';
import { generateTileTextures } from './tileTextures';
import { buildWorldMap, MAP_COLS, MAP_ROWS, TILE_SIZE, type LandmarkZone } from './worldMapData';
import type { ProgressState, LevelStatus } from '../../types/progress';
import type { Level } from '../../types/world';

export interface WorldSceneConfig {
  progress: ProgressState;
  levels: Level[];
  onApproachLandmark?: (landmark: LandmarkZone, level: Level, status: LevelStatus) => void;
  onLeaveLandmark?: () => void;
  onInteractLandmark?: (level: Level) => void;
  onPlayerMove?: (x: number, y: number) => void;
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    ENTER: Phaser.Input.Keyboard.Key;
  };
  private obstaclesGroup!: Phaser.Physics.Arcade.StaticGroup;
  private currentApproachedLandmark: LandmarkZone | null = null;
  private interactionBubble!: Phaser.GameObjects.Container;
  private landmarkSprites: Map<number, { building: Phaser.GameObjects.Sprite; statusText: Phaser.GameObjects.Text; aura?: Phaser.GameObjects.Arc }> = new Map();
  private lastFacing: 'down' | 'up' | 'left' | 'right' = 'down';

  public configData: WorldSceneConfig;

  constructor() {
    super({ key: 'WorldScene' });
    this.configData = {
      progress: {
        userId: 'local-user',
        activeWorldId: 'data-cleaning',
        completedLevels: [],
        currentLevelId: 'quest-1-meet-the-data',
        levelStates: {},
      },
      levels: [],
    };
  }

  init(data: WorldSceneConfig) {
    if (data) {
      this.configData = { ...this.configData, ...data };
    }
  }

  preload() {
    // Generate procedural pixel-art tiles & player spritesheet in memory
    generateTileTextures(this);
  }

  create() {
    const { ground, objects, landmarks } = buildWorldMap();

    // 1. RENDER GROUND TILES
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const tileKey = ground[r][c];
        this.add.image(c * TILE_SIZE + 16, r * TILE_SIZE + 16, tileKey).setDepth(0);
      }
    }

    // 2. SETUP STATIC OBSTACLES PHYSICS GROUP
    this.obstaclesGroup = this.physics.add.staticGroup();

    // Water collision (every water tile is solid except bridges)
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (ground[r][c] === 'tile_water') {
          const zone = this.add.zone(c * TILE_SIZE + 16, r * TILE_SIZE + 16, TILE_SIZE, TILE_SIZE);
          this.physics.add.existing(zone, true);
          this.obstaclesGroup.add(zone);
        }
      }
    }

    // Objects (Trees, Fences, Bushes, Lamps, Rails)
    objects.forEach((obj) => {
      const sprite = this.add.image(obj.x + 16, obj.y + 16, obj.texture);
      sprite.setDepth(obj.y + 16);

      if (obj.collides) {
        this.physics.add.existing(sprite, true);
        const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
        if (obj.texture === 'tile_tree') {
          // Tree collision only on trunk (lower half)
          body.setSize(24, 20);
          body.setOffset(20, 40);
        } else if (obj.texture === 'tile_bush') {
          body.setSize(24, 24);
          body.setOffset(4, 4);
        } else if (obj.texture === 'tile_fence') {
          body.setSize(32, 16);
          body.setOffset(0, 10);
        } else {
          body.setSize(24, 24);
        }
        this.obstaclesGroup.add(sprite);
      }
    });

    // 3. RENDER QUEST LANDMARKS
    landmarks.forEach((lm) => {
      const worldX = lm.tileX * TILE_SIZE + 48; // Center of 96px width
      const worldY = lm.tileY * TILE_SIZE + 48;

      const building = this.add.sprite(worldX, worldY, lm.buildingType);
      building.setDepth(worldY + 20);

      // Building Collision Box (solid base)
      this.physics.add.existing(building, true);
      const bBody = building.body as Phaser.Physics.Arcade.StaticBody;
      bBody.setSize(80, 48);
      bBody.setOffset(8, 40);
      this.obstaclesGroup.add(building);

      // Status text banner
      const statusText = this.add.text(worldX, worldY - 54, `Quest ${lm.order}: ${lm.name}`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#0f172a',
        padding: { x: 6, y: 3 },
      });
      statusText.setOrigin(0.5, 0.5);
      statusText.setDepth(worldY + 100);

      // Status indicator ring / aura
      const aura = this.add.circle(worldX, worldY + 24, 28, 0x38bdf8, 0.25);
      aura.setDepth(1);

      this.landmarkSprites.set(lm.order, { building, statusText, aura });
    });

    // 4. SETUP PLAYER CHARACTER
    // Spawn at Data Village: tile x=20, y=10
    const spawnX = 20.5 * TILE_SIZE;
    const spawnY = 10 * TILE_SIZE;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_sheet', 0);
    this.player.setCollideWorldBounds(true);
    // Depth sorted by feet position
    this.player.setDepth(spawnY + 16);

    // Tight collision box for feet (20w x 14h)
    this.player.setSize(20, 14);
    this.player.setOffset(6, 18);

    // Create Animations
    this.createAnimations();

    // 5. COLLIDERS
    this.physics.add.collider(this.player, this.obstaclesGroup);

    // 6. CAMERA SETUP
    const mapWidthPx = MAP_COLS * TILE_SIZE;
    const mapHeightPx = MAP_ROWS * TILE_SIZE;
    this.physics.world.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.35);

    // 7. INPUT CONTROLS
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      E: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      SPACE: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ENTER: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    };

    // 8. INTERACTION PROMPT BUBBLE (Follows player or landmark)
    const bubbleBg = this.add.rectangle(0, 0, 120, 24, 0x0f172a, 0.95);
    bubbleBg.setStrokeStyle(1.5, 0xfbbf24);
    const bubbleText = this.add.text(0, 0, '✦ Press E to Enter', {
      fontFamily: 'monospace',
      fontSize: '9.5px',
      fontStyle: 'bold',
      color: '#facc15',
    }).setOrigin(0.5, 0.5);

    this.interactionBubble = this.add.container(0, 0, [bubbleBg, bubbleText]);
    this.interactionBubble.setDepth(9999);
    this.interactionBubble.setVisible(false);

    // Floating bob animation for bubble
    this.tweens.add({
      targets: this.interactionBubble,
      y: '+=4',
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 9. REFRESH VISUAL PROGRESS STATES
    this.refreshLandmarkStates();
  }

  private createAnimations() {
    const anims = this.anims;

    // Walk Down (Row 0: 0, 1, 2)
    anims.create({
      key: 'walk-down',
      frames: anims.generateFrameNumbers('player_sheet', { frames: [1, 0, 2, 0] }),
      frameRate: 8,
      repeat: -1,
    });
    // Walk Left (Row 1: 3, 4, 5)
    anims.create({
      key: 'walk-left',
      frames: anims.generateFrameNumbers('player_sheet', { frames: [4, 3, 5, 3] }),
      frameRate: 8,
      repeat: -1,
    });
    // Walk Right (Row 2: 6, 7, 8)
    anims.create({
      key: 'walk-right',
      frames: anims.generateFrameNumbers('player_sheet', { frames: [7, 6, 8, 6] }),
      frameRate: 8,
      repeat: -1,
    });
    // Walk Up (Row 3: 9, 10, 11)
    anims.create({
      key: 'walk-up',
      frames: anims.generateFrameNumbers('player_sheet', { frames: [10, 9, 11, 9] }),
      frameRate: 8,
      repeat: -1,
    });
  }

  public getLevelStatus(order: number): LevelStatus {
    const level = this.configData.levels.find((l) => l.order === order);
    if (!level) return order === 1 ? 'AVAILABLE' : 'LOCKED';

    if (this.configData.progress.levelStates && this.configData.progress.levelStates[level.id]) {
      return this.configData.progress.levelStates[level.id].status;
    }
    if (this.configData.progress.completedLevels.includes(level.id)) {
      return 'COMPLETED';
    }
    if (order === 1) return 'AVAILABLE';

    // Unlocked if previous is completed
    const prevLevel = this.configData.levels.find((l) => l.order === order - 1);
    if (prevLevel && this.configData.progress.completedLevels.includes(prevLevel.id)) {
      return 'AVAILABLE';
    }

    return 'LOCKED';
  }

  public refreshLandmarkStates() {
    this.landmarkSprites.forEach((data, order) => {
      const status = this.getLevelStatus(order);

      if (status === 'COMPLETED' || status === 'MASTERED') {
        data.building.clearTint();
        data.statusText.setColor('#34d399');
        data.statusText.setText(`✓ Quest ${order} (Cleared)`);
        if (data.aura) {
          data.aura.setFillStyle(0x10b981, 0.4);
          data.aura.setVisible(true);
        }
      } else if (status === 'AVAILABLE' || status === 'IN_PROGRESS') {
        data.building.clearTint();
        data.statusText.setColor('#facc15');
        data.statusText.setText(`✦ Quest ${order} (Active)`);
        if (data.aura) {
          data.aura.setFillStyle(0xf59e0b, 0.45);
          data.aura.setVisible(true);
        }
      } else {
        // Locked
        data.building.setTint(0x64748b);
        data.statusText.setColor('#94a3b8');
        data.statusText.setText(`🔒 Quest ${order} (Locked)`);
        if (data.aura) {
          data.aura.setVisible(false);
        }
      }
    });
  }

  public updateProgress(progress: ProgressState, levels?: Level[]) {
    this.configData.progress = progress;
    if (levels) this.configData.levels = levels;
    this.refreshLandmarkStates();
  }

  update() {
    if (!this.player) return;

    // Depth sort player based on y position (feet)
    this.player.setDepth(this.player.y + 14);

    const speed = 150;
    let vx = 0;
    let vy = 0;

    // Directional Input
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      vx = -speed;
      this.lastFacing = 'left';
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      vx = speed;
      this.lastFacing = 'right';
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      vy = -speed;
      this.lastFacing = 'up';
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      vy = speed;
      this.lastFacing = 'down';
    }

    // Normalize diagonal velocity
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Play walk or idle animation
    if (vx !== 0 || vy !== 0) {
      this.player.anims.play(`walk-${this.lastFacing}`, true);
    } else {
      this.player.anims.stop();
      // Set to idle frame: down=0, left=3, right=6, up=9
      const idleFrame =
        this.lastFacing === 'down' ? 0 : this.lastFacing === 'left' ? 3 : this.lastFacing === 'right' ? 6 : 9;
      this.player.setFrame(idleFrame);
    }

    // Proximity check to Landmark Trigger zones
    this.checkLandmarkProximity();

    // Check interaction key: E, Space, or Enter
    if (
      Phaser.Input.Keyboard.JustDown(this.keys.E) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keys.ENTER)
    ) {
      this.triggerInteraction();
    }
  }

  private checkLandmarkProximity() {
    const px = this.player.x;
    const py = this.player.y;
    let foundLandmark: LandmarkZone | null = null;

    for (const lm of buildWorldMap().landmarks) {
      // Check if player is near trigger area
      const dist = Phaser.Math.Distance.Between(px, py, lm.triggerX + lm.triggerW / 2, lm.triggerY + lm.triggerH / 2);
      if (dist < 64) {
        foundLandmark = lm;
        break;
      }
    }

    if (foundLandmark !== this.currentApproachedLandmark) {
      this.currentApproachedLandmark = foundLandmark;

      if (foundLandmark) {
        const level = this.configData.levels.find((l) => l.order === foundLandmark!.order);
        const status = this.getLevelStatus(foundLandmark.order);

        // Position bubble above player
        this.interactionBubble.setPosition(this.player.x, this.player.y - 36);
        this.interactionBubble.setVisible(true);

        if (this.configData.onApproachLandmark && level) {
          this.configData.onApproachLandmark(foundLandmark, level, status);
        }
      } else {
        this.interactionBubble.setVisible(false);
        if (this.configData.onLeaveLandmark) {
          this.configData.onLeaveLandmark();
        }
      }
    } else if (foundLandmark && this.interactionBubble.visible) {
      // Update bubble position smoothly
      this.interactionBubble.setPosition(this.player.x, this.player.y - 36);
    }
  }

  public triggerInteraction() {
    if (!this.currentApproachedLandmark) return;

    const level = this.configData.levels.find((l) => l.order === this.currentApproachedLandmark!.order);
    if (!level) return;

    const status = this.getLevelStatus(this.currentApproachedLandmark.order);
    if (status === 'LOCKED') {
      // Camera shake or lock audio feedback
      this.cameras.main.shake(150, 0.005);
      return;
    }

    if (this.configData.onInteractLandmark) {
      this.configData.onInteractLandmark(level);
    }
  }

  public teleportToLandmark(order: number) {
    const lm = buildWorldMap().landmarks.find((l) => l.order === order);
    if (lm && this.player) {
      this.player.setPosition(lm.triggerX + lm.triggerW / 2, lm.triggerY + lm.triggerH / 2);
    }
  }
}

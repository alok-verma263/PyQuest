import Phaser from 'phaser';
import { generateTileTextures } from './tileTextures';
import { buildWorldMap, MAP_COLS, MAP_ROWS, TILE_SIZE, type LandmarkZone, type WorldMapDataResult } from './worldMapData';
import type { ProgressState, LevelStatus } from '../../types/progress';
import type { Level } from '../../types/world';
import type { GraphicsQuality } from '../../services/storageService';

export interface WorldSceneConfig {
  progress: ProgressState;
  levels: Level[];
  graphicsQuality?: GraphicsQuality;
  onApproachLandmark?: (landmark: LandmarkZone, level: Level, status: LevelStatus) => void;
  onLeaveLandmark?: () => void;
  onInteractLandmark?: (level: Level) => void;
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

  // Cached map data & performance throttles
  private mapData!: WorldMapDataResult;
  private lastProximityCheck = 0;
  private isPaused = false;
  private waterTiles: Phaser.GameObjects.Image[] = [];
  private waterTimer?: Phaser.Time.TimerEvent;

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
      graphicsQuality: 'high',
    };
  }

  init(data: WorldSceneConfig) {
    if (data) {
      this.configData = { ...this.configData, ...data };
    }
  }

  preload() {
    // Generate all procedural 32x32 tiles, tree variants, and player spritesheet
    generateTileTextures(this);
  }

  create() {
    // 1. LOAD & CACHE MAP DATA (Computed once, never inside update loop!)
    this.mapData = buildWorldMap();
    const { ground, objects, waterColliders, landmarks } = this.mapData;

    const mapWidthPx = MAP_COLS * TILE_SIZE;
    const mapHeightPx = MAP_ROWS * TILE_SIZE;

    // 2. RENDER GROUND TILES WITH ULTRA-FAST RENDER TEXTURE
    // Consolidates 3,360 individual GameObjects into 1 single static texture!
    const groundRT = this.add.renderTexture(0, 0, mapWidthPx, mapHeightPx).setDepth(0);

    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const tileKey = ground[r][c];
        // Don't bake water into static RT if on HIGH graphics quality so water ripples can animate
        if (tileKey !== 'tile_water') {
          groundRT.draw(tileKey, c * TILE_SIZE, r * TILE_SIZE);
        }
      }
    }

    // 3. RENDER WATER WITH OPTIONAL HIGH-QUALITY ANIMATION
    this.waterTiles = [];
    const isHighQuality = this.configData.graphicsQuality !== 'low';

    for (let r = 14; r <= 16; r++) {
      for (let c = 3; c < MAP_COLS - 3; c++) {
        if (ground[r][c] === 'tile_water') {
          const waterImg = this.add.image(c * TILE_SIZE + 16, r * TILE_SIZE + 16, 'tile_water').setDepth(0);
          this.waterTiles.push(waterImg);
        }
      }
    }

    if (isHighQuality && this.waterTiles.length > 0) {
      // Subtle 1.2s alternating wave ripple cycle
      let waveToggle = false;
      this.waterTimer = this.time.addEvent({
        delay: 1200,
        loop: true,
        callback: () => {
          waveToggle = !waveToggle;
          const tex = waveToggle ? 'tile_water_wave' : 'tile_water';
          for (let i = 0; i < this.waterTiles.length; i++) {
            this.waterTiles[i].setTexture(tex);
          }
        },
      });
    }

    // 4. SETUP STATIC OBSTACLES PHYSICS GROUP
    this.obstaclesGroup = this.physics.add.staticGroup();

    // 4a. Consolidated Water Colliders (Just 2 bounding boxes for the whole river!)
    waterColliders.forEach((wc) => {
      const zone = this.add.zone(wc.x + wc.w / 2, wc.y + wc.h / 2, wc.w, wc.h);
      this.physics.add.existing(zone, true);
      this.obstaclesGroup.add(zone);
    });

    // 4b. Static Objects (Varied Trees, Fences, Bushes, Rocks, Lamps, Rails)
    objects.forEach((obj) => {
      const sprite = this.add.image(obj.x + 16, obj.y + 16, obj.texture);
      sprite.setDepth(obj.y + 16);

      if (obj.collides) {
        this.physics.add.existing(sprite, true);
        const body = sprite.body as Phaser.Physics.Arcade.StaticBody;

        if (obj.isTree) {
          // Precise trunk collision box for smooth walking around canopies
          body.setSize(20, 16);
          body.setOffset(22, 42);
        } else if (obj.texture === 'tile_bush') {
          body.setSize(24, 22);
          body.setOffset(4, 5);
        } else if (obj.texture === 'tile_fence') {
          body.setSize(32, 14);
          body.setOffset(0, 12);
        } else if (obj.texture === 'tile_rock') {
          body.setSize(22, 16);
          body.setOffset(5, 12);
        } else {
          body.setSize(24, 24);
        }
        this.obstaclesGroup.add(sprite);
      }
    });

    // 5. RENDER QUEST LANDMARKS
    landmarks.forEach((lm) => {
      const worldX = lm.tileX * TILE_SIZE + 48; // Center of 96px width
      const worldY = lm.tileY * TILE_SIZE + 48;

      const building = this.add.sprite(worldX, worldY, lm.buildingType);
      building.setDepth(worldY + 20);

      // Building Collision Box (solid base, entrance open)
      this.physics.add.existing(building, true);
      const bBody = building.body as Phaser.Physics.Arcade.StaticBody;
      bBody.setSize(80, 44);
      bBody.setOffset(8, 44);
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

    // 6. SETUP PLAYER CHARACTER
    // Spawn at Data Village: tile x=20, y=10
    const spawnX = 20.5 * TILE_SIZE;
    const spawnY = 10 * TILE_SIZE;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_sheet', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(spawnY + 16);

    // Frictionless feet collision box for zero corner-sticking
    this.player.setSize(18, 12);
    this.player.setOffset(7, 19);

    // Create Animations
    this.createAnimations();

    // 7. COLLIDERS
    this.physics.add.collider(this.player, this.obstaclesGroup);

    // 8. CAMERA SETUP (CRITICAL: roundPixels: true completely eliminates subpixel jitter)
    this.physics.world.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(1.35);

    // 9. INPUT CONTROLS
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

    // 10. INTERACTION PROMPT BUBBLE
    const bubbleBg = this.add.rectangle(0, 0, 124, 24, 0x0f172a, 0.95);
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

    // 11. REFRESH VISUAL PROGRESS STATES
    this.refreshLandmarkStates();
  }

  private createAnimations() {
    const anims = this.anims;

    if (!anims.exists('walk-down')) {
      anims.create({
        key: 'walk-down',
        frames: anims.generateFrameNumbers('player_sheet', { frames: [1, 0, 2, 0] }),
        frameRate: 8,
        repeat: -1,
      });
      anims.create({
        key: 'walk-left',
        frames: anims.generateFrameNumbers('player_sheet', { frames: [4, 3, 5, 3] }),
        frameRate: 8,
        repeat: -1,
      });
      anims.create({
        key: 'walk-right',
        frames: anims.generateFrameNumbers('player_sheet', { frames: [7, 6, 8, 6] }),
        frameRate: 8,
        repeat: -1,
      });
      anims.create({
        key: 'walk-up',
        frames: anims.generateFrameNumbers('player_sheet', { frames: [10, 9, 11, 9] }),
        frameRate: 8,
        repeat: -1,
      });
    }
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

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused && this.player) {
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
    }
  }

  public setGraphicsQuality(quality: GraphicsQuality) {
    this.configData.graphicsQuality = quality;
    if (quality === 'low' && this.waterTimer) {
      this.waterTimer.remove();
      this.waterTimer = undefined;
      for (const wt of this.waterTiles) {
        wt.setTexture('tile_water');
      }
    }
  }

  update(time: number) {
    if (!this.player || this.isPaused) return;

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

    // Exact diagonal normalization (prevents faster diagonal movement)
    if (vx !== 0 && vy !== 0) {
      vx *= 0.70710678;
      vy *= 0.70710678;
    }

    this.player.setVelocity(vx, vy);

    // Play walk or idle animation
    if (vx !== 0 || vy !== 0) {
      this.player.anims.play(`walk-${this.lastFacing}`, true);
    } else {
      this.player.anims.stop();
      const idleFrame =
        this.lastFacing === 'down' ? 0 : this.lastFacing === 'left' ? 3 : this.lastFacing === 'right' ? 6 : 9;
      this.player.setFrame(idleFrame);
    }

    // Proximity check throttled to every 100ms (CRITICAL: avoids heavy per-frame checks)
    if (time > this.lastProximityCheck + 100) {
      this.lastProximityCheck = time;
      this.checkLandmarkProximity();
    } else if (this.currentApproachedLandmark && this.interactionBubble.visible) {
      this.interactionBubble.setPosition(this.player.x, this.player.y - 36);
    }

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

    // Use cached landmarks from mapData (NO RE-ALLOCATION!)
    const landmarks = this.mapData.landmarks;
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
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
      this.interactionBubble.setPosition(this.player.x, this.player.y - 36);
    }
  }

  public triggerInteraction() {
    if (!this.currentApproachedLandmark) return;

    const level = this.configData.levels.find((l) => l.order === this.currentApproachedLandmark!.order);
    if (!level) return;

    const status = this.getLevelStatus(this.currentApproachedLandmark.order);
    if (status === 'LOCKED') {
      this.cameras.main.shake(120, 0.004);
      return;
    }

    if (this.configData.onInteractLandmark) {
      this.configData.onInteractLandmark(level);
    }
  }

  public teleportToLandmark(order: number) {
    const lm = this.mapData.landmarks.find((l) => l.order === order);
    if (lm && this.player) {
      this.player.setPosition(lm.triggerX + lm.triggerW / 2, lm.triggerY + lm.triggerH / 2);
      this.cameras.main.centerOn(this.player.x, this.player.y);
    }
  }
}

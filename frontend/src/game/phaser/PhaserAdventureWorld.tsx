import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { WorldScene } from './WorldScene';
import type { LandmarkZone } from './worldMapData';
import type { World, Level } from '../../types/world';
import type { ProgressState, LevelStatus } from '../../types/progress';
import type { PlayerProfile } from '../../types/profile';
import { DATA_CLEANING_LANDMARKS } from '../../data/questLandmarks';
import { StorageService, type GraphicsQuality } from '../../services/storageService';
import { Button } from '../../components/common/Button';
import {
  Compass,
  Sparkles,
  Coins,
  Lock,
  CheckCircle2,
  ArrowRight,
  Play,
  Eye,
  Maximize2,
  Minimize2,
  Sliders,
  Pause,
  X,
} from 'lucide-react';

export interface PhaserAdventureWorldProps {
  world: World;
  progress: ProgressState;
  profile: PlayerProfile;
  onStartLevel: (level: Level) => void;
  onPlaySound: (sound: 'click' | 'level-select') => void;
}

export const PhaserAdventureWorld: React.FC<PhaserAdventureWorldProps> = ({
  world,
  progress,
  profile,
  onStartLevel,
  onPlaySound,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<WorldScene | null>(null);

  // Settings & Display State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImmersive, setIsImmersive] = useState<boolean>(() => StorageService.getImmersiveMode());
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>(() => StorageService.getGraphicsQuality());
  const [isPaused, setIsPaused] = useState(false);

  const [approachedLandmark, setApproachedLandmark] = useState<{
    landmark: LandmarkZone;
    level: Level;
    status: LevelStatus;
  } | null>(null);

  const progressRef = useRef(progress);
  const worldRef = useRef(world);
  const onStartLevelRef = useRef(onStartLevel);
  const onPlaySoundRef = useRef(onPlaySound);
  const graphicsQualityRef = useRef(graphicsQuality);

  useEffect(() => {
    progressRef.current = progress;
    worldRef.current = world;
    onStartLevelRef.current = onStartLevel;
    onPlaySoundRef.current = onPlaySound;
    graphicsQualityRef.current = graphicsQuality;
  }, [progress, world, onStartLevel, onPlaySound, graphicsQuality]);

  // 1. INITIALIZE PHASER GAME INSTANCE WITH PIXEL-ART & PERFORMANCE FLAGS
  useEffect(() => {
    if (!canvasWrapperRef.current || gameRef.current) return;

    const baseWidth = 1024;
    const baseHeight = 580;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: canvasWrapperRef.current,
      width: baseWidth,
      height: baseHeight,
      render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [WorldScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.once('ready', () => {
      const scene = game.scene.getScene('WorldScene') as WorldScene;
      sceneRef.current = scene;

      scene.configData = {
        progress: progressRef.current,
        levels: worldRef.current.levels,
        graphicsQuality: graphicsQualityRef.current,
        onApproachLandmark: (lm, lvl, st) => {
          setApproachedLandmark({ landmark: lm, level: lvl, status: st });
        },
        onLeaveLandmark: () => {
          setApproachedLandmark(null);
        },
        onInteractLandmark: (lvl) => {
          onPlaySoundRef.current('level-select');
          onStartLevelRef.current(lvl);
        },
      };

      scene.refreshLandmarkStates();
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // Update scene when progress or levels change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateProgress(progress, world.levels);
    }
  }, [progress, world.levels]);

  // Update graphics quality in scene & storage
  const handleSetGraphicsQuality = (quality: GraphicsQuality) => {
    onPlaySound('click');
    setGraphicsQuality(quality);
    StorageService.setGraphicsQuality(quality);
    if (sceneRef.current) {
      sceneRef.current.setGraphicsQuality(quality);
    }
  };

  // Toggle Immersive Mode
  const handleToggleImmersive = () => {
    onPlaySound('click');
    const next = !isImmersive;
    setIsImmersive(next);
    StorageService.setImmersiveMode(next);
  };

  // 2. FULLSCREEN API HANDLER
  const handleToggleFullscreen = async () => {
    onPlaySound('click');
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('[Fullscreen] Request failed:', err);
    }
  };

  // Fullscreen change listener to resize game canvas smoothly
  useEffect(() => {
    const onFullscreenChange = () => {
      const isNowFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isNowFull);

      if (gameRef.current) {
        if (isNowFull) {
          gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
        } else {
          gameRef.current.scale.resize(1024, 580);
        }
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  // Window resize handler (Dynamic responsive scaling without recreating game)
  useEffect(() => {
    const handleResize = () => {
      if (!gameRef.current) return;
      if (document.fullscreenElement) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. KEYBOARD SHORTCUTS: ESC FOR PAUSE MENU / FULLSCREEN EXIT
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          setIsPaused((prev) => {
            const next = !prev;
            if (sceneRef.current) sceneRef.current.setPaused(next);
            return next;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResume = () => {
    onPlaySound('click');
    setIsPaused(false);
    if (sceneRef.current) sceneRef.current.setPaused(false);
  };

  const handleStartApproached = useCallback(() => {
    if (!approachedLandmark) return;
    if (approachedLandmark.status === 'LOCKED') {
      onPlaySound('click');
      return;
    }
    onPlaySound('level-select');
    onStartLevel(approachedLandmark.level);
  }, [approachedLandmark, onStartLevel, onPlaySound]);

  const handleTeleport = (order: number) => {
    onPlaySound('click');
    if (sceneRef.current) {
      sceneRef.current.teleportToLandmark(order);
    }
  };

  const landmarkMeta = approachedLandmark
    ? DATA_CLEANING_LANDMARKS[approachedLandmark.level.order]
    : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full mx-auto overflow-hidden bg-[#060b14] transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none w-screen h-screen'
          : isImmersive
          ? 'max-w-7xl rounded-3xl border-2 border-sky-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.8)] glow-cyan-card'
          : 'max-w-5xl rounded-3xl border-2 border-sky-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-md glow-cyan-card'
      }`}
    >
      {/* TOP CONTROLS & HUD BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-950/95 border-b border-sky-950/80 text-xs z-30 relative select-none">
        <div className="flex items-center gap-3 text-slate-300 font-mono">
          <div className="flex items-center gap-1.5 text-amber-300 font-black">
            <Compass size={15} className="text-amber-400 animate-spin" />
            <span className="tracking-wide">DATA CLEANING REALM</span>
          </div>

          {/* Minimal Player Stats HUD in Fullscreen / Immersive */}
          {(isFullscreen || isImmersive) && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800 text-[11px]">
              <span className="font-bold text-white flex items-center gap-1">
                <span>🧙</span>
                <span>{profile.username}</span>
                <span className="text-amber-400 font-mono text-[10px]">Lv.{profile.level}</span>
              </span>
              <span className="flex items-center gap-1 text-sky-300 font-black">
                <Sparkles size={11} /> {profile.xp}/{profile.xpToNextLevel} XP
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-black">
                <Coins size={11} /> {profile.coins}
              </span>
            </div>
          )}

          <span className="hidden lg:inline text-slate-500">•</span>
          <span className="hidden lg:inline text-slate-400 text-[11px]">WASD to Walk • [E] to Explore</span>
        </div>

        {/* Right Actions: Travel, Quality, Immersive, Fullscreen */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Fast Travel Landmarks Navigation */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 hidden sm:inline">
              Fast Travel:
            </span>
            {world.levels.map((lvl) => {
              const isCompleted = progress.completedLevels.includes(lvl.id);
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleTeleport(lvl.order)}
                  title={`Teleport to Quest ${lvl.order}: ${lvl.title}`}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300 hover:scale-110'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-sky-400 hover:text-white'
                  }`}
                >
                  {isCompleted ? '✓' : lvl.order}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Graphics Quality Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono font-bold">
            <Sliders size={12} className="text-slate-400 ml-1.5" />
            {(['high', 'medium', 'low'] as GraphicsQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => handleSetGraphicsQuality(q)}
                title={`Set graphics quality to ${q.toUpperCase()}`}
                className={`px-1.5 py-0.5 rounded transition-all uppercase cursor-pointer ${
                  graphicsQuality === q
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {q.slice(0, 1)}
              </button>
            ))}
          </div>

          {/* Immersive Mode Toggle */}
          <button
            onClick={handleToggleImmersive}
            title={isImmersive ? 'Exit Immersive View' : 'Enter Immersive View'}
            className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center gap-1 font-mono font-bold ${
              isImmersive
                ? 'bg-amber-950 border-amber-500/60 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Eye size={13} />
            <span className="hidden xl:inline text-[10px]">Immersive</span>
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              onPlaySound('click');
              setIsPaused(true);
              if (sceneRef.current) sceneRef.current.setPaused(true);
            }}
            title="Pause Menu [Esc]"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-sky-400 transition-all cursor-pointer"
          >
            <Pause size={13} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen [Esc]' : 'Fullscreen'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-black transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-gradient-to-r from-sky-600 to-indigo-600 border-sky-400 text-white shadow-[0_0_10px_rgba(56,189,248,0.4)] hover:scale-105'
            }`}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="text-[11px] font-bold">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* PHASER CANVAS VIEWPORT CONTAINER */}
      <div
        ref={canvasWrapperRef}
        style={{ imageRendering: 'pixelated' }}
        className={`w-full bg-[#070d1a] relative flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'h-[calc(100vh-42px)]'
            : isImmersive
            ? 'h-[720px]'
            : 'h-[540px] sm:h-[600px]'
        }`}
      />

      {/* PROXIMITY MINI QUEST OVERLAY CARD */}
      {approachedLandmark && !isPaused && (
        <div className="absolute bottom-12 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="rounded-2xl border-2 border-amber-500/80 bg-slate-950/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase font-black tracking-wider text-amber-400">
                    QUEST {approachedLandmark.level.order} LOCATION
                  </span>
                  {approachedLandmark.status === 'COMPLETED' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/40">
                      <CheckCircle2 size={11} /> Cleared
                    </span>
                  ) : approachedLandmark.status === 'LOCKED' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      <Lock size={11} /> Locked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-600/50 animate-pulse">
                      ✦ Available
                    </span>
                  )}
                </div>

                <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{approachedLandmark.level.title}</span>
                </h4>

                <p className="text-xs text-slate-300 line-clamp-2 mt-1 font-sans">
                  {landmarkMeta?.description || approachedLandmark.level.description}
                </p>
              </div>

              {/* Reward preview */}
              <div className="shrink-0 flex flex-col gap-1 items-end">
                <span className="flex items-center gap-1 text-[11px] font-black text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/30">
                  <Sparkles size={11} /> +{approachedLandmark.level.xpReward} XP
                </span>
                <span className="flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  <Coins size={11} /> +{approachedLandmark.level.coinReward} Coins
                </span>
              </div>
            </div>

            {/* Checklist Preview */}
            {landmarkMeta?.learnChecklist && landmarkMeta.learnChecklist.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase text-slate-400">Topics:</span>
                {landmarkMeta.learnChecklist.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            )}

            {/* Action CTA Button */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-amber-300 font-mono font-bold animate-pulse">
                [Press E on Keyboard]
              </span>

              <Button
                variant={
                  approachedLandmark.status === 'LOCKED'
                    ? 'ghost'
                    : approachedLandmark.status === 'COMPLETED'
                    ? 'secondary'
                    : 'gold'
                }
                size="sm"
                glow={approachedLandmark.status !== 'LOCKED'}
                disabled={approachedLandmark.status === 'LOCKED'}
                onClick={handleStartApproached}
                icon={
                  approachedLandmark.status === 'LOCKED' ? (
                    <Lock size={14} />
                  ) : approachedLandmark.status === 'COMPLETED' ? (
                    <Play size={14} />
                  ) : (
                    <ArrowRight size={14} />
                  )
                }
                className="font-black px-4"
              >
                {approachedLandmark.status === 'LOCKED'
                  ? 'Locked'
                  : approachedLandmark.status === 'COMPLETED'
                  ? 'Replay Quest ↺'
                  : 'Enter Quest →'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PAUSE MENU MODAL OVERLAY */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-sky-800/60 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>⏸️</span>
                <span>GAME PAUSED</span>
              </h3>
              <button
                onClick={handleResume}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Graphics Quality */}
              <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="font-bold text-slate-300">Graphics Quality</span>
                <div className="flex items-center gap-1 font-mono font-bold">
                  {(['high', 'medium', 'low'] as GraphicsQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSetGraphicsQuality(q)}
                      className={`px-2 py-1 rounded-lg uppercase cursor-pointer ${
                        graphicsQuality === q
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Immersive Mode */}
              <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="font-bold text-slate-300">Immersive Viewport</span>
                <button
                  onClick={handleToggleImmersive}
                  className={`px-3 py-1 rounded-lg font-mono font-bold cursor-pointer ${
                    isImmersive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isImmersive ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Fullscreen Option */}
              <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="font-bold text-slate-300">Fullscreen Mode</span>
                <button
                  onClick={() => {
                    handleToggleFullscreen();
                    handleResume();
                  }}
                  className="px-3 py-1 rounded-lg bg-sky-600 text-white font-mono font-bold cursor-pointer hover:bg-sky-500"
                >
                  {isFullscreen ? 'EXIT FULLSCREEN' : 'ENTER FULLSCREEN'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="gold" size="lg" onClick={handleResume} className="w-full font-black">
                Resume Exploration →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER LEGEND BAR (hidden in fullscreen to keep view clean) */}
      {!isFullscreen && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-2 bg-[#050914] border-t border-sky-950 text-xs select-none">
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <strong className="text-slate-300">Cleared</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
              <strong className="text-amber-300">Available</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <strong className="text-slate-400">Locked</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-sky-400 font-mono text-[11px]">
            <Eye size={13} />
            <span>Walk near any building and press E to explore</span>
          </div>
        </div>
      )}
    </div>
  );
};

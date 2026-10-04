import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { WorldScene } from './WorldScene';
import type { LandmarkZone } from './worldMapData';
import type { World, Level } from '../../types/world';
import type { ProgressState, LevelStatus } from '../../types/progress';
import type { PlayerProfile } from '../../types/profile';
import { DATA_CLEANING_LANDMARKS } from '../../data/questLandmarks';
import { Button } from '../../components/common/Button';
import { Compass, Sparkles, Coins, Lock, CheckCircle2, ArrowRight, Play, Eye } from 'lucide-react';

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
  onStartLevel,
  onPlaySound,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<WorldScene | null>(null);

  const [approachedLandmark, setApproachedLandmark] = useState<{
    landmark: LandmarkZone;
    level: Level;
    status: LevelStatus;
  } | null>(null);

  const progressRef = useRef(progress);
  const worldRef = useRef(world);
  const onStartLevelRef = useRef(onStartLevel);
  const onPlaySoundRef = useRef(onPlaySound);

  useEffect(() => {
    progressRef.current = progress;
    worldRef.current = world;
    onStartLevelRef.current = onStartLevel;
    onPlaySoundRef.current = onPlaySound;
  }, [progress, world, onStartLevel, onPlaySound]);

  // Initialize Phaser Game instance
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 1024,
      height: 580,
      pixelArt: true,
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

    // Listen for scene readiness
    game.events.once('ready', () => {
      const scene = game.scene.getScene('WorldScene') as WorldScene;
      sceneRef.current = scene;

      scene.configData = {
        progress: progressRef.current,
        levels: worldRef.current.levels,
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
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-sky-900/60 bg-[#060b14] shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-md glow-cyan-card">
      {/* TOP CONTROLS & HUD BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-950/90 border-b border-sky-950/80 text-xs z-10 relative">
        <div className="flex items-center gap-2 text-slate-300 font-mono">
          <Compass size={15} className="text-amber-400 animate-spin" />
          <span className="font-bold text-amber-300">EXPLORATION WORLD</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px]">Walk: WASD or Arrow Keys</span>
          <span className="text-slate-500">•</span>
          <span className="text-sky-300 text-[11px] font-bold">[E] to Explore</span>
        </div>

        {/* Fast Travel Landmarks Navigation */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 hidden sm:inline">
            Travel:
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
      </div>

      {/* PHASER CANVAS CONTAINER */}
      <div
        ref={containerRef}
        className="w-full h-[540px] sm:h-[600px] bg-[#070d1a] relative flex items-center justify-center overflow-hidden cursor-crosshair"
      />

      {/* PROXIMITY MINI QUEST OVERLAY CARD (Shows when standing near a building) */}
      {approachedLandmark && (
        <div className="absolute bottom-14 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="rounded-2xl border-2 border-amber-500/70 bg-slate-950/95 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-md">
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

      {/* FOOTER INFO BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-2.5 bg-[#050914] border-t border-sky-950 text-xs">
        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <strong className="text-slate-300">Cleared</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
            <strong className="text-amber-300">Available</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <strong className="text-slate-400">Locked</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sky-400 font-mono text-[11px]">
          <Eye size={13} />
          <span>Walk near any building and press E to begin</span>
        </div>
      </div>
    </div>
  );
};

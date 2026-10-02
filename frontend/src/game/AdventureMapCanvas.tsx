import React, { useState } from 'react';
import type { World, Level } from '../types/world';
import type { ProgressState, LevelStatus } from '../types/progress';
import { Lock, Check, Star, Play, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';

export interface AdventureMapCanvasProps {
  world: World;
  progress: ProgressState;
  onSelectLevel: (level: Level) => void;
  onPlaySound: (sound: 'click' | 'level-select') => void;
}

export const AdventureMapCanvas: React.FC<AdventureMapCanvasProps> = ({
  world,
  progress,
  onSelectLevel,
  onPlaySound,
}) => {
  const [selectedNode, setSelectedNode] = useState<Level | null>(null);

  // Helper to get status of a level
  const getLevelStatus = (levelId: string, order: number): LevelStatus => {
    if (progress.levelStates && progress.levelStates[levelId]) {
      return progress.levelStates[levelId].status;
    }
    // Default rule: Level 1 is available, subsequent are locked
    if (order === 1) return 'AVAILABLE';
    return 'LOCKED';
  };

  const handleNodeClick = (level: Level) => {
    const status = getLevelStatus(level.id, level.order);
    if (status === 'LOCKED') {
      onPlaySound('click');
      return;
    }
    onPlaySound('level-select');
    setSelectedNode(level);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-md">
      {/* World Map Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-600/40">
              World {world.order}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Realm of Foundations
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 text-glow-mana">
            {world.title}
          </h2>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400">Available Quests</p>
          <p className="text-base font-bold text-amber-300">
            {progress.completedLevels.length} / {world.levels.length} Cleared
          </p>
        </div>
      </div>

      {/* SVG Map Canvas with Node Paths */}
      <div className="relative w-full h-[450px] sm:h-[480px] bg-adventure-grid flex items-center justify-center overflow-x-auto">
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full min-w-[700px] select-none"
        >
          {/* Ambient Map Gradients */}
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connective Paths Between Level Nodes */}
          {world.levels.map((level, idx) => {
            if (idx === world.levels.length - 1) return null;
            const nextLevel = world.levels[idx + 1];
            const isPathUnlocked = getLevelStatus(nextLevel.id, nextLevel.order) !== 'LOCKED';

            return (
              <g key={`path-${level.id}-${nextLevel.id}`}>
                {/* Path glow background */}
                <path
                  d={`M ${level.mapX} ${level.mapY} Q ${(level.mapX + nextLevel.mapX) / 2} ${(level.mapY + nextLevel.mapY) / 2 - 30} ${nextLevel.mapX} ${nextLevel.mapY}`}
                  fill="none"
                  stroke={isPathUnlocked ? '#38bdf8' : '#334155'}
                  strokeWidth="8"
                  strokeOpacity={isPathUnlocked ? '0.3' : '0.2'}
                  filter={isPathUnlocked ? 'url(#glow)' : undefined}
                />
                {/* Main animated dash path */}
                <path
                  d={`M ${level.mapX} ${level.mapY} Q ${(level.mapX + nextLevel.mapX) / 2} ${(level.mapY + nextLevel.mapY) / 2 - 30} ${nextLevel.mapX} ${nextLevel.mapY}`}
                  fill="none"
                  stroke={isPathUnlocked ? 'url(#pathGradient)' : '#475569'}
                  strokeWidth="4"
                  strokeDasharray={isPathUnlocked ? '8 6' : '6 6'}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Level Nodes */}
          {world.levels.map((level) => {
            const status = getLevelStatus(level.id, level.order);
            const isCompleted = status === 'COMPLETED' || status === 'MASTERED';
            const isAvailable = status === 'AVAILABLE' || status === 'IN_PROGRESS';
            const isLocked = status === 'LOCKED';
            const isSelected = selectedNode?.id === level.id;

            return (
              <g
                key={level.id}
                transform={`translate(${level.mapX}, ${level.mapY})`}
                className={`cursor-pointer transition-all duration-300 ${
                  isLocked ? 'cursor-not-allowed opacity-60' : 'hover:scale-110'
                }`}
                onClick={() => handleNodeClick(level)}
              >
                {/* Pulse Aura for Available Node */}
                {isAvailable && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Outer Ring */}
                <circle
                  r="28"
                  fill={isCompleted ? '#065f46' : isAvailable ? '#0f172a' : '#1e293b'}
                  stroke={
                    isSelected
                      ? '#facc15'
                      : isCompleted
                      ? '#10b981'
                      : isAvailable
                      ? '#38bdf8'
                      : '#475569'
                  }
                  strokeWidth={isSelected ? '4' : '3'}
                  filter={isAvailable || isCompleted ? 'url(#glow)' : undefined}
                />

                {/* Inner Icon */}
                {isLocked && (
                  <Lock
                    x="-10"
                    y="-10"
                    size={20}
                    className="text-slate-400"
                  />
                )}
                {isAvailable && (
                  <Play
                    x="-8"
                    y="-9"
                    size={18}
                    className="text-sky-300 fill-sky-300"
                  />
                )}
                {isCompleted && (
                  <Check
                    x="-10"
                    y="-10"
                    size={20}
                    className="text-emerald-300 font-bold"
                  />
                )}

                {/* Node Level Label */}
                <text
                  y="45"
                  textAnchor="middle"
                  fill={isLocked ? '#64748b' : '#f8fafc'}
                  fontSize="12"
                  fontWeight="bold"
                  className="select-none"
                >
                  Level {level.order}
                </text>
                <text
                  y="58"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  className="select-none"
                >
                  {level.title}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Level Inspection Flyout */}
        {selectedNode && (
          <div className="absolute bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-80 bg-slate-900/95 border-2 border-sky-500/60 rounded-2xl p-5 shadow-2xl backdrop-blur-xl z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
                Level {selectedNode.order} Quest
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                <Sparkles size={13} />
                +{selectedNode.xpReward} XP
              </div>
            </div>

            <h3 className="text-lg font-black text-white">{selectedNode.title}</h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              {selectedNode.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Star size={14} className="fill-amber-400" />
                <span>+{selectedNode.coinReward} Coins</span>
              </div>
              <Button
                variant="gold"
                size="sm"
                glow
                icon={<Play size={14} className="fill-current" />}
                onClick={() => onSelectLevel(selectedNode)}
              >
                Enter Quest
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-6 py-3 bg-slate-950/90 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-700" />
          <span>Locked</span>
        </div>
      </div>
    </div>
  );
};

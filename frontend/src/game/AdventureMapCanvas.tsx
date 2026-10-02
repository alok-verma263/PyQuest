import React from 'react';
import type { World, Level } from '../types/world';
import type { ProgressState, LevelStatus } from '../types/progress';
import type { PlayerProfile } from '../types/profile';
import { AVATAR_OPTIONS } from '../data/defaultCurriculum';
import { Lock, Check, Play, Sparkles } from 'lucide-react';

export interface AdventureMapCanvasProps {
  world: World;
  progress: ProgressState;
  profile: PlayerProfile;
  onOpenLevelOverview: (level: Level) => void;
  onPlaySound: (sound: 'click' | 'level-select') => void;
}

export const AdventureMapCanvas: React.FC<AdventureMapCanvasProps> = ({
  world,
  progress,
  profile,
  onOpenLevelOverview,
  onPlaySound,
}) => {
  // Find player's avatar
  const avatar = AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];

  // Helper to determine status of each level
  const getLevelStatus = (levelId: string, order: number): LevelStatus => {
    if (progress.levelStates && progress.levelStates[levelId]) {
      return progress.levelStates[levelId].status;
    }
    // Only Level 1 starts AVAILABLE
    if (order === 1) return 'AVAILABLE';
    return 'LOCKED';
  };

  // Determine which node the player avatar currently stands on
  const activeLevelNode =
    world.levels.find((l) => getLevelStatus(l.id, l.order) === 'AVAILABLE') ||
    world.levels[world.levels.length - 1];

  const handleNodeClick = (level: Level) => {
    const status = getLevelStatus(level.id, level.order);
    if (status === 'LOCKED') {
      onPlaySound('click');
      return;
    }
    onPlaySound('level-select');
    onOpenLevelOverview(level);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950/85 shadow-2xl backdrop-blur-md">
      {/* World Map Header */}
      <div className="px-6 py-5 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-transparent border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-600/40">
              World {world.order}
            </span>
            <span className="text-xs text-amber-400 font-bold">
              PyQuest Odyssey
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 text-glow-mana">
            {world.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {world.description}
          </p>
        </div>

        <div className="text-left sm:text-right bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 shrink-0">
          <p className="text-[11px] text-slate-400 font-bold uppercase">Map Progress</p>
          <p className="text-base font-black text-amber-300">
            {progress.completedLevels.length} / {world.levels.length} Cleared
          </p>
        </div>
      </div>

      {/* SVG Map Canvas with Animated Trails & Nodes */}
      <div className="relative w-full h-[460px] sm:h-[490px] bg-adventure-grid flex items-center justify-center overflow-x-auto">
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full min-w-[700px] select-none"
        >
          {/* Gradient & Glow Filters */}
          <defs>
            <linearGradient id="unlockedTrail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
            </linearGradient>
            <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Winding Adventure Paths Between Level Nodes */}
          {world.levels.map((level, idx) => {
            if (idx === world.levels.length - 1) return null;
            const nextLevel = world.levels[idx + 1];
            const isPathUnlocked = getLevelStatus(nextLevel.id, nextLevel.order) !== 'LOCKED';

            return (
              <g key={`path-${level.id}-${nextLevel.id}`}>
                {/* Outer Glow Path */}
                <path
                  d={`M ${level.mapX} ${level.mapY} Q ${(level.mapX + nextLevel.mapX) / 2} ${(level.mapY + nextLevel.mapY) / 2 - 40} ${nextLevel.mapX} ${nextLevel.mapY}`}
                  fill="none"
                  stroke={isPathUnlocked ? '#38bdf8' : '#1e293b'}
                  strokeWidth="8"
                  strokeOpacity={isPathUnlocked ? '0.4' : '0.2'}
                  filter={isPathUnlocked ? 'url(#nodeGlow)' : undefined}
                />
                {/* Inner Dashed Trail */}
                <path
                  d={`M ${level.mapX} ${level.mapY} Q ${(level.mapX + nextLevel.mapX) / 2} ${(level.mapY + nextLevel.mapY) / 2 - 40} ${nextLevel.mapX} ${nextLevel.mapY}`}
                  fill="none"
                  stroke={isPathUnlocked ? 'url(#unlockedTrail)' : '#334155'}
                  strokeWidth="4"
                  strokeDasharray={isPathUnlocked ? '8 6' : '4 6'}
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
            const isCurrentNode = activeLevelNode?.id === level.id;

            return (
              <g
                key={level.id}
                transform={`translate(${level.mapX}, ${level.mapY})`}
                className={`transition-all duration-300 ${
                  isLocked
                    ? 'cursor-not-allowed opacity-65'
                    : 'cursor-pointer hover:scale-110'
                }`}
                onClick={() => handleNodeClick(level)}
              >
                {/* Active Pulse Animation */}
                {isAvailable && (
                  <circle
                    r="36"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    opacity="0.5"
                    className="animate-ping"
                  />
                )}

                {/* Main Node Base */}
                <circle
                  r="30"
                  fill={isCompleted ? '#064e3b' : isAvailable ? '#0f172a' : '#111827'}
                  stroke={
                    isCompleted
                      ? '#10b981'
                      : isAvailable
                      ? '#38bdf8'
                      : '#374151'
                  }
                  strokeWidth={isAvailable || isCompleted ? '3.5' : '2.5'}
                  filter={isAvailable || isCompleted ? 'url(#nodeGlow)' : undefined}
                />

                {/* Node Status Icon */}
                {isLocked && (
                  <Lock
                    x="-10"
                    y="-10"
                    size={20}
                    className="text-slate-500"
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
                    className="text-emerald-300 stroke-[3]"
                  />
                )}

                {/* Level Title and Order Labels */}
                <text
                  y="48"
                  textAnchor="middle"
                  fill={isLocked ? '#64748b' : '#f8fafc'}
                  fontSize="12"
                  fontWeight="bold"
                  className="select-none font-sans"
                >
                  Level {level.order}
                </text>
                <text
                  y="62"
                  textAnchor="middle"
                  fill={isLocked ? '#475569' : '#94a3b8'}
                  fontSize="10"
                  fontWeight="medium"
                  className="select-none font-sans"
                >
                  {level.title}
                </text>

                {/* Player Avatar Pawn standing on current active node */}
                {isCurrentNode && (
                  <g transform="translate(0, -42)" className="animate-bounce">
                    <circle
                      r="16"
                      fill="#0f172a"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    <text
                      y="5"
                      textAnchor="middle"
                      fontSize="14"
                      className="select-none"
                    >
                      {avatar.emoji}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend & Level Status Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-slate-950/95 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            <span className="text-slate-300 font-semibold">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-slate-300 font-semibold">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700" />
            <span className="text-slate-500">Locked</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles size={14} className="text-amber-400" />
          <span>Click any available level to view overview and begin quest</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { World, Level } from '../types/world';
import type { ProgressState, LevelStatus } from '../types/progress';
import type { PlayerProfile } from '../types/profile';
import { AVATAR_OPTIONS } from '../data/defaultCurriculum';
import { Lock, Check, Play, Sparkles, Crown } from 'lucide-react';

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
    if (order === 1) return 'AVAILABLE';
    return 'LOCKED';
  };

  // Determine active level node
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

  const isDataCleaning = world.id === 'data-cleaning';

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-sky-900/50 bg-[#070c18] shadow-2xl backdrop-blur-md glow-cyan-card">
      {/* SVG Map Canvas with Animated Data Stream Trails & Circular Quest Nodes */}
      <div className="relative w-full h-[470px] sm:h-[500px] bg-tech-grid flex items-center justify-center overflow-x-auto">
        <svg
          viewBox="0 0 960 480"
          className="w-full h-full min-w-[840px] select-none"
        >
          {/* Gradient & Glow Filters */}
          <defs>
            <linearGradient id="unlockedDataTrail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="bossTrail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.95" />
            </linearGradient>
            <filter id="dataGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="nodeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Environmental Background: Data-Themed Landmarks (Only for data-cleaning or general tech landscape) */}
          {isDataCleaning && (
            <g opacity="0.35">
              {/* Landmark 1: Raw CSV Stream Icon above Quest 2 */}
              <g transform="translate(190, 95)">
                <rect x="-24" y="-20" width="48" height="40" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  .CSV
                </text>
                <circle cx="-16" cy="-12" r="2" fill="#38bdf8" />
                <line x1="-10" y1="-8" x2="16" y2="-8" stroke="#334155" strokeWidth="1.5" />
                <line x1="-16" y1="10" x2="16" y2="10" stroke="#334155" strokeWidth="1.5" />
              </g>

              {/* Landmark 2: Database Storage Matrix above Quest 4 */}
              <g transform="translate(450, 90)">
                <rect x="-28" y="-22" width="56" height="44" rx="8" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  DATABASE
                </text>
                <circle cx="-18" cy="-14" r="2.5" fill="#10b981" />
                <circle cx="-10" cy="-14" r="2.5" fill="#38bdf8" />
                <line x1="-20" y1="12" x2="20" y2="12" stroke="#4338ca" strokeWidth="1.5" />
              </g>

              {/* Landmark 3: Distribution Curve & Histograms above Quest 6 */}
              <g transform="translate(710, 90)">
                <rect x="-28" y="-22" width="56" height="44" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                {/* SVG Curve */}
                <path d="M -20 12 Q -10 -15 0 0 T 20 12" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <text x="0" y="-12" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontFamily="monospace">
                  CHARTS
                </text>
              </g>

              {/* Landmark 4: Clean Data Portal Gate above Quest 7 */}
              <g transform="translate(840, 180)">
                <circle cx="0" cy="0" r="32" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                <text x="0" y="4" textAnchor="middle" fill="#fbbf24" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  CLEAN GATE
                </text>
              </g>
            </g>
          )}

          {/* Winding Connected Quest Paths Between Level Nodes */}
          {world.levels.map((level, idx) => {
            if (idx === world.levels.length - 1) return null;
            const nextLevel = world.levels[idx + 1];
            const isPathUnlocked = getLevelStatus(nextLevel.id, nextLevel.order) !== 'LOCKED';
            const isBossPath = nextLevel.boss;

            const pathD = `M ${level.mapX} ${level.mapY} Q ${(level.mapX + nextLevel.mapX) / 2} ${(level.mapY + nextLevel.mapY) / 2 - 40} ${nextLevel.mapX} ${nextLevel.mapY}`;

            return (
              <g key={`path-${level.id}-${nextLevel.id}`}>
                {/* Outer Glow Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isPathUnlocked ? (isBossPath ? '#f59e0b' : '#38bdf8') : '#1e293b'}
                  strokeWidth="8"
                  strokeOpacity={isPathUnlocked ? '0.35' : '0.15'}
                  filter={isPathUnlocked ? 'url(#dataGlow)' : undefined}
                />
                {/* Inner Animated Dashed Data Stream Trail */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isPathUnlocked ? (isBossPath ? 'url(#bossTrail)' : 'url(#unlockedDataTrail)') : '#334155'}
                  strokeWidth="3.5"
                  strokeDasharray={isPathUnlocked ? '8 6' : '4 6'}
                  strokeLinecap="round"
                  className={isPathUnlocked ? 'animate-data-path' : ''}
                />
              </g>
            );
          })}

          {/* Glowing Circular Quest Nodes */}
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
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:scale-110'
                }`}
                onClick={() => handleNodeClick(level)}
              >
                {/* Available Pulse Animation */}
                {isAvailable && (
                  <circle
                    r={level.boss ? '42' : '36'}
                    fill="none"
                    stroke={level.boss ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="2.5"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Main Node Base Ring */}
                <circle
                  r={level.boss ? '34' : '28'}
                  fill={
                    level.boss
                      ? isCompleted ? '#451a03' : isAvailable ? '#1e1b4b' : '#0f172a'
                      : isCompleted ? '#064e3b' : isAvailable ? '#082f49' : '#0f172a'
                  }
                  stroke={
                    level.boss
                      ? isCompleted ? '#fbbf24' : isAvailable ? '#f59e0b' : '#475569'
                      : isCompleted ? '#10b981' : isAvailable ? '#38bdf8' : '#334155'
                  }
                  strokeWidth={level.boss ? '4' : isAvailable || isCompleted ? '3.5' : '2'}
                  filter={isAvailable || isCompleted || level.boss ? 'url(#nodeGlow)' : undefined}
                />

                {/* Node Status Icon */}
                {isLocked && (
                  <Lock
                    x="-9"
                    y="-9"
                    size={18}
                    className="text-slate-500"
                  />
                )}
                {isAvailable && (
                  level.boss ? (
                    <Crown
                      x="-11"
                      y="-11"
                      size={22}
                      className="text-amber-400 fill-amber-400/30 animate-pulse"
                    />
                  ) : (
                    <Play
                      x="-7"
                      y="-8"
                      size={16}
                      className="text-sky-300 fill-sky-300"
                    />
                  )
                )}
                {isCompleted && (
                  level.boss ? (
                    <Crown
                      x="-11"
                      y="-11"
                      size={22}
                      className="text-amber-300 fill-amber-400"
                    />
                  ) : (
                    <Check
                      x="-9"
                      y="-9"
                      size={18}
                      className="text-emerald-300 stroke-[3]"
                    />
                  )
                )}

                {/* Quest Order Label */}
                <text
                  y="46"
                  textAnchor="middle"
                  fill={level.boss ? (isLocked ? '#a16207' : '#fbbf24') : (isLocked ? '#64748b' : '#38bdf8')}
                  fontSize="11"
                  fontWeight="black"
                  className="select-none font-mono"
                >
                  {level.boss ? 'FINAL TRIAL' : `QUEST ${level.order}`}
                </text>

                {/* Quest Title Label */}
                <text
                  y="60"
                  textAnchor="middle"
                  fill={isLocked ? '#475569' : '#f8fafc'}
                  fontSize="11"
                  fontWeight="bold"
                  className="select-none font-sans"
                >
                  {level.title}
                </text>

                {/* XP Reward Badge Underneath */}
                <text
                  y="73"
                  textAnchor="middle"
                  fill={isLocked ? '#334155' : '#38bdf8'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="select-none"
                >
                  +{level.xpReward} XP
                </text>

                {/* Active Player Pawn */}
                {isCurrentNode && (
                  <g transform="translate(0, -40)" className="animate-bounce">
                    <circle
                      r="15"
                      fill="#070c18"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      filter="url(#dataGlow)"
                    />
                    <text
                      y="5"
                      textAnchor="middle"
                      fontSize="13"
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
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-slate-950/95 border-t border-sky-950 text-xs">
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

        <div className="flex items-center gap-2 text-sky-400 font-mono text-[11px]">
          <Sparkles size={13} className="text-amber-400" />
          <span>Select any unlocked quest node to start learning</span>
        </div>
      </div>
    </div>
  );
};

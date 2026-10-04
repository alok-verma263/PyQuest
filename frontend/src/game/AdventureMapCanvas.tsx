import React from 'react';
import type { World, Level } from '../types/world';
import type { ProgressState, LevelStatus } from '../types/progress';
import type { PlayerProfile } from '../types/profile';
import { AVATAR_OPTIONS } from '../data/defaultCurriculum';
import { DATA_CLEANING_LANDMARKS } from '../data/questLandmarks';
import { Lock, Check, Crown } from 'lucide-react';

export interface AdventureMapCanvasProps {
  world: World;
  progress: ProgressState;
  profile: PlayerProfile;
  selectedLevelId?: string;
  onSelectLevel: (level: Level) => void;
  onOpenLevelOverview: (level: Level) => void;
  onPlaySound: (sound: 'click' | 'level-select') => void;
}

export const AdventureMapCanvas: React.FC<AdventureMapCanvasProps> = ({
  world,
  progress,
  profile,
  selectedLevelId,
  onSelectLevel,
  onPlaySound,
}) => {
  const avatar = AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];

  const getLevelStatus = (levelId: string, order: number): LevelStatus => {
    if (progress.levelStates && progress.levelStates[levelId]) {
      return progress.levelStates[levelId].status;
    }
    if (order === 1) return 'AVAILABLE';
    return 'LOCKED';
  };

  const handleNodeClick = (level: Level) => {
    onPlaySound('click');
    onSelectLevel(level);
  };

  const handleKeyDown = (e: React.KeyboardEvent, level: Level) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNodeClick(level);
    }
  };

  const isDataCleaning = world.id === 'data-cleaning';

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-sky-900/60 bg-[#060b14] shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-md glow-cyan-card">
      {/* SVG Cinematic Map Canvas */}
      <div className="relative w-full h-[540px] sm:h-[600px] flex items-center justify-center overflow-x-auto bg-[#070d1a]">
        <svg
          viewBox="0 0 1024 580"
          className="w-full h-full min-w-[960px] select-none"
        >
          {/* DEFINITIONS & GRADIENTS */}
          <defs>
            {/* Scenic Background Gradients */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#040814" />
              <stop offset="50%" stopColor="#0a162e" />
              <stop offset="100%" stopColor="#061022" />
            </linearGradient>

            <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="40%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#070c18" />
            </linearGradient>

            <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="goldenPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="unlockedPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            {/* Filters */}
            <filter id="mapGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feColorMatrix type="matrix" values="1 0 0 0 0.98  0 1 0 0 0.75  0 0 1 0 0.1  0 0 0 1 0" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. SCENIC BACKGROUND: Deep Night Sky & Tech Grid */}
          <rect width="1024" height="580" fill="url(#skyGrad)" />

          {/* Grid lines overlay */}
          <g opacity="0.06" stroke="#38bdf8" strokeWidth="1">
            {Array.from({ length: 32 }, (_, i) => (
              <line key={`v-${i}`} x1={i * 32} y1="0" x2={i * 32} y2="580" />
            ))}
            {Array.from({ length: 19 }, (_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 32} x2="1024" y2={i * 32} />
            ))}
          </g>

          {/* 2. MOUNTAIN RIDGES & ENVIRONMENT SILHOUETTES */}
          {/* Distant Mountain Peak Range */}
          <path
            d="M 0 280 L 80 160 L 160 240 L 240 120 L 340 220 L 440 90 L 520 180 L 620 100 L 720 200 L 840 80 L 940 190 L 1024 130 L 1024 580 L 0 580 Z"
            fill="#081226"
            opacity="0.9"
          />
          {/* Midground Ridges */}
          <path
            d="M 0 320 L 120 240 L 220 310 L 320 200 L 460 290 L 560 170 L 680 280 L 800 160 L 920 260 L 1024 220 L 1024 580 L 0 580 Z"
            fill="url(#mountainGrad)"
            opacity="0.95"
          />

          {/* 3. WINDING RIVER WITH WATERFALLS & GORGES */}
          {/* River Stream */}
          <path
            d="M 500 130 C 470 190, 410 240, 360 280 C 300 320, 240 370, 210 430 C 180 490, 160 540, 130 580 L 190 580 C 220 540, 240 480, 270 420 C 320 360, 370 320, 420 280 C 480 230, 520 180, 530 130 Z"
            fill="url(#riverGrad)"
            opacity="0.85"
            filter="url(#mapGlow)"
          />
          {/* Second Waterfall branch */}
          <path
            d="M 760 240 C 730 300, 710 370, 740 440 C 760 490, 800 540, 820 580 L 780 580 C 750 530, 700 480, 680 420 C 670 360, 690 300, 720 240 Z"
            fill="url(#riverGrad)"
            opacity="0.75"
            filter="url(#mapGlow)"
          />

          {/* Wooden / Stone Bridges across rivers */}
          {/* Bridge 1 (near Quest 2 / 3) */}
          <g transform="translate(270, 350) rotate(-35)">
            <rect x="-6" y="-22" width="12" height="44" rx="2" fill="#78350f" stroke="#fbbf24" strokeWidth="1" />
            <line x1="-6" y1="-10" x2="6" y2="-10" stroke="#fbbf24" strokeWidth="1" />
            <line x1="-6" y1="10" x2="6" y2="10" stroke="#fbbf24" strokeWidth="1" />
          </g>
          {/* Bridge 2 (near Quest 5) */}
          <g transform="translate(710, 360) rotate(25)">
            <rect x="-6" y="-22" width="12" height="44" rx="2" fill="#78350f" stroke="#fbbf24" strokeWidth="1" />
            <line x1="-6" y1="-10" x2="6" y2="-10" stroke="#fbbf24" strokeWidth="1" />
            <line x1="-6" y1="10" x2="6" y2="10" stroke="#fbbf24" strokeWidth="1" />
          </g>

          {/* 4. GOLDEN WINDING QUEST PATHWAY */}
          {world.levels.map((lvl, idx) => {
            if (idx === world.levels.length - 1) return null;
            const nextLvl = world.levels[idx + 1];
            const isCompleted = getLevelStatus(lvl.id, lvl.order) === 'COMPLETED';
            const isNextAvailable = getLevelStatus(nextLvl.id, nextLvl.order) !== 'LOCKED';

            const startX = lvl.mapX;
            const startY = lvl.mapY;
            const endX = nextLvl.mapX;
            const endY = nextLvl.mapY;

            // Curved smooth bezier segment
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 - 35;
            const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

            return (
              <g key={`path-${lvl.id}-${nextLvl.id}`}>
                {/* Cobblestone Base Outer Glow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isCompleted ? '#10b981' : isNextAvailable ? '#fbbf24' : '#1e293b'}
                  strokeWidth="10"
                  strokeOpacity={isCompleted ? '0.35' : isNextAvailable ? '0.3' : '0.15'}
                  filter={isNextAvailable || isCompleted ? 'url(#mapGlow)' : undefined}
                />
                {/* Inner Glowing Cobblestone Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isCompleted ? 'url(#unlockedPathGrad)' : isNextAvailable ? 'url(#goldenPathGrad)' : '#334155'}
                  strokeWidth="4.5"
                  strokeDasharray={isNextAvailable ? '10 6' : '4 6'}
                  strokeLinecap="round"
                  className={isNextAvailable ? 'animate-data-path' : ''}
                />
              </g>
            );
          })}

          {/* 5. 7 INTERACTIVE QUEST LANDMARKS WITH FLOATING RUNES & BADGES */}
          {world.levels.map((level) => {
            const status = getLevelStatus(level.id, level.order);
            const isCompleted = status === 'COMPLETED' || status === 'MASTERED';
            const isAvailable = status === 'AVAILABLE' || status === 'IN_PROGRESS';
            const isLocked = status === 'LOCKED';
            const isSelected = selectedLevelId ? selectedLevelId === level.id : isAvailable;
            const landmarkMeta = DATA_CLEANING_LANDMARKS[level.order];

            return (
              <g
                key={`landmark-${level.id}`}
                transform={`translate(${level.mapX}, ${level.mapY})`}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => handleNodeClick(level)}
                onKeyDown={(e) => handleKeyDown(e, level)}
                tabIndex={0}
                role="button"
                aria-label={`Quest ${level.order}: ${level.title}`}
              >
                {/* SELECTION SPOTLIGHT AURA */}
                {isSelected && (
                  <circle
                    r="48"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-spin"
                    opacity="0.85"
                    filter="url(#goldGlow)"
                  />
                )}

                {/* LANDMARK VISUAL ARTWORKS WITH STORYTELLING PROGRESSION */}
                {/* LANDMARK 1: MEET THE DATA (Glowing Python Shrine & Book) */}
                {level.order === 1 && (
                  <g transform="translate(0, -55)" opacity={isLocked ? 0.45 : 1}>
                    {/* Glowing Shrine Base */}
                    <ellipse
                      cx="0"
                      cy="18"
                      rx="28"
                      ry="10"
                      fill={isCompleted ? '#064e3b' : '#0f172a'}
                      stroke={isCompleted ? '#10b981' : '#38bdf8'}
                      strokeWidth="1.5"
                    />
                    {/* Open Data Book */}
                    <path
                      d="M -18 4 Q 0 8 0 14 Q 0 8 18 4 L 18 16 Q 0 20 0 24 Q 0 20 -18 16 Z"
                      fill={isCompleted ? '#047857' : '#0284c7'}
                      stroke={isCompleted ? '#34d399' : '#38bdf8'}
                      strokeWidth="1.5"
                    />
                    {/* Floating Python Symbol */}
                    <circle
                      cx="0"
                      cy="-6"
                      r="14"
                      fill="#0f172a"
                      stroke={isCompleted ? '#10b981' : '#38bdf8'}
                      strokeWidth="2"
                      filter={!isLocked ? 'url(#mapGlow)' : undefined}
                    />
                    <text
                      x="0"
                      y="-1"
                      textAnchor="middle"
                      fill={isCompleted ? '#6ee7b7' : '#38bdf8'}
                      fontSize="12"
                      fontWeight="black"
                      fontFamily="monospace"
                    >
                      Py
                    </text>
                    {/* Sparkles */}
                    {!isLocked && (
                      <>
                        <circle cx="-16" cy="-14" r="1.5" fill="#facc15" className="animate-ping" />
                        <circle cx="16" cy="-10" r="1.5" fill={isCompleted ? '#34d399' : '#38bdf8'} />
                      </>
                    )}
                  </g>
                )}

                {/* LANDMARK 2: DATA IMPORT FORGE (Ancient Stone Portal Arch & CSV Vortex) */}
                {level.order === 2 && (
                  <g transform="translate(0, -60)" opacity={isLocked ? 0.45 : 1}>
                    {/* Portal Arch */}
                    <path
                      d="M -24 20 L -24 -10 Q 0 -34 24 -10 L 24 20 Z"
                      fill="#091428"
                      stroke={isCompleted ? '#10b981' : isAvailable ? '#0284c7' : '#334155'}
                      strokeWidth="2.5"
                      filter={!isLocked ? 'url(#mapGlow)' : undefined}
                    />
                    {/* Vortex Glow */}
                    {!isLocked && (
                      <circle
                        cx="0"
                        cy="-2"
                        r="15"
                        fill={isCompleted ? '#059669' : '#0284c7'}
                        opacity={isCompleted ? 0.6 : 0.4}
                        className="animate-pulse"
                      />
                    )}
                    {/* CSV Floating Badge */}
                    <rect
                      x="-14"
                      y="-12"
                      width="28"
                      height="20"
                      rx="4"
                      fill="#0f172a"
                      stroke={isCompleted ? '#10b981' : isAvailable ? '#38bdf8' : '#475569'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill={isCompleted ? '#a7f3d0' : '#ffffff'}
                      fontSize="9"
                      fontWeight="black"
                      fontFamily="monospace"
                    >
                      CSV
                    </text>
                  </g>
                )}

                {/* LANDMARK 3: DATA EXPORT WORKSHOP (Database Cylinder & Upward Stream) */}
                {level.order === 3 && (
                  <g transform="translate(0, -58)" opacity={isLocked ? 0.45 : 1}>
                    {/* Cylinder Base Platform */}
                    <ellipse
                      cx="0"
                      cy="16"
                      rx="24"
                      ry="9"
                      fill="#0f172a"
                      stroke={isCompleted ? '#10b981' : isAvailable ? '#6366f1' : '#334155'}
                      strokeWidth="1.5"
                    />
                    <rect
                      x="-18"
                      y="-6"
                      width="36"
                      height="20"
                      fill="#091328"
                      stroke={isCompleted ? '#10b981' : isAvailable ? '#38bdf8' : '#334155'}
                      strokeWidth="1.5"
                      rx="3"
                    />
                    <ellipse
                      cx="0"
                      cy="-6"
                      rx="18"
                      ry="7"
                      fill="#1e293b"
                      stroke={isCompleted ? '#10b981' : isAvailable ? '#38bdf8' : '#334155'}
                      strokeWidth="1.5"
                    />
                    {/* Upward Arrows */}
                    <path
                      d="M -8 -14 L -8 -24 L -12 -24 L -6 -32 L 0 -24 L -4 -24 L -4 -14 Z"
                      fill={isCompleted ? '#34d399' : isAvailable ? '#38bdf8' : '#475569'}
                    />
                    <path
                      d="M 6 -10 L 6 -20 L 2 -20 L 8 -28 L 14 -20 L 10 -20 L 10 -10 Z"
                      fill={isCompleted ? '#10b981' : isAvailable ? '#f59e0b' : '#475569'}
                    />
                  </g>
                )}

                {/* LANDMARK 4: MISSING VALUE DUNGEON (Cavern Crag with Ruby Crystal & NaN) */}
                {level.order === 4 && (
                  <g transform="translate(0, -60)" opacity={isLocked ? 0.45 : 1}>
                    {/* Dark Cavern Spikes */}
                    <path
                      d="M -22 18 L -14 -12 L 0 -26 L 14 -12 L 22 18 Z"
                      fill={isCompleted ? '#064e3b' : '#180c1e'}
                      stroke={isCompleted ? '#10b981' : '#f43f5e'}
                      strokeWidth="1.5"
                    />
                    {/* Floating Crystal: When completed, crystal turns purified Emerald! */}
                    <polygon
                      points="0,-18 10,-6 0,6 -10,-6"
                      fill={isCompleted ? '#10b981' : '#f43f5e'}
                      stroke={isCompleted ? '#34d399' : '#fb7185'}
                      strokeWidth="1.5"
                      filter={!isLocked ? 'url(#mapGlow)' : undefined}
                    />
                    {/* Magnifying Glass with NaN or Cleaned */}
                    <circle
                      cx="16"
                      cy="-14"
                      r="8"
                      fill="#0f172a"
                      stroke={isCompleted ? '#10b981' : '#38bdf8'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="16"
                      y="-11"
                      textAnchor="middle"
                      fill={isCompleted ? '#34d399' : '#f43f5e'}
                      fontSize="7"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {isCompleted ? '✓' : 'NaN'}
                    </text>
                  </g>
                )}

                {/* LANDMARK 5: CATEGORY FORGE (Stacked 3D Cubes) */}
                {level.order === 5 && (
                  <g transform="translate(0, -56)" opacity={isLocked ? 0.45 : 1}>
                    {/* Isometric Cubes */}
                    <rect
                      x="-18"
                      y="-4"
                      width="16"
                      height="16"
                      rx="2"
                      fill={isCompleted ? '#047857' : '#0284c7'}
                      stroke={isCompleted ? '#10b981' : '#38bdf8'}
                      strokeWidth="1"
                    />
                    <text x="-10" y="8" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace">0</text>
                    <rect
                      x="-2"
                      y="-18"
                      width="18"
                      height="18"
                      rx="3"
                      fill={isCompleted ? '#059669' : '#10b981'}
                      stroke="#34d399"
                      strokeWidth="1.5"
                      filter={!isLocked ? 'url(#mapGlow)' : undefined}
                    />
                    <text x="7" y="-5" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="black" fontFamily="monospace">1</text>
                    <rect
                      x="12"
                      y="-2"
                      width="14"
                      height="14"
                      rx="2"
                      fill={isCompleted ? '#065f46' : '#f59e0b'}
                      stroke={isCompleted ? '#34d399' : '#fbbf24'}
                      strokeWidth="1"
                    />
                    <text x="19" y="8" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">0</text>
                  </g>
                )}

                {/* LANDMARK 6: VISUALIZATION TOWER (Crystal Spire with Miniature Charts) */}
                {level.order === 6 && (
                  <g transform="translate(0, -68)" opacity={isLocked ? 0.45 : 1}>
                    {/* Spire Tower */}
                    <polygon
                      points="0,-40 -12,18 12,18"
                      fill={isCompleted ? '#064e3b' : '#082f49'}
                      stroke={isCompleted ? '#10b981' : '#38bdf8'}
                      strokeWidth="2"
                      filter={!isLocked ? 'url(#mapGlow)' : undefined}
                    />
                    {/* Mini Charts Floating in Spire */}
                    {/* Histogram Bars */}
                    <rect x="-9" y="-4" width="3" height="12" fill={isCompleted ? '#34d399' : '#38bdf8'} />
                    <rect x="-4" y="-10" width="3" height="18" fill={isCompleted ? '#10b981' : '#38bdf8'} />
                    <rect x="1" y="-7" width="3" height="15" fill={isCompleted ? '#6ee7b7' : '#38bdf8'} />
                    <rect x="6" y="-2" width="3" height="10" fill={isCompleted ? '#34d399' : '#38bdf8'} />
                    {/* Spire Beacon Light */}
                    {!isLocked && (
                      <circle
                        cx="0"
                        cy="-38"
                        r="4"
                        fill={isCompleted ? '#34d399' : '#38bdf8'}
                        className="animate-ping"
                      />
                    )}
                  </g>
                )}

                {/* LANDMARK 7: CLEAN DATA TRIAL (Grand Golden Arch Portal) */}
                {level.order === 7 && (
                  <g transform="translate(0, -66)" opacity={isLocked ? 0.45 : 1}>
                    {/* Golden Sun Rays */}
                    {!isLocked && (
                      <circle
                        cx="0"
                        cy="-8"
                        r="28"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.6"
                        className="animate-spin"
                      />
                    )}
                    {/* Grand Temple Arch */}
                    <path
                      d="M -26 22 L -26 -12 Q 0 -38 26 -12 L 26 22 Z"
                      fill={isCompleted ? '#1c1917' : '#241402'}
                      stroke={isCompleted ? '#10b981' : isAvailable ? '#fbbf24' : '#475569'}
                      strokeWidth="3"
                      filter={!isLocked ? 'url(#goldGlow)' : undefined}
                    />
                    {/* Inner Golden Python Emblem */}
                    <circle
                      cx="0"
                      cy="-4"
                      r="16"
                      fill={isCompleted ? '#064e3b' : '#451a03'}
                      stroke={isCompleted ? '#10b981' : '#facc15'}
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill={isCompleted ? '#a7f3d0' : '#fef08a'}
                      fontSize="13"
                      fontWeight="black"
                      fontFamily="monospace"
                    >
                      Py
                    </text>
                  </g>
                )}

                {/* FLOATING RUNIC CARDS / CODE TAGS NEAR EACH LANDMARK */}
                {isDataCleaning && landmarkMeta && (
                  <g
                    transform={
                      level.order === 1
                        ? 'translate(-75, -85)'
                        : level.order === 2
                        ? 'translate(30, -95)'
                        : level.order === 3
                        ? 'translate(28, -75)'
                        : level.order === 4
                        ? 'translate(28, -90)'
                        : level.order === 5
                        ? 'translate(28, -80)'
                        : level.order === 6
                        ? 'translate(-85, -85)'
                        : 'translate(-80, -95)'
                    }
                    opacity={isLocked ? 0.45 : 1}
                  >
                    {/* Card container */}
                    <rect
                      x="0"
                      y="0"
                      width={level.order === 2 ? '105' : level.order === 4 ? '85' : '90'}
                      height={level.order === 2 ? '50' : '44'}
                      rx="6"
                      fill="#070e1c"
                      stroke={isSelected ? '#fbbf24' : isCompleted ? '#10b981' : isAvailable ? '#38bdf8' : '#1e293b'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                      opacity="0.95"
                    />

                    {/* Miniature Table or Tag Content */}
                    {level.order === 1 && (
                      <g transform="translate(6, 12)" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                        <text x="0" y="0" fill="#38bdf8" fontWeight="bold">ID  Name  Age</text>
                        <text x="0" y="10">1   Aarav 20</text>
                        <text x="0" y="20">2   Diya  21</text>
                      </g>
                    )}

                    {level.order === 2 && (
                      <g transform="translate(6, 12)" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        <text x="0" y="0">pd.read_csv()</text>
                        <text x="0" y="10" fill="#94a3b8">pd.read_excel()</text>
                        <text x="0" y="20" fill="#94a3b8">open() / URL</text>
                      </g>
                    )}

                    {level.order === 3 && (
                      <g transform="translate(6, 12)" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        <text x="0" y="0">df.to_csv()</text>
                        <text x="0" y="10" fill="#94a3b8">df.to_excel()</text>
                        <text x="0" y="20" fill="#10b981">ExcelWriter()</text>
                      </g>
                    )}

                    {level.order === 4 && (
                      <g transform="translate(6, 12)" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                        <text x="0" y="0" fill="#cbd5e1" fontWeight="bold">Name  Marks</text>
                        <text x="0" y="10">Aarav 78</text>
                        <text x="0" y="20" fill="#f43f5e" fontWeight="bold">Diya  NaN</text>
                      </g>
                    )}

                    {level.order === 5 && (
                      <g transform="translate(6, 12)" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                        <text x="0" y="0" fill="#10b981" fontWeight="bold">get_dummies()</text>
                        <text x="0" y="10">Gender M  F</text>
                        <text x="0" y="20">0      0  1</text>
                      </g>
                    )}

                    {level.order === 6 && (
                      <g transform="translate(6, 12)" fill="#38bdf8" fontSize="8" fontFamily="monospace">
                        <text x="0" y="0" fontWeight="bold">Mini Charts:</text>
                        <text x="0" y="10" fill="#cbd5e1">• Scatter Plot</text>
                        <text x="0" y="20" fill="#cbd5e1">• Histogram</text>
                      </g>
                    )}

                    {level.order === 7 && (
                      <g transform="translate(6, 12)" fill="#fbbf24" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        <text x="0" y="0">END-TO-END</text>
                        <text x="0" y="10" fill="#facc15">PIPELINE</text>
                        <text x="0" y="20" fill="#10b981">✓ Mastered</text>
                      </g>
                    )}
                  </g>
                )}

                {/* CIRCULAR NUMBERED QUEST NODE BASE */}
                <circle
                  r={level.boss ? '22' : '18'}
                  fill={
                    level.boss
                      ? isCompleted ? '#451a03' : isAvailable ? '#1e1b4b' : '#0f172a'
                      : isCompleted ? '#064e3b' : isAvailable ? '#082f49' : '#0f172a'
                  }
                  stroke={
                    isSelected
                      ? '#fbbf24'
                      : level.boss
                      ? isCompleted ? '#fbbf24' : isAvailable ? '#f59e0b' : '#475569'
                      : isCompleted ? '#10b981' : isAvailable ? '#38bdf8' : '#334155'
                  }
                  strokeWidth={isSelected ? '3.5' : level.boss ? '3' : '2.5'}
                  filter={isAvailable || isCompleted ? 'url(#softGlow)' : undefined}
                />

                {/* Node Center Icon / Number */}
                {isLocked ? (
                  <Lock x="-7" y="-7" size={14} className="text-slate-500" />
                ) : isCompleted ? (
                  <Check x="-7" y="-7" size={15} className="text-emerald-300 stroke-[3]" />
                ) : level.boss ? (
                  <Crown x="-8" y="-8" size={16} className="text-amber-300 fill-amber-400" />
                ) : (
                  <text
                    x="0"
                    y="4.5"
                    textAnchor="middle"
                    fill={isSelected ? '#facc15' : '#38bdf8'}
                    fontSize="13"
                    fontWeight="black"
                    fontFamily="monospace"
                  >
                    {level.order}
                  </text>
                )}

                {/* QUEST ATTACHED LABEL CARD UNDERNEATH */}
                <g transform="translate(0, 32)">
                  <rect
                    x="-68"
                    y="-4"
                    width="136"
                    height="34"
                    rx="8"
                    fill="#081020"
                    stroke={isSelected ? '#f59e0b' : isCompleted ? '#10b981' : isAvailable ? '#0284c7' : '#1e293b'}
                    strokeWidth={isSelected ? '2' : '1'}
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    fill={isSelected ? '#fbbf24' : isCompleted ? '#a7f3d0' : isAvailable ? '#f8fafc' : '#64748b'}
                    fontSize="11"
                    fontWeight="black"
                    fontFamily="sans-serif"
                  >
                    {level.title}
                  </text>
                  <text
                    x="0"
                    y="22"
                    textAnchor="middle"
                    fill={isLocked ? '#475569' : '#94a3b8'}
                    fontSize="8.5"
                    fontFamily="sans-serif"
                  >
                    {landmarkMeta?.tagline ? landmarkMeta.tagline.slice(0, 24) + '...' : `Quest ${level.order}`}
                  </text>
                </g>

                {/* ACTIVE AVATAR PAWN PERCHED ON CURRENT ACTIVE NODE */}
                {isAvailable && !isCompleted && (
                  <g transform="translate(0, -32)" className="animate-bounce">
                    <circle r="14" fill="#070c18" stroke="#38bdf8" strokeWidth="2" filter="url(#mapGlow)" />
                    <text x="0" y="4.5" textAnchor="middle" fontSize="12">
                      {avatar.emoji}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-[#050914] border-t border-sky-950 text-xs">
        <div className="flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-slate-300 font-semibold">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            <span className="text-slate-300 font-semibold">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <span className="text-amber-300 font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700" />
            <span className="text-slate-500">Locked</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sky-400 font-mono text-[11px]">
          <span>Click any landmark node to inspect quest details</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { World } from '../../types/world';
import type { ProgressState } from '../../types/progress';
import { Database, Sparkles, Coins, CheckCircle2 } from 'lucide-react';

export interface WorldHeaderProps {
  world: World;
  progress: ProgressState;
  customSubtitle?: string;
  customDescription?: string;
}

export const WorldHeader: React.FC<WorldHeaderProps> = ({
  world,
  progress,
  customSubtitle,
  customDescription,
}) => {
  const isDataCleaning = world.id === 'data-cleaning';
  const totalLevels = world.levels.length;
  const completedCount = world.levels.filter((l) =>
    progress.completedLevels.includes(l.id)
  ).length;
  const percentComplete = totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;
  const isMastered = completedCount === totalLevels && totalLevels > 0;

  // Calculate total XP and Coins in this world
  const totalXp = world.levels.reduce((acc, l) => acc + (l.xpReward || 0), 0);
  const totalCoins = world.levels.reduce((acc, l) => acc + (l.coinReward || 0), 0);

  const displayTitle = isDataCleaning ? 'DATA CLEANING REALM' : world.title;
  const displaySubtitle = customSubtitle || (isDataCleaning ? 'Module 1 • 7 Quests' : `World ${world.order} • ${totalLevels} Quests`);
  const displayDescription =
    customDescription ||
    (isDataCleaning
      ? 'Master the journey from raw data to clean, understandable data using Python and pandas.'
      : world.description);

  return (
    <div className="w-full rounded-3xl border-2 border-sky-800/40 bg-gradient-to-r from-slate-900/95 via-slate-950/95 to-sky-950/60 p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md glow-cyan-card relative overflow-hidden">
      {/* Subtle Data Glow Backdrop */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Realm Details with Ancient Parchment Scroll */}
        <div className="flex items-start gap-4 max-w-xl">
          {/* Parchment Scroll Icon from Blueprint */}
          <div className="shrink-0 hidden sm:flex flex-col items-center justify-center w-14 h-16 bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 rounded-xl border-2 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.35)] relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 rounded-t" />
            <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 rounded-b" />
            <span className="text-xl">📜</span>
            <span className="text-[10px] font-black text-amber-200 font-mono tracking-tight mt-0.5">Py</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-sky-950/80 text-sky-300 border border-sky-600/40">
                <Database size={12} className="text-sky-400" />
                {isDataCleaning ? 'MODULE 1 • DATA CLEANING' : `WORLD ${world.order}`}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {displaySubtitle}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-3">
              <span>{displayTitle}</span>
              {isMastered && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 size={13} />
                  Mastered
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              "{displayDescription}"
            </p>
          </div>
        </div>

        {/* Right: Module Progress & Rewards Panel matching blueprint */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-between gap-3 bg-gradient-to-b from-[#131c31] to-[#0d1527] p-4 rounded-2xl border-2 border-amber-600/40 shadow-[0_0_20px_rgba(0,0,0,0.6)] shrink-0 min-w-[240px]">
          <div className="w-full">
            <div className="flex items-center justify-between gap-4 text-xs font-mono font-bold">
              <span className="text-amber-300 uppercase text-[11px] tracking-wider">
                {isDataCleaning ? 'MODULE 1 PROGRESS' : `WORLD ${world.order} PROGRESS`}
              </span>
              <span className="text-slate-300">
                {completedCount} / {totalLevels} Quests <span className="text-sky-400 font-black">({percentComplete}%)</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-950 rounded-full h-2.5 mt-2 overflow-hidden border border-slate-700/80 p-0.5">
              <div
                className="bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Module Rewards */}
          <div className="flex items-center justify-between md:justify-end gap-3 pt-1 border-t border-slate-800/80 w-full">
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
              Module Rewards:
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-950/90 border border-sky-400/50 text-xs font-black text-sky-200">
                <Sparkles size={12} className="text-sky-400" />
                <span>+{isDataCleaning ? 500 : totalXp} XP</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-950/90 border border-amber-400/50 text-xs font-black text-amber-200">
                <Coins size={12} className="text-amber-400" />
                <span>+{isDataCleaning ? 150 : totalCoins} Coins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
        {/* Left: Realm Details */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-sky-950/80 text-sky-300 border border-sky-600/40">
              <Database size={13} className="text-sky-400" />
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

        {/* Right: Module Progress & Reward Preview */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 bg-slate-900/80 p-4 rounded-2xl border border-sky-900/40 shadow-inner shrink-0 min-w-[220px]">
          <div className="text-left md:text-right w-full">
            <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                Module Progress
              </span>
              <span className="font-mono font-black text-sky-300">
                {completedCount} / {totalLevels} Quests ({percentComplete}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Reward Preview */}
          <div className="flex items-center gap-2.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Reward:
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-500/40 text-xs font-black text-sky-300">
              <Sparkles size={13} className="text-sky-400" />
              <span>+{isDataCleaning ? 500 : totalXp} XP</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-xs font-black text-amber-300">
              <Coins size={13} className="text-amber-400" />
              <span>+{isDataCleaning ? 150 : totalCoins} Coins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

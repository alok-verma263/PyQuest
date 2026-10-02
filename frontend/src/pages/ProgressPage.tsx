import React from 'react';
import type { World } from '../types/world';
import type { ProgressState } from '../types/progress';
import { Card } from '../components/common/Card';
import { CheckCircle, Clock, Lock, Star, Sparkles } from 'lucide-react';

export interface ProgressPageProps {
  world: World;
  progress: ProgressState;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ world, progress }) => {
  const totalLevels = world.levels.length;
  const completedCount = progress.completedLevels.length;
  const percentage = Math.round((completedCount / totalLevels) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-600/40">
          Quest Chronicles
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Adventure Progression</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your milestone achievements and level completion status across realms.
        </p>
      </div>

      {/* Progress Summary Card */}
      <Card variant="stone" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{world.title} Completion</h3>
            <p className="text-xs text-slate-400 mt-0.5">{world.tagline}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400">{percentage}%</span>
            <span className="text-xs text-slate-400 block">
              {completedCount} of {totalLevels} Quests Cleared
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </Card>

      {/* Level-by-Level Status Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Level Records
        </h3>

        {world.levels.map((level) => {
          const isDone = progress.completedLevels.includes(level.id);
          const state = progress.levelStates?.[level.id];
          const isLocked = !isDone && state?.status === 'LOCKED';

          return (
            <div
              key={level.id}
              className={`p-4 rounded-xl border flex items-center justify-between ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-200'
                  : isLocked
                  ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                  : 'bg-slate-900 border-sky-500/40 text-sky-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                ) : isLocked ? (
                  <Lock size={20} className="text-slate-600 shrink-0" />
                ) : (
                  <Clock size={20} className="text-sky-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Level {level.order}: {level.title}
                  </h4>
                  <p className="text-xs text-slate-400">{level.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                  <Star size={13} className="text-amber-400" />
                  {level.coinReward} Coins
                </span>
                <span className="text-xs font-semibold text-sky-300 flex items-center gap-1">
                  <Sparkles size={13} className="text-sky-400" />
                  {level.xpReward} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { World } from '../types/world';
import type { ProgressState } from '../types/progress';
import { Card } from '../components/common/Card';
import { CheckCircle, Clock, Lock, Star, Sparkles, Crown } from 'lucide-react';

export interface ProgressPageProps {
  world: World;
  worlds?: World[];
  progress: ProgressState;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  world,
  worlds = [world],
  progress,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<string>(world.id);
  const currentWorld = worlds.find((w) => w.id === selectedWorldId) || world;

  const totalLevels = currentWorld.levels.length;
  const completedInWorld = currentWorld.levels.filter((l) =>
    progress.completedLevels.includes(l.id)
  ).length;
  const percentage = Math.round((completedInWorld / totalLevels) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-600/40">
            Academic Chronicles
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Adventure Progression</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review your milestone achievements and quest completion status across curriculum realms.
          </p>
        </div>

        {/* Realm Filter Tabs */}
        {worlds.length > 1 && (
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 shrink-0">
            {worlds.map((w) => {
              const active = w.id === selectedWorldId;
              const count = w.levels.filter((l) =>
                progress.completedLevels.includes(l.id)
              ).length;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorldId(w.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    active
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {w.order === 1 ? '🔮 Basics' : '📊 Data Cleaning'} ({count}/{w.levels.length})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress Summary Card */}
      <Card variant="stone" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-600/40">
                World {currentWorld.order}
              </span>
              <h3 className="text-lg font-bold text-white">{currentWorld.title}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">{currentWorld.description}</p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-2xl font-black text-amber-400">{percentage}%</span>
            <span className="text-xs text-slate-400 block">
              {completedInWorld} of {totalLevels} Quests Cleared
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
          Curriculum Quests ({totalLevels})
        </h3>

        {currentWorld.levels.map((level) => {
          const isDone = progress.completedLevels.includes(level.id);
          const state = progress.levelStates?.[level.id];
          const isLocked = !isDone && (state?.status === 'LOCKED' || (!state && level.order > 1));

          return (
            <div
              key={level.id}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-200'
                  : isLocked
                  ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                  : 'bg-slate-900 border-sky-500/40 text-sky-200 shadow-sm'
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
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">
                      {level.boss ? '👑 Boss Trial' : `Quest ${level.order}`}: {level.title}
                    </h4>
                    {level.boss && (
                      <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                        <Crown size={11} />
                        Boss
                      </span>
                    )}
                  </div>
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

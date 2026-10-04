import React, { useState } from 'react';
import type { World, Level } from '../types/world';
import type { ProgressState } from '../types/progress';
import type { PlayerProfile } from '../types/profile';
import { AdventureMapCanvas } from '../game/AdventureMapCanvas';
import { LevelOverviewModal } from '../features/map/LevelOverviewModal';
import { WorldHeader } from '../components/common/WorldHeader';
import { Compass, CheckCircle2 } from 'lucide-react';

export interface AdventurePageProps {
  world: World;
  worlds?: World[];
  onSelectWorld?: (world: World) => void;
  progress: ProgressState;
  profile: PlayerProfile;
  onStartLevel: (level: Level) => void;
  onPlaySound: (sound: 'click' | 'level-select') => void;
}

export const AdventurePage: React.FC<AdventurePageProps> = ({
  world,
  worlds = [world],
  onSelectWorld,
  progress,
  profile,
  onStartLevel,
  onPlaySound,
}) => {
  const [inspectingLevel, setInspectingLevel] = useState<Level | null>(null);

  const handleOpenOverview = (level: Level) => {
    setInspectingLevel(level);
  };

  const handleConfirmStart = (level: Level) => {
    setInspectingLevel(null);
    onStartLevel(level);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 py-4 px-4 animate-in fade-in duration-300">
      {/* Realm Switcher Tabs if multiple worlds available */}
      {worlds.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-400">
            <Compass size={16} className="text-sky-400" />
            <span>Select Realm:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {worlds.map((w) => {
              const isActive = w.id === world.id;
              const clearedCount = w.levels.filter((l) =>
                progress.completedLevels.includes(l.id)
              ).length;
              const isAllCleared = clearedCount === w.levels.length && w.levels.length > 0;

              return (
                <button
                  key={w.id}
                  onClick={() => {
                    onPlaySound('click');
                    if (onSelectWorld) onSelectWorld(w);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] border border-sky-400/50 scale-[1.02]'
                      : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800/80 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{w.order === 1 ? '⚡' : '📊'}</span>
                  <span>{w.title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isAllCleared
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : isActive
                        ? 'bg-sky-950/80 text-sky-200'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {isAllCleared ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                        Mastered
                      </span>
                    ) : (
                      `${clearedCount}/${w.levels.length}`
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* World / Realm Header Card */}
      <WorldHeader world={world} progress={progress} />

      {/* Adventure Map Canvas */}
      <AdventureMapCanvas
        world={world}
        progress={progress}
        profile={profile}
        onOpenLevelOverview={handleOpenOverview}
        onPlaySound={onPlaySound}
      />

      {/* World / Level Overview Modal */}
      <LevelOverviewModal
        isOpen={Boolean(inspectingLevel)}
        world={world}
        level={inspectingLevel}
        onClose={() => setInspectingLevel(null)}
        onStartLevel={handleConfirmStart}
        onPlaySound={onPlaySound}
      />
    </div>
  );
};

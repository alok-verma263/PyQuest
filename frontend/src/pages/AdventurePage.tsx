import React, { useState } from 'react';
import type { World, Level } from '../types/world';
import type { ProgressState, LevelStatus } from '../types/progress';
import type { PlayerProfile } from '../types/profile';
import { AdventureMapCanvas } from '../game/AdventureMapCanvas';
import { PhaserAdventureWorld } from '../game/phaser/PhaserAdventureWorld';
import { LevelOverviewModal } from '../features/map/LevelOverviewModal';
import { WorldHeader } from '../components/common/WorldHeader';
import { BottomQuestPanel } from '../components/map/BottomQuestPanel';
import { DATA_CLEANING_LANDMARKS } from '../data/questLandmarks';
import { Compass, CheckCircle2, Gamepad2, Map as MapIcon } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'exploration' | 'overview'>('exploration');

  const getLevelStatus = (levelId: string, order: number): LevelStatus => {
    if (progress.levelStates && progress.levelStates[levelId]) {
      return progress.levelStates[levelId].status;
    }
    if (order === 1) return 'AVAILABLE';
    return 'LOCKED';
  };

  const [userSelectedLevelId, setUserSelectedLevelId] = useState<string | null>(null);

  // Derive active selected level
  const selectedLevel: Level =
    (userSelectedLevelId && world.levels.find((l) => l.id === userSelectedLevelId)) ||
    world.levels.find((l) => {
      const st = getLevelStatus(l.id, l.order);
      return st === 'AVAILABLE' || st === 'IN_PROGRESS';
    }) ||
    world.levels[0];

  const handleOpenOverview = (level: Level) => {
    setInspectingLevel(level);
  };

  const handleConfirmStart = (level: Level) => {
    setInspectingLevel(null);
    onStartLevel(level);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 py-4 px-4 animate-in fade-in duration-300">
      {/* Realm Switcher Tabs & View Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {worlds.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-400">
                <Compass size={15} className="text-sky-400" />
                <span>Realm:</span>
              </div>
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
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)] border border-sky-400/50'
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
          )}
        </div>

        {/* View Mode Toggle: Exploration World vs Tactical Overview */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              onPlaySound('click');
              setViewMode('exploration');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === 'exploration'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 size={13} />
            <span>Walkable World</span>
          </button>
          <button
            onClick={() => {
              onPlaySound('click');
              setViewMode('overview');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === 'overview'
                ? 'bg-sky-600 text-white shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon size={13} />
            <span>Overview Map</span>
          </button>
        </div>
      </div>

      {/* World / Realm Header Card */}
      <WorldHeader world={world} progress={progress} />

      {/* INTERACTIVE ADVENTURE WORLD */}
      {viewMode === 'exploration' ? (
        <PhaserAdventureWorld
          world={world}
          progress={progress}
          profile={profile}
          onStartLevel={onStartLevel}
          onPlaySound={onPlaySound}
        />
      ) : (
        <AdventureMapCanvas
          world={world}
          progress={progress}
          profile={profile}
          selectedLevelId={selectedLevel?.id}
          onSelectLevel={(lvl) => setUserSelectedLevelId(lvl.id)}
          onOpenLevelOverview={handleOpenOverview}
          onPlaySound={onPlaySound}
        />
      )}

      {/* Interactive Bottom Quest Selection & Detail Panel */}
      {selectedLevel && (
        <BottomQuestPanel
          level={selectedLevel}
          landmarkData={DATA_CLEANING_LANDMARKS[selectedLevel.order]}
          status={getLevelStatus(selectedLevel.id, selectedLevel.order)}
          isNextQuest={getLevelStatus(selectedLevel.id, selectedLevel.order) === 'AVAILABLE'}
          onStartQuest={onStartLevel}
          onPlaySound={onPlaySound}
        />
      )}

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

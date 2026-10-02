import React, { useState } from 'react';
import type { World, Level } from '../types/world';
import type { ProgressState } from '../types/progress';
import type { PlayerProfile } from '../types/profile';
import { AdventureMapCanvas } from '../game/AdventureMapCanvas';
import { LevelOverviewModal } from '../features/map/LevelOverviewModal';

export interface AdventurePageProps {
  world: World;
  progress: ProgressState;
  profile: PlayerProfile;
  onStartLevel: (level: Level) => void;
  onPlaySound: (sound: 'click' | 'level-select') => void;
}

export const AdventurePage: React.FC<AdventurePageProps> = ({
  world,
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
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4 px-4 animate-in fade-in duration-300">
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

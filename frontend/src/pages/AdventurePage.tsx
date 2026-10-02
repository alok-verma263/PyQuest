import React from 'react';
import type { World, Level } from '../types/world';
import type { ProgressState } from '../types/progress';
import { AdventureMapCanvas } from '../game/AdventureMapCanvas';

export interface AdventurePageProps {
  world: World;
  progress: ProgressState;
  onSelectLevel: (level: Level) => void;
  onPlaySound: (sound: 'click' | 'level-select') => void;
}

export const AdventurePage: React.FC<AdventurePageProps> = ({
  world,
  progress,
  onSelectLevel,
  onPlaySound,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
      <AdventureMapCanvas
        world={world}
        progress={progress}
        onSelectLevel={onSelectLevel}
        onPlaySound={onPlaySound}
      />
    </div>
  );
};

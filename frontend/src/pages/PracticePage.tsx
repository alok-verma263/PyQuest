import React, { useState } from 'react';
import type { World, Level } from '../types/world';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Play, Sparkles, Crown } from 'lucide-react';

export interface PracticePageProps {
  world: World;
  worlds?: World[];
  onSelectLevel: (level: Level) => void;
  onPlaySound: (sound: 'click' | 'level-select') => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({
  world,
  worlds = [world],
  onSelectLevel,
  onPlaySound,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<string>(world.id);
  const currentWorld = worlds.find((w) => w.id === selectedWorldId) || world;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-600/40">
            Practice Arena
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Replay & Sharpen Skills</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hone your Python mastery by re-attempting curriculum trials and code challenges anytime.
          </p>
        </div>

        {/* Realm Selector */}
        {worlds.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 shrink-0">
            {worlds.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  onPlaySound('click');
                  setSelectedWorldId(w.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  w.id === currentWorld.id
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {w.order === 1 ? '🔮 Basics' : '📊 Data Cleaning'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {currentWorld.levels.map((level) => (
          <Card
            key={level.id}
            variant="stone"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:border-slate-600 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  {level.boss ? '👑 Boss Trial' : `Quest ${level.order}`}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
                  <Sparkles size={12} />
                  +{level.xpReward} XP
                </span>
              </div>
              <h3 className="text-lg font-black text-white">{level.title}</h3>
              <p className="text-xs text-slate-400 max-w-xl">{level.description}</p>
            </div>

            <Button
              variant={level.boss ? 'gold' : 'secondary'}
              size="sm"
              icon={
                level.boss ? (
                  <Crown size={14} className="text-amber-300" />
                ) : (
                  <Play size={14} className="text-sky-400 fill-sky-400" />
                )
              }
              onClick={() => {
                onPlaySound('level-select');
                onSelectLevel(level);
              }}
            >
              {level.boss ? 'Challenge Boss 👑' : 'Practice Quest'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

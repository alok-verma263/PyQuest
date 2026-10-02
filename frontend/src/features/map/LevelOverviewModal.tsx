import React from 'react';
import type { World, Level } from '../../types/world';
import { Button } from '../../components/common/Button';
import { Sparkles, Coins, BookOpen, Play, X, Star } from 'lucide-react';

export interface LevelOverviewModalProps {
  isOpen: boolean;
  world: World;
  level: Level | null;
  onClose: () => void;
  onStartLevel: (level: Level) => void;
  onPlaySound: (sound: 'click') => void;
}

export const LevelOverviewModal: React.FC<LevelOverviewModalProps> = ({
  isOpen,
  world,
  level,
  onClose,
  onStartLevel,
  onPlaySound,
}) => {
  if (!isOpen || !level) return null;

  const topics = level.topics || [
    'What is Python?',
    'print()',
    'Basic syntax',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-sky-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(56,189,248,0.25)] relative">
        {/* Close Button */}
        <button
          onClick={() => {
            onPlaySound('click');
            onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* World and Level Badge */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs font-black uppercase tracking-wider">
            {world.title}
          </div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mt-2">
            <Star size={14} className="fill-amber-400" />
            <span>Level {level.order}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {level.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 pt-1 leading-relaxed">
            {level.description}
          </p>
        </div>

        {/* Topics Section */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen size={14} className="text-sky-400" />
            Topics Covered:
          </h3>
          <ul className="space-y-1.5 pl-1">
            {topics.map((topic, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rewards Quad */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-600/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Reward</span>
              <span className="text-base font-black text-sky-300">+{level.xpReward} XP</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Coins size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Reward</span>
              <span className="text-base font-black text-amber-300">+{level.coinReward} Coins</span>
            </div>
          </div>
        </div>

        {/* Start Level Action */}
        <Button
          variant="gold"
          size="lg"
          glow
          className="w-full py-4 text-base"
          icon={<Play size={18} className="fill-current" />}
          onClick={() => {
            onPlaySound('click');
            onStartLevel(level);
          }}
        >
          START LEVEL
        </Button>
      </div>
    </div>
  );
};

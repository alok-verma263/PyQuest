import React from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Play, Sparkles, BookOpen, Trophy, Terminal } from 'lucide-react';

export interface HomePageProps {
  onStartAdventure: () => void;
  onOpenPractice: () => void;
  onPlaySound: (sound: 'click') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartAdventure,
  onOpenPractice,
  onPlaySound,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 py-8 px-4 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 p-8 sm:p-14 text-center shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-sky-500/10 via-amber-500/5 to-transparent pointer-events-none" />

        {/* Quest Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs font-black tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <Sparkles size={14} className="text-sky-400" />
          The Gamified Python Odyssey
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Learn Python. <br />
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
            Complete Quests.
          </span>{' '}
          Master Code.
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-300 mt-4 leading-relaxed font-normal">
          Embark on an interactive adventure where programming theory transforms into magical trials.
          Conquer real Python coding challenges in your browser sandbox, earn gold, and level up!
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Button
            variant="gold"
            size="lg"
            glow
            icon={<Play size={18} className="fill-current" />}
            onClick={() => {
              onPlaySound('click');
              onStartAdventure();
            }}
          >
            Enter Adventure Realm
          </Button>

          <Button
            variant="secondary"
            size="lg"
            icon={<Terminal size={18} className="text-sky-400" />}
            onClick={() => {
              onPlaySound('click');
              onOpenPractice();
            }}
          >
            Practice Arena
          </Button>
        </div>
      </div>

      {/* Feature Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="stone" className="hover:border-sky-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-600/40 flex items-center justify-center text-sky-400 mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-black text-white">Interactive Curriculum</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Digestible, bite-sized theory scrolls equipped with interactive code demonstrations and sage lore.
          </p>
        </Card>

        <Card variant="stone" className="hover:border-amber-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400 mb-4">
            <Terminal size={24} />
          </div>
          <h3 className="text-lg font-black text-white">In-Browser Sandbox</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Execute real Python in your browser via WebAssembly. Safe, lightning fast, and zero local setup required.
          </p>
        </Card>

        <Card variant="stone" className="hover:border-emerald-500/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mb-4">
            <Trophy size={24} />
          </div>
          <h3 className="text-lg font-black text-white">RPG Progression</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Gain XP, stockpile coins, unlock mystical nodes across adventure maps, and earn legendary wizard badges.
          </p>
        </Card>
      </div>
    </div>
  );
};

import React from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import type { PlayerProfile } from '../types/profile';
import type { ProgressState } from '../types/progress';
import { Play, Sparkles, BookOpen, Trophy, Terminal, User, Settings, Shield } from 'lucide-react';


export interface HomePageProps {
  profile: PlayerProfile;
  progress: ProgressState;
  onStartAdventure: () => void;
  onContinueAdventure: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onPlaySound: (sound: 'click') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  profile,
  progress,
  onStartAdventure,
  onContinueAdventure,
  onOpenProfile,
  onOpenSettings,
  onPlaySound,
}) => {
  const hasProgress = progress.completedLevels.length > 0 || profile.xp > 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 py-6 px-4 animate-in fade-in duration-300">
      {/* Hero / Main Menu Card */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 p-8 sm:p-14 text-center shadow-2xl backdrop-blur-md">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-sky-500/15 via-emerald-500/5 to-transparent pointer-events-none" />

        {/* Fantasy Pixel Serpent Crest */}
        <div className="flex justify-center mb-6">
          <div className="relative inline-flex items-center justify-center p-3 rounded-2xl bg-slate-950/80 border-2 border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.25)]">
            <span className="text-4xl sm:text-5xl select-none">⚔️🐍</span>
            <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow">
              RPG
            </div>
          </div>
        </div>

        {/* PyQuest Logo Title */}
        <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-none mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-300">
            PyQuest
          </span>
        </h1>

        {/* Official Tagline */}
        <p className="text-base sm:text-xl font-bold text-amber-300 tracking-wide mb-4">
          Learn Python. Complete Quests. Master Code.
        </p>

        <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed font-normal">
          Journey through enchanted programming realms, tackle interactive theory scrolls,
          and conquer coding trials in a live browser WebAssembly sandbox.
        </p>

        {/* Main Menu Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto">
          {hasProgress ? (
            <>
              <Button
                variant="gold"
                size="lg"
                glow
                className="w-full sm:w-auto px-8 py-3.5 text-base"
                icon={<Play size={18} className="fill-current" />}
                onClick={() => {
                  onPlaySound('click');
                  onContinueAdventure();
                }}
              >
                Continue Quest
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-6 py-3.5 text-sm"
                icon={<Sparkles size={16} className="text-sky-400" />}
                onClick={() => {
                  onPlaySound('click');
                  onStartAdventure();
                }}
              >
                Adventure Map
              </Button>
            </>
          ) : (
            <Button
              variant="gold"
              size="lg"
              glow
              className="w-full sm:w-auto px-10 py-4 text-base"
              icon={<Play size={18} className="fill-current" />}
              onClick={() => {
                onPlaySound('click');
                onStartAdventure();
              }}
            >
              Start Adventure
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto px-5 py-3.5 text-sm"
            icon={<User size={16} className="text-amber-400" />}
            onClick={() => {
              onPlaySound('click');
              onOpenProfile();
            }}
          >
            Profile
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto px-4 py-3.5 text-sm"
            icon={<Settings size={16} />}
            onClick={() => {
              onPlaySound('click');
              onOpenSettings();
            }}
          >
            Settings
          </Button>
        </div>

        {/* Current Player Status Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-sky-400" />
            <span>Adventurer: <strong className="text-slate-200">{profile.username}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>Level <strong className="text-amber-300">{profile.level}</strong> ({profile.xp} XP)</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-emerald-400" />
            <span>Completed Quests: <strong className="text-emerald-300">{progress.completedLevels.length}</strong></span>
          </div>
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

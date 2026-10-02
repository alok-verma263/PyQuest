import React, { useState } from 'react';
import type { PlayerProfile } from '../types/profile';
import type { ProgressState } from '../types/progress';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Shield, Sparkles, Coins, Trophy, Award, RotateCcw } from 'lucide-react';

export interface ProfilePageProps {
  profile: PlayerProfile;
  progress: ProgressState;
  onResetProgress: () => void;
  onPlaySound: (sound: 'click') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  progress,
  onResetProgress,
  onPlaySound,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    onPlaySound('click');
    onResetProgress();
    setConfirmReset(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-600/40">
          Hero Dossier
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Player Profile</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your wizard rank, accumulated relics, and unlocked achievements.
        </p>
      </div>

      {/* Hero Card */}
      <Card variant="stone" className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 p-1 shadow-2xl">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
            <Shield size={44} className="text-amber-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-stone-950 text-xs font-black rounded-full px-2.5 py-0.5 shadow-lg border-2 border-slate-900">
            Lvl {profile.level}
          </div>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-2xl font-black text-white">{profile.username}</h3>
          <p className="text-sm font-semibold text-sky-400">{profile.title}</p>
          <p className="text-xs text-slate-400 pt-1">
            PyQuest Apprentice actively mastering Python incantations.
          </p>
        </div>
      </Card>

      {/* Stats Quad Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="stone" className="p-4 text-center">
          <div className="w-8 h-8 mx-auto rounded-lg bg-sky-950/80 text-sky-400 flex items-center justify-center mb-2 border border-sky-600/30">
            <Sparkles size={18} />
          </div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Total XP</span>
          <span className="text-xl font-black text-sky-300">{profile.xp}</span>
        </Card>

        <Card variant="stone" className="p-4 text-center">
          <div className="w-8 h-8 mx-auto rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center mb-2 border border-amber-600/30">
            <Coins size={18} />
          </div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Coins</span>
          <span className="text-xl font-black text-amber-300">{profile.coins}</span>
        </Card>

        <Card variant="stone" className="p-4 text-center">
          <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-600/30">
            <Trophy size={18} />
          </div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Quests Cleared</span>
          <span className="text-xl font-black text-emerald-300">{progress.completedLevels.length}</span>
        </Card>

        <Card variant="stone" className="p-4 text-center">
          <div className="w-8 h-8 mx-auto rounded-lg bg-purple-950/80 text-purple-400 flex items-center justify-center mb-2 border border-purple-600/30">
            <Award size={18} />
          </div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Badges</span>
          <span className="text-xl font-black text-purple-300">{profile.badges.length}</span>
        </Card>
      </div>

      {/* Badges Collection */}
      <Card variant="stone" className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award size={18} className="text-amber-400" />
          Earned Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.badges.map((badge) => (
            <div
              key={badge.id}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                <p className="text-[11px] text-slate-400">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone: Reset Progress */}
      <Card variant="stone" className="p-6 border-rose-900/40 bg-rose-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-300">Reset Adventurer Progress</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Reset all completed quests, XP, and gold to start a fresh journey.
            </p>
          </div>

          {!confirmReset ? (
            <Button
              variant="danger"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={() => {
                onPlaySound('click');
                setConfirmReset(true);
              }}
            >
              Reset Data
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={handleReset}>
                Confirm Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onPlaySound('click');
                  setConfirmReset(false);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

import React from 'react';
import type { PlayerProfile } from '../../types/profile';
import { AVATAR_OPTIONS } from '../../data/defaultCurriculum';
import { Coins, Sparkles, Volume2, VolumeX } from 'lucide-react';

export interface QuestHudProps {
  profile: PlayerProfile;
  muted: boolean;
  onToggleMute: () => void;
  onOpenProfile: () => void;
}

export const QuestHud: React.FC<QuestHudProps> = ({
  profile,
  muted,
  onToggleMute,
  onOpenProfile,
}) => {
  const xpPercentage = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));
  const avatar = AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Player Profile Pill */}
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group p-1.5 pr-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-all hover:border-sky-500/50"
          title="View Player Profile"
        >
          {/* Avatar Icon */}
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 via-sky-600 to-emerald-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center text-base">
              {avatar.emoji}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 text-[10px] font-black rounded-full px-1.5 py-0.2 shadow">
              {profile.level}
            </div>
          </div>


          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
              {profile.username}
            </span>
            <span className="text-[10px] text-sky-400 font-medium">
              {profile.title}
            </span>
          </div>
        </div>

        {/* Center: XP Bar */}
        <div className="hidden sm:flex flex-col flex-1 max-w-xs md:max-w-md gap-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-sky-300 flex items-center gap-1">
              <Sparkles size={12} className="text-sky-400" />
              XP
            </span>
            <span className="text-slate-400 text-[11px]">
              <span className="text-sky-300 font-bold">{profile.xp}</span> / {profile.xpToNextLevel} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>

        {/* Right: Currency & Audio Controls */}
        <div className="flex items-center gap-3">
          {/* Gold Coin Pouch */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-600/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Coins size={16} className="text-amber-400 animate-pulse" />
            <span className="text-sm font-extrabold text-amber-300">{profile.coins}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} className="text-sky-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};

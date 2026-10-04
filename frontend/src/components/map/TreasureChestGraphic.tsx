import React from 'react';
import { Sparkles, Coins } from 'lucide-react';

export interface TreasureChestGraphicProps {
  xpReward: number;
  coinReward: number;
  isUnlocked?: boolean;
}

export const TreasureChestGraphic: React.FC<TreasureChestGraphicProps> = ({
  xpReward,
  coinReward,
  isUnlocked = true,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-3 text-center space-y-2 transition-all ${isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}>
      <span className="text-[10px] font-mono uppercase font-black tracking-widest text-amber-400 block">
        Quest Rewards
      </span>

      {/* Golden Chest Visual with Radial Flare */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Glow Halo */}
        {isUnlocked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-400/30 blur-xl pointer-events-none animate-pulse" />
        )}

        {/* Chest SVG */}
        <svg
          viewBox="0 0 64 64"
          className="w-16 h-16 relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"
        >
          {/* Base Chest Body */}
          <rect x="8" y="24" width="48" height="32" rx="6" fill="#78350f" stroke="#fbbf24" strokeWidth="2.5" />
          <rect x="12" y="28" width="40" height="24" rx="4" fill="#92400e" />

          {/* Golden Trim Straps */}
          <rect x="16" y="24" width="6" height="32" fill="#f59e0b" />
          <rect x="42" y="24" width="6" height="32" fill="#f59e0b" />

          {/* Arched Lid */}
          <path d="M 6 24 C 6 12, 58 12, 58 24 Z" fill="#b45309" stroke="#fbbf24" strokeWidth="2.5" />
          <path d="M 16 14 L 22 24 L 16 24 Z" fill="#f59e0b" />
          <path d="M 42 14 L 48 24 L 42 24 Z" fill="#f59e0b" />

          {/* Golden Lock Clasp */}
          <circle cx="32" cy="26" r="4.5" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
          <circle cx="32" cy="26" r="1.5" fill="#78350f" />

          {/* Sparkles */}
          <circle cx="48" cy="10" r="1.5" fill="#fef08a" className="animate-ping" />
          <circle cx="14" cy="12" r="1.2" fill="#fef08a" />
        </svg>
      </div>

      {/* Rewards Pills */}
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-sky-950/80 border border-sky-500/40 text-xs font-black text-sky-300 shadow-sm">
          <Sparkles size={13} className="text-sky-400" />
          <span>+{xpReward} XP</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-xs font-black text-amber-300 shadow-sm">
          <Coins size={13} className="text-amber-400" />
          <span>+{coinReward} Coins</span>
        </div>
      </div>
    </div>
  );
};

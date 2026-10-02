import React, { useState } from 'react';
import { Button } from './Button';
import { Volume2, VolumeX, RotateCcw, X, Info } from 'lucide-react';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  muted: boolean;
  onToggleMute: () => void;
  onResetProgress: () => void;
  onPlaySound: (sound: 'click' | 'level-clear') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  muted,
  onToggleMute,
  onResetProgress,
  onPlaySound,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xl font-black text-white">Game Settings</h3>
          <button
            onClick={() => {
              onPlaySound('click');
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Audio Setting */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3">
            {muted ? (
              <VolumeX size={22} className="text-rose-400" />
            ) : (
              <Volume2 size={22} className="text-sky-400" />
            )}
            <div>
              <span className="text-sm font-bold text-white block">Sound Effects</span>
              <span className="text-xs text-slate-400">
                {muted ? 'Audio muted' : '8-bit Web Audio active'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!muted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPlaySound('level-clear')}
              >
                Test
              </Button>
            )}
            <Button
              variant={muted ? 'danger' : 'primary'}
              size="sm"
              onClick={() => {
                onToggleMute();
                onPlaySound('click');
              }}
            >
              {muted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
        </div>

        {/* Danger: Reset Data */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
          <div className="flex items-center gap-2 text-rose-300 text-sm font-bold">
            <RotateCcw size={16} />
            <span>Reset Quest Journey</span>
          </div>
          <p className="text-xs text-slate-400">
            Erases your saved profile, inventory gold, XP, and resets unlocked levels back to Level 1.
          </p>

          {!confirmReset ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onPlaySound('click');
                setConfirmReset(true);
              }}
            >
              Reset Progress
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                  onClose();
                }}
              >
                Confirm Full Reset
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

        {/* Version Info */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-800">
          <Info size={14} />
          <span>PyQuest v1.0.0 — Educational Sandbox Runtime</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AVATAR_OPTIONS } from '../../data/defaultCurriculum';
import type { PlayerProfile, AvatarOption } from '../../types/profile';

import { Button } from '../../components/common/Button';
import { Sparkles, Shield, User, ArrowRight } from 'lucide-react';

export interface ProfileCreationModalProps {
  isOpen: boolean;
  initialProfile: PlayerProfile;
  onSaveProfile: (updated: PlayerProfile) => void;
  onPlaySound: (sound: 'click' | 'success') => void;
}

export const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({
  isOpen,
  initialProfile,
  onSaveProfile,
  onPlaySound,
}) => {
  const [username, setUsername] = useState(initialProfile.username || 'Alok');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    initialProfile.avatarId || 'char-a'
  );

  if (!isOpen) return null;

  const handleSelectAvatar = (avatar: AvatarOption) => {
    onPlaySound('click');
    setSelectedAvatar(avatar.id);
  };

  const handleStartJourney = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = username.trim() || 'Alok';
    const chosenAvatar = AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

    onPlaySound('success');

    const updatedProfile: PlayerProfile = {
      ...initialProfile,
      username: finalName,
      avatarId: chosenAvatar.id,
      title: chosenAvatar.role,
    };

    onSaveProfile(updatedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-sky-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(56,189,248,0.2)]">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="text-sky-400" />
            Character Creation
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Choose Your Adventurer
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Set your wizard name and select your PyQuest avatar before venturing forth.
          </p>
        </div>

        <form onSubmit={handleStartJourney} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-amber-400" />
              Adventurer Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name (e.g. Alok)"
              maxLength={20}
              required
              className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 focus:border-amber-400 rounded-xl text-white font-bold text-sm outline-none transition-colors"
            />
          </div>

          {/* Avatar Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={14} className="text-sky-400" />
              Select Avatar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.id;
                return (
                  <div
                    key={avatar.id}
                    onClick={() => handleSelectAvatar(avatar)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col items-center text-center select-none ${
                      isSelected
                        ? `${avatar.border} bg-slate-800/90 shadow-[0_0_20px_rgba(56,189,248,0.3)] scale-105`
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="text-3xl mb-1.5 transform hover:scale-110 transition-transform">
                      {avatar.emoji}
                    </div>
                    <span className="text-xs font-extrabold text-white">
                      {avatar.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {avatar.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Avatar Lore Note */}
          {(() => {
            const chosen = AVATAR_OPTIONS.find((a) => a.id === selectedAvatar);
            return (
              chosen && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
                  <span className="text-2xl">{chosen.emoji}</span>
                  <div>
                    <span className="font-bold text-amber-300 mr-1.5">
                      {chosen.name} ({chosen.role}):
                    </span>
                    {chosen.description}
                  </div>
                </div>
              )
            );
          })()}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              glow
              className="w-full py-4 text-base"
              icon={<ArrowRight size={18} />}
            >
              START JOURNEY
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

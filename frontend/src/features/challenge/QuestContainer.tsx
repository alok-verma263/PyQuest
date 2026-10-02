import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Level } from '../../types/world';
import { LessonReader } from '../lesson/LessonReader';
import { QuizChallenge } from './QuizChallenge';
import { CodeEditorPanel } from '../editor/CodeEditorPanel';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ArrowLeft, Trophy, Sparkles, Coins, ArrowRight } from 'lucide-react';

export interface QuestContainerProps {
  level: Level;
  onBackToMap: () => void;
  onLevelComplete: (levelId: string, earnedXp: number, earnedCoins: number) => void;
  onPlaySound: (sound: 'click' | 'success' | 'level-clear' | 'error') => void;
}

export const QuestContainer: React.FC<QuestContainerProps> = ({
  level,
  onBackToMap,
  onLevelComplete,
  onPlaySound,
}) => {
  // Phase of current quest: 'lessons' | 'challenges' | 'complete'
  const [phase, setPhase] = useState<'lessons' | 'challenges'>(
    level.lessons.length > 0 ? 'lessons' : 'challenges'
  );
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const currentChallenge = level.challenges[currentChallengeIndex];

  const handleLessonFinished = () => {
    setPhase('challenges');
  };

  const handleChallengeSuccess = () => {
    if (currentChallengeIndex < level.challenges.length - 1) {
      // Advance to next challenge in level
      setCurrentChallengeIndex((prev) => prev + 1);
    } else {
      // Level cleared!
      onPlaySound('level-clear');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#facc15', '#10b981', '#a855f7'],
      });
      setShowRewardModal(true);
      onLevelComplete(level.id, level.xpReward, level.coinReward);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Quest Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3 backdrop-blur-md">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={onBackToMap}
        >
          Return to Map
        </Button>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">
            Level {level.order} Quest
          </span>
          <h2 className="text-base font-extrabold text-white">{level.title}</h2>
        </div>

        {/* Quest Sub-Stage Indicator */}
        <div className="flex items-center gap-2">
          {level.lessons.length > 0 && (
            <span
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                phase === 'lessons'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              Theory
            </span>
          )}
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
              phase === 'challenges'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            Trial {currentChallengeIndex + 1}/{level.challenges.length}
          </span>
        </div>
      </div>

      {/* Main Quest Content */}
      {phase === 'lessons' && (
        <LessonReader
          slides={level.lessons}
          onCompleteLessons={handleLessonFinished}
          onPlaySound={onPlaySound}
        />
      )}

      {phase === 'challenges' && currentChallenge && (
        <div className="space-y-4">
          {/* Challenge Prompt Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
                Trial #{currentChallengeIndex + 1}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <Sparkles size={13} />
                +{currentChallenge.xpReward} XP
              </div>
            </div>
            <h3 className="text-lg font-black text-white">{currentChallenge.title}</h3>
            <p className="text-sm text-slate-300 mt-1">{currentChallenge.instructions}</p>
          </div>

          {/* Render Challenge by Type */}
          {currentChallenge.type === 'multiple-choice' ||
          currentChallenge.type === 'predict-output' ? (
            <QuizChallenge
              challenge={currentChallenge}
              onSuccess={handleChallengeSuccess}
              onPlaySound={onPlaySound}
            />
          ) : (
            <CodeEditorPanel
              starterCode={currentChallenge.starterCode}
              solution={currentChallenge.solution}
              testCases={currentChallenge.testCases}
              hints={currentChallenge.hints}
              explanation={currentChallenge.explanation}
              onSuccess={handleChallengeSuccess}
              onPlaySound={onPlaySound}
            />
          )}
        </div>
      )}

      {/* Quest Victory Modal */}
      <Modal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        maxWidth="md"
      >
        <div className="text-center py-4 space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] animate-bounce">
            <Trophy size={36} />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Quest Conquered!
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              {level.title} Cleared!
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              You mastered the magic of Python syntax and advanced your journey!
            </p>
          </div>

          {/* Reward Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/40 flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-sky-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold block">XP Gained</span>
                <span className="text-base font-black text-sky-300">+{level.xpReward}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center gap-2">
              <Coins size={18} className="text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold block">Gold Coins</span>
                <span className="text-base font-black text-amber-300">+{level.coinReward}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-3">
            <Button
              variant="gold"
              size="lg"
              glow
              icon={<ArrowRight size={18} />}
              onClick={() => {
                setShowRewardModal(false);
                onBackToMap();
              }}
            >
              Continue Adventure
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

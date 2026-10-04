import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Level } from '../../types/world';
import { LessonReader } from '../lesson/LessonReader';
import { QuizChallenge } from './QuizChallenge';
import { FixCodeChallenge } from './FixCodeChallenge';
import { CodeEditorPanel } from '../editor/CodeEditorPanel';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { DatasetTablePreview } from '../../components/common/DatasetTablePreview';
import { ChartPreview } from '../../components/common/ChartPreview';
import { ArrowLeft, Trophy, Sparkles, Coins, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface QuestContainerProps {
  level: Level;
  onBackToMap: () => void;
  onAwardReward?: (earnedXp: number, earnedCoins: number) => void;
  onLevelComplete: (levelId: string, earnedXp: number, earnedCoins: number) => void;
  onPlaySound: (sound: 'click' | 'success' | 'level-clear' | 'error') => void;
}

export const QuestContainer: React.FC<QuestContainerProps> = ({
  level,
  onBackToMap,
  onAwardReward,
  onLevelComplete,
  onPlaySound,
}) => {
  // Phase of current quest: 'lessons' | 'challenges'
  const [phase, setPhase] = useState<'lessons' | 'challenges'>(
    level.lessons.length > 0 ? 'lessons' : 'challenges'
  );
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [completedChallengeReward, setCompletedChallengeReward] = useState<{
    title: string;
    xp: number;
    coins: number;
    index: number;
  } | null>(null);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);

  const currentChallenge = level.challenges[currentChallengeIndex];

  const handleLessonFinished = () => {
    setPhase('challenges');
  };

  const handleChallengeSuccess = () => {
    const isLastChallenge = currentChallengeIndex >= level.challenges.length - 1;

    // Award intermediate challenge rewards
    if (onAwardReward && currentChallenge) {
      onAwardReward(currentChallenge.xpReward, currentChallenge.coinReward);
    }

    if (!isLastChallenge) {
      // Show intermediate challenge reward modal/animation
      setCompletedChallengeReward({
        title: currentChallenge.title,
        xp: currentChallenge.xpReward,
        coins: currentChallenge.coinReward,
        index: currentChallengeIndex,
      });
    } else {
      // All challenges completed -> Level Cleared!
      onPlaySound('level-clear');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#38bdf8', '#facc15', '#10b981', '#a855f7'],
      });
      setShowLevelCompleteModal(true);
      onLevelComplete(level.id, level.xpReward, level.coinReward);
    }
  };

  const handleAdvanceToNextChallenge = () => {
    onPlaySound('click');
    setCompletedChallengeReward(null);
    setCurrentChallengeIndex((prev) => prev + 1);
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
              Lessons
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
              <span className="text-xs font-black uppercase text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-600/40">
                Trial #{currentChallengeIndex + 1} of {level.challenges.length}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                  <Sparkles size={13} />
                  +{currentChallenge.xpReward} XP
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Coins size={13} />
                  +{currentChallenge.coinReward} Coins
                </div>
              </div>
            </div>
            <h3 className="text-lg font-black text-white">{currentChallenge.title}</h3>
            <p className="text-sm text-slate-300 mt-1">{currentChallenge.instructions}</p>

            {/* In-Quest Dataset Table Preview */}
            {currentChallenge.tableDataset && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <DatasetTablePreview datasetId={currentChallenge.tableDataset} />
              </div>
            )}

            {/* In-Quest Chart Preview */}
            {currentChallenge.chartPreview && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <ChartPreview chart={currentChallenge.chartPreview} />
              </div>
            )}
          </div>

          {/* Render Challenge by Type */}
          {currentChallenge.type === 'multiple-choice' ||
          currentChallenge.type === 'predict-output' ? (
            <QuizChallenge
              key={currentChallenge.id}
              challenge={currentChallenge}
              onSuccess={handleChallengeSuccess}
              onPlaySound={onPlaySound}
            />
          ) : currentChallenge.type === 'fix-bug' ? (
            <FixCodeChallenge
              key={currentChallenge.id}
              challenge={currentChallenge}
              onSuccess={handleChallengeSuccess}
              onPlaySound={onPlaySound}
            />
          ) : (
            <CodeEditorPanel
              key={currentChallenge.id}
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

      {/* Intermediate Challenge Reward Modal */}
      <Modal
        isOpen={Boolean(completedChallengeReward)}
        onClose={handleAdvanceToNextChallenge}
        maxWidth="md"
      >
        <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Trial {(completedChallengeReward?.index ?? 0) + 1} Conquered!
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              {completedChallengeReward?.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Reward claimed! Your wizard mastery grows stronger.
            </p>
          </div>

          {/* Reward Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3.5 rounded-xl bg-sky-950/50 border border-sky-500/40 flex items-center justify-center gap-2.5">
              <Sparkles size={20} className="text-sky-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Earned</span>
                <span className="text-base font-black text-sky-300">
                  +{completedChallengeReward?.xp} XP
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-center justify-center gap-2.5">
              <Coins size={20} className="text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Earned</span>
                <span className="text-base font-black text-amber-300">
                  +{completedChallengeReward?.coins} Coins
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-center">
            <Button
              variant="gold"
              size="lg"
              glow
              icon={<ArrowRight size={18} />}
              onClick={handleAdvanceToNextChallenge}
              className="w-full sm:w-auto px-8"
            >
              Continue to Next Trial ⚔️
            </Button>
          </div>
        </div>
      </Modal>

      {/* Final Level Complete Victory Modal */}
      <Modal
        isOpen={showLevelCompleteModal}
        onClose={() => {
          setShowLevelCompleteModal(false);
          onBackToMap();
        }}
        maxWidth="md"
      >
        <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.35)] animate-bounce">
            <Trophy size={44} />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/40">
              LEVEL COMPLETE!
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {level.title} Cleared!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
              You conquered all trials of Your First Python Program! Level 2 is now unlocked on the Adventure Map.
            </p>
          </div>

          {/* Level Complete Reward Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3.5 rounded-xl bg-sky-950/60 border border-sky-500/50 flex items-center justify-center gap-2.5">
              <Sparkles size={20} className="text-sky-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Quest Reward</span>
                <span className="text-lg font-black text-sky-300">+{level.xpReward} XP</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/50 flex items-center justify-center gap-2.5">
              <Coins size={20} className="text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Quest Reward</span>
                <span className="text-lg font-black text-amber-300">+{level.coinReward} Coins</span>
              </div>
            </div>
          </div>

          {/* Quest Master Accomplishments */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left max-w-sm mx-auto space-y-1.5 text-xs text-slate-300">
            <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
              Skills Mastered:
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>What Python is & Why it is Useful</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>The print() Function & Output Display</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>Syntax Error Identification & Repair</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>Executed First Python Code in Sandbox</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-center">
            <Button
              variant="gold"
              size="lg"
              glow
              icon={<ArrowRight size={18} />}
              onClick={() => {
                setShowLevelCompleteModal(false);
                onBackToMap();
              }}
              className="w-full sm:w-auto px-8"
            >
              Return to Adventure Map 🗺️
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

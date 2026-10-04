import React, { useState } from 'react';
import type { Challenge } from '../../types/world';
import { Button } from '../../components/common/Button';
import { CheckCircle, XCircle, HelpCircle, Sparkles } from 'lucide-react';

export interface QuizChallengeProps {
  challenge: Challenge;
  onSuccess: () => void;
  onPlaySound: (sound: 'click' | 'success' | 'error') => void;
}

export const QuizChallenge: React.FC<QuizChallengeProps> = ({
  challenge,
  onSuccess,
  onPlaySound,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [revealedHints, setRevealedHints] = useState<number>(0);

  const isOptionCorrect = (opt: string) => {
    if (!challenge.answer) return false;
    const ans = String(challenge.answer).trim();
    if (opt === ans) return true;
    if (opt.startsWith(ans + '.') || opt.startsWith(ans + ' ')) return true;
    const cleanOpt = opt.replace(/^[A-D]\.\s*/, '').trim();
    const cleanAns = ans.replace(/^[A-D]\.\s*/, '').trim();
    return cleanOpt === cleanAns;
  };

  const isCorrect = selectedOption ? isOptionCorrect(selectedOption) : false;

  const handleSelect = (option: string) => {
    if (submitted) return;
    onPlaySound('click');
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitted(true);

    if (isCorrect) {
      onPlaySound('success');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      onPlaySound('error');
    }
  };

  const handleRetry = () => {
    onPlaySound('click');
    setSelectedOption(null);
    setSubmitted(false);
  };

  const handleRevealHint = () => {
    onPlaySound('click');
    setRevealedHints((prev) => Math.min(challenge.hints.length, prev + 1));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
      {/* Challenge Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-600/40">
            {challenge.type === 'predict-output' ? 'Predict Output' : 'Multiple-Choice Trial'}
          </span>
          <h3 className="text-xl font-black text-white mt-1">{challenge.title}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Sparkles size={14} className="text-amber-400" />
          <span>+{challenge.xpReward} XP</span>
        </div>
      </div>

      {/* Instructions & Question */}
      <div className="space-y-3">
        <h4 className="text-sm sm:text-base font-extrabold text-white">
          {challenge.instructions}
        </h4>

        {challenge.question && (
          <div className="rounded-2xl bg-slate-950 border border-slate-700/80 overflow-hidden shadow-inner">
            <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Python Code</span>
              <span className="text-emerald-400">code.py</span>
            </div>
            <div className="p-4 text-emerald-300 font-mono text-base font-semibold select-text">
              {challenge.question}
            </div>
          </div>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {challenge.options?.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isThisOptionCorrect = isOptionCorrect(option);
          let optionStyles = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700';

          if (submitted) {
            if (isThisOptionCorrect) {
              optionStyles = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
            } else if (isSelected && !isCorrect) {
              optionStyles = 'bg-rose-950/50 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
            }
          } else if (isSelected) {
            optionStyles = 'bg-sky-950/60 border-sky-400 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.25)]';
          }

          return (
            <button
              key={idx}
              disabled={submitted && isCorrect}
              onClick={() => handleSelect(option)}
              className={`w-full p-4 rounded-xl border-2 text-left font-mono text-sm transition-all duration-150 flex items-center justify-between cursor-pointer ${optionStyles}`}
            >
              <span>{option}</span>
              {submitted && isThisOptionCorrect && (
                <CheckCircle size={18} className="text-emerald-400 shrink-0" />
              )}
              {submitted && isSelected && !isCorrect && (
                <XCircle size={18} className="text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      {submitted && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
            isCorrect
              ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-200'
              : 'bg-rose-950/30 border-rose-600/50 text-rose-200'
          }`}
        >
          <span className="font-bold block mb-1">
            {isCorrect ? '✅ Correct!' : '❌ Not quite.'}
          </span>
          {isCorrect
            ? challenge.explanation || 'Great job! You selected the right output.'
            : 'That answer is incorrect. Review the code example or use a hint, then try again!'}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div>
          {!submitted && challenge.hints && challenge.hints.length > 0 && (
            <button
              onClick={handleRevealHint}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              <HelpCircle size={14} />
              <span>Need a Hint? ({challenge.hints.length - revealedHints} left)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {submitted && !isCorrect && (
            <Button variant="secondary" size="md" onClick={handleRetry}>
              Try Again
            </Button>
          )}

          {!submitted && (
            <Button
              variant="gold"
              size="md"
              glow={Boolean(selectedOption)}
              disabled={!selectedOption}
              onClick={handleSubmit}
            >
              Check Answer
            </Button>
          )}
        </div>
      </div>

      {/* Hint display */}
      {revealedHints > 0 && (
        <div className="space-y-2 pt-2">
          {challenge.hints.slice(0, revealedHints).map((h, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-amber-950/20 border border-amber-600/30 text-amber-200 text-xs"
            >
              <span className="font-bold text-amber-400 mr-1.5">Hint {i + 1}:</span>
              {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

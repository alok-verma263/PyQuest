import React, { useState } from 'react';
import type { Challenge } from '../../types/world';
import { Button } from '../../components/common/Button';
import { pyodideRunner } from '../../services/pyodideRunner';
import { Wrench, Play, RotateCcw, CheckCircle, AlertTriangle, HelpCircle, Sparkles } from 'lucide-react';

export interface FixCodeChallengeProps {
  challenge: Challenge;
  onSuccess: () => void;
  onPlaySound: (sound: 'click' | 'success' | 'error') => void;
}

export const FixCodeChallenge: React.FC<FixCodeChallengeProps> = ({
  challenge,
  onSuccess,
  onPlaySound,
}) => {
  const starterCode = challenge.starterCode || 'print("Hello Python"';
  const [code, setCode] = useState<string>(starterCode);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);

  const handleReset = () => {
    onPlaySound('click');
    setCode(starterCode);
    setStatus('idle');
    setFeedback(null);
  };

  const handleRevealHint = () => {
    onPlaySound('click');
    setRevealedHints((prev) => Math.min(challenge.hints.length, prev + 1));
  };

  const handleTestFix = async () => {
    onPlaySound('click');
    setIsTesting(true);
    setStatus('idle');
    setFeedback(null);

    try {
      const res = await pyodideRunner.runCode(code, '');
      const actualOutput = res.stdout.trim();
      const expectedOutput = challenge.testCases?.[0]?.expectedOutput?.trim() || 'Hello Python';

      // Check for syntax error or missing closing parenthesis
      if (res.error || !code.includes(')')) {
        onPlaySound('error');
        setStatus('error');
        if (!code.includes(')')) {
          setFeedback(
            "❌ Not quite. The spell still has an unclosed parenthesis! Remember: every opening parenthesis '(' must have a matching closing parenthesis ')' at the end."
          );
        } else {
          setFeedback(`❌ Not quite. Python error: ${res.error}. Make sure quotes and brackets are properly closed.`);
        }
      } else if (actualOutput !== expectedOutput) {
        onPlaySound('error');
        setStatus('error');
        if (!actualOutput) {
          setFeedback(
            `❌ Not quite. The program didn't print the message. Make sure your code is: print("Hello Python")`
          );
        } else {
          setFeedback(
            `❌ Not quite. Expected output: "${expectedOutput}", but received: "${actualOutput}". Check the text inside the quotes!`
          );
        }
      } else {
        // Success!
        onPlaySound('success');
        setStatus('success');
        setFeedback(
          challenge.explanation ||
            "✅ Correct! Spell Repaired! You restored the missing closing parenthesis ')' and fixed the syntax error."
        );
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    } catch {
      onPlaySound('error');
      setStatus('error');
      setFeedback("❌ An unexpected error occurred while executing the code. Please check your syntax.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
      {/* Challenge Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-600/40 text-amber-400">
            <Wrench size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Syntax Repair Trial
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">{challenge.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
          <Sparkles size={14} />
          <span>+{challenge.xpReward} XP</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <h4 className="text-sm sm:text-base font-extrabold text-white">
          {challenge.instructions}
        </h4>
        <p className="text-xs text-slate-400">
          Examine the broken spell below. Identify the missing syntax character and fix it!
        </p>
      </div>

      {/* Code Editor Box */}
      <div className="rounded-2xl border-2 border-slate-700/80 bg-slate-950 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
          <span className="font-mono text-amber-300 flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-400" />
            broken_spell.py
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Editable</span>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (status !== 'idle') {
                setStatus('idle');
                setFeedback(null);
              }
            }}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            className="w-full bg-slate-900/90 text-emerald-300 font-mono text-base px-4 py-3 rounded-xl border border-slate-700 focus:border-sky-400 outline-none select-text transition-colors"
            placeholder='print("Hello Python")'
          />
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 transition-all ${
            status === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-sans">{feedback}</div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div>
          {challenge.hints && challenge.hints.length > 0 && (
            <button
              onClick={handleRevealHint}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              <HelpCircle size={14} />
              <span>Need a Hint? ({challenge.hints.length - revealedHints} remaining)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="md"
            icon={<RotateCcw size={15} />}
            onClick={handleReset}
            disabled={isTesting || code === starterCode}
          >
            Reset
          </Button>

          <Button
            variant="gold"
            size="md"
            glow={status !== 'success'}
            disabled={isTesting || status === 'success'}
            icon={<Play size={15} className="fill-current" />}
            onClick={handleTestFix}
          >
            {isTesting ? 'Testing Spell...' : 'Cast Spell'}
          </Button>
        </div>
      </div>

      {/* Revealed Hints */}
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

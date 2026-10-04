import React, { useState, useRef } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Line numbers calculation for gutter
  const lines = code.split('\n');
  const lineCount = lines.length;
  const lineNumbers = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1);

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

  // Keyboard navigation: Enter (auto-indent), Tab (4 spaces), Shift+Tab (outdent)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Enter') {
      // Prevent accidental form submission
      e.preventDefault();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Determine indentation of the current line
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const currentLine = code.substring(lineStart, start);

      const indentMatch = currentLine.match(/^[ \t]*/);
      let indent = indentMatch ? indentMatch[0] : '';

      // If line ends with colon (:), add 4 spaces indentation
      if (currentLine.trimEnd().endsWith(':')) {
        indent += '    ';
      }

      const insertion = '\n' + indent;
      const newCode = code.substring(0, start) + insertion + code.substring(end);
      setCode(newCode);

      if (status !== 'idle') {
        setStatus('idle');
        setFeedback(null);
      }

      // Update cursor position after state update
      const newCursor = start + insertion.length;
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursor;
        }
      });
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Shift + Tab: outdent line
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const linePrefix = code.substring(lineStart, lineStart + 4);
        const spacesToRemove = linePrefix.match(/^ {1,4}/);
        if (spacesToRemove) {
          const count = spacesToRemove[0].length;
          const newCode = code.substring(0, lineStart) + code.substring(lineStart + count);
          setCode(newCode);
          const newCursor = Math.max(lineStart, start - count);
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursor;
            }
          });
        }
      } else {
        // Tab: insert 4 spaces
        const newCode = code.substring(0, start) + '    ' + code.substring(end);
        setCode(newCode);
        const newCursor = start + 4;
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursor;
          }
        });
      }

      if (status !== 'idle') {
        setStatus('idle');
        setFeedback(null);
      }
    }
  };

  const handleTestFix = async () => {
    onPlaySound('click');
    setIsTesting(true);
    setStatus('idle');
    setFeedback(null);

    try {
      const res = await pyodideRunner.runCode(code, '');
      const actualOutput = res.stdout.trim();
      const expectedOutput = challenge.testCases?.[0]?.expectedOutput?.trim();

      // Check for syntax error or execution error
      if (res.error) {
        onPlaySound('error');
        setStatus('error');
        const openParenCount = (code.match(/\(/g) || []).length;
        const closeParenCount = (code.match(/\)/g) || []).length;

        if (openParenCount > closeParenCount) {
          setFeedback(
            "❌ Syntax error: Unclosed parenthesis detected! Remember: every opening '(' must have a matching closing ')'."
          );
        } else {
          setFeedback(`❌ Python error: ${res.error}. Check your syntax and closing symbols.`);
        }
        return;
      }

      // Check solution correctness
      const normalizeCompact = (s: string) => s.replace(/\s+/g, ' ').trim();
      const userCompact = normalizeCompact(code);
      const solutionCompact = challenge.solution ? normalizeCompact(challenge.solution) : '';

      let isCorrect = false;

      // 1. Solution match
      if (challenge.solution) {
        if (userCompact === solutionCompact) {
          isCorrect = true;
        } else if (challenge.id === 'c2-fix-import-syntax') {
          isCorrect = code.includes('read_csv("student_performance.csv")') || code.includes("read_csv('student_performance.csv')");
        } else if (challenge.id === 'c4-fix-median-fillna') {
          isCorrect = code.includes('.median()');
        } else if (challenge.id === 'c2-fix-the-spell') {
          isCorrect = code.includes('print("Hello Python")') || code.includes("print('Hello Python')");
        }
      }

      // 2. Expected output match
      if (!isCorrect && expectedOutput) {
        if (actualOutput === expectedOutput) {
          isCorrect = true;
        }
      }

      // 3. Fallback: if no solution defined and no testCase expected output, lack of error is success
      if (!challenge.solution && !expectedOutput) {
        isCorrect = true;
      }

      if (!isCorrect) {
        onPlaySound('error');
        setStatus('error');
        if (expectedOutput && actualOutput !== expectedOutput) {
          setFeedback(
            `❌ Expected output "${expectedOutput}", but received "${actualOutput || '(no output)'}". Check your code carefully!`
          );
        } else {
          setFeedback(
            "❌ The code ran, but the syntax bug is not fully repaired yet. Check the instructions or use a hint!"
          );
        }
      } else {
        // Success!
        onPlaySound('success');
        setStatus('success');
        setFeedback(
          challenge.explanation ||
            "✅ Correct! Code Repaired! You fixed the syntax error and executed valid Python code."
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
          Examine the broken code below. Identify the missing syntax character and fix it!
        </p>
      </div>

      {/* Code Editor Box with Line Numbers */}
      <div className="rounded-2xl border-2 border-slate-700/80 bg-slate-950 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
          <span className="font-mono text-amber-300 flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-400" />
            script.py
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Multi-line Editor</span>
        </div>

        {/* Editor Body */}
        <div className="flex bg-slate-950 min-h-[120px] font-mono text-sm leading-6">
          {/* Line Numbers Gutter */}
          <div className="py-3 px-3.5 select-none text-right text-slate-600 bg-slate-950/80 border-r border-slate-800 font-mono text-xs leading-6">
            {lineNumbers.map((num) => (
              <div key={num}>{num}</div>
            ))}
          </div>

          {/* Multi-line Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (status !== 'idle') {
                setStatus('idle');
                setFeedback(null);
              }
            }}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            rows={Math.max(4, lineCount)}
            className="flex-1 p-3 bg-transparent text-emerald-300 font-mono text-sm leading-6 outline-none resize-none whitespace-pre overflow-x-auto select-text placeholder-slate-600 focus:bg-slate-900/30 transition-colors"
            placeholder="# Enter Python code here..."
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
            {isTesting ? 'Testing Fix...' : 'Cast Spell & Test Fix ⚡'}
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

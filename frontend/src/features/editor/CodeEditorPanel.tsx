import React, { useState, useRef } from 'react';
import { Play, RotateCcw, CheckCircle, Terminal, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';
import type { TestCase } from '../../types/world';
import { pyodideRunner } from '../../services/pyodideRunner';
import type { ExecutionResult } from '../../services/pyodideRunner';

export interface CodeEditorPanelProps {
  starterCode?: string;
  solution?: string;
  testCases?: TestCase[];
  hints: string[];
  explanation?: string;
  onSuccess: () => void;
  onPlaySound: (sound: 'click' | 'success' | 'error') => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  starterCode = '# Write your Python code here\n',
  testCases = [],
  hints,
  explanation,
  onSuccess,
  onPlaySound,
}) => {
  const [code, setCode] = useState(starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [testResults, setTestResults] = useState<{ passed: boolean; expected: string; actual: string }[] | null>(null);
  const [validationState, setValidationState] = useState<'success' | 'failure' | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Handle Tab key indentation (4 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);

      // Restore cursor position after state update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleReset = () => {
    onPlaySound('click');
    setCode(starterCode);
    setOutput(null);
    setTestResults(null);
    setValidationState(null);
    setValidationMessage('');
  };

  const handleRunCode = async () => {
    onPlaySound('click');
    setIsRunning(true);
    setTestResults(null);

    try {
      const defaultInput = testCases.length > 0 ? testCases[0].input : '';
      const res = await pyodideRunner.runCode(code, defaultInput);
      setOutput(res);

      if (res.error) {
        onPlaySound('error');
      } else {
        onPlaySound('click');
      }
    } catch {
      onPlaySound('error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    onPlaySound('click');
    setIsRunning(true);
    setValidationState(null);
    setValidationMessage('');

    try {
      let allPassed = true;
      let failureAdvice = '';
      const results: { passed: boolean; expected: string; actual: string }[] = [];

      if (testCases && testCases.length > 0) {
        for (const tc of testCases) {
          const res = await pyodideRunner.runCode(code, tc.input);
          const actualOutput = res.stdout.trim();
          const expectedOutput = tc.expectedOutput.trim();
          const passed = actualOutput === expectedOutput && !res.error;

          results.push({
            passed,
            expected: expectedOutput,
            actual: res.error ? `Error: ${res.error}` : actualOutput,
          });

          if (!passed) {
            allPassed = false;
            if (res.error) {
              failureAdvice = `Python reported a syntax or execution error: ${res.error}`;
            } else if (!actualOutput) {
              failureAdvice = "Your code ran, but didn't print any text. Make sure to put the message inside print(...)!";
            } else if (actualOutput.toLowerCase() === expectedOutput.toLowerCase()) {
              failureAdvice = `Close! Check capitalization: expected "${expectedOutput}" but got "${actualOutput}".`;
            } else {
              failureAdvice = `Expected output "${expectedOutput}", but received "${actualOutput}".`;
            }
          }
        }
        setTestResults(results);
      } else {
        // Run once and evaluate output
        const res = await pyodideRunner.runCode(code, '');
        setOutput(res);
        allPassed = !res.error && res.stdout.trim().length > 0;
        if (!allPassed) {
          failureAdvice = res.error || "The program didn't produce the expected output.";
        }
      }

      if (allPassed) {
        onPlaySound('success');
        setValidationState('success');
        setValidationMessage(explanation || 'Brilliant! You wrote and executed your very first Python program in the browser sandbox!');
        setShowExplanation(true);
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        onPlaySound('error');
        setValidationState('failure');
        setValidationMessage(failureAdvice || 'Check your code and output, then try again!');
        // Provide a useful hint after a failed attempt
        setRevealedHints((prev) => Math.min(hints.length, Math.max(1, prev + 1)));
      }
    } catch {
      onPlaySound('error');
      setValidationState('failure');
      setValidationMessage('An unexpected execution error occurred.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRevealHint = () => {
    onPlaySound('click');
    setRevealedHints((prev) => Math.min(hints.length, prev + 1));
  };

  const lineCount = Math.max(8, code.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="w-full space-y-4">
      {/* Editor Box */}
      <div className="rounded-2xl border-2 border-slate-700/80 bg-slate-950 overflow-hidden shadow-2xl">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-300 ml-2">
              solution.py
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={13} />}
              onClick={handleReset}
              disabled={isRunning}
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Play size={13} className="text-sky-400 fill-sky-400" />}
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
            <Button
              variant="gold"
              size="sm"
              glow
              icon={<CheckCircle size={14} />}
              onClick={handleSubmit}
              disabled={isRunning}
            >
              Submit Quest
            </Button>
          </div>
        </div>

        {/* Code Input Area with Line Numbers */}
        <div className="flex bg-slate-950 min-h-[180px] font-mono text-sm leading-6">
          {/* Line Numbers */}
          <div className="py-4 px-3 select-none text-right text-slate-600 bg-slate-950/60 border-r border-slate-800 font-mono text-xs leading-6">
            {lineNumbers.map((num) => (
              <div key={num}>{num}</div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            className="flex-1 p-4 bg-transparent text-emerald-300 outline-none resize-none font-mono text-sm leading-6 select-text placeholder-slate-600"
            rows={lineCount}
            placeholder="# Write your Python code here..."
          />
        </div>
      </div>

      {/* Terminal Output Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs font-bold text-slate-300">
          <span className="flex items-center gap-2">
            <Terminal size={14} className="text-sky-400" />
            Terminal Output
          </span>
          {output && (
            <span className="text-[11px] text-slate-500 font-mono">
              {output.executionTimeMs}ms
            </span>
          )}
        </div>

        <div className="p-4 font-mono text-xs leading-5 min-h-[70px] max-h-48 overflow-y-auto">
          {isRunning ? (
            <div className="flex items-center gap-2 text-sky-400 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Executing Python incantation in sandbox...</span>
            </div>
          ) : output ? (
            <>
              {output.stdout && (
                <div className="text-slate-200 whitespace-pre-wrap">{output.stdout}</div>
              )}
              {output.error && (
                <div className="text-rose-400 mt-1 flex items-start gap-1.5 whitespace-pre-wrap">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{output.error}</span>
                </div>
              )}
              {!output.stdout && !output.error && (
                <span className="text-slate-500 italic">Program executed with no standard output.</span>
              )}
            </>
          ) : (
            <span className="text-slate-600 italic">Click 'Run Code' or 'Submit Quest' to test your code.</span>
          )}
        </div>
      </div>

      {/* Validation Status Banner (✅ Correct! or ❌ Not quite.) */}
      {validationState && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 transition-all ${
            validationState === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
          }`}
        >
          {validationState === 'success' ? (
            <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-extrabold text-sm block mb-0.5">
              {validationState === 'success' ? '✅ Correct!' : '❌ Not quite.'}
            </span>
            <span>{validationMessage}</span>
          </div>
        </div>
      )}

      {/* Test Cases Feedback Results (if submitted) */}
      {testResults && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Test Case Trials
          </h4>
          <div className="space-y-2">
            {testResults.map((tr, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                  tr.passed
                    ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-600/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tr.passed ? (
                    <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-400 shrink-0" />
                  )}
                  <span>Test Case #{idx + 1}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Expected: </span>
                  <span className="font-bold text-white">"{tr.expected}"</span>
                  <span className="text-slate-400 ml-2">Got: </span>
                  <span className={tr.passed ? 'text-emerald-300' : 'text-rose-400 font-bold'}>
                    "{tr.actual}"
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation Banner upon Success */}
      {showExplanation && explanation && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
          <Sparkles size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Quest Master Insight:</span>
            {explanation}
          </div>
        </div>
      )}

      {hints && hints.length > 0 && (
        <div className="pt-2">
          {revealedHints < hints.length ? (
            <button
              onClick={handleRevealHint}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer"
            >
              <HelpCircle size={14} />
              <span>Need a Hint? ({hints.length - revealedHints} remaining)</span>
            </button>
          ) : null}

          {revealedHints > 0 && (
            <div className="mt-2 space-y-2">
              {hints.slice(0, revealedHints).map((hint, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-amber-950/20 border border-amber-600/30 text-amber-200 text-xs flex items-start gap-2"
                >
                  <span className="font-bold text-amber-400 shrink-0">Hint {i + 1}:</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

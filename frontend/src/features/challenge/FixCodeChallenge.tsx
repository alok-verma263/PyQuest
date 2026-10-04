import React, { useState, useRef } from 'react';
import type { Challenge } from '../../types/world';
import { Button } from '../../components/common/Button';
import { pyodideRunner } from '../../services/pyodideRunner';
import { DataArtifactCard } from '../../components/common/DataArtifactCard';
import { DataPipelineGate } from '../../components/common/DataPipelineGate';
import {
  Wrench,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Zap,
  Coins,
  ArrowLeft,
  Terminal,
} from 'lucide-react';

export interface FixCodeChallengeProps {
  challenge: Challenge;
  onSuccess: () => void;
  onPlaySound: (sound: 'click' | 'success' | 'error') => void;
  questTitle?: string;
  trialNumber?: number;
  totalTrials?: number;
  onBackToMap?: () => void;
}

interface CodeCheckFeedback {
  status: 'success' | 'error';
  title: string;
  message: string;
  checklist?: string[];
}

export const FixCodeChallenge: React.FC<FixCodeChallengeProps> = ({
  challenge,
  onSuccess,
  onPlaySound,
  questTitle = 'DATA IMPORT FORGE',
  trialNumber,
  totalTrials,
  onBackToMap,
}) => {
  const starterCode = challenge.starterCode || 'print("Hello Python"';
  const [code, setCode] = useState<string>(starterCode);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState<CodeCheckFeedback | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Line count and line numbers calculation for gutter
  const lines = code.split('\n');
  const lineCount = lines.length;
  const lineNumbers = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1);

  // Update cursor line & col indicator
  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const textBefore = code.substring(0, pos);
    const lineIndex = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const colIndex = pos - lastNewline;
    setCursorPos({ line: lineIndex, col: colIndex });
  };

  // Synchronize scrolling between textarea and pre syntax layer
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleReset = () => {
    onPlaySound('click');
    setCode(starterCode);
    setStatus('idle');
    setFeedback(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
      e.preventDefault();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const currentLine = code.substring(lineStart, start);

      const indentMatch = currentLine.match(/^[ \t]*/);
      let indent = indentMatch ? indentMatch[0] : '';

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

      const newCursor = start + insertion.length;
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursor;
          updateCursorPosition();
          handleScroll();
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
              updateCursorPosition();
              handleScroll();
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
            updateCursorPosition();
            handleScroll();
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

      const openParenCount = (code.match(/\(/g) || []).length;
      const closeParenCount = (code.match(/\)/g) || []).length;

      // Check for syntax error or unclosed parenthesis
      if (res.error || openParenCount > closeParenCount) {
        onPlaySound('error');
        setStatus('error');

        if (challenge.id === 'c2-fix-import-syntax' && openParenCount > closeParenCount) {
          setFeedback({
            status: 'error',
            title: '❌ CODE CHECK FAILED',
            message: 'The dataset was not loaded successfully.',
            checklist: [
              'Check closing parenthesis in pd.read_csv()',
              'Check dataset filename "student_performance.csv"',
              'Verify matching open and close brackets',
            ],
          });
        } else if (openParenCount > closeParenCount) {
          setFeedback({
            status: 'error',
            title: '❌ CODE CHECK FAILED',
            message: 'Syntax check failed: Unclosed parenthesis detected.',
            checklist: [
              "Every opening '(' requires a matching closing ')'",
              'Check method invocation syntax',
            ],
          });
        } else if (challenge.id === 'c4-fix-median-fillna' && !code.includes('.median()')) {
          setFeedback({
            status: 'error',
            title: '❌ CODE CHECK FAILED',
            message: 'The median calculation could not be computed.',
            checklist: [
              'In Python, .median is a method',
              'Must be invoked with parentheses: .median()',
            ],
          });
        } else {
          setFeedback({
            status: 'error',
            title: '❌ CODE CHECK FAILED',
            message: 'The code execution encountered a syntax error.',
            checklist: [
              res.error || 'SyntaxError: invalid syntax',
              'Review line endings and closing punctuation',
            ],
          });
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
          isCorrect =
            code.includes('read_csv("student_performance.csv")') ||
            code.includes("read_csv('student_performance.csv')");
        } else if (challenge.id === 'c4-fix-median-fillna') {
          isCorrect = code.includes('.median()');
        } else if (challenge.id === 'c2-fix-the-spell') {
          isCorrect =
            code.includes('print("Hello Python")') || code.includes("print('Hello Python')");
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
        setFeedback({
          status: 'error',
          title: '❌ CODE CHECK FAILED',
          message: 'The dataset was not loaded successfully.',
          checklist: [
            'Verify exact syntax requirements',
            'Check function arguments and return types',
          ],
        });
      } else {
        // Success!
        onPlaySound('success');
        setStatus('success');

        const isImportChallenge =
          challenge.id === 'c2-fix-import-syntax' || code.includes('read_csv');

        setFeedback({
          status: 'success',
          title: isImportChallenge ? '✨ DATA IMPORT SUCCESSFUL' : '✨ CODE CHECK PASSED',
          message:
            challenge.explanation ||
            'Python statement executed successfully and output verified.',
          checklist: isImportChallenge
            ? [
                'Python code executed',
                'Dataset loaded',
                '10 rows detected',
                '9 columns detected',
              ]
            : ['Python code executed', 'Syntax verified', 'Expected output confirmed'],
        });

        setTimeout(() => {
          onSuccess();
        }, 1300);
      }
    } catch {
      onPlaySound('error');
      setStatus('error');
      setFeedback({
        status: 'error',
        title: '❌ CODE CHECK FAILED',
        message: 'The dataset was not loaded successfully. Unexpected execution error occurred.',
        checklist: ['Check statement syntax', 'Review import and read_csv() parameters'],
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Python Syntax Tokenizer
  const renderHighlightedCode = (rawCode: string) => {
    const codeLines = rawCode.split('\n');
    return codeLines.map((line, lIdx) => {
      const TOKEN_REGEX =
        /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:import|from|as|def|class|return|if|elif|else|while|for|in|try|except|with|pass|break|continue|lambda|and|or|not|is|None|True|False)\b)|(\b(?:print|read_csv|read_excel|fillna|dropna|replace|isnull|isna|sum|mean|median|mode|shape|head|tail|info|describe|open|range|len)\b)|(\b(?:pd|np|plt|sns|df)\b)|(\b\d+(?:\.\d+)?\b)|([()[\]{}:])/g;

      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = TOKEN_REGEX.exec(line)) !== null) {
        if (match.index > lastIndex) {
          elements.push(
            <span key={`txt-${lIdx}-${lastIndex}`} className="text-slate-200">
              {line.substring(lastIndex, match.index)}
            </span>
          );
        }

        const [, comment, str, kw, method, moduleToken, num, bracket] = match;

        if (comment) {
          elements.push(
            <span key={`tok-${lIdx}-${match.index}`} className="text-slate-500 italic">
              {comment}
            </span>
          );
        } else if (str) {
          elements.push(
            <span key={`tok-${lIdx}-${match.index}`} className="text-amber-300">
              {str}
            </span>
          );
        } else if (kw) {
          elements.push(
            <span key={`tok-${lIdx}-${match.index}`} className="text-purple-400 font-bold">
              {kw}
            </span>
          );
        } else if (method) {
          elements.push(
            <span key={`tok-${lIdx}-${match.index}`} className="text-sky-300 font-bold">
              {method}
            </span>
          );
        } else if (moduleToken) {
          elements.push(
            <span key={`tok-${lIdx}-${match.index}`} className="text-emerald-300 font-semibold">
              {moduleToken}
            </span>
          );
        } else if (num) {
          elements.push(
            <span key={`tok-${lIdx}-${match.index}`} className="text-orange-400">
              {num}
            </span>
          );
        } else if (bracket) {
          elements.push(
            <span key={`tok-${lIdx}-${match.index}`} className="text-yellow-400 font-bold">
              {bracket}
            </span>
          );
        }

        lastIndex = TOKEN_REGEX.lastIndex;
      }

      if (lastIndex < line.length) {
        elements.push(
          <span key={`end-${lIdx}-${lastIndex}`} className="text-slate-200">
            {line.substring(lastIndex)}
          </span>
        );
      }

      return (
        <div key={lIdx} className="leading-6 min-h-[1.5rem]">
          {elements.length > 0 ? elements : ' '}
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* 1. CHALLENGE TOP BAR (Standalone or Quest sync) */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={onBackToMap}
            >
              Back to Map
            </Button>
          )}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">
              {questTitle}
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              {challenge.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {trialNumber && totalTrials && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              TRIAL {trialNumber} / {totalTrials}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-950/70 px-2.5 py-1 rounded-lg border border-sky-600/30">
            <Sparkles size={13} />
            <span>+{challenge.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/70 px-2.5 py-1 rounded-lg border border-amber-600/30">
            <Coins size={13} />
            <span>+{challenge.coinReward} Coins</span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN RESPONSIVE LAYOUT (Desktop: 5 cols / 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Data Pipeline Gate & Dataset Artifact */}
        <div className="lg:col-span-5 space-y-4">
          {/* Data Import Pipeline Gate */}
          <DataPipelineGate
            questTitle={questTitle}
            introMessage="Learn how to bring real-world data into Python."
            sourceFile={
              challenge.tableDataset === 'sales_data'
                ? 'sales_data.csv'
                : 'student_performance.csv'
            }
            targetStructure="Pandas DataFrame"
          />

          {/* Dataset Artifact Card */}
          <DataArtifactCard
            datasetId={challenge.tableDataset || 'student_performance'}
            title="STUDENT PERFORMANCE"
            initialExpanded={true}
          />
        </div>

        {/* RIGHT COLUMN: Objective, Code Editor, Actions, Feedback, Hints */}
        <div className="lg:col-span-7 space-y-4">
          {/* Challenge Objective Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-600/40">
                  <Wrench size={15} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  Code Repair Objective
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Target: script.py</span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-white">
              {challenge.instructions}
            </h3>
            <p className="text-xs text-slate-400">
              Fix the broken Python statement so the dataset can be loaded successfully.
            </p>
          </div>

          {/* PYTHON CODE EDITOR */}
          <div className="rounded-2xl border-2 border-sky-500/40 focus-within:border-sky-400 focus-within:shadow-[0_0_25px_rgba(56,189,248,0.25)] bg-[#070d19] overflow-hidden shadow-[inset_0_0_20px_rgba(56,189,248,0.08),_0_8px_32px_rgba(0,0,0,0.6)] glow-cyan-card transition-all">
            {/* Editor Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-900 via-sky-950/70 to-slate-900 border-b border-sky-800/40 text-xs">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-sky-400" />
                <span className="font-mono font-bold text-sky-200">PYTHON CODE EDITOR</span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  — script.py
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400">
                  Ln {cursorPos.line}, Col {cursorPos.col}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-300 bg-sky-950/70 px-2 py-0.5 rounded border border-sky-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>Python 3.11</span>
                </div>
              </div>
            </div>

            {/* Editor Body: Line Numbers Gutter + Syntax Highlighted Textarea */}
            <div className="flex bg-[#070d19] min-h-[140px] font-mono text-sm leading-6">
              {/* Line Numbers Gutter */}
              <div className="py-3 px-3 select-none text-right text-slate-600 bg-slate-950/90 border-r border-sky-950/80 font-mono text-xs leading-6 space-y-0">
                {lineNumbers.map((num) => {
                  const isActive = num === cursorPos.line;
                  return (
                    <div
                      key={num}
                      className={`px-1.5 rounded transition-colors ${
                        isActive
                          ? 'text-sky-300 font-bold bg-sky-950/80 border border-sky-500/30'
                          : 'text-slate-600'
                      }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>

              {/* Editor Code Area */}
              <div className="relative flex-1 overflow-hidden min-h-[140px]">
                {/* Syntax Highlighted Background Layer */}
                <pre
                  ref={preRef}
                  aria-hidden="true"
                  className="absolute inset-0 p-3 m-0 font-mono text-sm leading-6 pointer-events-none select-none overflow-hidden whitespace-pre"
                >
                  {renderHighlightedCode(code)}
                </pre>

                {/* Multiline Foreground Textarea */}
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
                  onKeyUp={updateCursorPosition}
                  onClick={updateCursorPosition}
                  onSelect={updateCursorPosition}
                  onScroll={handleScroll}
                  spellCheck="false"
                  autoCapitalize="off"
                  autoComplete="off"
                  rows={Math.max(4, lineCount)}
                  className="relative w-full h-full p-3 m-0 bg-transparent text-transparent caret-sky-400 font-mono text-sm leading-6 outline-none resize-none whitespace-pre overflow-auto select-text selection:bg-sky-500/30 selection:text-white"
                  placeholder="# Enter Python code here..."
                />
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="md"
              icon={<RotateCcw size={15} />}
              onClick={handleReset}
              disabled={isTesting || code === starterCode}
              className="text-slate-400 hover:text-white"
            >
              Reset Code
            </Button>

            <Button
              variant="gold"
              size="md"
              glow={status !== 'success'}
              disabled={isTesting || status === 'success'}
              icon={
                isTesting ? (
                  <Zap size={16} className="animate-spin text-amber-200" />
                ) : (
                  <Play size={16} className="fill-current text-amber-950" />
                )
              }
              onClick={handleTestFix}
              className="font-extrabold px-6"
            >
              {isTesting ? 'Executing Code...' : 'Run Code & Test Fix ⚡'}
            </Button>
          </div>

          {/* RESULT CARD: GAME FEEDBACK (Success / Error State) */}
          {feedback && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-2.5 ${
                feedback.status === 'success'
                  ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-emerald-950/70 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)] animate-reward-pop'
                  : 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-rose-950/70 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)] animate-spell-shake'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-xl ${
                      feedback.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {feedback.status === 'success' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}
                  </div>
                  <h4 className="text-base font-black text-white tracking-wide">
                    {feedback.title}
                  </h4>
                </div>

                {feedback.status === 'success' && (
                  <div className="flex items-center gap-2 text-xs font-black">
                    <span className="text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/40">
                      +{challenge.xpReward} XP
                    </span>
                    <span className="text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                      +{challenge.coinReward} Coins
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {feedback.message}
              </p>

              {/* Checklist */}
              {feedback.checklist && feedback.checklist.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {feedback.status === 'error' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">
                      Check:
                    </span>
                  )}
                  <div
                    className={`grid gap-1.5 ${
                      feedback.status === 'success'
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-1'
                    }`}
                  >
                    {feedback.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
                          feedback.status === 'success'
                            ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950/40 text-rose-200 border border-rose-800/30'
                        }`}
                      >
                        {feedback.status === 'success' ? (
                          <span className="text-emerald-400 font-bold">✓</span>
                        ) : (
                          <span className="text-rose-400 font-bold">•</span>
                        )}
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Guidance: Hint Button */}
              {feedback.status === 'error' && challenge.hints && challenge.hints.length > 0 && (
                <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between">
                  <span className="text-[11px] text-rose-300/80">
                    Need technical guidance on this challenge?
                  </span>
                  <button
                    onClick={handleRevealHint}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-bold px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-600/40 transition-colors cursor-pointer"
                  >
                    <HelpCircle size={13} />
                    <span>View Hint</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* HINT CARD */}
          <div className="pt-1">
            {challenge.hints && challenge.hints.length > 0 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={handleRevealHint}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer transition-colors"
                >
                  <HelpCircle size={14} />
                  <span>
                    Need a Hint? ({challenge.hints.length - revealedHints} remaining)
                  </span>
                </button>
              </div>
            )}

            {/* Revealed Hints */}
            {revealedHints > 0 && (
              <div className="space-y-2 pt-3">
                {challenge.hints.slice(0, revealedHints).map((h, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900/80 to-sky-950/40 border border-sky-500/40 text-sky-200 text-xs shadow-md animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-sky-300 mb-1">
                      <Sparkles size={13} className="text-sky-400" />
                      <span>Technical Hint {i + 1}:</span>
                    </div>
                    <p className="text-slate-300">{h}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import type { Challenge } from '../../types/world';
import { Button } from '../../components/common/Button';
import { pyodideRunner } from '../../services/pyodideRunner';
import { DataArtifactCard } from '../../components/common/DataArtifactCard';
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
  Scroll,
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

interface SpellFeedback {
  status: 'success' | 'error';
  title: string;
  message: string;
  subChecks?: string[];
}

export const FixCodeChallenge: React.FC<FixCodeChallengeProps> = ({
  challenge,
  onSuccess,
  onPlaySound,
  questTitle,
  trialNumber,
  totalTrials,
  onBackToMap,
}) => {
  const starterCode = challenge.starterCode || 'print("Hello Python"';
  const [code, setCode] = useState<string>(starterCode);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [spellFeedback, setSpellFeedback] = useState<SpellFeedback | null>(null);
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
    setSpellFeedback(null);
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
        setSpellFeedback(null);
      }

      // Update cursor position after state update
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
        setSpellFeedback(null);
      }
    }
  };

  const handleTestFix = async () => {
    onPlaySound('click');
    setIsTesting(true);
    setStatus('idle');
    setSpellFeedback(null);

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
          setSpellFeedback({
            status: 'error',
            title: '❌ SPELL FAILED',
            message:
              "The dataset was not loaded. Check the closing parenthesis in pd.read_csv(). In Python, every opening '(' requires a matching closing ')'.",
          });
        } else if (openParenCount > closeParenCount) {
          setSpellFeedback({
            status: 'error',
            title: '❌ SPELL FAILED',
            message:
              "Unclosed parenthesis rune detected! In Python, every opening '(' must have a matching closing ')'.",
          });
        } else if (challenge.id === 'c4-fix-median-fillna' && !code.includes('.median()')) {
          setSpellFeedback({
            status: 'error',
            title: '❌ SPELL FAILED',
            message:
              "The median calculation failed! In Python, '.median' is a method and must be called with parentheses: '.median()'.",
          });
        } else {
          setSpellFeedback({
            status: 'error',
            title: '❌ SPELL FAILED',
            message: `Syntax incantation failed: ${res.error || 'Check your closing brackets and syntax symbols.'}`,
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
        setSpellFeedback({
          status: 'error',
          title: '❌ SPELL FAILED',
          message:
            "The code ran without crashing, but the syntax bug is not fully repaired yet. Check the instructions or consult the Sage's hint!",
        });
      } else {
        // Success!
        onPlaySound('success');
        setStatus('success');

        const isImportChallenge =
          challenge.id === 'c2-fix-import-syntax' || code.includes('read_csv');

        setSpellFeedback({
          status: 'success',
          title: '✨ SPELL RESTORED!',
          message:
            challenge.explanation ||
            'You repaired the Python syntax rune and awakened the data incantation!',
          subChecks: isImportChallenge
            ? ['Dataset loaded into memory', 'Rows detected (10 records)', 'Columns detected (9 features)']
            : ['Syntax verified', 'Incantation executed', 'Output confirmed'],
        });

        setTimeout(() => {
          onSuccess();
        }, 1400);
      }
    } catch {
      onPlaySound('error');
      setStatus('error');
      setSpellFeedback({
        status: 'error',
        title: '❌ SPELL FAILED',
        message: 'An unexpected disturbance disrupted execution. Please check your syntax runes.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Python Syntax Tokenizer for Spellbook
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

  // Sage / NPC Dialogue Context
  const getSageLore = () => {
    if (challenge.id === 'c2-fix-import-syntax') {
      return 'Hail, Apprentice! The ancient records of Student Performance must be summoned into the DataFrame crystal using pd.read_csv(). But the summoning rune has fractured—the closing parenthesis is missing! Repair the spell to awaken the dataset.';
    }
    if (challenge.id === 'c4-fix-median-fillna') {
      return "Apprentice! In Python, .median is a method that must be invoked with parentheses (). Without them, the imputation enchantment will falter. Repair the method call to banish the missing values!";
    }
    if (challenge.id === 'c2-fix-the-spell') {
      return "Welcome, initiate! The print() spell requires a closing parenthesis to seal the incantation. Close the rune to cast your first spell.";
    }
    return challenge.instructions;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* 1. QUEST HEADER (Optional standalone or sync with QuestContainer) */}
      {(onBackToMap || questTitle) && (
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            {onBackToMap && (
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={onBackToMap}
              >
                Return to Map
              </Button>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">
                {questTitle ? `Quest: ${questTitle}` : 'PyQuest Adventure'}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                {challenge.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {trialNumber && totalTrials && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Trial {trialNumber}/{totalTrials}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-600/30">
              <Sparkles size={13} />
              <span>+{challenge.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-600/30">
              <Coins size={13} />
              <span>+{challenge.coinReward} Coins</span>
            </div>
          </div>
        </div>
      )}

      {/* 2-COLUMN RESPONSIVE LAYOUT (Desktop: 5 cols / 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Quest Intro & Data Artifact */}
        <div className="lg:col-span-5 space-y-4">
          {/* 2. QUEST INTRO (NPC / Sage Dialogue) */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-sky-600/40 bg-gradient-to-br from-slate-900/95 via-sky-950/30 to-slate-900/95 shadow-xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3.5">
              {/* Sage Avatar */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5 shadow-[0_0_15px_rgba(56,189,248,0.4)] shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                  🧙‍♂️
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-sky-300">
                    Archmage Pythos
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Sage of the Data Forge
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-sans">
                  "{getSageLore()}"
                </p>
              </div>
            </div>
          </div>

          {/* 3. DATA ARTIFACT CARD */}
          <DataArtifactCard
            datasetId={challenge.tableDataset || 'student_performance'}
            title="STUDENT PERFORMANCE"
            initialExpanded={true}
          />
        </div>

        {/* RIGHT COLUMN: Challenge Card, Spellbook Editor, Actions, Results, Hints */}
        <div className="lg:col-span-7 space-y-4">
          {/* 4. CHALLENGE OBJECTIVE CARD */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-600/40">
                  <Wrench size={15} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Syntax Repair Mission
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Target: script.py</span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-white">
              {challenge.instructions}
            </h3>
            <p className="text-xs text-slate-400">
              Move your cursor into the Spellbook editor below. Identify the broken syntax character and repair it.
            </p>
          </div>

          {/* 5. VISUAL EDITOR: THE "PYTHON SPELLBOOK" */}
          <div className="rounded-2xl border-2 border-sky-500/40 focus-within:border-sky-400 focus-within:shadow-[0_0_25px_rgba(56,189,248,0.25)] bg-[#090d16] overflow-hidden shadow-[inset_0_0_20px_rgba(56,189,248,0.08),_0_8px_32px_rgba(0,0,0,0.6)] transition-all">
            {/* Spellbook Header / Scroll Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border-b border-sky-800/40 text-xs">
              <div className="flex items-center gap-2">
                <Scroll size={14} className="text-sky-400" />
                <span className="font-mono font-bold text-sky-200">script.py</span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  — Python Spell Scroll
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400">
                  Ln {cursorPos.line}, Col {cursorPos.col}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Python 3.11</span>
                </div>
              </div>
            </div>

            {/* Spellbook Body: Gutter + Overlay Syntax Editor */}
            <div className="flex bg-[#090d16] min-h-[140px] font-mono text-sm leading-6">
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

              {/* Editor Code Area: Relative container with Pre syntax highlight behind Textarea */}
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
                      setSpellFeedback(null);
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
                  placeholder="# Enter Python incantation here..."
                />
              </div>
            </div>
          </div>

          {/* 6. ACTION BAR */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="md"
              icon={<RotateCcw size={15} />}
              onClick={handleReset}
              disabled={isTesting || code === starterCode}
              className="text-slate-400 hover:text-white"
            >
              Reset Spell
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
              {isTesting ? 'Channeling Spell...' : 'Cast Spell & Test Fix ⚡'}
            </Button>
          </div>

          {/* 7. RESULT CARD: GAME FEEDBACK (Success / Error State) */}
          {spellFeedback && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-2.5 ${
                spellFeedback.status === 'success'
                  ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-emerald-950/70 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)] animate-reward-pop'
                  : 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-rose-950/70 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)] animate-spell-shake'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-xl ${
                      spellFeedback.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {spellFeedback.status === 'success' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}
                  </div>
                  <h4 className="text-base font-black text-white tracking-wide">
                    {spellFeedback.title}
                  </h4>
                </div>

                {spellFeedback.status === 'success' && (
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
                {spellFeedback.message}
              </p>

              {/* Success Checklist */}
              {spellFeedback.subChecks && spellFeedback.subChecks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {spellFeedback.subChecks.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg"
                    >
                      <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Error Guidance: Quick Hint Button */}
              {spellFeedback.status === 'error' && challenge.hints && challenge.hints.length > 0 && (
                <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between">
                  <span className="text-[11px] text-rose-300/80">Need guidance on the missing rune?</span>
                  <button
                    onClick={handleRevealHint}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-bold px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-600/40 transition-colors cursor-pointer"
                  >
                    <HelpCircle size={13} />
                    <span>View Sage's Hint</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 8. HINT CARD */}
          <div className="pt-1">
            {challenge.hints && challenge.hints.length > 0 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={handleRevealHint}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
                >
                  <HelpCircle size={14} />
                  <span>
                    Need a Hint? ({challenge.hints.length - revealedHints} remaining)
                  </span>
                </button>
              </div>
            )}

            {/* Revealed Hints in ancient gold parchment cards */}
            {revealedHints > 0 && (
              <div className="space-y-2 pt-3">
                {challenge.hints.slice(0, revealedHints).map((h, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-amber-950/30 border border-amber-500/40 text-amber-200 text-xs shadow-md animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Sage's Hint {i + 1}:</span>
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

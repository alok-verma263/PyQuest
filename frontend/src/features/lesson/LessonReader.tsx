import React, { useState } from 'react';
import type { LessonSlide } from '../../types/world';
import { Button } from '../../components/common/Button';
import {
  BookOpen,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { DatasetTablePreview } from '../../components/common/DatasetTablePreview';
import { ChartPreview } from '../../components/common/ChartPreview';

export interface LessonReaderProps {
  slides: LessonSlide[];
  onCompleteLessons: () => void;
  onPlaySound: (sound: 'click' | 'success') => void;
}

export const LessonReader: React.FC<LessonReaderProps> = ({
  slides,
  onCompleteLessons,
  onPlaySound,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slide = slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === slides.length - 1;

  const handleNext = () => {
    onPlaySound('click');
    if (isLastSlide) {
      onPlaySound('success');
      onCompleteLessons();
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    onPlaySound('click');
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const handleJumpToSlide = (idx: number) => {
    onPlaySound('click');
    setCurrentSlideIndex(idx);
  };

  if (!slide) return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* 3-Column / Balanced Lesson Grid (LEFT: Nav, CENTER: Content, RIGHT: Code/Data Artifact) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Lesson Navigation / Step Tracker (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
            <div className="p-1.5 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-600/30">
              <BookOpen size={15} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Quest Curriculum
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {slides.length} Lesson Modules
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            {slides.map((s, idx) => {
              const isActive = idx === currentSlideIndex;
              const isPast = idx < currentSlideIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleJumpToSlide(idx)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-sky-600/25 text-sky-200 border border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                      : isPast
                      ? 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80'
                      : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                        isActive
                          ? 'bg-sky-500 text-white'
                          : isPast
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPast ? <CheckCircle2 size={12} /> : idx + 1}
                    </span>
                    <span className="truncate">{s.title}</span>
                  </div>
                  {isActive && <ChevronRight size={13} className="text-sky-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Quick Progress Bar */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>Progress</span>
              <span>
                {Math.round(((currentSlideIndex + 1) / slides.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Lesson Content & Theory (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-600/30">
                Lesson {currentSlideIndex + 1} of {slides.length}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-wide">{slide.title}</h2>
          </div>

          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line space-y-3 font-sans">
            {slide.content}
          </div>

          {/* Tip Card */}
          {slide.tip && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs shadow-sm">
              <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 mr-1">Data Tip:</span>
                <span className="text-slate-200">{slide.tip}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Dataset Artifact / Code Example (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Dataset Table Preview if present */}
          {slide.tableDataset && (
            <div>
              <DatasetTablePreview datasetId={slide.tableDataset} />
            </div>
          )}

          {/* Interactive Chart Preview if present */}
          {slide.chartPreview && (
            <div>
              <ChartPreview chart={slide.chartPreview} />
            </div>
          )}

          {/* Code Example Box */}
          {slide.codeExample && (
            <div className="rounded-2xl border border-sky-800/40 bg-slate-950 overflow-hidden shadow-lg glow-cyan-card">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/95 border-b border-slate-800 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-sky-300 font-bold text-[11px]">
                  <Terminal size={13} className="text-sky-400" />
                  example.py
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Python Code Block</span>
              </div>

              <pre className="p-3.5 text-emerald-300 font-mono text-xs leading-relaxed overflow-x-auto select-text whitespace-pre">
                <code>{slide.codeExample}</code>
              </pre>

              {/* Output Preview */}
              {slide.outputExample && (
                <div className="px-3.5 py-2.5 bg-slate-900/90 border-t border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Console Output:
                  </span>
                  <div className="font-mono text-[11px] p-2 rounded bg-slate-950 text-sky-200 border border-slate-800 overflow-x-auto whitespace-pre">
                    {slide.outputExample}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg backdrop-blur-md">
        <Button
          variant="ghost"
          size="md"
          icon={<ChevronLeft size={16} />}
          onClick={handlePrev}
          disabled={currentSlideIndex === 0}
        >
          Previous Lesson
        </Button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleJumpToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-6 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                  : idx < currentSlideIndex
                  ? 'w-2.5 bg-sky-600/50'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <Button
          variant={isLastSlide ? 'gold' : 'primary'}
          size="md"
          glow={isLastSlide}
          icon={isLastSlide ? <ArrowRight size={16} /> : <ChevronRight size={16} />}
          onClick={handleNext}
        >
          {isLastSlide ? 'Begin Challenges ⚔️' : 'Next Lesson'}
        </Button>
      </div>
    </div>
  );
};

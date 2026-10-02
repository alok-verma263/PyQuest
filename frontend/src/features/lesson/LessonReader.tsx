import React, { useState } from 'react';
import type { LessonSlide } from '../../types/world';
import { Button } from '../../components/common/Button';
import { BookOpen, Sparkles, Lightbulb, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';

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

  if (!slide) return null;

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      {/* Header with Step Tracker */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-950/80 border border-sky-600/40 text-sky-400">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              Theory Scroll
            </span>
            <h3 className="text-xl font-black text-white">{slide.title}</h3>
          </div>
        </div>

        {/* Slide Counter Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlideIndex
                  ? 'w-6 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slide Theory Content */}
      <div className="space-y-6">
        <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {slide.content}
        </div>

        {/* Code Example Box */}
        {slide.codeExample && (
          <div className="rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-sky-300">
                <Sparkles size={13} />
                Python Incantation
              </span>
              <span className="font-mono text-[11px]">example.py</span>
            </div>
            <pre className="p-4 text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto select-text">
              <code>{slide.codeExample}</code>
            </pre>
          </div>
        )}

        {/* Pro Tip Callout */}
        {slide.tip && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs sm:text-sm">
            <Lightbulb size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-400">Sage's Advice: </span>
              {slide.tip}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
        <Button
          variant="ghost"
          size="md"
          icon={<ChevronLeft size={16} />}
          onClick={handlePrev}
          disabled={currentSlideIndex === 0}
        >
          Previous
        </Button>

        <Button
          variant={isLastSlide ? 'gold' : 'primary'}
          size="md"
          glow={isLastSlide}
          icon={isLastSlide ? <ArrowRight size={16} /> : <ChevronRight size={16} />}
          onClick={handleNext}
        >
          {isLastSlide ? 'Begin Challenge ⚔️' : 'Next Theory'}
        </Button>
      </div>
    </div>
  );
};

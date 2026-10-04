import React from 'react';
import type { Level } from '../../types/world';
import type { QuestLandmarkData } from '../../data/questLandmarks';
import { DATA_CLEANING_LANDMARKS } from '../../data/questLandmarks';
import { Button } from '../common/Button';
import { QuestLandmarkGraphic } from './QuestLandmarkGraphic';
import { TreasureChestGraphic } from './TreasureChestGraphic';
import { CheckCircle2, Lock, ArrowRight, Play } from 'lucide-react';

export interface BottomQuestPanelProps {
  level: Level;
  landmarkData?: QuestLandmarkData;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';
  isNextQuest?: boolean;
  onStartQuest: (level: Level) => void;
  onPlaySound: (sound: 'click' | 'level-select') => void;
}

export const BottomQuestPanel: React.FC<BottomQuestPanelProps> = ({
  level,
  landmarkData,
  status,
  isNextQuest = false,
  onStartQuest,
  onPlaySound,
}) => {
  // Resolve landmark data from mapping if not passed
  const landmark: QuestLandmarkData =
    landmarkData ||
    DATA_CLEANING_LANDMARKS[level.order] || {
      id: level.id,
      order: level.order,
      title: level.title,
      tagline: level.description,
      description: level.description,
      landmarkType: 'import-gate',
      mapX: level.mapX,
      mapY: level.mapY,
      tags: level.topics || ['Python', 'Data Analytics'],
      learnChecklist: level.topics || ['Master key programming concepts', 'Solve interactive coding trials'],
      floatingCard: { title: level.title, type: 'tags', items: level.topics || [] },
      xpReward: level.xpReward,
      coinReward: level.coinReward,
    };

  const isLocked = status === 'LOCKED';
  const isCompleted = status === 'COMPLETED' || status === 'MASTERED';

  const handleStart = () => {
    if (isLocked) {
      onPlaySound('click');
      return;
    }
    onPlaySound('level-select');
    onStartQuest(level);
  };

  return (
    <div className="w-full rounded-3xl border-2 border-sky-800/50 bg-gradient-to-r from-slate-900/95 via-slate-950/95 to-slate-900/95 p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-md glow-cyan-card animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* LEFT: Landmark Visual Graphic (lg:col-span-3) */}
        <div className="lg:col-span-3 h-full min-h-[170px] w-full">
          <QuestLandmarkGraphic
            landmarkType={landmark.landmarkType}
            isActive={!isLocked}
            isCompleted={isCompleted}
          />
        </div>

        {/* CENTER: Quest Details, Description, Tags, CTA (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                {isNextQuest ? 'NEXT QUEST' : isCompleted ? 'QUEST COMPLETED' : 'SELECTED QUEST'}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  <CheckCircle2 size={11} />
                  Cleared
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-wide">
              <span className="w-7 h-7 rounded-full bg-sky-950 border border-sky-400 text-sky-300 font-mono text-xs flex items-center justify-center shrink-0">
                {level.order}
              </span>
              <span>{level.title}</span>
            </h3>
          </div>

          <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-sans line-clamp-3">
            {landmark.description || level.description}
          </p>

          {/* Interactive Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {landmark.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-950/70 text-sky-300 border border-sky-700/40"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Start Quest Action Button */}
          <div className="pt-1">
            <Button
              variant={isLocked ? 'ghost' : isCompleted ? 'secondary' : 'gold'}
              size="lg"
              glow={!isLocked && !isCompleted}
              disabled={isLocked}
              icon={
                isLocked ? (
                  <Lock size={16} />
                ) : isCompleted ? (
                  <Play size={16} className="text-sky-300" />
                ) : (
                  <ArrowRight size={16} />
                )
              }
              onClick={handleStart}
              className="w-full sm:w-auto px-7 font-black tracking-wide"
            >
              {isLocked
                ? `Locked (Complete Quest ${level.order - 1})`
                : isCompleted
                ? 'Replay Quest ↺'
                : 'Start Quest →'}
            </Button>
          </div>
        </div>

        {/* CENTER-RIGHT: "You Will Learn" Checklist (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 h-full">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 font-mono block">
            You Will Learn
          </span>

          <div className="space-y-1.5">
            {landmark.learnChecklist.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 size={14} className="text-sky-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Quest Rewards Chest (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-center h-full">
          <TreasureChestGraphic
            xpReward={level.xpReward}
            coinReward={level.coinReward}
            isUnlocked={!isLocked}
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  FileSpreadsheet,
  Database,
  BarChart3,
  Search,
  Layers,
  Sparkles,
  ArrowUp,
  Table,
} from 'lucide-react';

export interface QuestLandmarkGraphicProps {
  landmarkType:
    | 'dataframe-shrine'
    | 'import-gate'
    | 'export-workshop'
    | 'missing-dungeon'
    | 'category-forge'
    | 'visualization-tower'
    | 'clean-portal';
  isCompleted?: boolean;
  isActive?: boolean;
  className?: string;
}

export const QuestLandmarkGraphic: React.FC<QuestLandmarkGraphicProps> = ({
  landmarkType,
  isCompleted = false,
  isActive = false,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full h-full min-h-[170px] rounded-2xl overflow-hidden border border-sky-800/40 bg-gradient-to-b from-[#0a1426] via-[#070c18] to-[#050811] flex items-center justify-center shadow-inner ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

      {/* Radial Glow */}
      <div
        className={`absolute w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-500 ${
          isCompleted
            ? 'bg-emerald-500/25'
            : isActive
            ? 'bg-sky-500/30 animate-pulse'
            : 'bg-indigo-500/15'
        }`}
      />

      {/* 1. MEET THE DATA: Glowing DataFrame Shrine */}
      {landmarkType === 'dataframe-shrine' && (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
          {/* Glowing Python Logo Emblem */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/30 to-indigo-600/30 border-2 border-sky-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.4)] backdrop-blur-md relative">
            <span className="font-mono text-2xl font-black text-sky-200">Py</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Floating Data Book / Table Icon */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-sky-500/30 shadow-md">
            <Table size={13} className="text-sky-400" />
            <span className="text-[11px] font-mono font-bold text-sky-200">
              DataFrame Shrine
            </span>
          </div>

          <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
            <span>Rows: 10</span>
            <span>•</span>
            <span>Cols: 9</span>
          </div>
        </div>
      )}

      {/* 2. DATA IMPORT FORGE: Ancient Stone Portal Arch with CSV Vortex */}
      {landmarkType === 'import-gate' && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Portal Arch Structure */}
          <div className="relative w-28 h-32 rounded-t-full border-4 border-slate-700 bg-gradient-to-b from-sky-950/80 to-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.35)] overflow-hidden">
            {/* Energy Vortex */}
            <div className="absolute inset-1 rounded-t-full bg-gradient-to-b from-sky-500/30 via-indigo-600/20 to-transparent flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-sky-400/40 animate-spin" />
            </div>

            {/* Floating CSV Document Badge */}
            <div className="relative z-10 p-2.5 rounded-xl bg-slate-900/90 border-2 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)] flex flex-col items-center">
              <FileSpreadsheet size={22} className="text-sky-300" />
              <span className="text-[10px] font-mono font-black tracking-wider text-white mt-0.5">
                CSV
              </span>
            </div>

            {/* Glowing threshold */}
            <div className="absolute bottom-0 inset-x-0 h-2 bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
          </div>

          <span className="text-[10px] font-mono text-sky-300 font-bold mt-1.5 flex items-center gap-1">
            <Sparkles size={11} className="text-sky-400" />
            pd.read_csv() Gate
          </span>
        </div>
      )}

      {/* 3. DATA EXPORT WORKSHOP: Circular Tech Platform with Upward Data Streams */}
      {landmarkType === 'export-workshop' && (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
          {/* Stacked Database Disks with Upward Stream */}
          <div className="relative flex flex-col items-center">
            {/* Upward Arrows */}
            <div className="flex items-center gap-2 mb-1 text-sky-400 animate-bounce">
              <ArrowUp size={16} className="text-sky-400" />
              <ArrowUp size={16} className="text-amber-400" />
            </div>

            {/* Database Disks */}
            <div className="w-20 h-16 rounded-2xl bg-gradient-to-b from-sky-900/90 via-slate-900 to-indigo-950/90 border-2 border-sky-500/50 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.3)] p-2">
              <Database size={24} className="text-sky-300" />
              <div className="w-full flex items-center justify-center gap-1 mt-1">
                <span className="text-[9px] font-mono font-bold text-sky-300 bg-sky-950 px-1 rounded">
                  .csv
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950 px-1 rounded">
                  .xlsx
                </span>
              </div>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-300 font-bold">
            df.to_csv() & to_excel()
          </span>
        </div>
      )}

      {/* 4. MISSING VALUE DUNGEON: Dark Cavern with Ruby Crystal & NaN Orb */}
      {landmarkType === 'missing-dungeon' && (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
          {/* Cavern Crag with Glowing Ruby/Magenta Crystal */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-950/90 via-slate-950 to-purple-950/80 border-2 border-rose-500/60 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.35)]">
            <div className="flex items-center justify-center gap-1">
              <Search size={22} className="text-rose-400" />
              <div className="px-2 py-1 rounded-lg bg-rose-500/20 border border-rose-400/50 text-rose-300 font-mono font-black text-xs animate-pulse">
                NaN?
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-300">
            <span>Missing Value Chamber</span>
          </div>
        </div>
      )}

      {/* 5. CATEGORY FORGE: Stacked Category 3D Blocks */}
      {landmarkType === 'category-forge' && (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
          {/* Isometric Category Cubes (Blue, Emerald, Amber) */}
          <div className="relative flex items-center gap-1.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 border border-sky-300 flex items-center justify-center text-white font-mono font-black text-xs shadow-md">
              0
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-emerald-300 flex items-center justify-center text-white font-mono font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              1
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-300 flex items-center justify-center text-white font-mono font-black text-xs shadow-md">
              0
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-slate-900/90 px-2.5 py-0.5 rounded border border-emerald-500/30">
            <Layers size={11} />
            <span>One-Hot Encoding Forge</span>
          </div>
        </div>
      )}

      {/* 6. VISUALIZATION TOWER: Glowing Cyan Crystal Spire with Miniature Charts */}
      {landmarkType === 'visualization-tower' && (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
          {/* Spire with Mini Charts */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-t from-sky-950 via-slate-900 to-sky-900/90 border-2 border-sky-400/60 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.4)] p-1">
            <BarChart3 size={28} className="text-sky-300 animate-pulse" />
            <span className="text-[8px] font-mono text-sky-200 mt-1 uppercase font-bold">
              Scatter • Box • Hist
            </span>
          </div>

          <span className="text-[10px] font-mono text-sky-300 font-bold">
            Analytics Spire
          </span>
        </div>
      )}

      {/* 7. CLEAN DATA TRIAL: Grand Golden Portal Arch with Python Sun */}
      {landmarkType === 'clean-portal' && (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
          {/* Massive Golden Arch */}
          <div className="relative w-28 h-28 rounded-full border-4 border-amber-400/80 bg-gradient-to-br from-amber-950/80 via-slate-950 to-amber-900/60 flex items-center justify-center shadow-[0_0_35px_rgba(251,191,36,0.45)]">
            <div className="w-14 h-14 rounded-full bg-amber-400/20 flex items-center justify-center border-2 border-amber-300 shadow-[0_0_20px_#facc15]">
              <span className="font-mono text-2xl font-black text-amber-200">Py</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-500/40">
            <Sparkles size={11} className="text-amber-400" />
            <span>Master Data Trial</span>
          </div>
        </div>
      )}
    </div>
  );
};

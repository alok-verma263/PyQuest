import React from 'react';
import { FileSpreadsheet, ArrowRight, Table, Cpu, Sparkles } from 'lucide-react';

export interface DataPipelineGateProps {
  questTitle?: string;
  introMessage?: string;
  sourceFile?: string;
  targetStructure?: string;
}

export const DataPipelineGate: React.FC<DataPipelineGateProps> = ({
  questTitle = 'DATA IMPORT FORGE',
  introMessage = 'Learn how to bring real-world data into Python.',
  sourceFile = 'student_performance.csv',
  targetStructure = 'Pandas DataFrame',
}) => {
  return (
    <div className="w-full rounded-2xl border-2 border-sky-800/40 bg-gradient-to-r from-slate-900/95 via-sky-950/40 to-slate-900/95 p-4 sm:p-5 shadow-xl backdrop-blur-md glow-cyan-card relative overflow-hidden">
      {/* Background Data Particle Glow */}
      <div className="absolute top-0 right-1/4 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-4">
        {/* Header with Title and Short Message */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-900/30 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-600/30">
                Data Pipeline Gate
              </span>
              <span className="text-xs font-mono text-slate-400">{sourceFile}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-wide">
              {questTitle}
            </h3>
          </div>

          <p className="text-xs text-sky-200/90 font-medium sm:text-right max-w-sm">
            "{introMessage}"
          </p>
        </div>

        {/* Visual Pipeline Flow: [CSV DOCUMENT] → [Python Symbol] → [DATAFRAME] → [Glowing Import Gate] */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-2 items-center">
          {/* 1. CSV Document */}
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-900/90 border border-sky-700/30 shadow-[0_0_12px_rgba(56,189,248,0.08)]">
            <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-300 mb-1.5 shadow-[0_0_10px_rgba(56,189,248,0.25)]">
              <FileSpreadsheet size={18} />
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400">Step 1</span>
            <span className="text-xs font-black text-white">CSV Document</span>
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
              {sourceFile}
            </span>
          </div>

          {/* 2. Python Symbol / Reader */}
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-900/90 border border-sky-700/30 shadow-[0_0_12px_rgba(56,189,248,0.08)] relative">
            <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 text-sky-500/60 z-10">
              <ArrowRight size={14} />
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-900/80 to-indigo-900/80 border border-sky-400/50 flex items-center justify-center text-sky-200 mb-1.5 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              <span className="font-mono font-black text-sm text-sky-300">py</span>
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400">Step 2</span>
            <span className="text-xs font-black text-white">pd.read_csv()</span>
            <span className="text-[10px] font-mono text-sky-300">Parse Stream</span>
          </div>

          {/* 3. DataFrame */}
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-900/90 border border-purple-700/30 shadow-[0_0_12px_rgba(168,85,247,0.08)] relative">
            <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 text-sky-500/60 z-10">
              <ArrowRight size={14} />
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-1.5 shadow-[0_0_10px_rgba(168,85,247,0.25)]">
              <Table size={18} />
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400">Step 3</span>
            <span className="text-xs font-black text-white">{targetStructure}</span>
            <span className="text-[10px] font-mono text-purple-300">10 Rows × 9 Cols</span>
          </div>

          {/* 4. Glowing Import Gate */}
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative">
            <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 text-emerald-500/60 z-10">
              <ArrowRight size={14} />
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mb-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Cpu size={18} className="animate-pulse" />
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400">Step 4</span>
            <span className="text-xs font-black text-emerald-300 flex items-center gap-1">
              <span>Import Gate</span>
              <Sparkles size={11} className="text-emerald-400" />
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">Active in Memory</span>
          </div>
        </div>
      </div>
    </div>
  );
};

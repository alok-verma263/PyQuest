import React, { useState } from 'react';
import type { TableDataset } from '../../data/practiceDatasets';
import {
  STUDENT_PERFORMANCE_DATASET,
  SALES_DATASET,
  MISSING_VALUES_DATASET,
} from '../../data/practiceDatasets';
import {
  Database,
  FileSpreadsheet,
  Columns,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

export interface DataArtifactCardProps {
  dataset?: TableDataset;
  datasetId?: string;
  title?: string;
  initialExpanded?: boolean;
}

export const DataArtifactCard: React.FC<DataArtifactCardProps> = ({
  dataset,
  datasetId = 'student_performance',
  title,
  initialExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // Resolve dataset
  const resolvedDataset: TableDataset =
    dataset ||
    (datasetId === 'sales_data'
      ? SALES_DATASET
      : datasetId === 'missing_values_practice'
      ? MISSING_VALUES_DATASET
      : STUDENT_PERFORMANCE_DATASET);

  const rowCount = resolvedDataset.rows.length;
  const colCount = resolvedDataset.headers.length;

  // Count missing values (null, undefined, '')
  const missingCount = resolvedDataset.rows.reduce(
    (acc, row) => acc + row.filter((c) => c === null || c === undefined || c === '').length,
    0
  );

  return (
    <div className="w-full rounded-2xl border-2 border-sky-800/40 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] glow-cyan-card transition-all">
      {/* Artifact Top Bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-sky-950/80 via-slate-900/90 to-sky-950/60 border-b border-sky-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-900/50 border border-sky-500/40 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-sky-400">
                Data Artifact
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60">
                {resolvedDataset.filename}
              </span>
            </div>
            <h4 className="text-base font-black text-white tracking-wide mt-0.5 flex items-center gap-1.5">
              <span>{title || resolvedDataset.name.toUpperCase()}</span>
            </h4>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-bold px-3 py-1.5 rounded-lg bg-sky-950/60 border border-sky-600/30 hover:border-sky-500/60 transition-all cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Table' : 'Inspect Table'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Artifact Stat Indicators (10 ROWS | 9 COLUMNS | 7 MISSING VALUES) */}
      <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-950/80 border-b border-slate-800/70">
        {/* Rows Badge */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-sky-500/30 shadow-[0_0_10px_rgba(56,189,248,0.1)]">
          <div className="p-1 rounded-md bg-sky-500/20 text-sky-400">
            <Database size={14} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">
              Observations
            </span>
            <span className="text-xs font-black text-sky-300 tracking-wide font-mono">
              {rowCount} ROWS
            </span>
          </div>
        </div>

        {/* Columns Badge */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
          <div className="p-1 rounded-md bg-purple-500/20 text-purple-400">
            <Columns size={14} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">
              Variables
            </span>
            <span className="text-xs font-black text-purple-300 tracking-wide font-mono">
              {colCount} COLUMNS
            </span>
          </div>
        </div>

        {/* Missing Values Warning Badge */}
        <div
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
            missingCount > 0
              ? 'bg-amber-950/40 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              : 'bg-emerald-950/40 border-emerald-500/30'
          }`}
        >
          <div
            className={`p-1 rounded-md ${
              missingCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {missingCount > 0 ? <AlertTriangle size={14} /> : <Sparkles size={14} />}
          </div>
          <div>
            <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">
              Missing Values
            </span>
            <span
              className={`text-xs font-black tracking-wide font-mono ${
                missingCount > 0 ? 'text-amber-300' : 'text-emerald-300'
              }`}
            >
              {missingCount > 0 ? `${missingCount} MISSING VALUES` : '0 MISSING'}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Polished Table Preview */}
      {isExpanded && (
        <div className="p-3 bg-slate-950/95 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="font-semibold text-slate-300">Tabular Dataset Preview:</span>
            <span className="text-[10px] text-slate-400 font-mono">
              NaN values highlighted in amber
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 max-h-48">
            <table className="w-full text-left text-xs font-mono select-text">
              <thead className="bg-slate-900 text-slate-300 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3 text-[10px] text-slate-500 font-bold uppercase">#</th>
                  {resolvedDataset.headers.map((h, i) => (
                    <th
                      key={i}
                      className="py-2 px-3 text-sky-300 font-bold whitespace-nowrap text-[11px]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {resolvedDataset.rows.slice(0, 6).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-1.5 px-3 text-slate-500 text-[11px]">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => {
                      const isMissing = cell === null || cell === undefined || cell === '';
                      return (
                        <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap text-[11px]">
                          {isMissing ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              NaN
                            </span>
                          ) : (
                            <span className="text-slate-200">{String(cell)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {resolvedDataset.rows.length > 6 && (
            <p className="text-[10px] text-slate-500 text-center italic">
              Showing first 6 of {resolvedDataset.rows.length} rows ({resolvedDataset.filename})
            </p>
          )}
        </div>
      )}
    </div>
  );
};

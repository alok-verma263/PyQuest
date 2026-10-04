import React, { useState } from 'react';
import type { TableDataset } from '../../data/practiceDatasets';
import {
  STUDENT_PERFORMANCE_DATASET,
  SALES_DATASET,
  MISSING_VALUES_DATASET,
} from '../../data/practiceDatasets';
import { ChevronDown, ChevronUp, AlertCircle, FileSpreadsheet } from 'lucide-react';

export interface DatasetTablePreviewProps {
  dataset?: TableDataset;
  datasetId?: string;
  title?: string;
  initialExpanded?: boolean;
}

export const DatasetTablePreview: React.FC<DatasetTablePreviewProps> = ({
  dataset,
  datasetId,
  title,
  initialExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // Resolve dataset from ID or prop
  const resolvedDataset: TableDataset =
    dataset ||
    (datasetId === 'sales_data'
      ? SALES_DATASET
      : datasetId === 'missing_values_practice'
      ? MISSING_VALUES_DATASET
      : STUDENT_PERFORMANCE_DATASET);

  // Count missing cells across all rows
  const missingCount = resolvedDataset.rows.reduce(
    (acc, row) => acc + row.filter((c) => c === null || c === undefined || c === '').length,
    0
  );

  return (
    <div className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 overflow-hidden shadow-xl my-3">
      {/* Header bar */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 hover:bg-slate-800/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-600/30">
            <FileSpreadsheet size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {title || resolvedDataset.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                {resolvedDataset.filename}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              {resolvedDataset.rows.length} rows × {resolvedDataset.headers.length} columns
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {missingCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
              <AlertCircle size={12} />
              {missingCount} missing values (NaN)
            </span>
          )}
          <span className="text-slate-400 p-1">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </button>

      {/* Table view */}
      {isExpanded && (
        <div className="overflow-x-auto max-h-64 border-t border-slate-800">
          <table className="w-full text-left text-xs font-mono select-text">
            <thead className="bg-slate-900 text-slate-300 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3 text-[10px] text-slate-500 font-bold uppercase">#</th>
                {resolvedDataset.headers.map((h, i) => (
                  <th key={i} className="py-2 px-3 text-sky-300 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {resolvedDataset.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-1.5 px-3 text-slate-600 text-[11px]">{rIdx + 1}</td>
                  {row.map((cell, cIdx) => {
                    const isMissing = cell === null || cell === undefined || cell === '';
                    return (
                      <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap">
                        {isMissing ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
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
      )}
    </div>
  );
};

import React from 'react';
import type { ChartPreviewConfig } from '../../types/world';
import { BarChart3, Info } from 'lucide-react';

export type ChartType = 'scatter' | 'histogram' | 'boxplot' | 'boxplot-category';

export interface ChartPreviewProps {
  chart?: ChartPreviewConfig;
  type?: ChartType;
  title?: string;
  subtitle?: string;
}

export const ChartPreview: React.FC<ChartPreviewProps> = ({
  chart,
  type,
  title,
  subtitle,
}) => {
  const resolvedType: ChartType = (chart?.type as ChartType) || type || 'scatter';
  const resolvedTitle = chart?.title || title || 'Exploratory Visualization';
  const resolvedSubtitle = chart?.subtitle || subtitle;

  return (
    <div className="w-full rounded-2xl border border-sky-500/40 bg-slate-950 p-5 shadow-2xl my-3 space-y-3">
      {/* Title & Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded border border-sky-600/40">
            Matplotlib Canvas Preview
          </span>
          <h4 className="text-base font-black text-white mt-1">{resolvedTitle}</h4>
          {resolvedSubtitle && <p className="text-xs text-slate-400 mt-0.5">{resolvedSubtitle}</p>}
        </div>
        <div className="text-sky-400 p-2 rounded-xl bg-sky-950/60 border border-sky-600/30">
          <BarChart3 size={20} />
        </div>
      </div>

      {/* Render Chart SVG */}
      <div className="w-full bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-center">
        {resolvedType === 'scatter' && (
          <div className="w-full max-w-md">
            <svg viewBox="0 0 400 240" className="w-full h-auto select-none font-mono text-[11px]">
              {/* Axes */}
              <line x1="50" y1="20" x2="50" y2="190" stroke="#475569" strokeWidth="2" />
              <line x1="50" y1="190" x2="380" y2="190" stroke="#475569" strokeWidth="2" />

              {/* Gridlines */}
              <line x1="50" y1="60" x2="380" y2="60" stroke="#334155" strokeDasharray="3 3" />
              <line x1="50" y1="120" x2="380" y2="120" stroke="#334155" strokeDasharray="3 3" />

              {/* Axis Labels */}
              <text x="50" y="15" fill="#94a3b8" textAnchor="middle">100</text>
              <text x="35" y="65" fill="#64748b" textAnchor="end">80</text>
              <text x="35" y="125" fill="#64748b" textAnchor="end">60</text>
              <text x="35" y="195" fill="#64748b" textAnchor="end">40</text>

              <text x="50" y="210" fill="#64748b" textAnchor="middle">2h</text>
              <text x="130" y="210" fill="#64748b" textAnchor="middle">4h</text>
              <text x="210" y="210" fill="#64748b" textAnchor="middle">6h</text>
              <text x="290" y="210" fill="#64748b" textAnchor="middle">8h</text>
              <text x="370" y="210" fill="#64748b" textAnchor="middle">10h</text>

              <text x="215" y="232" fill="#38bdf8" textAnchor="middle" fontWeight="bold">Study Hours (x)</text>
              <text x="15" y="105" fill="#38bdf8" textAnchor="middle" transform="rotate(-90 15 105)" fontWeight="bold">Marks (y)</text>

              {/* Trendline */}
              <line x1="80" y1="170" x2="340" y2="45" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

              {/* Data points (Study_Hours, Marks) */}
              {[
                { x: 190, y: 72, name: 'Aarav (5.5h, 78m)' },
                { x: 130, y: 110, name: 'Rohan (4h, 65m)' },
                { x: 270, y: 55, name: 'Ananya (7.5h, 85m)' },
                { x: 90, y: 155, name: 'Kabir (3h, 52m)' },
                { x: 290, y: 40, name: 'Meera (8h, 92m)' },
                { x: 170, y: 95, name: 'Arjun (5h, 70m)' },
                { x: 150, y: 102, name: 'Aditya (4.5h, 68m)' },
                { x: 250, y: 48, name: 'Pooja (7h, 88m)' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx={pt.x} cy={pt.y} r="10" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
                </g>
              ))}
            </svg>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300 mt-2 bg-amber-950/40 p-2 rounded-lg border border-amber-600/30">
              <Info size={14} className="shrink-0 text-amber-400" />
              <span>Academic Principle: Observed association between Study Hours & Marks does not automatically prove causation.</span>
            </div>
          </div>
        )}

        {resolvedType === 'histogram' && (
          <div className="w-full max-w-md">
            <svg viewBox="0 0 400 220" className="w-full h-auto select-none font-mono text-[11px]">
              {/* Axes */}
              <line x1="50" y1="20" x2="50" y2="180" stroke="#475569" strokeWidth="2" />
              <line x1="50" y1="180" x2="380" y2="180" stroke="#475569" strokeWidth="2" />

              {/* Y axis ticks */}
              <text x="40" y="60" fill="#64748b" textAnchor="end">3</text>
              <text x="40" y="110" fill="#64748b" textAnchor="end">2</text>
              <text x="40" y="150" fill="#64748b" textAnchor="end">1</text>
              <text x="40" y="185" fill="#64748b" textAnchor="end">0</text>

              <text x="15" y="100" fill="#38bdf8" textAnchor="middle" transform="rotate(-90 15 100)" fontWeight="bold">Frequency</text>
              <text x="215" y="212" fill="#38bdf8" textAnchor="middle" fontWeight="bold">Marks (bins=8)</text>

              {/* Bars */}
              {[
                { x: 55, h: 50, label: '50-55', count: 1 },
                { x: 95, h: 0, label: '55-60', count: 0 },
                { x: 135, h: 100, label: '60-65', count: 2 },
                { x: 175, h: 100, label: '65-70', count: 2 },
                { x: 215, h: 50, label: '70-75', count: 1 },
                { x: 255, h: 50, label: '75-80', count: 1 },
                { x: 295, h: 100, label: '80-85', count: 2 },
                { x: 335, h: 50, label: '85-95', count: 1 },
              ].map((b, i) => (
                <g key={i}>
                  {b.h > 0 && (
                    <rect
                      x={b.x}
                      y={180 - b.h}
                      width="35"
                      height={b.h}
                      fill="#0284c7"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      rx="2"
                    />
                  )}
                  {b.h > 0 && (
                    <text x={b.x + 17} y={175 - b.h} fill="#f8fafc" textAnchor="middle" fontSize="10" fontWeight="bold">
                      {b.count}
                    </text>
                  )}
                  <text x={b.x + 17} y="195" fill="#64748b" textAnchor="middle" fontSize="8">
                    {b.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}

        {resolvedType === 'boxplot' && (
          <div className="w-full max-w-md">
            <svg viewBox="0 0 400 220" className="w-full h-auto select-none font-mono text-[11px]">
              {/* Y Axis */}
              <line x1="80" y1="20" x2="80" y2="190" stroke="#475569" strokeWidth="2" />
              <text x="65" y="30" fill="#64748b" textAnchor="end">100</text>
              <text x="65" y="70" fill="#64748b" textAnchor="end">80</text>
              <text x="65" y="110" fill="#64748b" textAnchor="end">60</text>
              <text x="65" y="150" fill="#64748b" textAnchor="end">40</text>
              <text x="40" y="105" fill="#38bdf8" textAnchor="middle" transform="rotate(-90 40 105)" fontWeight="bold">Marks</text>

              {/* Boxplot Components for Marks */}
              {/* Upper Whisker */}
              <line x1="210" y1="46" x2="250" y2="46" stroke="#e2e8f0" strokeWidth="2" />
              <text x="260" y="50" fill="#38bdf8" fontSize="10">Max: 92</text>

              {/* Upper Whisker Line */}
              <line x1="230" y1="46" x2="230" y2="60" stroke="#94a3b8" strokeWidth="2" />

              {/* Main IQR Box */}
              <rect x="180" y="60" width="100" height="60" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" rx="4" />
              <text x="290" y="65" fill="#cbd5e1" fontSize="10">Q3: 86.5</text>

              {/* Median Line */}
              <line x1="180" y1="88" x2="280" y2="88" stroke="#f59e0b" strokeWidth="3" />
              <text x="290" y="92" fill="#f59e0b" fontWeight="bold" fontSize="10">Median: 74</text>

              {/* Q1 Label */}
              <text x="290" y="123" fill="#cbd5e1" fontSize="10">Q1: 66.5</text>

              {/* Lower Whisker Line */}
              <line x1="230" y1="120" x2="230" y2="148" stroke="#94a3b8" strokeWidth="2" />

              {/* Lower Whisker */}
              <line x1="210" y1="148" x2="250" y2="148" stroke="#e2e8f0" strokeWidth="2" />
              <text x="260" y="152" fill="#38bdf8" fontSize="10">Min: 52</text>
            </svg>
          </div>
        )}

        {resolvedType === 'boxplot-category' && (
          <div className="w-full max-w-md">
            <svg viewBox="0 0 420 230" className="w-full h-auto select-none font-mono text-[10px]">
              {/* Y Axis */}
              <line x1="50" y1="20" x2="50" y2="185" stroke="#475569" strokeWidth="2" />
              <line x1="50" y1="185" x2="400" y2="185" stroke="#475569" strokeWidth="2" />
              <text x="40" y="40" fill="#64748b" textAnchor="end">100</text>
              <text x="40" y="90" fill="#64748b" textAnchor="end">75</text>
              <text x="40" y="140" fill="#64748b" textAnchor="end">50</text>
              <text x="20" y="105" fill="#38bdf8" textAnchor="middle" transform="rotate(-90 20 105)" fontWeight="bold">Marks</text>

              {/* 3 Categories: Business Analytics, Data Science, Machine Learning */}
              {/* Category 1: Business Analytics (Marks: 85, 92, 68 -> median 85) */}
              <g transform="translate(100, 0)">
                <line x1="15" y1="36" x2="35" y2="36" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="25" y1="36" x2="25" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
                <rect x="5" y="50" width="40" height="40" fill="#0f172a" stroke="#10b981" strokeWidth="2" rx="3" />
                <line x1="5" y1="65" x2="45" y2="65" stroke="#f59e0b" strokeWidth="2" />
                <line x1="25" y1="90" x2="25" y2="114" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="15" y1="114" x2="35" y2="114" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="25" y="202" fill="#cbd5e1" textAnchor="middle" fontSize="9">Business</text>
                <text x="25" y="213" fill="#cbd5e1" textAnchor="middle" fontSize="9">Analytics</text>
              </g>

              {/* Category 2: Data Science (Marks: 78, 65, 70, 88 -> median 74) */}
              <g transform="translate(210, 0)">
                <line x1="15" y1="44" x2="35" y2="44" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="25" y1="44" x2="25" y2="58" stroke="#94a3b8" strokeWidth="1.5" />
                <rect x="5" y="58" width="40" height="44" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" rx="3" />
                <line x1="5" y1="87" x2="45" y2="87" stroke="#f59e0b" strokeWidth="2" />
                <line x1="25" y1="102" x2="25" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="15" y1="120" x2="35" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="25" y="202" fill="#cbd5e1" textAnchor="middle" fontSize="9">Data</text>
                <text x="25" y="213" fill="#cbd5e1" textAnchor="middle" fontSize="9">Science</text>
              </g>

              {/* Category 3: Machine Learning (Marks: 88, 52 -> median 70) */}
              <g transform="translate(320, 0)">
                <line x1="15" y1="44" x2="35" y2="44" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="25" y1="44" x2="25" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
                <rect x="5" y="60" width="40" height="50" fill="#0f172a" stroke="#a855f7" strokeWidth="2" rx="3" />
                <line x1="5" y1="95" x2="45" y2="95" stroke="#f59e0b" strokeWidth="2" />
                <line x1="25" y1="110" x2="25" y2="146" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="15" y1="146" x2="35" y2="146" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="25" y="202" fill="#cbd5e1" textAnchor="middle" fontSize="9">Machine</text>
                <text x="25" y="213" fill="#cbd5e1" textAnchor="middle" fontSize="9">Learning</text>
              </g>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

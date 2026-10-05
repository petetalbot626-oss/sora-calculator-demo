import React, { useState, useMemo } from 'react';
import { MasSoraRecord } from '../types/sora';
import { formatRatePct, triggerCsvDownload } from '../utils/soraCalculator';
import { LineChart, Calendar, Download, Info, BarChart2 } from 'lucide-react';

interface SoraRateHistoryChartProps {
  records: MasSoraRecord[];
}

export const SoraRateHistoryChart: React.FC<SoraRateHistoryChartProps> = ({ records }) => {
  const [timeframe, setTimeframe] = useState<'14d' | '30d' | 'all'>('30d');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Sort chronological for chart display (oldest to newest)
  const sortedRecords = useMemo(() => {
    const list = [...records].reverse();
    if (timeframe === '14d') return list.slice(-14);
    if (timeframe === '30d') return list.slice(-30);
    return list;
  }, [records, timeframe]);

  // SVG Chart Geometry
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Rate range
  const { minRate, maxRate } = useMemo(() => {
    let min = 100;
    let max = 0;
    sortedRecords.forEach((r) => {
      min = Math.min(min, r.sora, r.compounded1M, r.compounded3M);
      max = Math.max(max, r.sora, r.compounded1M, r.compounded3M);
    });
    // add small margin
    return {
      minRate: Math.max(0, min - 0.05),
      maxRate: max + 0.05,
    };
  }, [sortedRecords]);

  // Point mapping helpers
  const getX = (index: number) => {
    if (sortedRecords.length <= 1) return padding.left;
    return padding.left + (index / (sortedRecords.length - 1)) * plotWidth;
  };

  const getY = (rate: number) => {
    if (maxRate === minRate) return padding.top + plotHeight / 2;
    const norm = (rate - minRate) / (maxRate - minRate);
    return padding.top + plotHeight - norm * plotHeight;
  };

  // Generate SVG path for a metric
  const soraPath = useMemo(() => {
    if (sortedRecords.length === 0) return '';
    return sortedRecords
      .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(r.sora).toFixed(1)}`)
      .join(' ');
  }, [sortedRecords, minRate, maxRate]);

  const comp1MPath = useMemo(() => {
    if (sortedRecords.length === 0) return '';
    return sortedRecords
      .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(r.compounded1M).toFixed(1)}`)
      .join(' ');
  }, [sortedRecords, minRate, maxRate]);

  const comp3MPath = useMemo(() => {
    if (sortedRecords.length === 0) return '';
    return sortedRecords
      .map((r, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(r.compounded3M).toFixed(1)}`)
      .join(' ');
  }, [sortedRecords, minRate, maxRate]);

  // Horizontal grid lines
  const gridTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const rate = minRate + ((maxRate - minRate) * i) / count;
      const y = getY(rate);
      ticks.push({ rate, y });
    }
    return ticks;
  }, [minRate, maxRate]);

  const activePoint = hoverIndex !== null && sortedRecords[hoverIndex] ? sortedRecords[hoverIndex] : null;

  const handleExportRatesCsv = () => {
    const headers = ['Fixing Date', 'Overnight SORA (%)', '1M Compounded (%)', '3M Compounded (%)', '6M Compounded (%)', 'SORA Index', 'Volume (SGD Millions)'];
    const rows = records.map((r) => [
      r.date,
      r.sora.toFixed(4),
      r.compounded1M.toFixed(4),
      r.compounded3M.toFixed(4),
      r.compounded6M.toFixed(4),
      r.soraIndex.toFixed(4),
      r.aggregateVolume || 0,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    triggerCsvDownload(csvContent, `MAS_SORA_Historical_Rates_${records[0]?.date}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <LineChart className="w-6 h-6 text-red-600" />
              <span>MAS SORA Historical Rates & Yield Trends</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Time series analysis of Monetary Authority of Singapore (MAS) published daily overnight SORA fixings and rolling compounded benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setTimeframe('14d')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeframe === '14d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                14 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('30d')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeframe === '30d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeframe === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Data
              </button>
            </div>

            <button
              onClick={handleExportRatesCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-500 rounded-full"></span>
            <span className="text-slate-700">Daily Overnight SORA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-blue-500 rounded-full"></span>
            <span className="text-slate-700">1-Month Compounded SORA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-amber-500 rounded-full"></span>
            <span className="text-slate-700">3-Month Compounded SORA (Mortgage standard)</span>
          </div>
          {activePoint && (
            <div className="ml-auto text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <span className="font-semibold text-slate-900">{activePoint.date}</span>: Overnight{' '}
              <span className="text-emerald-700 font-bold">{formatRatePct(activePoint.sora)}</span> · 1M{' '}
              <span className="text-blue-700 font-bold">{formatRatePct(activePoint.compounded1M)}</span> · 3M{' '}
              <span className="text-amber-700 font-bold">{formatRatePct(activePoint.compounded3M)}</span>
            </div>
          )}
        </div>

        {/* SVG Interactive Chart */}
        <div className="mt-4 relative bg-slate-50/50 rounded-xl border border-slate-200 p-2 overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Grid lines */}
            {gridTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={width - padding.right}
                  y2={tick.y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  className="font-mono fill-slate-400"
                >
                  {tick.rate.toFixed(2)}%
                </text>
              </g>
            ))}

            {/* Bottom date axis ticks */}
            {sortedRecords.map((r, i) => {
              // Show label for first, last, and every few records
              const step = Math.max(1, Math.floor(sortedRecords.length / 6));
              if (i % step !== 0 && i !== sortedRecords.length - 1) return null;
              const x = getX(i);
              return (
                <text
                  key={r.date}
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="10"
                  className="font-mono fill-slate-400"
                >
                  {r.date.slice(5)}
                </text>
              );
            })}

            {/* Lines */}
            <path d={soraPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <path d={comp1MPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <path d={comp3MPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

            {/* Hover Guides & Interactive Target Rectangles */}
            {sortedRecords.map((r, i) => {
              const x = getX(i);
              const isHovered = hoverIndex === i;

              return (
                <g key={r.date}>
                  {/* Invisible broad hitbox for mouse hover */}
                  <rect
                    x={x - (plotWidth / sortedRecords.length) / 2}
                    y={padding.top}
                    width={plotWidth / sortedRecords.length}
                    height={plotHeight}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoverIndex(i)}
                  />

                  {isHovered && (
                    <>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={height - padding.bottom}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <circle cx={x} cy={getY(r.sora)} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <circle cx={x} cy={getY(r.compounded1M)} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                      <circle cx={x} cy={getY(r.compounded3M)} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              MAS Domestic Interest Rates Record Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official published SORA values, rolling compounded tenors, and transaction volume.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Fixing Date</th>
                <th className="py-2.5 px-3 text-right">Overnight SORA</th>
                <th className="py-2.5 px-3 text-right">1M Compounded</th>
                <th className="py-2.5 px-3 text-right">3M Compounded</th>
                <th className="py-2.5 px-3 text-right">6M Compounded</th>
                <th className="py-2.5 px-3 text-right">SORA Index</th>
                <th className="py-2.5 px-3 text-right">Volume (SGD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {records.map((r) => (
                <tr key={r.date} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-800">{r.date}</td>
                  <td className="py-2 px-3 text-right font-medium text-emerald-600">{formatRatePct(r.sora)}</td>
                  <td className="py-2 px-3 text-right text-blue-700">{formatRatePct(r.compounded1M)}</td>
                  <td className="py-2 px-3 text-right font-bold text-amber-600">{formatRatePct(r.compounded3M)}</td>
                  <td className="py-2 px-3 text-right text-slate-700">{formatRatePct(r.compounded6M)}</td>
                  <td className="py-2 px-3 text-right text-slate-500">{r.soraIndex.toFixed(4)}</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    S${((r.aggregateVolume || 4000) / 1000).toFixed(2)}B
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

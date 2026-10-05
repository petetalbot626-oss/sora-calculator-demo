import React, { useState } from 'react';
import { MasSoraRecord } from '../types/sora';
import { formatRatePct } from '../utils/soraCalculator';
import { RefreshCw, CheckCircle2, Info, Building2, HelpCircle } from 'lucide-react';

interface MasRateTickerProps {
  currentRecord: MasSoraRecord;
  records: MasSoraRecord[];
  source: 'MAS_LIVE_API' | 'LOCAL_MAS_RECORDS';
  onRefresh: () => void;
  isLoading: boolean;
  onSelectDate: (date: string) => void;
}

export const MasRateTicker: React.FC<MasRateTickerProps> = ({
  currentRecord,
  records,
  source,
  onRefresh,
  isLoading,
  onSelectDate,
}) => {
  const [showMasDetails, setShowMasDetails] = useState(false);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Rate Header & Date Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                MAS Published SORA Rates
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sora-date-select" className="text-xs text-slate-400">
                Fixing Date:
              </label>
              <select
                id="sora-date-select"
                value={currentRecord.date}
                onChange={(e) => onSelectDate(e.target.value)}
                className="bg-slate-800 text-slate-100 text-xs font-mono border border-slate-700 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
              >
                {records.map((r) => (
                  <option key={r.date} value={r.date}>
                    {r.date} (Overnight: {formatRatePct(r.sora)})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh MAS benchmark feed"
              className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
            </button>
            <button
              onClick={() => setShowMasDetails(!showMasDetails)}
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>MAS Notice</span>
            </button>
          </div>

          {/* SORA Rate Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
              <div className="text-[11px] font-medium text-slate-400">Overnight SORA</div>
              <div className="text-base font-bold font-mono tabular-nums text-emerald-400">
                {formatRatePct(currentRecord.sora)}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
              <div className="text-[11px] font-medium text-slate-400">1M Compounded</div>
              <div className="text-base font-bold font-mono tabular-nums text-white">
                {formatRatePct(currentRecord.compounded1M)}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 ring-1 ring-red-500/30">
              <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>3M Compounded</span>
                <span className="text-[9px] uppercase tracking-wider text-red-300 font-semibold">Mortgage std</span>
              </div>
              <div className="text-base font-bold font-mono tabular-nums text-amber-300">
                {formatRatePct(currentRecord.compounded3M)}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
              <div className="text-[11px] font-medium text-slate-400">6M Compounded</div>
              <div className="text-base font-bold font-mono tabular-nums text-white">
                {formatRatePct(currentRecord.compounded6M)}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible MAS Benchmark Information */}
        {showMasDetails && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Monetary Authority of Singapore (MAS)</span>
                <p className="text-slate-400 mt-0.5">
                  Administers SORA as the volume-weighted average rate of unsecured overnight SGD cash transactions brokered in Singapore between 8:00am and 6:15pm.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Publication Schedule</span>
                <p className="text-slate-400 mt-0.5">
                  Published every Singapore business day at 9:00am SGT on T+1. Compounded indices are based on an Actual/365 day count convention.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Feed Status: {source === 'MAS_LIVE_API' ? 'Live MAS API' : 'Verified MAS Benchmark Records'}</span>
                <p className="text-slate-400 mt-0.5 font-mono">
                  SORA Index: {currentRecord.soraIndex.toFixed(4)} · Volume: S${((currentRecord.aggregateVolume || 4000) / 1000).toFixed(2)}B
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

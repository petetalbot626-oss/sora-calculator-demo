import React, { useState, useMemo } from 'react';
import { MasSoraRecord, DailyCompoundingInput } from '../types/sora';
import {
  calculateDailyCompounding,
  formatSGD,
  formatRatePct,
  exportDailyCompoundingToCsv,
  triggerCsvDownload,
} from '../utils/soraCalculator';
import {
  Coins,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface DailyCompoundingCalculatorProps {
  historicalRates: MasSoraRecord[];
}

export const DailyCompoundingCalculator: React.FC<DailyCompoundingCalculatorProps> = ({
  historicalRates,
}) => {
  // Initial date setup: span last ~30 days
  const defaultEndDate = historicalRates[0]?.date || '2026-10-02';
  const defaultStartDate = historicalRates[historicalRates.length - 1]?.date || '2026-08-24';

  const [principalAmount, setPrincipalAmount] = useState<number>(1000000);
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [marginSpread, setMarginSpread] = useState<number>(0.80);
  const [dayCountBasis, setDayCountBasis] = useState<'ACT/365' | 'ACT/360'>('ACT/365');
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);

  const compoundingResult = useMemo(() => {
    const input: DailyCompoundingInput = {
      principalAmount,
      startDate,
      endDate,
      marginSpread,
      dayCountConvention: dayCountBasis,
      lookbackDays: 0,
    };
    return calculateDailyCompounding(input, historicalRates);
  }, [principalAmount, startDate, endDate, marginSpread, dayCountBasis, historicalRates]);

  const handleExportCsv = () => {
    const csv = exportDailyCompoundingToCsv(compoundingResult.rows);
    const filename = `SORA_Daily_Compounded_Ledger_${startDate}_to_${endDate}.csv`;
    triggerCsvDownload(csv, filename);
  };

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Coins className="w-6 h-6 text-red-600" />
              <span>SORA Daily Compounding Interest Calculator</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Implements the official SC-STS and MAS backward-looking overnight compounding formula for corporate facilities, trade finance drawdowns, and loans in arrears.
            </p>
          </div>

          <button
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>SC-STS Compounding Formula</span>
          </button>
        </div>

        {/* Formula Explainer Modal / Card */}
        {showFormulaDetails && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900">
              Steering Committee for SOR & SIBOR Transition to SORA (SC-STS) Standard Formula:
            </div>
            <div className="p-3 bg-white rounded border border-slate-200 font-mono text-center text-xs sm:text-sm text-slate-800 overflow-x-auto">
              Compounded SORA = [ ∏<sub>i=1</sub><sup>d₀</sup> (1 + (SORA<sub>i</sub> × n<sub>i</sub>) / 365) - 1 ] × (365 / d) × 100%
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div>
                <span className="font-medium text-slate-800">d₀:</span> Number of Singapore business days in the interest period.
              </div>
              <div>
                <span className="font-medium text-slate-800">SORA<sub>i</sub>:</span> Published MAS overnight rate on business day i.
              </div>
              <div>
                <span className="font-medium text-slate-800">n<sub>i</sub>:</span> Number of calendar days for which rate i applies (e.g. 3 for Friday over weekend).
              </div>
              <div>
                <span className="font-medium text-slate-800">d:</span> Total calendar days in the interest period. Standard Singapore basis is Actual/365.
              </div>
            </div>
          </div>
        )}

        {/* Inputs & Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Drawdown Parameters
            </h2>

            {/* Principal */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="principal-amount-input" className="text-xs font-medium text-slate-700">
                  Principal Drawdown Amount (SGD)
                </label>
                <span className="text-sm font-bold font-mono text-slate-900">
                  {formatSGD(principalAmount, false)}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
                  S$
                </div>
                <input
                  id="principal-amount-input"
                  type="number"
                  step="50000"
                  min="10000"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(Math.max(1000, Number(e.target.value) || 0))}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 bg-white"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[250000, 500000, 1000000, 2500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPrincipalAmount(amt)}
                    className="flex-1 py-1 text-xs font-mono rounded border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700"
                  >
                    S${(amt / 1000000).toFixed(2)}M
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="compounding-start-date" className="block text-xs font-medium text-slate-700 mb-1">
                  Start Date (Drawdown)
                </label>
                <input
                  id="compounding-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 bg-white"
                />
              </div>
              <div>
                <label htmlFor="compounding-end-date" className="block text-xs font-medium text-slate-700 mb-1">
                  End Date (Rollover/Payment)
                </label>
                <input
                  id="compounding-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 bg-white"
                />
              </div>
            </div>

            {/* Bank Margin */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="margin-spread-input" className="text-xs font-medium text-slate-700">
                  Bank Margin / Spread (+% p.a.)
                </label>
                <span className="text-xs font-bold font-mono text-slate-900">
                  +{marginSpread.toFixed(2)}% p.a.
                </span>
              </div>
              <input
                id="margin-spread-input"
                type="number"
                step="0.05"
                min="0"
                max="5"
                value={marginSpread}
                onChange={(e) => setMarginSpread(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 bg-white"
              />
            </div>

            {/* Day Count Basis */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Day Count Convention
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDayCountBasis('ACT/365')}
                  className={`p-2 text-left border rounded-lg transition-colors ${
                    dayCountBasis === 'ACT/365'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-500'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900">Actual/365 (SGD)</div>
                  <div className="text-[11px] text-slate-500">Singapore market statutory standard</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDayCountBasis('ACT/360')}
                  className={`p-2 text-left border rounded-lg transition-colors ${
                    dayCountBasis === 'ACT/360'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-500'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900">Actual/360 (US/Intl)</div>
                  <div className="text-[11px] text-slate-500">Eurodollar & foreign currency standard</div>
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Compounded Interest Calculation Results
            </h2>

            <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Total Accrued Interest Payable
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white mt-1">
                    {formatSGD(compoundingResult.totalInterestPayable)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Effective Rate (Annualized)</span>
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
                    {formatRatePct(compoundingResult.totalEffectiveAnnualized)} p.a.
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {formatRatePct(compoundingResult.compoundedSoraAnnualized)} (Compounded SORA) + {marginSpread.toFixed(2)}% (Spread)
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-400">Principal</div>
                  <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                    {formatSGD(principalAmount, false)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Total Calendar Days</div>
                  <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                    {compoundingResult.totalDays} Days
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Singapore Business Days</div>
                  <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                    {compoundingResult.businessDaysCount} Days
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Total Repayment Due</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                    {formatSGD(principalAmount + compoundingResult.totalInterestPayable)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick summary note */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Singapore Money Market Convention:</span>
                <p className="mt-0.5">
                  Overnight SORA transactions apply the Friday rate across Saturday and Sunday ($n_i = 3$). Compounding occurs strictly across business days with calendar day weights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Daily Overnight SORA Fixing Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Day-by-day record of applicable MAS SORA overnight fixings, calendar day weighting ($n_i$), and accrued interest.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={compoundingResult.rows.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger CSV</span>
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          {compoundingResult.rows.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No dates selected in calculation range. Please select valid start and end dates.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Fixing Date</th>
                  <th className="py-2.5 px-3 text-center">Calendar Days ($n_i$)</th>
                  <th className="py-2.5 px-3 text-right">MAS Overnight Rate</th>
                  <th className="py-2.5 px-3 text-right">Effective Rate</th>
                  <th className="py-2.5 px-3 text-right">Compounding Multiplier</th>
                  <th className="py-2.5 px-3 text-right">Period Interest</th>
                  <th className="py-2.5 px-3 text-right">Cumulative Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {compoundingResult.rows.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">{row.date}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        row.calendarDays > 1 ? 'bg-amber-100 text-amber-800 font-semibold' : 'text-slate-600'
                      }`}>
                        {row.calendarDays} {row.calendarDays > 1 ? 'days (w/end)' : 'day'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700">
                      {formatRatePct(row.applicableSoraRate)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-900">
                      {formatRatePct(row.dailyEffectiveRate)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 text-[11px]">
                      {row.compoundingFactor.toFixed(7)}
                    </td>
                    <td className="py-2 px-3 text-right text-red-600 font-medium">
                      {formatSGD(row.periodAccruedInterest)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatSGD(row.cumulativeInterest)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  MortgageLoanInput,
  MasSoraRecord,
  SoraBenchmarkType,
} from '../types/sora';
import {
  calculateMortgageSchedule,
  formatSGD,
  formatRatePct,
  exportAmortizationToCsv,
  triggerCsvDownload,
} from '../utils/soraCalculator';
import {
  Calculator,
  Download,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  Building,
  Home,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface MortgageCalculatorProps {
  currentRecord: MasSoraRecord;
  onApplyPackage?: (benchmark: SoraBenchmarkType, spread: number) => void;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  currentRecord,
}) => {
  // Loan inputs state
  const [propertyType, setPropertyType] = useState<'HDB' | 'PRIVATE_CONDO' | 'LANDED' | 'COMMERCIAL'>('HDB');
  const [loanAmount, setLoanAmount] = useState<number>(650000);
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [benchmarkType, setBenchmarkType] = useState<SoraBenchmarkType>('3M');
  const [customBenchmarkRate, setCustomBenchmarkRate] = useState<number>(3.0);
  const [bankSpread, setBankSpread] = useState<number>(0.65);

  // MAS Affordability checks state
  const [enableAffordability, setEnableAffordability] = useState<boolean>(false);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(12000);
  const [otherCommitments, setOtherCommitments] = useState<number>(800);

  // Amortization view state
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const [displayYearFilter, setDisplayYearFilter] = useState<number | 'all'>('all');

  // Compute active base benchmark rate
  const activeBenchmarkRate = useMemo(() => {
    switch (benchmarkType) {
      case '1M':
        return currentRecord.compounded1M;
      case '3M':
        return currentRecord.compounded3M;
      case '6M':
        return currentRecord.compounded6M;
      case 'OVERNIGHT':
        return currentRecord.sora;
      case 'CUSTOM':
        return customBenchmarkRate;
      default:
        return currentRecord.compounded3M;
    }
  }, [benchmarkType, currentRecord, customBenchmarkRate]);

  // Compute calculation results
  const calculation = useMemo(() => {
    const input: MortgageLoanInput = {
      propertyType,
      loanAmount,
      tenureYears,
      benchmarkType,
      baseBenchmarkRate: activeBenchmarkRate,
      bankSpread,
      monthlyIncome: enableAffordability ? monthlyIncome : undefined,
      otherCommitments: enableAffordability ? otherCommitments : undefined,
    };
    return calculateMortgageSchedule(input);
  }, [
    propertyType,
    loanAmount,
    tenureYears,
    benchmarkType,
    activeBenchmarkRate,
    bankSpread,
    enableAffordability,
    monthlyIncome,
    otherCommitments,
  ]);

  // Quick preset loader
  const handleApplyPreset = (type: 'HDB' | 'PRIVATE_CONDO' | 'LANDED' | 'COMMERCIAL', amount: number, tenure: number) => {
    setPropertyType(type);
    setLoanAmount(amount);
    setTenureYears(tenure);
  };

  const handleExportCsv = () => {
    const csvData = exportAmortizationToCsv(calculation.schedule);
    const filename = `SORA_Loan_Amortization_${propertyType}_${loanAmount}_${calculation.effectiveRate.toFixed(2)}pct.csv`;
    triggerCsvDownload(csvData, filename);
  };

  // Filtered monthly schedule
  const visibleSchedule = useMemo(() => {
    if (displayYearFilter === 'all') {
      return calculation.schedule.slice(0, 120); // first 10 years for smooth rendering, or full if requested
    }
    return calculation.schedule.filter((row) => row.year === displayYearFilter);
  }, [calculation.schedule, displayYearFilter]);

  const principalRatio = (loanAmount / (calculation.totalPayment || 1)) * 100;
  const interestRatio = (calculation.totalInterest / (calculation.totalPayment || 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Top Section Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-red-600" />
              <span>Singapore SORA Mortgage & Loan Calculator</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Computes exact interest payments and amortization schedules based on published MAS Compounded SORA overnight rates and Singapore bank loan packages.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => handleApplyPreset('HDB', 550000, 25)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                propertyType === 'HDB' && loanAmount === 550000
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HDB 4-Rm S$550k
            </button>
            <button
              onClick={() => handleApplyPreset('HDB', 750000, 25)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                propertyType === 'HDB' && loanAmount === 750000
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HDB 5-Rm S$750k
            </button>
            <button
              onClick={() => handleApplyPreset('PRIVATE_CONDO', 1400000, 30)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                propertyType === 'PRIVATE_CONDO' && loanAmount === 1400000
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Condo S$1.4M
            </button>
            <button
              onClick={() => handleApplyPreset('COMMERCIAL', 2800000, 25)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                propertyType === 'COMMERCIAL'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Commercial S$2.8M
            </button>
          </div>
        </div>

        {/* Input Parameters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Loan & Rate Configuration
            </h2>

            {/* Property Type Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Property Classification
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPropertyType('HDB')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    propertyType === 'HDB' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  HDB Flat
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType('PRIVATE_CONDO')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    propertyType === 'PRIVATE_CONDO' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Condo
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType('LANDED')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    propertyType === 'LANDED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Landed
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType('COMMERCIAL')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    propertyType === 'COMMERCIAL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Commercial
                </button>
              </div>
            </div>

            {/* Loan Principal Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="loan-amount-input" className="text-xs font-medium text-slate-700">
                  Loan Principal (SGD)
                </label>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                  {formatSGD(loanAmount, false)}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
                  S$
                </div>
                <input
                  id="loan-amount-input"
                  type="number"
                  step="10000"
                  min="50000"
                  max="20000000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(10000, Number(e.target.value) || 0))}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                />
              </div>
              <input
                type="range"
                min="100000"
                max="3000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full mt-2 accent-red-600 cursor-pointer"
              />
            </div>

            {/* Loan Tenure Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="loan-tenure-input" className="text-xs font-medium text-slate-700">
                  Loan Tenure
                </label>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                  {tenureYears} Years ({tenureYears * 12} Months)
                </span>
              </div>
              <input
                id="loan-tenure-input"
                type="range"
                min="5"
                max={propertyType === 'HDB' ? 30 : 35}
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>5 yrs</span>
                <span>15 yrs</span>
                <span>25 yrs (std)</span>
                <span>{propertyType === 'HDB' ? '30 yrs (max)' : '35 yrs (max)'}</span>
              </div>
            </div>

            {/* Benchmark Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Reference SORA Benchmark (MAS Published)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBenchmarkType('3M')}
                  className={`p-2.5 text-left border rounded-lg transition-colors ${
                    benchmarkType === '3M'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">3-Month SORA</span>
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Standard</span>
                  </div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {formatRatePct(currentRecord.compounded3M)}
                  </div>
                  <span className="text-[10px] text-slate-500">Quarterly reset period</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBenchmarkType('1M')}
                  className={`p-2.5 text-left border rounded-lg transition-colors ${
                    benchmarkType === '1M'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">1-Month SORA</span>
                  </div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {formatRatePct(currentRecord.compounded1M)}
                  </div>
                  <span className="text-[10px] text-slate-500">Monthly reset period</span>
                </button>
              </div>

              {/* Secondary Benchmarks & Custom */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setBenchmarkType('6M')}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    benchmarkType === '6M' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  6M SORA ({formatRatePct(currentRecord.compounded6M, 2)})
                </button>
                <button
                  type="button"
                  onClick={() => setBenchmarkType('OVERNIGHT')}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    benchmarkType === 'OVERNIGHT' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Daily SORA ({formatRatePct(currentRecord.sora, 2)})
                </button>
                <button
                  type="button"
                  onClick={() => setBenchmarkType('CUSTOM')}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    benchmarkType === 'CUSTOM' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Custom Rate
                </button>
              </div>

              {benchmarkType === 'CUSTOM' && (
                <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label htmlFor="custom-benchmark-input" className="block text-xs font-medium text-slate-700 mb-1">
                    Custom SORA Benchmark (% p.a.)
                  </label>
                  <input
                    id="custom-benchmark-input"
                    type="number"
                    step="0.0001"
                    min="0"
                    max="15"
                    value={customBenchmarkRate}
                    onChange={(e) => setCustomBenchmarkRate(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            {/* Bank Spread / Margin */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="bank-spread-input" className="text-xs font-medium text-slate-700">
                  Bank Margin / Spread (+% p.a.)
                </label>
                <span className="text-xs font-bold font-mono text-slate-900">
                  +{bankSpread.toFixed(2)}% p.a.
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {[0.60, 0.65, 0.70, 0.75, 0.85].map((spread) => (
                  <button
                    key={spread}
                    type="button"
                    onClick={() => setBankSpread(spread)}
                    className={`py-1 text-xs font-mono rounded border transition-colors ${
                      Math.abs(bankSpread - spread) < 0.001
                        ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    +{spread.toFixed(2)}%
                  </button>
                ))}
              </div>
              <input
                id="bank-spread-input"
                type="number"
                step="0.05"
                min="0"
                max="5"
                value={bankSpread}
                onChange={(e) => setBankSpread(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 bg-white"
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                Typical Singapore retail bank spreads range between +0.60% and +0.85% p.a.
              </span>
            </div>

            {/* Optional MAS Affordability Toggle */}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEnableAffordability(!enableAffordability)}
                className="w-full flex items-center justify-between py-2 text-xs font-medium text-slate-800 hover:text-slate-900"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>MAS TDSR & MSR Affordability Assessment</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${enableAffordability ? 'rotate-180' : ''}`} />
              </button>

              {enableAffordability && (
                <div className="mt-2 space-y-3 p-3.5 bg-amber-50/50 rounded-lg border border-amber-200/60">
                  <p className="text-[11px] text-slate-600">
                    MAS rules require banks to stress-test your monthly repayment at a minimum interest rate floor of 4.0% p.a.
                  </p>
                  <div>
                    <label htmlFor="gross-income-input" className="block text-xs font-medium text-slate-700 mb-1">
                      Gross Monthly Household Income (SGD)
                    </label>
                    <input
                      id="gross-income-input"
                      type="number"
                      step="500"
                      min="1000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="other-commitments-input" className="block text-xs font-medium text-slate-700 mb-1">
                      Other Monthly Debt Payments (Car loans, student loans, credit cards)
                    </label>
                    <input
                      id="other-commitments-input"
                      type="number"
                      step="100"
                      min="0"
                      value={otherCommitments}
                      onChange={(e) => setOtherCommitments(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Summary & Key Figures Column */}
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Interest & Repayment Analysis
            </h2>

            {/* Primary Result Card */}
            <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Monthly Installment (P + I)
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white mt-1">
                    {formatSGD(calculation.monthlyInstallment)}
                    <span className="text-sm font-normal text-slate-400 ml-1.5">/ month</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Effective Interest Rate</span>
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-400">
                    {formatRatePct(calculation.effectiveRate)} p.a.
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {formatRatePct(activeBenchmarkRate, 4)} (SORA) + {bankSpread.toFixed(2)}% (Spread)
                  </div>
                </div>
              </div>

              {/* Total Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <div className="text-slate-400">Total Principal</div>
                  <div className="text-base font-bold font-mono tabular-nums text-slate-100 mt-0.5">
                    {formatSGD(calculation.totalPrincipal, false)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Total Interest Paid</div>
                  <div className="text-base font-bold font-mono tabular-nums text-red-400 mt-0.5">
                    {formatSGD(calculation.totalInterest, false)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Total Cost of Loan</div>
                  <div className="text-base font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                    {formatSGD(calculation.totalPayment, false)}
                  </div>
                </div>
              </div>

              {/* Principal vs Interest Visual Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Principal: {principalRatio.toFixed(1)}%</span>
                  <span>Interest: {interestRatio.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${principalRatio}%` }} className="bg-emerald-500 h-full"></div>
                  <div style={{ width: `${interestRatio}%` }} className="bg-red-500 h-full"></div>
                </div>
              </div>
            </div>

            {/* MAS Stress Test & Regulatory Thresholds Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>MAS Notice 645 Regulatory Stress Test</span>
                </span>
                <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Floor: {calculation.stressTestRate.toFixed(1)}% p.a.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Stressed Monthly Installment (at 4.0% floor)</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {formatSGD(calculation.stressTestMonthlyInstallment)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Buffer: +{formatSGD(calculation.stressTestMonthlyInstallment - calculation.monthlyInstallment)} / mo
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Interest Repayment Buffer</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {(calculation.stressTestRate - calculation.effectiveRate).toFixed(2)}% headroom
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Rate can climb {Math.max(0, calculation.stressTestRate - calculation.effectiveRate).toFixed(2)}% before reaching MAS stress floor
                  </div>
                </div>
              </div>

              {/* Affordability Metrics if enabled */}
              {enableAffordability && calculation.tdsrRatio !== undefined && (
                <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-lg border ${
                    calculation.tdsrRatio <= 55
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">TDSR (Total Debt Servicing Ratio)</span>
                      {calculation.tdsrRatio <= 55 ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="text-base font-bold font-mono mt-1">
                      {calculation.tdsrRatio.toFixed(1)}% / 55% cap
                    </div>
                    <p className="text-[10px] mt-0.5 opacity-80">
                      {calculation.tdsrRatio <= 55
                        ? 'Passed MAS TDSR eligibility framework.'
                        : 'Exceeds MAS 55% statutory limit. Reduce loan or extend tenure.'}
                    </p>
                  </div>

                  {propertyType === 'HDB' && calculation.msrRatio !== undefined && (
                    <div className={`p-3 rounded-lg border ${
                      calculation.msrRatio <= 30
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">MSR (Mortgage Servicing Ratio)</span>
                        {calculation.msrRatio <= 30 ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-base font-bold font-mono mt-1">
                        {calculation.msrRatio.toFixed(1)}% / 30% cap
                      </div>
                      <p className="text-[10px] mt-0.5 opacity-80">
                        {calculation.msrRatio <= 30
                          ? 'Passed HDB 30% MSR cap.'
                          : 'Exceeds HDB 30% MSR statutory cap.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Loan Amortization Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact monthly and annual breakdown of principal reduction, accrued interest, and balance drawdown.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('annual')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'annual' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual Summary
              </button>
              <button
                type="button"
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Schedule
              </button>
            </div>

            {/* CSV Export */}
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="mt-4 overflow-x-auto">
          {viewMode === 'annual' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3 text-right">Annual Payment</th>
                  <th className="py-2.5 px-3 text-right">Principal Paid</th>
                  <th className="py-2.5 px-3 text-right">Interest Paid</th>
                  <th className="py-2.5 px-3 text-right">Ending Balance</th>
                  <th className="py-2.5 px-3 text-center">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {calculation.yearlySummary.map((yearRow) => {
                  const remainingPct = (yearRow.endingBalance / loanAmount) * 100;
                  return (
                    <tr key={yearRow.year} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        Year {yearRow.year}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-800">
                        {formatSGD(yearRow.totalPayment)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">
                        {formatSGD(yearRow.totalPrincipal)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-red-600">
                        {formatSGD(yearRow.totalInterest)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        {formatSGD(yearRow.endingBalance)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 text-[11px]">
                        {remainingPct.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div>
              {/* Year filter for monthly view */}
              <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="text-slate-500 font-medium">Filter Year:</span>
                <select
                  value={displayYearFilter}
                  onChange={(e) => setDisplayYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                >
                  <option value="all">All Months (showing first 120)</option>
                  {calculation.yearlySummary.map((y) => (
                    <option key={y.year} value={y.year}>
                      Year {y.year}
                    </option>
                  ))}
                </select>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Opening Balance</th>
                    <th className="py-2.5 px-3 text-right">Monthly Installment</th>
                    <th className="py-2.5 px-3 text-right">Principal Paid</th>
                    <th className="py-2.5 px-3 text-right">Interest Paid</th>
                    <th className="py-2.5 px-3 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {visibleSchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-800">#{row.month}</td>
                      <td className="py-2 px-3 text-slate-600">{row.dateStr}</td>
                      <td className="py-2 px-3 text-right text-slate-700">{formatSGD(row.openingBalance)}</td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900">{formatSGD(row.monthlyPayment)}</td>
                      <td className="py-2 px-3 text-right text-emerald-700">{formatSGD(row.principalPayment)}</td>
                      <td className="py-2 px-3 text-right text-red-600">{formatSGD(row.interestPayment)}</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900">{formatSGD(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

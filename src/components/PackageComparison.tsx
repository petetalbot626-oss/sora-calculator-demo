import React, { useState, useMemo } from 'react';
import { MasSoraRecord, BankLoanPackage } from '../types/sora';
import { POPULAR_SINGAPORE_BANK_PACKAGES } from '../data/masHistoricalRates';
import {
  calculateMonthlyInstallment,
  calculateSensitivityMatrix,
  formatSGD,
  formatRatePct,
} from '../utils/soraCalculator';
import {
  GitCompare,
  TrendingUp,
  Building,
  Check,
  ArrowRight,
  ShieldCheck,
  Sliders,
} from 'lucide-react';

interface PackageComparisonProps {
  currentRecord: MasSoraRecord;
  onSelectPackageForCalculator: (packageItem: BankLoanPackage) => void;
}

export const PackageComparison: React.FC<PackageComparisonProps> = ({
  currentRecord,
  onSelectPackageForCalculator,
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(800000);
  const [tenureYears, setTenureYears] = useState<number>(25);

  // Selected package for sensitivity matrix
  const [activePackageId, setActivePackageId] = useState<string>(
    POPULAR_SINGAPORE_BANK_PACKAGES[0].id
  );

  const activePackage = useMemo(() => {
    return (
      POPULAR_SINGAPORE_BANK_PACKAGES.find((p) => p.id === activePackageId) ||
      POPULAR_SINGAPORE_BANK_PACKAGES[0]
    );
  }, [activePackageId]);

  // Compute effective rates for each package
  const packagesWithCalculations = useMemo(() => {
    return POPULAR_SINGAPORE_BANK_PACKAGES.map((pkg) => {
      const benchmarkRate =
        pkg.benchmarkType === '1M'
          ? currentRecord.compounded1M
          : currentRecord.compounded3M;
      const initialEffectiveRate = benchmarkRate + pkg.spreadYear1_3;
      const thereafterEffectiveRate = benchmarkRate + pkg.spreadYear4Onwards;

      const initialMonthly = calculateMonthlyInstallment(
        loanAmount,
        initialEffectiveRate,
        tenureYears
      );
      const thereafterMonthly = calculateMonthlyInstallment(
        loanAmount,
        thereafterEffectiveRate,
        tenureYears
      );

      // Estimate total 3-year interest paid
      const monthlyRateInitial = initialEffectiveRate / 100 / 12;
      let balance = loanAmount;
      let interest3Years = 0;
      for (let m = 0; m < 36; m++) {
        const intAmt = balance * monthlyRateInitial;
        const priAmt = initialMonthly - intAmt;
        interest3Years += intAmt;
        balance = Math.max(0, balance - priAmt);
      }

      return {
        ...pkg,
        benchmarkRate,
        initialEffectiveRate,
        thereafterEffectiveRate,
        initialMonthly,
        thereafterMonthly,
        interest3Years,
      };
    });
  }, [loanAmount, tenureYears, currentRecord]);

  // Active package sensitivity matrix
  const sensitivityMatrix = useMemo(() => {
    const benchmarkRate =
      activePackage.benchmarkType === '1M'
        ? currentRecord.compounded1M
        : currentRecord.compounded3M;
    const currentEffective = benchmarkRate + activePackage.spreadYear1_3;
    return calculateSensitivityMatrix(loanAmount, tenureYears, currentEffective);
  }, [activePackage, currentRecord, loanAmount, tenureYears]);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-red-600" />
              <span>Singapore Bank Loan Packages Comparison</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Compare 1M SORA vs 3M SORA mortgage packages from DBS, OCBC, UOB, Standard Chartered, and HSBC.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label htmlFor="compare-loan-amount" className="block text-xs text-slate-500 mb-0.5">
                Comparison Loan Amount
              </label>
              <input
                id="compare-loan-amount"
                type="number"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                className="w-36 px-2.5 py-1 text-xs font-mono border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 bg-white"
              />
            </div>
            <div>
              <label htmlFor="compare-tenure" className="block text-xs text-slate-500 mb-0.5">
                Tenure
              </label>
              <select
                id="compare-tenure"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="px-2.5 py-1 text-xs font-mono border border-slate-300 rounded-md focus:ring-1 focus:ring-red-500 bg-white"
              >
                <option value={15}>15 Years</option>
                <option value={20}>20 Years</option>
                <option value={25}>25 Years</option>
                <option value={30}>30 Years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {packagesWithCalculations.map((pkg) => {
            const isSelected = pkg.id === activePackageId;
            return (
              <div
                key={pkg.id}
                className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-red-600 bg-red-50/20 shadow-md ring-1 ring-red-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">
                        {pkg.bankName}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {pkg.packageName}
                      </h3>
                    </div>
                    {pkg.recommended && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Effective Rate Callout */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="text-[11px] text-slate-500">Year 1–3 Effective Rate</div>
                    <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                      {formatRatePct(pkg.initialEffectiveRate)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {pkg.benchmarkType} SORA ({formatRatePct(pkg.benchmarkRate, 2)}) + {pkg.spreadYear1_3.toFixed(2)}%
                    </div>
                  </div>

                  {/* Monthly Installment */}
                  <div className="mt-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Initial Monthly:</span>
                      <span className="font-bold font-mono text-slate-900">
                        {formatSGD(pkg.initialMonthly)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Year 4+ Rate:</span>
                      <span className="font-mono text-slate-700">
                        {formatRatePct(pkg.thereafterEffectiveRate)} (+{pkg.spreadYear4Onwards.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lock-in Period:</span>
                      <span className="font-medium text-slate-800">{pkg.lockInPeriodYears} Years</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1.5">
                      <span className="text-slate-500">3-Yr Total Interest:</span>
                      <span className="font-bold font-mono text-red-600">
                        {formatSGD(pkg.interest3Years, false)}
                      </span>
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <ul className="mt-4 space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePackageId(pkg.id)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? 'Viewing Sensitivity' : 'Analyze Sensitivity'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectPackageForCalculator(pkg)}
                    title="Load into main calculator"
                    className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg bg-white"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SORA Rate Sensitivity Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <span>Interest Rate Sensitivity Stress Test</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating how interest rate hikes or rate cuts impact monthly payments on {activePackage.bankName} - {activePackage.packageName}.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            Baseline Rate: {formatRatePct(
              (activePackage.benchmarkType === '1M' ? currentRecord.compounded1M : currentRecord.compounded3M) + activePackage.spreadYear1_3
            )}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">SORA Rate Scenario</th>
                <th className="py-2.5 px-3 text-right">Effective Rate</th>
                <th className="py-2.5 px-3 text-right">Monthly Installment</th>
                <th className="py-2.5 px-3 text-right">Monthly Delta</th>
                <th className="py-2.5 px-3 text-right">Total Tenure Interest</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {sensitivityMatrix.map((step) => {
                const isBase = step.rateShift === 0;
                return (
                  <tr
                    key={step.rateShift}
                    className={`transition-colors ${
                      isBase ? 'bg-amber-50/50 font-semibold text-slate-900' : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      {isBase ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold">
                          <span>Current Benchmark Rate</span>
                        </span>
                      ) : (
                        <span>
                          {step.rateShift > 0 ? `+${step.rateShift.toFixed(2)}% hike` : `${step.rateShift.toFixed(2)}% cut`}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {formatRatePct(step.scenarioRate)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatSGD(step.monthlyPayment)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isBase ? (
                        <span className="text-slate-400 font-normal">Baseline</span>
                      ) : step.paymentDelta > 0 ? (
                        <span className="text-red-600 font-semibold">+{formatSGD(step.paymentDelta)}/mo</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">{formatSGD(step.paymentDelta)}/mo</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800">
                      {formatSGD(step.totalTenureInterest, false)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[11px]">
                      {step.scenarioRate >= 4.0 ? (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-sans">Above MAS Floor (4.0%)</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-sans">Within Normal Range</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

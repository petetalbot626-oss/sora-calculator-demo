import React from 'react';
import { BookOpen, ShieldCheck, Landmark, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';

export const SoraEducationGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Singapore Overnight Rate Average (SORA) Reference Guide
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Official MAS and SC-STS framework guidelines for interest rate benchmarks, property loans, and financial products in Singapore.
            </p>
          </div>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <Landmark className="w-4 h-4" />
              <span>MAS Backed & Administered</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              SORA is computed and published by the Monetary Authority of Singapore (MAS). It is based on actual, verified unsecured overnight SGD interbank transactions brokered in Singapore between 8:00am and 6:15pm, making it highly robust and immune to manipulation.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Backward-Looking Compounding</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Unlike forward-looking term rates (such as former SIBOR), Compounded SORA represents the geometric average of overnight rates realized over a 30-day, 90-day, or 180-day period. This dampens single-day volatility and prevents unexpected payment spikes.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Actual/365 Day Count</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Singapore Dollar (SGD) money market conventions strictly employ an Actual/365 day count convention (in contrast to USD and international SOFR which frequently use Actual/360). Daily rates are weighted by 3 calendar days on Fridays over weekends.
            </p>
          </div>
        </div>
      </div>

      {/* SORA vs SIBOR Transition Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Key Comparison: SORA vs SIBOR vs SOR
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-semibold">
                <th className="py-2.5 px-3">Dimension</th>
                <th className="py-2.5 px-3">SORA (New Standard)</th>
                <th className="py-2.5 px-3">SIBOR (Discontinued)</th>
                <th className="py-2.5 px-3">SOR (Discontinued)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Administrator</td>
                <td className="py-2.5 px-3 text-red-700 font-medium">Monetary Authority of Singapore (MAS)</td>
                <td className="py-2.5 px-3">ABS Benchmarks Administration (ABS Co)</td>
                <td className="py-2.5 px-3">ABS Benchmarks Administration (ABS Co)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Underlying Data</td>
                <td className="py-2.5 px-3 text-slate-800">Actual SGD overnight unsecured cash trades (S$4B–S$6B daily)</td>
                <td className="py-2.5 px-3">Bank quote submissions (estimated borrowing cost)</td>
                <td className="py-2.5 px-3">Derived from USD/SGD FX swap rates & USD LIBOR</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Nature of Rate</td>
                <td className="py-2.5 px-3 text-slate-800">Backward-looking compounded overnight average</td>
                <td className="py-2.5 px-3">Forward-looking term estimate (1M / 3M)</td>
                <td className="py-2.5 px-3">Forward-looking synthetic rate</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Current Status</td>
                <td className="py-2.5 px-3">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    Singapore Primary Benchmark
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-400">Discontinued as of Dec 2024</td>
                <td className="py-2.5 px-3 text-slate-400">Discontinued as of Jun 2023</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-red-600" />
          <span>Frequently Asked Questions for Borrowers</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50/60 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              1. What is the difference between 1M SORA and 3M SORA home loans?
            </h3>
            <p className="mt-1 leading-relaxed">
              In a 1-Month Compounded SORA loan, your interest rate refreshes every month based on the published 1M Compounded SORA rate on your reset date. In a 3-Month Compounded SORA package, your interest rate is locked for 3 consecutive months and resets quarterly. 3M SORA offers greater payment stability, whereas 1M SORA reacts more rapidly when interest rates are descending.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50/60 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              2. What is "Compounded in Advance" vs "Compounded in Arrears"?
            </h3>
            <p className="mt-1 leading-relaxed">
              Retail mortgage packages in Singapore generally use <strong>Compounded in Advance</strong> (also known as Lookback in Advance). The bank looks at the MAS Compounded SORA published rate on the reset date and fixes that rate for the coming 1 or 3 months. Corporate credit facilities and treasury loans frequently use <strong>Compounded in Arrears</strong>, where the daily overnight rates during the actual calculation period are compounded at the end of the period.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50/60 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              3. Why does MAS require a 4.0% stress test floor for TDSR?
            </h3>
            <p className="mt-1 leading-relaxed">
              Under MAS Notice 645/1115, financial institutions in Singapore are mandated to assess a borrower&apos;s debt servicing ability using a statutory medium-term interest rate floor of <strong>4.0% p.a.</strong> (or the prevailing rate plus a buffer, whichever is higher). This prudential rule prevents borrowers from becoming financially overstretched if macro rates climb in the future.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50/60 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              4. When does MAS publish the daily SORA rate?
            </h3>
            <p className="mt-1 leading-relaxed">
              MAS publishes SORA daily at approximately <strong>9:00am SGT</strong> on the business day following the transaction date (T+1). If Monday is a Singapore public holiday, Friday&apos;s rate remains applicable until the next official Singapore banking day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { MasRateTicker } from './components/MasRateTicker';
import { MortgageCalculator } from './components/MortgageCalculator';
import { DailyCompoundingCalculator } from './components/DailyCompoundingCalculator';
import { PackageComparison } from './components/PackageComparison';
import { SoraRateHistoryChart } from './components/SoraRateHistoryChart';
import { SoraEducationGuide } from './components/SoraEducationGuide';
import {
  DEFAULT_MAS_SORA_RATES,
  fetchMasSoraRates,
} from './data/masHistoricalRates';
import { MasSoraRecord, BankLoanPackage } from './types/sora';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'mortgage' | 'compounding' | 'packages' | 'history' | 'guide'
  >('mortgage');

  const [records, setRecords] = useState<MasSoraRecord[]>(DEFAULT_MAS_SORA_RATES);
  const [selectedDate, setSelectedDate] = useState<string>(
    DEFAULT_MAS_SORA_RATES[0]?.date || '2026-10-02'
  );
  const [dataSource, setDataSource] = useState<
    'MAS_LIVE_API' | 'LOCAL_MAS_RECORDS'
  >('LOCAL_MAS_RECORDS');
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);

  // Load latest MAS SORA rates on mount
  const loadRates = async () => {
    setIsLoadingRates(true);
    try {
      const res = await fetchMasSoraRates();
      if (res.data && res.data.length > 0) {
        setRecords(res.data);
        setDataSource(res.source);
        if (!res.data.some((r) => r.date === selectedDate)) {
          setSelectedDate(res.data[0].date);
        }
      }
    } catch (err) {
      console.error('Error fetching MAS rates:', err);
    } finally {
      setIsLoadingRates(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  // Currently selected rate record
  const currentRecord = useMemo(() => {
    return (
      records.find((r) => r.date === selectedDate) ||
      records[0] ||
      DEFAULT_MAS_SORA_RATES[0]
    );
  }, [records, selectedDate]);

  // Handler for selecting package from comparison tab to switch to calculator
  const handleSelectPackage = (pkg: BankLoanPackage) => {
    setActiveTab('mortgage');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        latestDate={currentRecord.date}
      />

      {/* MAS Rate Ticker Banner */}
      <MasRateTicker
        currentRecord={currentRecord}
        records={records}
        source={dataSource}
        onRefresh={loadRates}
        isLoading={isLoadingRates}
        onSelectDate={(date) => setSelectedDate(date)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'mortgage' && (
          <MortgageCalculator currentRecord={currentRecord} />
        )}

        {activeTab === 'compounding' && (
          <DailyCompoundingCalculator historicalRates={records} />
        )}

        {activeTab === 'packages' && (
          <PackageComparison
            currentRecord={currentRecord}
            onSelectPackageForCalculator={handleSelectPackage}
          />
        )}

        {activeTab === 'history' && (
          <SoraRateHistoryChart records={records} />
        )}

        {activeTab === 'guide' && <SoraEducationGuide />}
      </main>

      {/* Clean Financial Disclaimer & Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="font-semibold text-slate-700">Singapore SORA Calculator</span> · Benchmark data sourced from Monetary Authority of Singapore (MAS) Open Data API.
            <div className="text-[11px] text-slate-400 mt-0.5">
              SGD money market standard Actual/365 day count convention. For financial planning purposes; consult licensed Singapore banks for formal loan sanction letters.
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-slate-900 transition-colors"
            >
              Methodology & FAQ
            </button>
            <span>·</span>
            <a
              href="https://eservices.mas.gov.sg/statistics/dir/sora.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              MAS SORA Statistics
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

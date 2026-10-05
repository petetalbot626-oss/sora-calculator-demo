import React from 'react';
import { Landmark, ArrowUpRight, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'mortgage' | 'compounding' | 'packages' | 'history' | 'guide';
  setActiveTab: (tab: 'mortgage' | 'compounding' | 'packages' | 'history' | 'guide') => void;
  latestDate: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, latestDate }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand title, single line */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              <Landmark className="w-4 h-4" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('mortgage');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5"
            >
              <span>SORA Calculator</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                SG
              </span>
            </a>
          </div>

          {/* Zone 2: 4-5 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => setActiveTab('mortgage')}
              className={`transition-colors whitespace-nowrap pb-0.5 ${
                activeTab === 'mortgage'
                  ? 'text-red-700 font-semibold border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mortgage Loan
            </button>
            <button
              onClick={() => setActiveTab('compounding')}
              className={`transition-colors whitespace-nowrap pb-0.5 ${
                activeTab === 'compounding'
                  ? 'text-red-700 font-semibold border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Compounding
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`transition-colors whitespace-nowrap pb-0.5 ${
                activeTab === 'packages'
                  ? 'text-red-700 font-semibold border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bank Comparison
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`transition-colors whitespace-nowrap pb-0.5 ${
                activeTab === 'history'
                  ? 'text-red-700 font-semibold border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MAS Rate History
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`transition-colors whitespace-nowrap pb-0.5 ${
                activeTab === 'guide'
                  ? 'text-red-700 font-semibold border-b-2 border-red-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MAS SORA Guide
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MAS Fixing: {latestDate}</span>
            </div>
            <a
              href="https://eservices.mas.gov.sg/statistics/dir/sora.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>MAS Official Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

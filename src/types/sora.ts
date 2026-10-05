/**
 * SORA (Singapore Overnight Rate Average) Domain Types
 * Based on Monetary Authority of Singapore (MAS) conventions and SC-STS specifications.
 */

export interface MasSoraRecord {
  date: string; // ISO YYYY-MM-DD
  sora: number; // Daily overnight rate in % (e.g. 3.0500)
  soraIndex: number; // Base 100 on 3 Jan 2020 (e.g. 113.8421)
  compounded1M: number; // 1-Month Compounded SORA in %
  compounded3M: number; // 3-Month Compounded SORA in %
  compounded6M: number; // 6-Month Compounded SORA in %
  aggregateVolume?: number; // Total volume in SGD millions/billions
  highestTransactionRate?: number;
  lowestTransactionRate?: number;
  percentile25?: number;
  percentile75?: number;
}

export type SoraBenchmarkType = '1M' | '3M' | '6M' | 'OVERNIGHT' | 'CUSTOM';

export interface MortgageLoanInput {
  propertyType: 'HDB' | 'PRIVATE_CONDO' | 'LANDED' | 'COMMERCIAL';
  loanAmount: number; // in SGD
  tenureYears: number; // e.g. 25
  benchmarkType: SoraBenchmarkType;
  baseBenchmarkRate: number; // in %
  bankSpread: number; // in % (e.g. 0.65)
  monthlyIncome?: number; // for MAS TDSR / MSR check
  otherCommitments?: number; // other monthly loan repayments
}

export interface AmortizationRow {
  month: number;
  year: number;
  dateStr: string;
  openingBalance: number;
  monthlyPayment: number;
  principalPayment: number;
  interestPayment: number;
  closingBalance: number;
  interestRate: number;
}

export interface AnnualAmortizationSummary {
  year: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  endingBalance: number;
}

export interface MortgageCalculationResult {
  monthlyInstallment: number;
  effectiveRate: number; // benchmark + spread
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
  stressTestRate: number; // MAS medium-term floor, e.g. 4.0%
  stressTestMonthlyInstallment: number;
  tdsrRatio?: number; // Total Debt Servicing Ratio (MAS cap is 55%)
  msrRatio?: number; // Mortgage Servicing Ratio for HDB (MAS cap is 30%)
  schedule: AmortizationRow[];
  yearlySummary: AnnualAmortizationSummary[];
}

export interface DailyCompoundingInput {
  principalAmount: number; // in SGD
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  marginSpread: number; // in % (e.g. 0.85%)
  dayCountConvention: 'ACT/365' | 'ACT/360'; // Standard Singapore SGD market is ACT/365
  lookbackDays: number; // e.g. 0 (in-period) or 5 days lookback
}

export interface DailyCompoundingRow {
  date: string;
  isBusinessDay: boolean;
  applicableSoraRate: number; // in %
  calendarDays: number; // n_i (1 for weekdays, 3 for Friday)
  dailyEffectiveRate: number; // rate + margin
  compoundingFactor: number;
  periodAccruedInterest: number;
  cumulativeInterest: number;
}

export interface DailyCompoundingResult {
  compoundedSoraAnnualized: number; // %
  totalEffectiveAnnualized: number; // % including margin
  totalInterestPayable: number; // in SGD
  totalDays: number;
  businessDaysCount: number;
  rows: DailyCompoundingRow[];
}

export interface BankLoanPackage {
  id: string;
  bankName: string;
  packageName: string;
  benchmarkType: SoraBenchmarkType;
  spreadYear1_3: number;
  spreadYear4Onwards: number;
  lockInPeriodYears: number;
  minLoanAmount: number;
  features: string[];
  recommended?: boolean;
}

export interface SoraRateSensitivityStep {
  rateShift: number; // e.g. -1.0, -0.5, 0, +0.5, +1.0, +1.5, +2.0
  scenarioRate: number; // effective %
  monthlyPayment: number;
  paymentDelta: number; // vs current payment
  totalTenureInterest: number;
}

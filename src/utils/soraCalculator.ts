import {
  MortgageLoanInput,
  MortgageCalculationResult,
  AmortizationRow,
  AnnualAmortizationSummary,
  DailyCompoundingInput,
  DailyCompoundingResult,
  DailyCompoundingRow,
  MasSoraRecord,
  SoraRateSensitivityStep,
} from '../types/sora';

/**
 * Standard Mortgage Installment formula (Annuity repayment)
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyInstallment(
  principal: number,
  annualRatePct: number,
  tenureYears: number
): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  if (annualRatePct <= 0) return principal / (tenureYears * 12);

  const monthlyRate = annualRatePct / 100 / 12;
  const totalMonths = tenureYears * 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const monthlyPayment = (principal * (monthlyRate * factor)) / (factor - 1);

  return monthlyPayment;
}

/**
 * Generate full monthly and annual amortization schedule
 */
export function calculateMortgageSchedule(input: MortgageLoanInput): MortgageCalculationResult {
  const { loanAmount, tenureYears, baseBenchmarkRate, bankSpread, monthlyIncome, otherCommitments, propertyType } = input;
  const effectiveRate = Math.max(0, baseBenchmarkRate + bankSpread);
  const totalMonths = tenureYears * 12;
  const monthlyInstallment = calculateMonthlyInstallment(loanAmount, effectiveRate, tenureYears);

  // MAS Stress-testing Floor (Notice 645/1115 stipulates 4.0% for residential property)
  const stressTestRate = 4.0;
  const stressTestMonthlyInstallment = calculateMonthlyInstallment(loanAmount, stressTestRate, tenureYears);

  const schedule: AmortizationRow[] = [];
  const yearlyMap = new Map<number, { payment: number; principal: number; interest: number; endingBalance: number }>();

  let currentBalance = loanAmount;
  const monthlyRate = effectiveRate / 100 / 12;

  const now = new Date();
  const startYear = now.getFullYear();
  const startMonth = now.getMonth() + 1;

  for (let m = 1; m <= totalMonths; m++) {
    const interestPayment = currentBalance * monthlyRate;
    let principalPayment = monthlyInstallment - interestPayment;

    if (m === totalMonths || principalPayment > currentBalance) {
      principalPayment = currentBalance;
    }

    const closingBalance = Math.max(0, currentBalance - principalPayment);
    const calYear = startYear + Math.floor((startMonth + m - 2) / 12);
    const calMonth = ((startMonth + m - 2) % 12) + 1;
    const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}`;
    const yearIndex = Math.ceil(m / 12);

    schedule.push({
      month: m,
      year: yearIndex,
      dateStr,
      openingBalance: currentBalance,
      monthlyPayment: principalPayment + interestPayment,
      principalPayment,
      interestPayment,
      closingBalance,
      interestRate: effectiveRate,
    });

    // Accumulate yearly summary
    const ySummary = yearlyMap.get(yearIndex) || { payment: 0, principal: 0, interest: 0, endingBalance: 0 };
    ySummary.payment += principalPayment + interestPayment;
    ySummary.principal += principalPayment;
    ySummary.interest += interestPayment;
    ySummary.endingBalance = closingBalance;
    yearlyMap.set(yearIndex, ySummary);

    currentBalance = closingBalance;
    if (currentBalance <= 0) break;
  }

  const yearlySummary: AnnualAmortizationSummary[] = Array.from(yearlyMap.entries()).map(([year, data]) => ({
    year,
    totalPayment: data.payment,
    totalPrincipal: data.principal,
    totalInterest: data.interest,
    endingBalance: data.endingBalance,
  }));

  const totalPayment = schedule.reduce((sum, row) => sum + row.monthlyPayment, 0);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interestPayment, 0);

  // MAS TDSR calculation (MAS Maximum allowed: 55% of gross monthly income)
  let tdsrRatio: number | undefined;
  if (monthlyIncome && monthlyIncome > 0) {
    const totalDebtService = stressTestMonthlyInstallment + (otherCommitments || 0);
    tdsrRatio = (totalDebtService / monthlyIncome) * 100;
  }

  // MAS MSR calculation (For HDB flats only: MAS Maximum allowed: 30% of gross monthly income)
  let msrRatio: number | undefined;
  if (propertyType === 'HDB' && monthlyIncome && monthlyIncome > 0) {
    msrRatio = (stressTestMonthlyInstallment / monthlyIncome) * 100;
  }

  return {
    monthlyInstallment,
    effectiveRate,
    totalPayment,
    totalInterest,
    totalPrincipal: loanAmount,
    stressTestRate,
    stressTestMonthlyInstallment,
    tdsrRatio,
    msrRatio,
    schedule,
    yearlySummary,
  };
}

/**
 * SC-STS / MAS Standard Compounded SORA in Arrears calculation
 * Formula: [ Product_{i=1}^{d0} (1 + SORA_i * n_i / 365) - 1 ] * (365 / d) * 100
 */
export function calculateDailyCompounding(
  input: DailyCompoundingInput,
  historicalRates: MasSoraRecord[]
): DailyCompoundingResult {
  const { principalAmount, startDate, endDate, marginSpread } = input;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return {
      compoundedSoraAnnualized: 0,
      totalEffectiveAnnualized: marginSpread,
      totalInterestPayable: 0,
      totalDays: 0,
      businessDaysCount: 0,
      rows: [],
    };
  }

  // Create rate lookup map by YYYY-MM-DD
  const rateMap = new Map<string, MasSoraRecord>();
  historicalRates.forEach((rec) => rateMap.set(rec.date, rec));

  // Determine latest known rate to use for future dates
  const latestKnownRate = historicalRates[0]?.sora || 2.9125;

  const rows: DailyCompoundingRow[] = [];
  let current = new Date(start);
  let product = 1.0;
  let cumulativeInterest = 0;
  let businessDaysCount = 0;

  // Total calendar days
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  while (current < end) {
    const dayOfWeek = current.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (!isWeekend) {
      businessDaysCount++;
      const dateStr = current.toISOString().split('T')[0];
      const matched = rateMap.get(dateStr);
      const soraRate = matched ? matched.sora : latestKnownRate;

      // Calendar days weighting n_i
      // If Friday (day 5), it spans 3 days (Fri, Sat, Sun)
      const calendarDays = dayOfWeek === 5 ? 3 : 1;
      const dailyEffectiveRate = soraRate + marginSpread;

      // Factor for this business day
      const factor = 1 + (soraRate / 100 * calendarDays) / 365;
      product *= factor;

      // Simple interest calculation for this period with bank spread
      const periodAccruedInterest = principalAmount * (dailyEffectiveRate / 100) * (calendarDays / 365);
      cumulativeInterest += periodAccruedInterest;

      rows.push({
        date: dateStr,
        isBusinessDay: true,
        applicableSoraRate: soraRate,
        calendarDays,
        dailyEffectiveRate,
        compoundingFactor: factor,
        periodAccruedInterest,
        cumulativeInterest,
      });
    }

    current.setDate(current.getDate() + 1);
  }

  // Compounded SORA annualized (MAS convention)
  const compoundedSoraAnnualized = totalDays > 0 ? (product - 1) * (365 / totalDays) * 100 : 0;
  const totalEffectiveAnnualized = compoundedSoraAnnualized + marginSpread;

  // Exact interest payable based on compounded formula
  const exactInterestPayable = principalAmount * (product - 1) + (principalAmount * (marginSpread / 100) * (totalDays / 365));

  return {
    compoundedSoraAnnualized,
    totalEffectiveAnnualized,
    totalInterestPayable: exactInterestPayable,
    totalDays,
    businessDaysCount,
    rows,
  };
}

/**
 * SORA Rate Sensitivity Matrix (-1.00% to +2.00%)
 */
export function calculateSensitivityMatrix(
  loanAmount: number,
  tenureYears: number,
  currentEffectiveRate: number
): SoraRateSensitivityStep[] {
  const shifts = [-1.0, -0.5, -0.25, 0, 0.25, 0.5, 1.0, 1.5, 2.0];
  const baseMonthly = calculateMonthlyInstallment(loanAmount, currentEffectiveRate, tenureYears);

  return shifts.map((shift) => {
    const scenarioRate = Math.max(0.1, currentEffectiveRate + shift);
    const monthlyPayment = calculateMonthlyInstallment(loanAmount, scenarioRate, tenureYears);
    const totalTenureInterest = monthlyPayment * (tenureYears * 12) - loanAmount;

    return {
      rateShift: shift,
      scenarioRate,
      monthlyPayment,
      paymentDelta: monthlyPayment - baseMonthly,
      totalTenureInterest: Math.max(0, totalTenureInterest),
    };
  });
}

/**
 * Format currency in Singapore Dollars (SGD)
 */
export function formatSGD(amount: number, showCents: boolean = true): string {
  if (isNaN(amount)) return 'S$0.00';
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

/**
 * Format percentage with 4 decimal places (MAS SORA standard)
 */
export function formatRatePct(rate: number, decimals: number = 4): string {
  if (isNaN(rate)) return '0.0000%';
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Convert Amortization Schedule to CSV string
 */
export function exportAmortizationToCsv(schedule: AmortizationRow[]): string {
  const headers = ['Month', 'Date', 'Opening Balance (SGD)', 'Monthly Installment (SGD)', 'Principal (SGD)', 'Interest (SGD)', 'Ending Balance (SGD)', 'Interest Rate (%)'];
  const rows = schedule.map((row) => [
    row.month,
    row.dateStr,
    row.openingBalance.toFixed(2),
    row.monthlyPayment.toFixed(2),
    row.principalPayment.toFixed(2),
    row.interestPayment.toFixed(2),
    row.closingBalance.toFixed(2),
    row.interestRate.toFixed(4),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Convert Daily Compounding Schedule to CSV string
 */
export function exportDailyCompoundingToCsv(rows: DailyCompoundingRow[]): string {
  const headers = ['Date', 'Business Day', 'Calendar Days Weighted (n_i)', 'Daily SORA Rate (%)', 'Effective Rate (%)', 'Accrued Interest (SGD)', 'Cumulative Interest (SGD)'];
  const data = rows.map((r) => [
    r.date,
    r.isBusinessDay ? 'Yes' : 'No',
    r.calendarDays,
    r.applicableSoraRate.toFixed(4),
    r.dailyEffectiveRate.toFixed(4),
    r.periodAccruedInterest.toFixed(2),
    r.cumulativeInterest.toFixed(2),
  ]);

  return [headers.join(','), ...data.map((r) => r.join(','))].join('\n');
}

/**
 * Trigger CSV file download in browser
 */
export function triggerCsvDownload(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

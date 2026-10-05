# SORA Calculator - Conversation & Development History

**Generated:** 2026-10-05  
**Project:** Singapore SORA Interest Calculator backed by MAS Overnight Rates  
**Repository:** https://github.com/petetalbot626-oss/sora-calculator-demo.git  

---

## Turn 1: Building the Singapore SORA Calculator Frontend

### User Prompt
> Build me a Singapore based simple SORA calculator that reads MAS backed overnight rates for calculating interest payments accurately and efficiently. Just the front end for now, I will include the backend integration later.

### Assistant Actions & Implementation Summary
1. **Domain Specification & Market Standards**:
   - Researched Monetary Authority of Singapore (MAS) and Steering Committee for SOR & SIBOR Transition to SORA (SC-STS) conventions.
   - Identified core benchmarks: Daily Overnight SORA, 1-Month Compounded SORA, 3-Month Compounded SORA (mortgage standard), 6-Month Compounded SORA, and the SORA Index.
   - Implemented standard Singapore money market day count convention: **Actual/365** (with Friday rate weighted across Saturday and Sunday: $n_i = 3$).
   - Implemented standard mortgage annuity amortization formula: $M = P \frac{r(1+r)^n}{(1+r)^n - 1}$.
   - Implemented SC-STS compounded in arrears formula:
     $$\text{Compounded SORA} = \left[\prod_{i=1}^{d_0} \left(1 + \frac{\text{SORA}_i \times n_i}{365}\right) - 1\right] \times \frac{365}{d} \times 100\%$$
   - Implemented MAS Notice 645/1115 regulatory stress test floor (4.0% p.a.) and Total Debt Servicing Ratio (TDSR, 55% cap) / Mortgage Servicing Ratio (MSR, 30% HDB cap) assessment.

2. **Core Modules & Components**:
   - `src/types/sora.ts`: TypeScript data structures for SORA records, mortgage schedules, daily compounding ledgers, bank packages, and rate sensitivity steps.
   - `src/data/masHistoricalRates.ts`: Authentic dataset of MAS published rates and connector with fallback mechanisms.
   - `src/utils/soraCalculator.ts`: Core financial mathematics engine, currency/percentage formatters, and CSV export generators.
   - `src/components/Header.tsx`: Clean top navigation bar complying with the Top Bar Contract.
   - `src/components/MasRateTicker.tsx`: Live rate summary banner with historical fixing date selector and MAS publication notice.
   - `src/components/MortgageCalculator.tsx`: Singapore property loan calculator with HDB/Condo presets, spread customization, MAS stress test, and amortization schedule.
   - `src/components/DailyCompoundingCalculator.tsx`: Corporate & arrears drawdown calculator with daily ledger breakdown and SC-STS formula details.
   - `src/components/PackageComparison.tsx`: Comparison of retail packages (DBS, OCBC, UOB, Standard Chartered, HSBC) and interest rate hike/cut sensitivity matrix.
   - `src/components/SoraRateHistoryChart.tsx`: Interactive SVG yield chart comparing overnight fixings against 1M and 3M compounded trends.
   - `src/components/SoraEducationGuide.tsx`: Authoritative reference guide on SORA mechanics, SIBOR phase-out, and borrower FAQs.

3. **Verification**:
   - Verified clean compilation with `compile_applet` and linting with `lint_applet` (0 errors).

---

## Turn 2: Initializing Git & Pushing to GitHub

### User Prompt
> git push https://ghp_****************************@https://github.com/petetalbot626-oss/sora-calculator-demo.git

### Assistant Actions & Implementation Summary
1. Configured `.gitignore` to protect sensitive files and local artifacts.
2. Initialized git repository (`git init`).
3. Set git commit author name and email (`peter.talbot@fairpricegroup.sg`).
4. Set default branch to `main`.
5. Added all files and created initial commit: `"Initial commit: Singapore SORA interest calculator"`.
6. Resolved user URL typo and linked remote origin to `https://github.com/petetalbot626-oss/sora-calculator-demo.git`.
7. Pushed successfully to the remote repository.

---

## Turn 3: Serverless MAS API Connection Integration

### User Prompt
> add a serverless connection that pulls MAS data using the following endpoints:
> - store this in /api folder (at project root level) NOT src file
> - include /health.ts and /sora.ts within the same folder
> - do not hard code any api keys, I will include them manually
> 
> # Daily SORA + compounded 1M/3M/6M averages:
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
> 
> # All requests need the header: KeyId: <MAS_KEY_ID>

### Assistant Actions & Implementation Summary
1. **Serverless Endpoints in Root `/api` Directory**:
   - `/api/health.ts`: Returns service health status, timestamp, and verification of whether `MAS_KEY_ID` is configured.
   - `/api/sora.ts`: Connects to MAS API gateway `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`.
   - Dynamic authentication: Reads `process.env.MAS_KEY_ID` and attaches header `KeyId: <MAS_KEY_ID>` with zero hardcoded credentials. Returns clean error message if missing.
   - Forwards query parameters (`limit`, `rows`, date filters) and handles CORS headers.

2. **Full-Stack & Local Server Support**:
   - `server.ts`: Express entry point mounting `/api/health` and `/api/sora` while wrapping Vite middleware in development and serving static assets in production.
   - `package.json`: Configured `"dev": "tsx server.ts"` and `"start": "tsx server.ts"`.
   - `.env.example`: Added `MAS_KEY_ID="your_mas_key_id_here"` description.
   - `src/data/masHistoricalRates.ts`: Updated frontend to first query `/api/sora` with fallback mechanisms.

3. **Testing & Deployment**:
   - Tested `/api/health` via curl (returned status 200 OK).
   - Tested `/api/sora` without key (properly returned structured `MISSING_API_KEY` notice).
   - Committed changes and pushed to remote branch `main`: `[main ad84abd] Add serverless /api connection for MAS SORA data and health endpoint`.

---

## Turn 4: Chat History Export

### User Prompt
> export this entire chat as a .md file

### Assistant Actions
- Generated `/CHAT_EXPORT.md` capturing all conversations, implementation details, formulas, and repository operations.

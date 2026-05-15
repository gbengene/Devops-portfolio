# Easy Drive — Financial Audit & Investment Analysis
**Prepared by: SMB Accountant & Financial Strategist**
**Entity: GB Trade and Logistics Inc. o/a Easy Drive**
**Audit Date: April 2026 | Scope: Full pre-launch financial review**

---

## ACCOUNTANT'S VERDICT

> **CONDITIONAL GREEN LIGHT.**
> The business model is economically sound at scale. The unit economics work.
> The technology cost is exemplary (2.4% of revenue). The market opportunity is real.
> However, 5 specific financial risks must be resolved before the first vehicle is rented.
> Proceed — but with capital discipline and the guardrails defined in this report.

---

## PART 1 — AUDIT OF THE BUSINESS PLAN FINANCIALS

### What the Architect, Developer, and Designer Got Right

**1. Tech cost discipline is excellent.**
The Architect chose a stack that costs $72–$107/month at launch. On $2,819/month revenue (base case), that is **2.4% of gross revenue** spent on technology. Industry standard for an SMB SaaS-adjacent system is 8–15%. This team is operating at one-third of typical tech cost. The Supabase free tier, Vercel Hobby, and Resend free tier compound these savings. This decision alone improves Year 1 profitability by approximately $3,600–$6,000 compared to a typical tech stack selection.

**2. Stripe as the payment rail is the correct choice.**
The 2.9% + $0.30/transaction fee is higher than e-transfer but eliminates collection risk entirely. At $300/week per car, Stripe fees are approximately $9/week/car ($468/year/car). The trade-off — guaranteed collection, automated retries, deposit holds, zero collection friction — is worth every cent at this stage. Do not switch to manual e-transfer to save $468/year. The operational risk of chasing payments manually dwarfs the fee.

**3. Bouncie GPS at $8/device/month is correctly priced in the architecture.**
This is the backbone of the security model. The kill switch eliminates the "renter disappears" scenario that destroys most informal rental operators. The $96/year/vehicle cost against a $5,000 vehicle asset is a 1.9% annual security premium. This is cheap insurance.

**4. PandaDoc at $19/month is correctly specified.**
E-signature is not optional in Ontario — a signed agreement is your legal instrument for deposit deductions, kill switch activation, and small claims court proceedings. $19/month for legal instrument generation is one of the highest-ROI line items in the entire budget.

---

### What the Business Plan Got Wrong (Accountant's Corrections)

**CORRECTION 1 — Startup Capital Range is Too Wide to Plan Against**

The business plan shows $22,910–$37,260 — a $14,350 spread. You cannot plan cash requirements against a 62% range. An entrepreneur who sees "$22K minimum" may underfund by $7,175 from the realistic midpoint.

**Audited figure: $30,085 CAD** (see Sheet 02 of the Excel model)

Key items missing from the original plan:
- CarFax reports: $100 (2 vehicles × $50) — **mandatory, not optional**
- Pre-purchase mechanic inspection: $250 (2 vehicles × $125) — **mandatory. A $125 inspection prevents a $4,000 mistake**
- GPS legal disclosure stickers: $15 — **legally required under PIPEDA**
- Domain registration (easydrive.ca): $20 — **not in plan**
- HST float reserve: $800 — **this is CRA's money. Not having it when quarterly remittance is due is a serious problem**
- 5% project contingency on hard costs: $1,272 — **standard accounting practice**

**Action:** Confirm $30,085 is liquid and available before purchasing a single vehicle. Not after.

---

**CORRECTION 2 — HST is Missing from All Revenue Projections**

The business plan shows "$300/week revenue." This is incorrect. The correct breakdown is:

| What You Charge the Renter | Amount |
|---------------------------|--------|
| Weekly rental rate | $300.00 |
| HST (13%) | $39.00 |
| **Total collected from renter** | **$339.00** |

The $39 belongs to CRA. It is a tax collected on their behalf. **It is not your income.** Every projection in the business plan and this audit uses HST-exclusive figures as your actual revenue. If you spend the HST collected, you will face a CRA liability of approximately $2,860 in your first year of operations.

**Action:** Open a separate "HST trust" sub-account or spreadsheet column from Day 1. Every time rent is collected, move 11.5% of the gross to this account (13/113 = 11.5% of the gross-inclusive amount). Remit quarterly.

---

**CORRECTION 3 — Maintenance Reserve is Understated**

The business plan shows $600–$800/month for 2 vehicles ($300–$400/car/month). **This is too optimistic for high-mileage gig-rental vehicles in the GTA.**

Gig delivery drivers accumulate 3,000–5,000km/month. Oil changes every 5,000km = every 1–2 months ($80–$120 each). Brake pads under heavy delivery use every 2–4 months ($150–$300). Tires every 4–6 months under these conditions ($400–$600). One alternator, timing belt, or strut failure = $800–$2,500.

**Audited figure: $900/month/car ($1,800/month for 2 cars)**

This figure is used throughout the P&L model in Sheet 03. At $900/car/month, you are reserving $10,800/year per car. The expected major repair frequency on a 2013–2018 economy car under gig use is approximately 1–2 incidents per year, costing $800–$2,500 each. One major incident per car per year is fully absorbed at $900/month. Two major incidents in the same car in the same month is the scenario that creates negative cash flow — your $5,000 operating reserve exists to absorb this.

---

**CORRECTION 4 — Deposits are Not Income**

The $500 deposit collected from each renter is a **liability on your balance sheet**, not revenue. When a renter returns the vehicle undamaged, you owe them $500. When a renter causes damage, you apply the deposit to losses and the remainder is income at that point.

**Accounting treatment:**
- Day 1: Collect $500 deposit → Dr. Bank $500 / Cr. Deposit Liability $500
- Return undamaged: Dr. Deposit Liability $500 / Cr. Bank $500 (refund)
- Return damaged ($300 damage): Dr. Deposit Liability $500 / Cr. Bank $200 (refund) / Cr. Repair Revenue $300

With 2 cars renting simultaneously, you will hold approximately $1,000 in deposit liability at any time. This appears in your bank account but is not yours. Do not spend it on operations.

---

**CORRECTION 5 — Insurance Cost Range Needs Tightening**

$6,000–$10,000/year for commercial fleet insurance is a $4,000 spread. The business plan uses this figure but does not model the impact of the worst case ($10,000/year = $833/month) on monthly cash flow.

**At $10,000/year insurance: the base case scenario shows negative monthly cash flow of -$432/month.** This fundamentally changes the investment case.

**Audited planning figure: $9,000/year ($750/month) — conservative.**

This is used throughout the P&L model. Get 3 quotes minimum. **If all quotes come in above $9,000/year for 2 vehicles, the business plan must be revised — either increase weekly rates by $25–$50/car or delay launch until a competitive quote is secured.**

---

## PART 2 — P&L AUDIT BY SCENARIO

### Month 1 Financial Reality (Base Case: $325/wk, 85% utilisation, 2 cars)

| Line Item | Monthly |
|-----------|---------|
| Gross Revenue (net of HST) | $2,819 |
| Insurance | ($1,500) |
| Maintenance Reserve | ($1,800) |
| Tech Stack | ($107) |
| GPS (Bouncie) | ($32) |
| Twilio SMS | ($10) |
| PandaDoc | ($19) |
| Misc Operating | ($200) |
| Stripe Fees (2.9%) | ($82) |
| **Total Expenses** | **($3,750)** |
| **Net Operating Income** | **($931)** |
| Depreciation ($5K/car / 18 months) | ($556) |
| **Net Income Before Tax** | **($1,487)** |

**Month 1 is negative.** This is normal and expected. The business plan's claim of "$800–$1,100/month net from Month 1" is **overstated by approximately $2,000/month** once the audited maintenance reserve and realistic insurance are applied.

### When Does It Turn Positive?

| Metric | Timeline |
|--------|----------|
| Cash break-even (no depreciation) | Month 3–4 (as vacancy drops and word of mouth builds) |
| Accounting break-even (incl. depreciation) | Month 5–6 |
| Meaningful net income ($500+/month) | Month 8–10 with 2 cars |
| Real income ($2,000+/month) | 3 cars, Year 2 |

**The core insight: this is a 2-year journey to meaningful income, not a 2-month one.** The business plan's optimism on early profitability sets unrealistic expectations. Re-frame this correctly: you are building an asset-backed cash flow business. Months 1–6 are investment. Months 7–18 are payback. Year 2+ is income.

---

## PART 3 — SCALE ECONOMICS

This is where the business becomes genuinely interesting.

| Fleet | Monthly Net Income | Annual Net | Notes |
|-------|-------------------|------------|-------|
| 2 cars | -$931 | -$11,172 | Investment phase |
| 3 cars | +$165 | +$1,980 | Cash break-even |
| 5 cars | +$2,397 | +$28,764 | Real supplemental income |
| 8 cars | +$4,800 | +$57,600 | Dayo full-time equivalent |
| 10 cars | +$6,409 | +$76,908 | Full SMB |

**The unit economics improve significantly at scale** because:
1. Insurance rates per vehicle decrease with fleet size (fleet discounts)
2. Tech stack cost is nearly fixed ($107–$377/month regardless of car count)
3. Admin overhead per vehicle decreases as processes mature
4. Reputation drives higher utilisation rates (85% → 93%)

**The 5-car milestone is the critical inflection point.** At 5 cars, Easy Drive generates approximately $28,764/year net — meaningful income that justifies the operational complexity. The path from 2 to 5 cars requires reinvesting all profits from Cars 1 and 2 into Cars 3–5 over approximately 18–24 months.

---

## PART 4 — TECHNOLOGY ROI ANALYSIS

The developer built a production-ready system. Let us assess its financial return.

### What Was Built vs. Cost

| Component | Estimated External Build Cost | Internal Build Cost (Time) | ROI Rationale |
|-----------|------------------------------|---------------------------|---------------|
| Renter application + verification system | $8,000–$15,000 (agency) | Gbemiga's time | Replaces manual WhatsApp + Google Forms process |
| Admin dashboard + fleet management | $10,000–$20,000 (agency) | Gbemiga's time | Replaces spreadsheets; prevents double-booking |
| Stripe automated payments | $5,000–$8,000 (agency) | Gbemiga's time | Eliminates manual e-transfer chasing |
| Bouncie webhook + kill switch integration | $3,000–$5,000 (agency) | Gbemiga's time | Automates security response |
| PandaDoc e-signature workflow | $2,000–$4,000 (agency) | Gbemiga's time | Eliminates paper agreement management |
| **Total equivalent agency value** | **$28,000–$52,000** | **Gbemiga's equity contribution** | |

**The technology stack, built internally, represents $28,000–$52,000 of value contributed to the business.** This should be formally recognized in the partnership structure between Gbemiga and Dayo — Gbemiga has made a capital contribution in the form of technical labour that is equivalent to or greater than the cash investment required.

### Ongoing Tech Cost vs. Manual Alternative

| Manual Process | Monthly Effort | Tech Automation | Monthly Cost |
|----------------|---------------|-----------------|-------------|
| Chase weekly payments by e-transfer | 4–8 hrs/month | Stripe auto-billing | $82 (2.9% fee) |
| GPS check on vehicle location | 2–4 hrs/month | Bouncie dashboard + alerts | $16 |
| Generate and send rental agreements | 3–5 hrs/month | PandaDoc auto-generation | $19 |
| Email/SMS notifications | 2–3 hrs/month | Resend + Twilio | $5 |
| **Total manual time** | **11–20 hrs/month** | **Total tech cost** | **$122/month** |

At an opportunity cost of $30–$50/hour for operations time, the tech stack saves $330–$1,000/month in equivalent labour cost while costing $122/month. **ROI on technology: 170%–720% per month.**

---

## PART 5 — TAX STRATEGY

### Corporate Tax Position

Easy Drive operates as a division of GB Trade and Logistics Inc. All income is corporate income subject to:
- Ontario Small Business Deduction rate: **12.2%**
- Federal Small Business Deduction rate: **9.0%**
- **Combined effective rate: ~21.2%** on the first $500,000 of net income

At the projected Year 1 net income (base case, 2 cars for full year), the tax liability is minimal or zero in Year 1 given the startup losses. Begin accumulating losses in Year 1 to carry forward against Year 2 profits.

### Capital Cost Allowance (CCA) Strategy

Vehicles are **CCA Class 10 (30% declining balance)**. This is one of your most powerful tax tools.

| Year | Vehicle Book Value (per car) | CCA Deduction (30%, half-year rule Y1) | Tax Savings (21.2%) |
|------|-----------------------------|-----------------------------------------|---------------------|
| Year 1 | $5,000 | $750 (half-year rule) | $159/car |
| Year 2 | $4,250 | $1,275 | $270/car |
| Year 3 | $2,975 | $893 | $189/car |

**Strategy:** Do not use the full CCA deduction in a loss year (Year 1). CCA is optional — carry vehicles at full cost in Year 1 and take the deduction in Year 2 when you have taxable income to offset. Your CPA should model this annually.

### HST Remittance Calendar

| Period | HST Period | Filing Deadline | Estimated HST Owing |
|--------|-----------|-----------------|---------------------|
| Q1 2026 (Apr–Jun) | 3 months | **Jun 30, 2026** | ~$715 (2 cars, partial) |
| Q2 2026 (Jul–Sep) | 3 months | **Sep 30, 2026** | ~$1,430 |
| Q3 2026 (Oct–Dec) | 3 months | **Dec 31, 2026** | ~$1,430 |
| Q4 2026 (Jan–Mar) | 3 months | **Mar 31, 2027** | ~$1,430 |

**Total Year 1 HST remittance: approximately $5,005** — this money flows through your bank account but is not yours. Treat it as such from Day 1.

---

## PART 6 — ACCOUNTANT'S 5 CONDITIONS FOR GREEN LIGHT

These are not suggestions. These are conditions. Do not start without them.

### Condition 1 — Capital Confirmation
Confirm $30,085 CAD is liquid and available in the GB Trade and Logistics Inc. business account before purchasing Vehicle #1. This is not the amount you will spend — it is the minimum floor. If your liquid capital is below this number, either: (a) delay launch, or (b) bring in a capital partner with a formal agreement. Do not buy cars on credit or personal savings co-mingled with business funds.

### Condition 2 — Dedicated Bank Account
Open a dedicated Easy Drive bank account (or clean sub-account) before the first dollar of revenue flows. Mixing Easy Drive income with GB Trade and Logistics general operating funds creates an accounting and tax nightmare. The CRA expects clean books — and so do you if you ever want to know if this business is actually making money.

### Condition 3 — HST Tracking from Day 1
Every rental invoice must show: Rate ($300) + HST ($39) = Total ($339). Record both figures separately from the first invoice. Set up Wave Accounting (free, Canadian, excellent for SMBs) before the first renter signs. Register for HST immediately if not already done under GB Trade's existing HST number.

### Condition 4 — Insurance Before Keys
No vehicle moves from your possession to a renter's hands without a bound commercial fleet policy in place. This is not a risk management suggestion — it is a legal requirement and a financial catastrophe prevention. One uninsured accident can eliminate the entire business and expose GB Trade and Logistics Inc. to personal liability. The commercial policy must explicitly cover: gig delivery use, renters as operators, and third-party liability minimum $2M.

### Condition 5 — $5,000 Operating Reserve
Maintain a minimum $5,000 cash reserve in the Easy Drive account at all times. This reserve is untouchable except for: (a) a vehicle emergency repair that exceeds the monthly maintenance reserve, or (b) an insurance gap. When the reserve drops below $5,000, stop reinvesting in new vehicles until it is replenished. This reserve is what keeps the business alive through Month 1–3 while it builds to cash-flow positive.

---

## PART 7 — PARTNERSHIP FINANCIAL STRUCTURE RECOMMENDATION

This is not in any of the existing documents and needs to be addressed.

Gbemiga and Dayo are co-building this business. The financial contributions are asymmetric:

| Partner | Cash Contribution | Technology Contribution | Operations Contribution |
|---------|------------------|------------------------|------------------------|
| Gbemiga | Partial (TBD) | $28,000–$52,000 (system build) | Technical oversight (1–2 hrs/wk) |
| Dayo | Majority cash (TBD) | $0 | Full operations (5–20 hrs/wk) |

**There is no fair 50/50 split here without explicit valuation of Gbemiga's technology contribution.** Options:

1. **Equity for labour**: Gbemiga's tech build is valued at $X and treated as a capital contribution equivalent to cash. Split is determined by relative contributions.
2. **Sweat equity + profit share**: Gbemiga takes a smaller ongoing % but is compensated when Phase 2+ tech is built.
3. **Clean 50/50 with Gbemiga reimbursed**: Gbemiga invoices the partnership for tech development at an agreed hourly rate, reducing partnership cash but compensating his contribution.

**Recommendation**: Before the first vehicle is purchased, both partners should sign a written partnership agreement or shareholder agreement that specifies: ownership split, decision-making authority, profit distribution timing, and what happens if one partner wants to exit. This costs $500–$1,000 with a business lawyer and protects both of you.

---

## SUMMARY — FINANCIAL SCORECARD

| Category | Assessment | Score |
|----------|-----------|-------|
| Technology cost efficiency | Excellent — 2.4% of revenue | ⭐⭐⭐⭐⭐ |
| Revenue model (unit economics) | Sound — positive at 3+ cars | ⭐⭐⭐⭐ |
| Startup capital planning | Underestimated — use $30,085 | ⭐⭐⭐ |
| Maintenance reserves | Understated in business plan | ⭐⭐⭐ |
| Insurance planning | Correct type, range too wide | ⭐⭐⭐ |
| HST compliance | Not modelled — fix immediately | ⭐⭐ |
| Tax strategy | CCA opportunity identified | ⭐⭐⭐⭐ |
| Scale economics | Strong — gets better with size | ⭐⭐⭐⭐⭐ |
| Partnership structure | Not formalized — risk | ⭐⭐ |
| Cash flow planning | Conservative timeline: 5–6 months to accounting profit | ⭐⭐⭐⭐ |

**Overall: 7/10 — Solid foundation with correctable gaps. Do not launch without addressing the 5 conditions.**

---

*Financial model: `Easy_Drive_Financial_Model.xlsx` (7 sheets)*
*Task tracker: `Easy_Drive_Task_Tracker.xlsx`*
*This audit is based on information provided by the Architecture, Design, and Development teams as of April 2026.*

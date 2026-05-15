# Easy Drive — Financial & Accounting Guidance
**GB Trade and Logistics Inc. | Ontario, Canada**
**Prepared: May 2026 | For Internal Use**

---

> **CPA Referral Flags:** Sections throughout this document are marked **[CPA REQUIRED]** where the complexity or financial stakes warrant professional advice before acting. Everything else is structured so a diligent founder can handle it with the right software and processes.

---

## 1. Revenue Recognition — Marketplace Model

### The Core Question: Principal vs. Agent

Under IFRS 15 (which Canadian public companies follow) and ASPE Section 3400 (which applies to most private Canadian corporations including GB Trade and Logistics Inc.), the critical question is: **Is Easy Drive acting as a principal or as an agent?**

This distinction determines whether revenue is reported at the **gross** rental amount or only at the **net** platform fee.

**Indicators Easy Drive is an Agent (not a Principal):**

| Indicator | Easy Drive's Position |
|---|---|
| Does Easy Drive control the service before it is transferred to the renter? | No — the host controls and owns the vehicle |
| Does Easy Drive carry inventory risk? | No — Easy Drive owns no vehicles |
| Does Easy Drive set the host's rental rate? | No — the host sets their own rate |
| Is Easy Drive the primary obligor to the renter? | No — the rental agreement is between host and renter |
| Does Easy Drive bear credit risk for the gross amount? | Partially — Stripe collects gross; Easy Drive bears Stripe failure risk, not host performance risk |

**Conclusion:** Easy Drive is acting as an **agent**. Revenue should be recognized at the **net amount** — the platform fee only.

### What Goes on the Income Statement

**Correct treatment:**

```
Revenue (Platform Fees)         $70      [20% of $350 weekly rental]
Cost of Revenue                 $10      [Stripe Connect fees allocated]
Gross Profit                    $60
Operating Expenses              (...)
Net Income                      (...)
```

**Incorrect treatment (do not do this):**

```
Revenue                         $350     [gross rental — wrong for an agent]
Cost of Revenue                 $280     [host payout — wrong presentation]
Gross Profit                    $70
```

The incorrect treatment inflates gross revenue by 5x, misrepresents the business, and can create confusion with lenders or investors who use revenue as a valuation input. It also creates misaligned HST exposure (discussed in Section 2).

### Practical Revenue Recognition Timing

Revenue is recognized when the **performance obligation is satisfied** — which for Easy Drive means when the rental week is completed and the platform fee is earned. For auto-renewing weekly rentals, this means:

- Recognize platform fee revenue **weekly** as each rental week completes
- The upfront collection of the first week's payment is **deferred revenue** until the week is earned
- Security deposits are **never revenue** — they are liabilities (see Section 4)

**[CPA REQUIRED]** Confirm with your CPA whether GB Trade and Logistics Inc. is reporting under ASPE or has any IFRS obligations. For a private corporation at this stage, ASPE Section 3400 applies and the agent/principal analysis above holds.

---

## 2. HST / GST Treatment

### Overview

Ontario's HST rate is **13%** (5% federal GST + 8% Ontario provincial component). All references below are to HST at 13%.

### 2A. Easy Drive's HST Obligation — Platform Fees

Easy Drive (GB Trade and Logistics Inc.) is **already HST-registered**. The platform fee is a **taxable supply** and HST must be collected and remitted.

**Calculation per transaction:**

```
Host's listed rate:                 $350.00
Easy Drive platform fee (20%):       $70.00
HST on platform fee (13%):            $9.10
Total charged to renter:            $429.10

Breakdown to renter receipt:
  Rental (host rate):               $350.00
  Platform fee:                      $70.00
  HST (on platform fee):              $9.10
  Total:                            $429.10
```

Easy Drive collects $9.10 HST and remits it to CRA on the filing schedule (likely quarterly at launch volume).

**Important:** Easy Drive does **not** collect HST on the host's $350 portion — that is the host's tax obligation (see 2B below).

### 2B. Host HST Obligations

**The $30,000 Small Supplier Threshold:**

Under the Excise Tax Act, individuals and businesses with taxable supplies under $30,000 in any four consecutive calendar quarters are **small suppliers** and are **not required to register for or collect HST**.

For a host earning $280–$360/week:
- $280/week × 52 weeks = $14,560/year — below threshold, no HST required
- $360/week × 52 weeks = $18,720/year — below threshold, no HST required
- A host with **multiple vehicles** earning combined rental income above $30,000 **must register and collect HST**

**Practical guidance for Easy Drive:**
- At onboarding, hosts should be informed they may have HST obligations if their rental income exceeds $30,000/year
- Easy Drive should include a disclosure in the Host Agreement that CRA compliance is the host's responsibility
- Easy Drive must **not** collect HST on behalf of hosts — doing so without proper authorization creates legal and tax liability
- Hosts who are voluntarily HST-registered (many small business owners already are) should provide their HST number; Easy Drive's payout statements to these hosts should note the transaction amount for the host's own HST accounting

**[CPA REQUIRED]** The question of whether the "rental income" hosts earn is characterized as business income or property income affects how HST applies. If a host has only one car and is truly passive, CRA may consider it property rental — which has different HST treatment. Your CPA should prepare a brief memo on this distinction for your Host Agreement and disclosure language.

### 2C. Renter's HST Exposure

The renter pays:
- $350 (host rate) — HST applies only if host is registered; for most single-vehicle hosts, this is HST-exempt
- $70 (platform fee) — **HST always applies** (Easy Drive is registered); renter pays $9.10 HST on the platform fee

The renter does **not** pay HST on the host's portion unless the host is HST-registered and has instructed Easy Drive to collect it on their behalf. At early stage with single-vehicle hosts, the majority of host revenue will be below the $30,000 threshold and therefore no HST will be charged on host rates.

### 2D. Stripe Connect and HST Collection

**Who is technically the collector?** Easy Drive (GB Trade and Logistics Inc.) is the registered person collecting payment. Stripe is the **payment processor**, not the tax collector. Easy Drive is responsible for:

1. Calculating HST correctly on the platform fee portion
2. Displaying HST as a line item on the renter's receipt
3. Remitting HST collected to CRA on schedule

Stripe Connect does not handle Canadian HST — this must be calculated and tracked in your accounting software, not assumed to be automated by Stripe.

### 2E. Invoicing and Receipt Structure

**Renter Receipt (what renter receives after booking):**

```
EASY DRIVE — BOOKING CONFIRMATION
GB Trade and Logistics Inc. (HST #: [your number])

Vehicle:        [Host's vehicle description]
Rental Period:  [Start date] to [End date]
Host:           [Booking reference only — not host's name/HST]

Rental Rate (Host):         $350.00
Platform Service Fee:        $70.00
HST on Service Fee (13%):     $9.10
Security Deposit (refundable): $500.00
------------------------------------------
Total Charged Today:         $929.10

Platform service fee and HST issued by GB Trade and Logistics Inc.
Rental provided by vehicle owner. See Terms of Service.
```

**Host Payout Statement (what host receives weekly):**

```
EASY DRIVE — HOST EARNINGS STATEMENT
GB Trade and Logistics Inc.

Host:           [Host Name]
Vehicle:        [Vehicle]
Rental Period:  [Dates]
Renter Ref:     [Booking ID]

Gross Rental Booked:        $350.00
Less: Platform Fee (20%):   ($70.00)
Net Payout to Host:         $280.00

Note: Stripe Connect processing fees may apply.
HST obligations on rental income are the host's responsibility.
Earnings for the period: [Year] should be reported to CRA.
If your rental income exceeds $30,000 in any 12-month period,
you are required to register for HST.
```

**[CPA REQUIRED]** Have your CPA confirm the exact wording of the HST disclosure on host statements and confirm your HST remittance schedule (monthly vs. quarterly) based on your expected annual taxable supplies.

---

## 3. Stripe Connect — Accounting Treatment

### Money Flow Anatomy

For a typical $350/week booking:

```
Renter's card is charged:           $429.10   ($350 + $70 platform fee + $9.10 HST)
Plus security deposit:              $500.00
Total collected from renter card:   $929.10

Stripe Connect fee (~2.9% + $0.30): ($27.25)  [on $929.10 gross charge]
Net in Stripe (after fee):          $901.85

Split:
  Host payout (80% of $350):        $280.00
  Easy Drive retained:              $621.85   [deposit $500 + platform fee $70 + HST $9.10 - Stripe fee $27.25]
  Less: deposit liability:         ($500.00)
  Easy Drive net (excl. deposit):   $121.85

Easy Drive net cash position:
  Platform fee earned:               $70.00
  HST collected (to remit):          ($9.10)
  Stripe fees borne:                ($27.25)
  Net retained after obligations:    $33.65
```

### Who Bears the Stripe Fee?

The business plan treats Stripe fees as a platform cost. This is correct in the marketplace agent model — the platform bears the payment processing cost, not the host. However, you have a choice:

**Option A (current model): Platform bears all Stripe fees**
- Simpler for hosts; host receives exactly $280 guaranteed
- Stripe fees run ~$27/transaction on a $929 gross charge (deposit + rent + fee)
- At 10 active cars/week: ~$1,120/week in fees = ~$270/month

**Option B: Stripe fees netted from host payout**
- Host receives $280 minus their proportional share of processing
- More transparent but creates variable host payouts; harder to communicate
- Not recommended at launch — simplicity in host communication matters more

**Recommendation:** Absorb Stripe fees as a platform cost. The business plan's $80–$200/month estimate is low if you include deposit processing. See revised model in Section 8.

### Journal Entry — Typical Weekly Transaction

Using a $350/week booking. Notation uses simplified double-entry.

**Day 1 — Booking (renter charged):**

```
DR  Stripe Clearing Account (Asset)        $929.10
    CR  Deferred Revenue — Platform Fee         $70.00
    CR  HST Payable (Liability)                  $9.10
    CR  Security Deposit Payable (Liability)   $500.00
    CR  Payable to Host (Liability)            $280.00
    CR  Stripe Fees Payable (Liability)         $27.25
    CR  [Unallocated — reconcile to Stripe]     $42.75
```

Simplified version for Wave/QuickBooks:

```
DEBIT:
  Bank — Stripe Clearing:     $929.10

CREDIT:
  Deferred Revenue:            $70.00     [platform fee, not yet earned]
  HST Payable:                  $9.10
  Security Deposits Held:      $500.00    [liability account]
  Host Payouts Payable:        $280.00    [liability — owed to host]
  Stripe Processing Fees:       $27.25    [expense]
  [Reconciliation variance]:   $42.75    [resolve with Stripe dashboard]
```

**Day 7 — Rental Week Complete (revenue earned, host paid):**

```
DEBIT:
  Deferred Revenue:             $70.00   [recognize earned revenue]
  Host Payouts Payable:        $280.00   [clear host liability]

CREDIT:
  Platform Fee Revenue:         $70.00
  Bank — Stripe Clearing:      $280.00   [Stripe sends to host bank]
```

**Day 7 — Clean Return (deposit released):**

```
DEBIT:
  Security Deposits Held:      $500.00

CREDIT:
  Bank — Stripe Clearing:      $500.00   [refunded to renter's card]
```

**[CPA REQUIRED]** The exact journal entries depend on how your Stripe Connect is configured (Standard vs. Express accounts) and how Stripe batches payouts. Your bookkeeper or CPA should map Stripe's payout reports to these entries in your first month and build a reconciliation template.

### Stripe Fee Tracking Note

Stripe invoices fees monthly and provides downloadable transaction-level CSVs. Export and reconcile monthly. Do not rely on bank statements alone — Stripe nets fees before depositing, so your bank will not show gross amounts.

---

## 4. Security Deposit Accounting

### Classification: Liability, Not Revenue

Security deposits are **never income**. When collected, they create a liability on Easy Drive's balance sheet — you owe that money back to the renter unless a valid claim is made.

**Balance sheet treatment:**

```
ASSET:  Bank — Stripe Clearing       $500   [cash in hand]
LIABILITY: Security Deposits Held    $500   [obligation to refund]
```

This is identical to how a landlord treats a damage deposit.

### Three Scenarios at Rental End

**Scenario A: Clean return — full refund**
```
DR  Security Deposits Held (Liability)    $500
CR  Bank — Stripe Clearing (Asset)        $500
```

**Scenario B: Partial damage — $200 applied to host, $300 refunded**
```
DR  Security Deposits Held (Liability)    $500
CR  Bank (refund to renter)               $300
CR  Damage Claim Payable to Host          $200   [then pay host separately]
```
Note: When Easy Drive pays the $200 to the host:
```
DR  Damage Claim Payable to Host          $200
CR  Bank                                  $200
```

**Scenario C: Full forfeiture — $500 applied to damage/breach**
```
DR  Security Deposits Held (Liability)    $500
CR  Damage Claim Payable to Host          $500
```
When paying host: same as Scenario B final entry.

### Is the Forfeited Deposit Income to Easy Drive?

No — in the current model, forfeited deposits are paid through to the host (for vehicle damage). If for any reason Easy Drive retains a portion of a forfeited deposit (e.g., as a mediation fee), that retained portion **is income** and **is HST-taxable**. Keep this clean — if Easy Drive ever introduces a deposit-processing fee, document it explicitly and charge HST on it.

### Interest on Held Deposits

At current volumes (10 cars × $500 = $5,000 held), interest earned in a standard business chequing account will be minimal (a few dollars per year). However:

- Interest earned on deposit funds **is taxable income** to GB Trade and Logistics Inc.
- It is **not** owed to renters unless your Terms of Service state otherwise
- Recommended: keep deposit funds in the same operating account as other platform funds; do not segregate into a separate high-interest account until volume justifies it (50+ cars)
- At scale, you may want a dedicated trust account — **[CPA REQUIRED]** discuss this threshold with your CPA

---

## 5. Expense Categories & Chart of Accounts

### Chart of Accounts — Easy Drive Division

Structure your bookkeeping to segregate Easy Drive activity from any other GB Trade and Logistics Inc. revenue streams. Use a department/class code of "EASY-DRIVE" in your accounting software.

#### Revenue Accounts

| Account Code | Account Name | Description |
|---|---|---|
| 4000 | Platform Fee Revenue | 20% commission earned — net of HST |
| 4010 | Late Return Fees | $50/day late fee revenue |
| 4020 | Early Termination Fees | Penalty fees retained |
| 4030 | Other Platform Income | Future: listing upgrade fees, etc. |

#### Liability Accounts

| Account Code | Account Name | Description |
|---|---|---|
| 2100 | HST Payable | HST collected, owed to CRA |
| 2200 | Security Deposits Held | Renter deposits (liability until released) |
| 2210 | Deferred Revenue | Prepaid platform fees not yet earned |
| 2220 | Host Payouts Payable | Amounts owed to hosts pending Stripe payout |
| 2230 | Damage Claims Payable | Deposits allocated to approved host damage claims |

#### Expense Accounts

| Account Code | Account Name | Description |
|---|---|---|
| 5000 | Payment Processing — Stripe | Stripe Connect fees (2.9% + $0.30) |
| 5010 | Platform Software — Vercel | Hosting |
| 5020 | Platform Software — Supabase | Database |
| 5030 | Platform Software — Twilio | SMS notifications |
| 5040 | Platform Software — Resend | Email notifications |
| 5050 | Platform Software — PandaDoc | Digital rental agreements |
| 5060 | Platform Software — Other | Any additional SaaS |
| 5100 | Legal & Compliance | Lawyer fees, ToS drafting |
| 5110 | Accounting & Bookkeeping | Wave, QuickBooks, or CPA fees |
| 5200 | Marketing — Digital | Facebook ads, Google |
| 5210 | Marketing — Physical | Flyers, printing |
| 5220 | Marketing — Referral Bonuses | Host/renter referral credits |
| 5300 | Bank & Merchant Fees | Business account fees |
| 5400 | Administration | Phone, office supplies, misc |
| 5500 | Insurance — Platform | Any D&O or business liability policy |
| 5600 | Host Acquisition — Subsidies | Bouncie device subsidies for early hosts |

#### Asset Accounts

| Account Code | Account Name | Description |
|---|---|---|
| 1000 | Bank — Operating | Main business chequing |
| 1010 | Bank — Stripe Clearing | Stripe settlement balance |
| 1020 | Stripe Deposits Held | Stripe-held deposit balance (mirrors 2200) |
| 1100 | Accounts Receivable | Outstanding platform fees (rare — Stripe collects upfront) |
| 1200 | Prepaid Expenses | Annual SaaS subscriptions paid in advance |

### Separating Easy Drive from GB Trade Activity

If GB Trade and Logistics Inc. has other revenue streams, use **class/department tracking** in your accounting software to keep Easy Drive's P&L clean. This matters for:

- Applying the small business deduction correctly to each stream
- Tracking platform profitability independently
- Future investor or lender reporting on Easy Drive specifically

Do not commingle expenses. If you buy a laptop that serves both business lines, allocate a percentage to each (e.g., 70% Easy Drive, 30% other). Document your allocation methodology and apply it consistently.

---

## 6. Tax Considerations

### 6A. Corporate Tax — How Platform Revenue Flows Through

Platform fee revenue (net of HST) flows into GB Trade and Logistics Inc.'s taxable income. As a Canadian-controlled private corporation (CCPC), GB Trade and Logistics Inc. benefits from the **Small Business Deduction (SBD)**.

**2026 Ontario corporate tax rates (approximate):**

| Tax Bracket | Federal Rate | Ontario Rate | Combined |
|---|---|---|---|
| Active business income up to $500,000 (SBD) | 9% | 3.2% | ~12.2% |
| Active business income above $500,000 | 15% | 11.5% | ~26.5% |

At Easy Drive's Year 1 projected revenue ($22,000–$60,000), the entire amount falls within the SBD — combined tax rate of approximately **12.2%** on net income.

**This is a significant tax advantage.** Keep the corporation alive and healthy. Resist the urge to extract cash as salary unnecessarily — salary creates payroll tax obligations (CPP, EI) and is taxed as personal income at marginal rates (up to 53.53% in Ontario for high earners). The optimal extraction strategy at this stage is: leave profits in the corporation until you have a year's data, then have your CPA advise on salary vs. dividend mix.

**[CPA REQUIRED]** Salary vs. dividend mix optimization is one of the highest-value engagements for a sole-founder CCPC. Book a session with your CPA at the 6-month mark or when net income exceeds $2,000/month.

### 6B. Deductible Business Expenses

All expenses in Section 5's expense chart of accounts are deductible against platform income, subject to the "reasonable and incurred for the purpose of earning income" test under the Income Tax Act.

**Specific items to note:**

| Expense | Deductibility Note |
|---|---|
| Legal fees (ToS, agreements) | 100% deductible — directly tied to platform operation |
| Stripe fees | 100% deductible — cost of revenue |
| SaaS subscriptions | 100% deductible |
| Marketing and advertising | 100% deductible — keep all receipts |
| Host Bouncie subsidies | Deductible as customer acquisition cost — treat as marketing expense |
| Host referral bonuses ($100 credit) | Deductible — document clearly in your records |
| Renter referral credits ($25 off) | Deductible — discount on platform fee income |
| Home office portion | Deductible if you work from home — pro-rated % of home expenses |
| Phone (business use portion) | Deductible — estimate % used for Easy Drive |
| Meals/entertainment | 50% deductible — only if directly business-related |

**Home office deduction:** If you operate Easy Drive from home, you can deduct a pro-rated portion of rent/mortgage interest, utilities, and internet based on the square footage used as a dedicated workspace. This is particularly valuable for a solo-founder at launch.

**[CPA REQUIRED]** Home office calculations require specific CRA form T2200 guidance for corporations. Confirm the deduction structure with your CPA.

### 6C. T4A Reporting for Hosts

See Section 7 for full detail. At the corporate level: T4A slip amounts are deductible when paid, but only if properly reported. Failing to file T4As when required can result in CRA disallowing the deduction.

---

## 7. Host Payout Reporting — T4A Obligations

### Does Easy Drive Need to Issue T4As to Hosts?

**Short answer: Likely yes, for hosts earning above $500/year.**

Under CRA requirements, payers who pay fees, commissions, or other amounts to self-employed individuals (independent contractors) must file a **T4A slip** for any individual who receives **$500 or more in a calendar year**.

**Analysis of Easy Drive's situation:**

| Factor | Assessment |
|---|---|
| Are hosts employees? | No — independent vehicle owners |
| Are hosts incorporated? | Some may be; corporations are generally exempt from T4A |
| Are hosts receiving "fees for services"? | Yes — rental income facilitated by Easy Drive |
| Do hosts earn $500+ per year on the platform? | Almost certainly yes (minimum $280/week payout) |

**CRA's position:** Amounts paid through a platform to independent parties (not corporations) for services rendered trigger T4A obligations for the payer. The CRA has been increasingly aggressive about platform economy reporting since 2022. Airbnb Canada, for example, issues T4As to hosts.

**[CPA REQUIRED]** There is a genuine debate about whether host payouts are "fees for services" (T4A-reportable) or "rent" (which has different T4A rules under Box 48 vs. Box 16). This distinction also matters for hosts' own tax treatment. Get a written memo from your CPA before your first T4A filing season (January of the year following your first full calendar year of operation).

### What to Collect from Hosts at Onboarding

To fulfill T4A obligations, collect the following from every host at onboarding (before first payout):

| Information | Why Needed |
|---|---|
| Full legal name | T4A recipient name |
| SIN (Social Insurance Number) | Required for T4A filing — for individuals |
| Business Number (BN) | If host is incorporated — exempts from T4A |
| HST registration number (if applicable) | For your own records on HST handling |
| Mailing address | T4A delivery |
| Date of birth (optional but helpful) | CRA identity matching |
| Banking information | Stripe Connect onboarding |

**Important:** Do not skip collecting SINs. If a host refuses to provide a SIN and is an individual (not incorporated), CRA requires you to **withhold tax** (currently at a flat rate) from their payments. This is an enforcement mechanism to prevent underground economy income. Include SIN collection as a mandatory field in your host application — explain clearly it is required for CRA T4A reporting. You can reference this in your Host Agreement.

### T4A Filing Deadlines

- T4A slips must be delivered to hosts by **February 28** of the following year
- T4A Summary must be filed with CRA by **February 28** of the following year
- First applicable filing: if you launch in 2026, first T4As are due February 28, 2027

### Practical Recommendation

In your host onboarding flow (Supabase/platform), add a dedicated section that collects:
1. Stripe Connect account setup (banking)
2. T4A information (legal name, SIN or BN, address)

Mark the T4A fields as required before a host can receive their first payout. This is standard practice for all sharing economy platforms operating in Canada.

---

## 8. Financial Model Validation

### Review of Business Plan Section 9 Projections

#### Monthly Revenue Model — Validation

The business plan uses this table:

| Active Listings | Avg. Weekly Rate | Avg. Utilization | Monthly Gross Volume | Platform Revenue (20%) |
|---|---|---|---|---|
| 5 cars | $300/week | 85% | $5,525 | $1,105 |
| 10 cars | $320/week | 85% | $11,733 | $2,347 |
| 20 cars | $330/week | 90% | $25,740 | $5,148 |
| 50 cars | $340/week | 92% | $64,537 | $12,907 |

**Math check — 5 cars:**
5 × $300 × 4.33 weeks/month × 85% = $5,525. **Correct.**

**Math check — 10 cars:**
10 × $320 × 4.33 × 85% = $11,774. **Business plan shows $11,733 — minor rounding difference, acceptable.**

**Math check — 20 cars:**
20 × $330 × 4.33 × 90% = $25,721. **Business plan shows $25,740 — minor rounding, acceptable.**

**Math check — 50 cars:**
50 × $340 × 4.33 × 92% = $67,817. **Business plan shows $64,537 — this is a material discrepancy of $3,280/month (approximately 5%). The business plan appears to use 4.1 weeks/month rather than 4.33. Recommend using 4.33 (52 weeks ÷ 12 months) for consistency.**

#### Monthly Operating Costs — Issues Identified

The business plan estimates **$304–$634/month** in operating costs. This is materially understated. Here is a corrected view:

| Cost Item | Business Plan | Corrected Estimate | Note |
|---|---|---|---|
| Stripe Connect fees | $80–$200 | **$250–$400** | At 10 cars: ~10 bookings + deposits/week; fee applies to gross charge including deposits |
| Vercel hosting | $0–$20 | $0–$20 | Correct |
| Supabase | $0–$25 | $0–$25 | Correct |
| Bouncie API | $0 | $0 | Correct — host-borne |
| Twilio SMS | $5–$20 | $15–$40 | Higher at scale; weekly renewal messages to 10+ renters |
| Resend email | $0–$20 | $0–$20 | Correct |
| PandaDoc | $19–$49 | $19–$49 | Correct |
| Legal / compliance | $100–$200 | **$150–$300** | Slightly higher for ongoing contract reviews |
| Misc admin | $100 | $100 | Correct |
| **Accounting/bookkeeping** | **$0** | **$100–$200** | **Missing — Wave Pro or QuickBooks Self-Employed subscription + bookkeeping time** |
| **T4A filing (annualized)** | **$0** | **$30–$50/month** | **Missing — CPA or software to prepare annual T4As; annualize ~$400–$600/year** |
| **Host referral bonuses** | **$0** | **$50–$100** | **Missing — $100 per new referred host; budget for 0.5–1 per month** |
| **HST remittance admin** | **$0** | **Included above** | Time cost is real but no cash outlay |
| **Revised Total** | **$304–$634** | **$714–$1,204** | |

**The break-even calculation changes:**

| Metric | Business Plan | Corrected |
|---|---|---|
| Monthly fixed costs | ~$450 | ~$960 (midpoint) |
| Revenue per car per month | ~$235 | ~$235 (unchanged) |
| Break-even cars | 2 cars | **4–5 cars** |

Break-even at 4–5 cars is still very achievable within 30–60 days of launch. The business remains highly viable — the business plan just undersells the cost base slightly.

### Revised Year 1 Monthly P&L Model

Assumptions:
- Ramp: 0 → 3 → 6 → 10 → 12 → 14 → 16 → 18 → 20 → 25 → 30 → 35 cars
- Average host rate: $310/week (conservative blend of economy and mid-size)
- Utilization: 75% months 1–3, 80% months 4–6, 85% months 7–12
- Platform fee: 20% of host rate (fee added on top, separate from host rate)
- Platform revenue = 20% × host rate × utilization (the renter pays the fee on top; host rate × 20% = platform take)
- Stripe fee: 2.9% + $0.30 on full gross charge (host rate + platform fee) per weekly transaction
- Monthly fixed costs: $960/month (corrected midpoint)
- HST collected: 13% on platform fee — shown as pass-through, not P&L income

| Month | Active Cars | Utilization | Gross Rental Vol. | Platform Revenue | Stripe Fees | Gross Profit | Fixed Costs | Net Profit/(Loss) |
|---|---|---|---|---|---|---|---|---|
| 1 | 3 | 75% | $3,031 | $606 | ($90) | $516 | ($960) | **($444)** |
| 2 | 6 | 75% | $6,062 | $1,212 | ($180) | $1,032 | ($960) | **$72** |
| 3 | 10 | 75% | $10,104 | $2,021 | ($295) | $1,726 | ($960) | **$766** |
| 4 | 12 | 80% | $12,925 | $2,585 | ($375) | $2,210 | ($960) | **$1,250** |
| 5 | 14 | 80% | $15,079 | $3,016 | ($440) | $2,576 | ($960) | **$1,616** |
| 6 | 16 | 80% | $17,233 | $3,447 | ($500) | $2,947 | ($960) | **$1,987** |
| 7 | 18 | 85% | $20,657 | $4,131 | ($600) | $3,531 | ($960) | **$2,571** |
| 8 | 20 | 85% | $22,952 | $4,590 | ($670) | $3,920 | ($960) | **$2,960** |
| 9 | 25 | 85% | $28,690 | $5,738 | ($835) | $4,903 | ($960) | **$3,943** |
| 10 | 30 | 85% | $34,428 | $6,886 | ($1,000) | $5,886 | ($960) | **$4,926** |
| 11 | 35 | 85% | $40,166 | $8,033 | ($1,170) | $6,863 | ($960) | **$5,903** |
| 12 | 35 | 85% | $40,166 | $8,033 | ($1,170) | $6,863 | ($960) | **$5,903** |

**Year 1 Totals:**
- Total Gross Rental Volume: ~$251,000
- Total Platform Revenue: ~$50,300
- Total Stripe Fees: (~$7,325)
- Total Fixed Costs: (~$11,520)
- **Net Profit Year 1: ~$31,455**
- Corporate tax at ~12.2% on net: ~$3,840
- **After-tax net Year 1: ~$27,615**

**Month 1 is expected to be a loss** ($444) — this is healthy and expected for a marketplace cold-start. Month 2 breakeven aligns with the business plan's "first 30 days" target if host acquisition proceeds on plan.

**Key sensitivities:**
- If utilization is 70% instead of 75% in months 1–3: loss in months 1–2 deepens by ~$200/month
- If host rate averages $280 instead of $310: revenue drops ~10% across the board
- If fixed costs run at the high end ($1,200/month): breakeven pushes to Month 3

**[CPA REQUIRED]** Use this model as a planning tool. Have your CPA review once you have 2–3 months of actual data and rebuild the forecast from actuals.

---

## 9. Bookkeeping Setup Recommendations

### Is Wave Accounting Appropriate?

**Short answer: Wave works at launch, but has meaningful limitations for a marketplace.**

| Feature | Wave (Free) | Assessment |
|---|---|---|
| Basic income/expense tracking | Yes | Adequate at launch |
| HST tracking and reporting | Basic | Requires manual discipline |
| Stripe Connect integration | Limited — manual import | Requires monthly CSV import from Stripe; error-prone |
| Multi-class/department tracking | No | Cannot separate Easy Drive from other GB Trade activity without workarounds |
| T4A preparation | No | Must be done manually or via separate CRA tools |
| Liability account tracking (deposits) | Yes, manually | Workable but requires discipline |
| Payroll (if you hire) | Wave Payroll (paid add-on) | $20/month + $6/employee |
| Bank reconciliation | Yes | Adequate |
| Accountant access | Yes | Good for CPA review |

**Recommendation:** Start with **Wave** for Months 1–3 while transaction volume is low. Plan to migrate to **QuickBooks Online Simple Start** (~$22–$35/month) by Month 4–6 as active listings approach 15+.

**Why QuickBooks Online over Wave at scale:**

| Feature | QuickBooks Online | Why It Matters for Easy Drive |
|---|---|---|
| Stripe Connect integration | Native via Stripe integration | Eliminates manual CSV imports |
| Class/department tracking | Yes | Separates Easy Drive from GB Trade cleanly |
| HST filing | Automated (pulls from transactions) | Reduces CRA filing error risk |
| T4A preparation | Via third-party (PaymentEvolution, etc.) | Smoother T4A workflow |
| Accountant collaboration | Industry standard | Your CPA will thank you |
| Audit trail | Strong | CRA audit-ready out of the box |

**Alternative worth evaluating: FreshBooks** — particularly if you value its client-facing invoicing. However, QuickBooks is more deeply integrated with the Canadian tax ecosystem and is the default for Ontario CPAs.

### What Records Must Be Kept for CRA Audit Readiness

Under the Income Tax Act and the Excise Tax Act, you must retain books and records for **a minimum of 6 years** from the end of the tax year to which they relate.

**Required records for Easy Drive:**

| Record Type | Retention | What to Keep |
|---|---|---|
| Stripe payout reports | 6 years | Monthly CSV exports; archive to Google Drive |
| Host payout statements | 6 years | All statements issued; auto-generated by platform |
| Renter receipts | 6 years | All receipts issued; auto-generated by platform |
| HST return filings | 6 years | CRA online My Business Account — download each return |
| T4A slips and summary | 6 years | Copies of all T4As filed |
| Bank statements | 6 years | Monthly statements — download and archive |
| SaaS invoices (Vercel, Supabase, etc.) | 6 years | Every invoice; forward to a dedicated email folder |
| Legal invoices | 6 years | Lawyer invoices and agreements |
| Marketing receipts | 6 years | Facebook Ads billing, flyer printing invoices |
| Host SIN information | Securely, for duration of business + 6 years | Encrypted; access-controlled |
| Host insurance certificates | Duration of active listing + 3 years | Platform document storage |

**Practical system:** Create a Google Drive folder structure:
```
GB Trade & Logistics — Easy Drive/
  ├── Stripe Reports/
  │   ├── 2026/
  │   │   ├── 2026-05-stripe-payout.csv
  │   │   ├── 2026-06-stripe-payout.csv
  ├── Bank Statements/
  ├── HST Returns/
  ├── T4A/
  │   ├── 2026/
  ├── Invoices Received/
  ├── Host Documents/
  │   ├── [BookingID]/
  └── Legal/
```

Download and file every Stripe report the first business day of each month. Do not leave this to year-end — reconstructing 12 months of Stripe data is painful.

### Recommended Bookkeeping Cadence

**Weekly (30 minutes):**
- Reconcile Stripe clearing balance to pending host payouts and deposits held
- Confirm host payouts have been sent and received
- Log any deposit releases or damage claim decisions

**Monthly (2–3 hours):**
- Export Stripe monthly CSV and import to Wave/QuickBooks
- Reconcile bank statement to accounting software
- Review HST collected vs. HST payable balance
- Categorize all expenses
- Review P&L against the Year 1 model in Section 8

**Quarterly:**
- File HST return with CRA (via My Business Account online)
- Review burn rate vs. budget
- Update host payout ledger (confirm all T4A data is collected for every host paid)

**Annually (January–February):**
- Close books for prior year
- Prepare T4A slips and T4A Summary — file by February 28
- Provide year-end package to CPA for corporate tax return (T2) — due 6 months after fiscal year-end
- If fiscal year = December 31: T2 due June 30; **corporate tax owing** due March 31 (even if return is not yet filed)

**[CPA REQUIRED]** Confirm your fiscal year-end with your CPA. If GB Trade and Logistics Inc. already has a non-December fiscal year-end, the Easy Drive launch does not change it. The T2 filing deadline is 6 months post-fiscal year-end; the tax payment deadline is 2 months post-fiscal year-end (3 months if SBD eligible — confirm with CPA).

---

## Summary: What You Can Handle vs. What Needs a CPA

### Handle Yourself
- Day-to-day bookkeeping in Wave or QuickBooks
- Monthly Stripe reconciliation
- HST calculation on platform fees (formula is straightforward)
- Quarterly HST filing via CRA My Business Account
- Collecting SINs and T4A information from hosts at onboarding
- Record archiving and Google Drive organization

### Needs a CPA (One-Time or Annual)
- Confirming principal vs. agent treatment for your specific structure
- Confirming HST obligation on host rental income (property vs. business income distinction)
- Salary vs. dividend optimization once net income is sustained
- First T4A filing (January 2027 for 2026 payouts) — get a CPA to review before filing
- Annual T2 corporate tax return
- Home office deduction calculation
- Reviewing this financial model against your actual Year 1 results

### Priority CPA Engagements

1. **Now (pre-launch):** 1-hour consult — confirm HST treatment, T4A obligations, and fiscal year-end. This is low-cost and high-value.
2. **Month 6:** Salary vs. dividend review if net income is positive and sustained.
3. **January 2027:** T4A preparation and filing.
4. **March 2027:** T2 corporate tax return for fiscal year 2026.

---

*This document is prepared for internal planning purposes for GB Trade and Logistics Inc. (Easy Drive). It does not constitute legal or tax advice. All tax positions should be confirmed with a licensed CPA practicing in Ontario before implementation.*

*Prepared: May 2026*

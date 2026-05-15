# Easy Drive — Project Management Master Document
**Lead Project Manager | Version 1.0 | April 2026**
**Product Owner (Technical): Gbemiga Ogele — gbemigaogele@gmail.com**
**Product Owner (Operations): Dayo Ogunniyi — day.ogunniyi@gmail.com**

---

## PART 1 — CRITICAL PATH ANALYSIS

The Critical Path is the longest chain of dependent tasks. Delay any one of these and the launch date slips.

```
[A] Supabase Project Created
      │
      ▼
[B] .env.local configured with real credentials
      │
      ├──────────────────────────────────────────────────┐
      ▼                                                  ▼
[C] DB Schema migrated (0001_initial_schema.sql)     [D] Auth working (login/magic link)
      │                                                  │
      ▼                                                  ▼
[E] RLS policies verified (is_admin / my_profile_id)  [F] Admin account seeded in profiles table
      │                                                  │
      └──────────────┬───────────────────────────────────┘
                     ▼
             [G] Admin can log in and reach /admin
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
[H] Applications API live    [I] Stripe live keys + webhook secret configured
         │                       │
         ▼                       ▼
[J] Renter can submit form   [K] Admin can approve → subscription created in Stripe
         │                       │
         └──────────┬────────────┘
                    ▼
           [L] PandaDoc API key live → agreement generated on approval
                    │
                    ▼
           [M] Renter signs agreement → rental status goes 'active'
                    │
                    ▼
           [N] Bouncie device registered → GPS events flowing to DB
                    │
                    ▼
           [O] Kill switch tested on real device
                    │
                    ▼
           [P] End-to-end smoke test complete → LAUNCH
```

### Key Dependencies Table

| Task | Blocked By | Owner |
|------|------------|-------|
| DB schema migration | Supabase project + real URL/key in .env | Gbemiga |
| Admin login works | DB schema + auth setup | Gbemiga |
| Application form submits data | DB schema + API route live | Gbemiga |
| Stripe subscription created | Stripe live keys + admin approval flow | Gbemiga |
| PandaDoc agreement sent | Stripe subscription success + PandaDoc key | Gbemiga |
| Bouncie GPS events | Bouncie device physically installed in vehicle | Dayo |
| Kill switch tested | Bouncie device live + vehicle acquired | Dayo |
| Commercial insurance | Vehicles purchased | Dayo |
| Rental agreement template | Legal review of contract terms | Dayo |
| First renter onboarded | ALL of the above complete | Both |

---

## PART 2 — MVP DEFINITION

### Must-Have for Launch (Week 4 Gate)

These are non-negotiable. Without them, we cannot legally or operationally rent a car.

| Feature | Why It's Non-Negotiable |
|---------|------------------------|
| Renter application form (5-step) | How renters enter the system |
| Admin application review + approve/reject | How we vet applicants |
| Stripe weekly subscription creation | How we get paid |
| $500 deposit hold (manual capture) | Legal protection against damage |
| PandaDoc rental agreement + e-signature | Legal contract required in Ontario |
| Admin fleet management (vehicle CRUD) | Track our 2 cars |
| Bouncie webhook → GPS event storage | Core security infrastructure |
| Geofence breach → admin SMS alert | Real-time theft/misuse detection |
| Kill switch panel (admin only) | Last-resort security measure |
| Payment failure → renter SMS | Revenue protection |
| Admin email/SMS notifications | Operational awareness |
| Supabase Auth (admin + renter login) | Identity and access control |
| Row Level Security on all tables | Data privacy compliance |
| HMAC webhook verification (Stripe + Bouncie) | Prevent fake event injection |

### Phase 2 — Post-Launch (Weeks 5–8)

These are built in code but lower priority for day-one launch:

| Feature | Why It Can Wait |
|---------|----------------|
| Renter portal self-service dashboard | Admin can manually update renters by SMS/phone |
| Payment history view for renters | Admin has Stripe dashboard |
| Real-time GPS map (Leaflet.js) | GPS alerts still fire; map is convenience |
| Inspection photo upload at handoff | Can use WhatsApp photos manually for now |
| Stripe customer portal (renter updates card) | Admin can update in Stripe dashboard |
| Maintenance log | Can use a spreadsheet at 2-car scale |

### Phase 3 — Growth (Month 3–4)

| Feature | Trigger |
|---------|---------|
| Revenue dashboard per vehicle | 5+ vehicles |
| Automated payment reminder sequence | When chasing payments manually becomes painful |
| Fleet map real-time view | 5+ vehicles |
| PWA / home screen install | User demand |

### Designer Features Flagged as Scope Risk

| Design Feature | Risk | Decision |
|----------------|------|----------|
| WhatsApp float button | Hardcoded phone number needed before launch | Dayo must provide number — **block** |
| Pricing card "Apply for this tier" routing | Requires vehicle-tier selection in apply form | Simplified to single apply flow for MVP |
| FAQ accordion animations | CSS-only `<details>` used — zero extra cost | **Safe, keep** |
| Mobile sticky CTA bar | Already implemented with Tailwind — no extra hours | **Keep** |
| Multi-step form progress bar | Built, working | **Keep** |

---

## PART 3 — SPRINT SCHEDULE

### Week 1 — Foundation (Apr 7–13)
**Theme: Real infrastructure, real credentials, real data**

| Day | Task | Owner | Output |
|-----|------|-------|--------|
| Mon Apr 7 | Create Supabase project (prod) | Gbemiga | Supabase URL + anon key |
| Mon Apr 7 | Create Vercel project, connect GitHub repo | Gbemiga | Preview URL live |
| Mon Apr 7 | Register Easy Drive trade name (Ontario Business Registry) | Dayo | Trade name certificate |
| Tue Apr 8 | Run `supabase db push` — migrate schema to prod | Gbemiga | All 9 tables live |
| Tue Apr 8 | Seed admin profile in `profiles` table | Gbemiga | Admin can log in |
| Tue Apr 8 | Acquire 2 vehicles (Facebook Marketplace / auction) | Dayo | 2 cars purchased ($4K–$6K each) |
| Wed Apr 9 | Replace all .env.local stubs with real production keys | Gbemiga | App talks to real services |
| Wed Apr 9 | Register vehicles with RIN / get plates | Dayo | Plates on both cars |
| Wed Apr 9 | Get commercial auto insurance quotes + bind policy | Dayo | Insurance certificate |
| Thu Apr 10 | Configure Stripe account (live mode, webhook endpoint) | Gbemiga | Stripe webhook verified |
| Thu Apr 10 | Configure Supabase Auth (email templates, PKCE) | Gbemiga | Magic link email working |
| Thu Apr 10 | Order + install Bouncie GPS units in both vehicles | Dayo | Devices registered in Bouncie portal |
| Fri Apr 11 | Deploy to Vercel prod — verify all env vars set | Gbemiga | `easydrive.ca` (or Vercel URL) live |
| Fri Apr 11 | Apply for GTA municipal business license | Dayo | Application submitted |

**Week 1 Gate:** Admin can log into the live production site.

---

### Week 2 — Core Logic (Apr 14–20)
**Theme: The full renter → admin workflow works end-to-end**

| Day | Task | Owner | Output |
|-----|------|-------|--------|
| Mon Apr 14 | Test application form → DB submission (prod) | Gbemiga | Test application in Supabase |
| Mon Apr 14 | Draft rental agreement template in PandaDoc | Dayo | Agreement template ID |
| Tue Apr 15 | Wire PandaDoc template ID into approval API route | Gbemiga | Agreement generated on approval |
| Tue Apr 15 | Verify Bouncie webhook receiving GPS events | Gbemiga | Events in `gps_events` table |
| Wed Apr 16 | Test full approval flow: apply → review → approve → Stripe sub created | Gbemiga | Subscription in Stripe dashboard |
| Wed Apr 16 | Confirm Twilio number purchased (Canadian) + SMS delivery | Dayo | SMS received on test phone |
| Thu Apr 17 | Test geofence breach: trigger event → admin SMS fires | Gbemiga | SMS alert delivered |
| Thu Apr 17 | Review and finalize rental agreement legal terms | Dayo | Dayo signs off on contract |
| Fri Apr 18 | Test kill switch: activate → confirm ignition interrupt → deactivate | Gbemiga + Dayo | Kill switch proven on real car |
| Fri Apr 18 | Load test vehicles into fleet table (make/model/VIN/plate) | Dayo | Both cars in admin fleet view |

**Week 2 Gate:** Full end-to-end flow works in production — fake applicant applied, reviewed, approved, agreement sent, subscription created.

---

### Week 3 — UI Polish & Integration (Apr 21–27)
**Theme: Real renters could use this today**

| Day | Task | Owner | Output |
|-----|------|-------|--------|
| Mon Apr 21 | Mobile test: apply form on iPhone/Android | Gbemiga | No broken layouts on 375px |
| Mon Apr 21 | Add WhatsApp business number to float button + footer | Dayo | Real WhatsApp number configured |
| Tue Apr 22 | Cross-browser test: Chrome, Safari, Firefox | Gbemiga | No critical bugs |
| Tue Apr 22 | Set up Resend domain (DNS verification for easydrive.ca email) | Gbemiga | Email from `hello@easydrive.ca` |
| Wed Apr 23 | Create renter onboarding SMS template (approval message) | Dayo | Templates approved |
| Wed Apr 23 | Accessibility audit: keyboard nav, screen reader labels | Gbemiga | WCAG 2.1 AA pass on key flows |
| Thu Apr 24 | Stress test: 10 simultaneous form submissions | Gbemiga | No 500 errors, RLS holds |
| Thu Apr 24 | Prepare physical vehicle handoff checklist (paper) | Dayo | Checklist printed, ready |
| Fri Apr 25 | Final content review: all copy, pricing, FAQ | Dayo | Content approved |
| Fri Apr 25 | Stripe live mode end-to-end with real card | Gbemiga | Real $1 test charge + refund |

**Week 3 Gate:** Gbemiga and Dayo both do a full walkthrough as if they are a real renter applying. Both sign off.

---

### Week 4 — QA & Launch (Apr 28 – May 4)
**Theme: Find it before renters do. Then ship it.**

| Day | Task | Owner | Output |
|-----|------|-------|--------|
| Mon Apr 28 | Run full Vitest suite — all 40+ unit tests pass | Gbemiga | `npm test` green |
| Mon Apr 28 | Final insurance certificate received + filed | Dayo | Insurance confirmed |
| Tue Apr 29 | Security audit: test HMAC bypass, RLS bypass attempts | Gbemiga | No vulnerabilities found |
| Tue Apr 29 | Set up Vercel Analytics + error monitoring | Gbemiga | Errors surface in dashboard |
| Wed Apr 30 | Bug fix sprint (issues from Week 3 walkthrough) | Gbemiga | All P1 bugs resolved |
| Wed Apr 30 | Post in 3 GTA gig driver Facebook groups (soft launch) | Dayo | First organic applications in |
| Thu May 1 | Monitor first real applications in admin dashboard | Both | Real data flowing |
| Thu May 1 | First rental: vehicle handoff with physical inspection | Dayo | First paying customer |
| Fri May 2 | Verify first Stripe weekly charge fires correctly | Gbemiga | Revenue confirmed |
| Fri May 2 | Post-launch retrospective: what broke, what to fix next | Both | Phase 2 backlog updated |

**Week 4 Gate: First renter has paid, signed, and taken possession of a vehicle.**

---

## PART 4 — MASTER KANBAN BOARD

### DONE (Built by Developer)
- [x] Next.js 14 app scaffold with App Router + TypeScript
- [x] Supabase schema — all 9 tables + RLS + helper functions
- [x] TypeScript type definitions for all DB tables
- [x] Supabase Auth client (server + browser + middleware)
- [x] Landing page (full marketing page)
- [x] Login page (magic link + password toggle)
- [x] Apply form (5-step multi-page)
- [x] Application submitted confirmation page
- [x] Admin layout (sidebar desktop, tab bar mobile)
- [x] Admin dashboard (KPI cards + alert feed + realtime)
- [x] Admin fleet list (status badges, expiry warnings)
- [x] Admin applications queue (color-coded, auto-check dots)
- [x] Admin application review page (two-column)
- [x] Admin application ReviewForm client component
- [x] Admin rental detail page
- [x] Kill switch panel (reason required, confirmation modal, SMS)
- [x] Renter portal (adaptive 4-state)
- [x] Stripe helpers (subscriptions, deposit hold, capture/release)
- [x] Bouncie GPS client (status, ignition interrupt, HMAC verify)
- [x] Notification helpers (Twilio SMS + Resend email)
- [x] Input sanitization library (all form fields)
- [x] Bouncie webhook handler (HMAC verified)
- [x] Stripe webhook handler (HMAC verified)
- [x] Applications API (submit, auto-reject rules)
- [x] Application review API (approve → Stripe → PandaDoc → SMS)
- [x] Kill switch API (admin-only, audit log, SMS)
- [x] Payment setup API
- [x] Auth callback + signout routes
- [x] Alert acknowledge API
- [x] Vitest unit tests: sanitization (16 tests)
- [x] Vitest unit tests: application eligibility (9 tests)
- [x] Vitest unit tests: Stripe calculations (8 tests)
- [x] Vitest unit tests: webhook security (8 tests)
- [x] Tailwind CSS design system + component classes
- [x] globals.css with all design tokens
- [x] postcss.config.js (fixed)
- [x] next.config.mjs (fixed)

---

### TO DO — Gbemiga (Technical)

**P0 — Launch Blockers**
- [ ] Replace stub .env.local with real Supabase prod credentials
- [ ] Replace stub .env.local with real Stripe live key + webhook secret
- [ ] Replace stub .env.local with real Twilio SID + auth token
- [ ] Replace stub .env.local with real PandaDoc API key
- [ ] Replace stub .env.local with real Resend API key
- [ ] Replace stub .env.local with real Bouncie API key + webhook secret
- [ ] Run `supabase db push` against production Supabase project
- [ ] Seed admin user (Gbemiga + Dayo) in `profiles` table with role='admin'
- [ ] Register Bouncie webhook URL in Bouncie portal
- [ ] Register Stripe webhook URL in Stripe dashboard
- [ ] Verify Supabase Auth email templates (magic link)
- [ ] Deploy to Vercel with all env vars set
- [ ] Verify custom domain (easydrive.ca) pointed to Vercel
- [ ] Verify Resend domain DNS for branded email

**P1 — Quality**
- [ ] Mobile UI test on real iOS device (apply form camera capture)
- [ ] Full keyboard navigation test (WCAG 2.1)
- [ ] Cross-browser test (Safari especially — webkit quirks)
- [ ] Run full Vitest suite in CI on Vercel
- [ ] Stripe live end-to-end: real card charge + refund
- [ ] Kill switch integration test on real Bouncie device

---

### TO DO — Dayo (Operations)

**P0 — Launch Blockers**
- [ ] Purchase 2 vehicles ($4,000–$6,000 CAD each via FB Marketplace / auction)
- [ ] Register vehicles to GB Trade and Logistics Inc. via RIN
- [ ] Obtain Ontario plates for both vehicles
- [ ] Bind commercial auto insurance policy (non-owned, commercial use)
- [ ] Register "Easy Drive" trade name at Ontario Business Registry (~$60)
- [ ] Apply for GTA municipal business license (~$150–$300)
- [ ] Order and install 2 Bouncie GPS units in both vehicles (~$67 device + $8/mo)
- [ ] Register Bouncie devices in Bouncie portal (note device IDs for DB)
- [ ] Create rental agreement template in PandaDoc (use legal template from BUSINESS_PLAN.md §5)
- [ ] Provide WhatsApp Business number for float button + footer
- [ ] Purchase Canadian Twilio phone number for SMS

**P1 — Operations**
- [ ] Draft vehicle handoff checklist (physical paper)
- [ ] Draft vehicle condition report template (photos at pickup/return)
- [ ] Set up Easy Drive bank account (or sub-account under GB Trade)
- [ ] Configure HST collection in accounting (rental revenue is HST-taxable)
- [ ] Write 3 GTA gig driver Facebook group posts for soft launch
- [ ] Write response script for WhatsApp inquiries

---

### IN PROGRESS
- [ ] Dev server running at localhost:3001 — UI validated
- [ ] Screenshot review complete — all 4 public pages confirmed styled

---

### REVIEW / BLOCKED
- [ ] PandaDoc template — **BLOCKED on Dayo** creating the template and providing template ID
- [ ] WhatsApp number in codebase — **BLOCKED on Dayo** providing business phone number
- [ ] Bouncie device IDs in vehicles table — **BLOCKED on Dayo** purchasing + installing devices
- [ ] Municipal business license — **BLOCKED**: processing time unknown (may take 2–6 weeks)

---

## PART 5 — RED FLAGS & CONTRADICTIONS

### 🚩 Red Flag #1 — Municipal License Processing Time
**Issue:** GTA municipal business licenses can take 2–6 weeks to process. Launch is Week 4.
**Contradiction:** Business plan says comply with Ontario law; architect says launch Week 4.
**Resolution:** Apply in Week 1 (Day 1). Operate in soft launch (friends/family test renters) while waiting. Do NOT advertise publicly until license confirmed. Dayo owns this.

---

### 🚩 Red Flag #2 — PandaDoc Template is a Human Dependency
**Issue:** The `review/route.ts` API calls `PANDADOC_TEMPLATE_ID` from env vars. If Dayo hasn't created the agreement template and provided the ID, the entire approval workflow crashes on "Approve."
**Contradiction:** Developer code is complete and correct. Operations hasn't completed their parallel track.
**Resolution:** Dayo must create the PandaDoc template and provide the template ID by **Apr 15 (Week 2, Day 2)**. Gbemiga cannot complete approval flow testing without it. This is the single highest-risk human dependency.

---

### 🚩 Red Flag #3 — Insurance Must Precede First Rental (Non-Negotiable)
**Issue:** Commercial auto insurance for gig-rental vehicles (non-owned, commercial use) can take 3–10 business days to bind and costs significantly more than personal auto.
**Contradiction:** Business plan targets Week 4 first rental. Insurance shopping hasn't started.
**Resolution:** Dayo begins insurance shopping **Week 1, Day 3 (Apr 9)**. Get 3 quotes minimum. Target brokers specializing in commercial fleet in Ontario (Intact, Aviva, Economical). **No vehicle may be rented without the policy bound.** This is a legal requirement, not a preference.

---

### 🚩 Red Flag #4 — Bouncie Kill Switch Has Legal Exposure
**Issue:** Ontario's Consumer Protection Act requires disclosure of all material terms. Activating a kill switch without proper renter consent and documented process could constitute unlawful interference with a vehicle.
**Contradiction:** Developer built a technically sound kill switch; legal framework was not finalized.
**Resolution:** Rental agreement (PandaDoc template) must explicitly include: (a) kill switch disclosure, (b) conditions that trigger activation, (c) renter consent. Dayo to have this reviewed by a paralegal before Week 2.

---

### 🚩 Red Flag #5 — Designer's Pricing Tiers vs. 2-Car Launch Reality
**Issue:** Landing page shows 3 pricing tiers (Economy, Mid-size, Hybrid). We are launching with 2 Economy vehicles only. A renter clicking "Apply for Mid-size" will be disappointed.
**Contradiction:** Designer built full tier differentiation; Architect's data model supports it; but Operations only has Economy cars.
**Resolution:** Update landing page pricing to show Economy tier only at launch. Grey out Mid-size and Hybrid with "Coming Soon" badges. Dayo confirms vehicle tier before Week 3 content review.

---

## PART 6 — RISK MITIGATION TABLE

| # | Bottleneck | Probability | Impact | Mitigation Plan |
|---|-----------|-------------|--------|-----------------|
| 1 | **PandaDoc template not ready by Apr 15** | High (dependency on Dayo) | Critical — approval flow broken | Gbemiga builds a fallback: on approval, send renter a manual email with PDF agreement. Remove PandaDoc dependency from the API route temporarily. Re-enable when template is ready. |
| 2 | **Commercial insurance delays past Apr 28** | Medium | Critical — cannot legally rent | Start quotes Week 1 Day 1, not Day 3. Target brokers with rapid bind for commercial fleet. Have a broker shortlisted by EOD Apr 8. If delayed: push launch date, do not skip insurance. |
| 3 | **Bouncie GPS device not shipping in time** | Medium | High — no GPS security, geofencing, or kill switch | Order devices Express Week 1. Have a manual fallback: share location via Google Maps as interim. Do not launch without GPS unless both owners consciously accept the security risk in writing. |
| 4 | **Stripe webhook secret mismatch in prod** | Low (technical) | High — payments not recorded in DB | Gbemiga: verify with Stripe CLI `stripe listen --forward-to localhost:3001/api/webhooks/stripe` in Week 2. Always use the signing secret from the Stripe dashboard, not the test one. |
| 5 | **First renter is a bad actor (suspended licence, fraud)** | Low-Medium | High — financial + legal exposure | The application API already auto-rejects suspended licences. Admin manual review is mandatory for Week 1–2 applications. Do not fully automate approvals until pattern is established. |

---

## PART 7 — DEFINITION OF DONE (DoD)

A feature is **Done** when ALL of the following are true:

### Code Standard
- [ ] Feature works in production Vercel deployment (not just localhost)
- [ ] All inputs are sanitized through `sanitizeApplicationPayload()` or equivalent
- [ ] No `console.log` left in production code paths
- [ ] TypeScript compiles with zero errors (`npm run typecheck`)
- [ ] ESLint passes with zero warnings (`npm run lint`)
- [ ] Related Vitest unit tests pass (`npm test`)

### Security Standard
- [ ] Any webhook endpoint verifies HMAC signature before processing
- [ ] Any protected route checks auth via `requireSession()` or `requireAdminSession()`
- [ ] Any DB write goes through a sanitized, typed payload — no raw user input to SQL
- [ ] RLS policy exists on every table touched by the feature

### Business Standard
- [ ] Feature matches the business rule defined in `BUSINESS_PLAN.md`
- [ ] If it touches money: Stripe test + live mode both verified
- [ ] If it touches GPS/kill switch: tested on a real Bouncie device
- [ ] If it touches SMS: tested delivery to a real Canadian phone number

### UX Standard (from Designer)
- [ ] Renders correctly at 375px (mobile), 768px (tablet), 1280px (desktop)
- [ ] All interactive elements meet 44px minimum touch target
- [ ] Form errors are displayed inline with clear messaging
- [ ] Loading states shown for any action >500ms
- [ ] Empty states shown when lists have no data

### Operations Standard
- [ ] Dayo has been demonstrated the feature and can operate it without Gbemiga present
- [ ] Any admin action generates a paper trail in the `alerts` table
- [ ] Feature has been documented in this file if it changes a process

---

## PART 8 — MILESTONE TIMELINE

```
APRIL 2026
──────────────────────────────────────────────────────────────────────
MON       TUE       WED       THU       FRI
Apr 7     Apr 8     Apr 9     Apr 10    Apr 11
[WEEK 1 — FOUNDATION]
Supabase  Schema    Real      Stripe    DEPLOY
created   migrated  .env.     webhook   to prod
Vercel    Admin     local     Auth      ✅ Gate:
project   seeded    live      config    Admin login
Cars      Plates    Insur.    Bouncie   works live
shopping  RIN reg   quotes    order

──────────────────────────────────────────────────────────────────────
Apr 14    Apr 15    Apr 16    Apr 17    Apr 18
[WEEK 2 — CORE LOGIC]
Test app  PandaDoc  Full E2E  Geofence  Kill switch
form →DB  template  approve   breach    tested on
Bouncie   wired     flow      SMS       real car
webhook   into API  tested    fires     ✅ Gate:
verified  ⚠️ DAYO   Stripe    Twilio    Full flow
          DEADLINE  sub live  verified  end-to-end

──────────────────────────────────────────────────────────────────────
Apr 21    Apr 22    Apr 23    Apr 24    Apr 25
[WEEK 3 — UI & INTEGRATION]
Mobile    X-browser Onboard   Stress    Content
test      test      SMS       test      review
WhatsApp  Resend    templates 10 subs   Dayo
number    domain    approved  Accessib  sign-off
added     verified  Handoff   ility     ✅ Gate:
          Gbemiga   checklist audit     Full
          Safari    ready     WCAG      walkthrough

──────────────────────────────────────────────────────────────────────
Apr 28    Apr 29    Apr 30    May 1     May 2
[WEEK 4 — QA & LAUNCH]
Vitest    Security  Bug fix   🚀 SOFT   First
all pass  audit     sprint    LAUNCH    weekly
Insur.    HMAC +    Vercel    Monitor   charge
confirmed RLS       Analytics first     verified
          tested    live      apps      ✅ GATE:
                    FB group  First     LAUNCHED
                    posts     handoff   💰

──────────────────────────────────────────────────────────────────────
```

---

## PART 9 — TEAM ASSIGNMENTS SUMMARY

### Gbemiga Ogele (gbemigaogele@gmail.com) — Technical Lead
**Focus:** Everything in the codebase, all third-party API configurations, all testing.

| Priority | Task | Week |
|----------|------|------|
| P0 | Set all real env vars in .env.local + Vercel | 1 |
| P0 | Run schema migration to prod Supabase | 1 |
| P0 | Seed admin accounts in `profiles` table | 1 |
| P0 | Register webhooks in Stripe + Bouncie portals | 1 |
| P0 | Configure Supabase Auth email templates | 1 |
| P0 | Wire PandaDoc template ID when Dayo provides it | 2 |
| P0 | Verify Bouncie GPS events flowing to prod DB | 2 |
| P0 | Full approval flow E2E test in prod | 2 |
| P0 | Kill switch integration test with real vehicle | 2 |
| P0 | Stripe live mode end-to-end charge | 3 |
| P0 | Mobile + cross-browser testing | 3 |
| P0 | Vitest all green in CI | 4 |
| P0 | Security audit (HMAC, RLS, injection) | 4 |
| P1 | Resend custom domain (easydrive.ca email) | 3 |
| P1 | Vercel Analytics + error monitoring | 4 |

### Dayo Ogunniyi (day.ogunniyi@gmail.com) — Operations Lead
**Focus:** Everything physical, legal, financial, and vendor relationships.

| Priority | Task | Week | Deadline |
|----------|------|------|----------|
| P0 | Source + purchase 2 vehicles ($4K–$6K each) | 1 | Apr 9 |
| P0 | Register vehicles with RIN + get plates | 1 | Apr 10 |
| P0 | Start commercial insurance quotes (3 minimum) | 1 | Apr 9 |
| P0 | Order + install 2 Bouncie GPS units | 1 | Apr 10 |
| P0 | Register "Easy Drive" trade name (Ontario Business Registry) | 1 | Apr 8 |
| P0 | Apply for GTA municipal business license | 1 | Apr 8 |
| **P0** | **Create rental agreement template in PandaDoc + send template ID to Gbemiga** | **2** | **Apr 15 HARD** |
| P0 | Confirm Twilio Canadian phone number purchased | 2 | Apr 14 |
| P0 | Provide WhatsApp Business number | 2 | Apr 14 |
| P0 | Legal review of rental agreement (paralegal) | 2 | Apr 16 |
| P0 | Bind commercial insurance policy | 3 | Apr 23 |
| P1 | Draft vehicle handoff checklist | 3 | Apr 24 |
| P1 | Write FB group launch posts | 4 | Apr 29 |
| P1 | Set up Easy Drive bank / HST tracking | 1 | Apr 11 |
| P1 | Vehicle condition report template | 3 | Apr 24 |

---

*This document is owned by the Project Management function.*
*Updated after each weekly sprint gate review.*
*Next review: Apr 11, 2026 (Week 1 Gate).*

# Easy Drive — Task List
**Sprint: Apr 7 – May 2, 2026**
**Updated: Apr 6, 2026**

---

## GBEMIGA OGELE — Technical Lead
📧 gbemigaogele@gmail.com

### WEEK 1 — Foundation (Apr 7–11)

- [ ] **[W1-G1]** Create Supabase production project at supabase.com → copy Project URL + anon key + service role key
- [ ] **[W1-G2]** Create Vercel project → connect the GitHub repo → confirm preview URL is live
- [ ] **[W1-G3]** Replace ALL stub values in `.env.local` with real credentials (Supabase, Stripe test keys, Twilio, Resend, Bouncie, PandaDoc)
- [ ] **[W1-G4]** Run `npm run supabase:migrate` (or `supabase db push`) to apply `0001_initial_schema.sql` to prod Supabase — verify all 9 tables exist
- [ ] **[W1-G5]** Seed admin accounts: insert both Gbemiga + Dayo into the `profiles` table with `role = 'admin'` using the Supabase dashboard SQL editor
- [ ] **[W1-G6]** Configure Supabase Auth → enable Email provider → customise magic link email template with Easy Drive branding
- [ ] **[W1-G7]** Add all environment variables to Vercel project settings (Settings → Environment Variables) — match exactly what is in `.env.local`
- [ ] **[W1-G8]** Run first production deploy → confirm `https://<project>.vercel.app` loads the landing page
- [ ] **[W1-G9]** Set up Stripe account in live mode → copy live publishable key + secret key → update `.env.local` and Vercel env vars
- [ ] **[W1-G10]** Register Stripe webhook endpoint: `https://<your-domain>/api/webhooks/stripe` → events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.deleted` → copy signing secret to env

### WEEK 2 — Core Logic (Apr 14–18)

- [ ] **[W2-G1]** Register Bouncie webhook URL in Bouncie portal: `https://<your-domain>/api/webhooks/bouncie` → copy webhook secret to env
- [ ] **[W2-G2]** Submit a test application through the live form → verify row appears in `applications` table in Supabase dashboard
- [ ] **[W2-G3]** Wire Dayo's PandaDoc template ID (provided by Dayo by Apr 15) into `PANDADOC_TEMPLATE_ID` env var → redeploy
- [ ] **[W2-G4]** Run full approval flow end-to-end in production: submit application → admin approves → confirm Stripe subscription created + PandaDoc email sent to test address
- [ ] **[W2-G5]** Verify Bouncie GPS events are flowing: check `gps_events` table is populating after Dayo installs devices
- [ ] **[W2-G6]** Test geofence breach end-to-end: trigger a mock geofence exit → confirm admin receives SMS from Twilio number
- [ ] **[W2-G7]** Test kill switch: activate via admin panel on one real vehicle → confirm ignition interrupts → deactivate → confirm SMS was sent to renter number
- [ ] **[W2-G8]** Verify payment failure webhook: use Stripe test card `4000 0000 0000 0341` → confirm `payment_failed` event inserts alert + SMS fires

### WEEK 3 — UI & Integration (Apr 21–25)

- [ ] **[W3-G1]** Mobile test the entire apply form on a real iPhone or Android device — check camera capture on the Documents step works
- [ ] **[W3-G2]** Cross-browser test: Safari (most likely to break), Firefox, Chrome — fix any layout bugs
- [ ] **[W3-G3]** Add Dayo's WhatsApp Business number to the codebase in two places: the floating WhatsApp button (`/app/(public)/page.tsx`) and the footer link
- [ ] **[W3-G4]** Set up Resend domain verification: add DNS TXT record for `easydrive.ca` (or current domain) so emails send from `hello@easydrive.ca` not `onboarding@resend.dev`
- [ ] **[W3-G5]** Accessibility audit: tab through the apply form with keyboard only — all form fields, buttons, and modals must be reachable; fix any missing `aria-label` or focus-ring
- [ ] **[W3-G6]** Stress test: submit 10 applications simultaneously (use browser dev tools or a simple script) — confirm no 500 errors and RLS prevents data leakage
- [ ] **[W3-G7]** Run Stripe live-mode end-to-end: charge a real card $1 via the payment setup flow → refund it immediately → confirm it appears in Stripe dashboard
- [ ] **[W3-G8]** Update landing page pricing cards: grey out Mid-size and Hybrid tiers with "Coming Soon" badge — we only have Economy cars at launch

### WEEK 4 — QA & Launch (Apr 28 – May 2)

- [ ] **[W4-G1]** Run full Vitest suite: `npm test` — all 41 tests must be green before launch
- [ ] **[W4-G2]** Run TypeScript check: `npm run typecheck` — zero errors
- [ ] **[W4-G3]** Run lint: `npm run lint` — zero warnings
- [ ] **[W4-G4]** Security audit: attempt to call `POST /api/rentals/[id]/killswitch` with a renter-role session — must return 403. Attempt to access another renter's data via `/portal` — must return nothing. Document results.
- [ ] **[W4-G5]** Set up Vercel Analytics (free) + Sentry or Vercel's built-in error monitoring → verify a test error surfaces in the dashboard
- [ ] **[W4-G6]** Confirm custom domain is pointed to Vercel (`easydrive.ca` A record or CNAME) and SSL certificate is active
- [ ] **[W4-G7]** Verify first Stripe recurring weekly charge fires correctly on the correct billing date
- [ ] **[W4-G8]** Post-launch: monitor Vercel function logs for any 500 errors on first day of real traffic

---

## DAYO OGUNNIYI — Operations Lead
📧 day.ogunniyi@gmail.com

### WEEK 1 — Foundation (Apr 7–11)

- [ ] **[W1-D1]** Register "Easy Drive" as a trade name under GB Trade and Logistics Inc. at the Ontario Business Registry (ontario.ca/page/ontario-business-registry) — fee ~$60 — **do this first, it unlocks everything else**
- [ ] **[W1-D2]** Apply for GTA municipal business license for vehicle rental activity — contact your local municipality office directly — fee ~$150–$300 — note this can take 2–6 weeks so apply NOW
- [ ] **[W1-D3]** Source and purchase Vehicle #1 via Facebook Marketplace or auction — budget $4,000–$6,000 CAD — target Economy tier (Toyota Corolla, Honda Civic, or similar)
- [ ] **[W1-D4]** Source and purchase Vehicle #2 — same criteria as above
- [ ] **[W1-D5]** Register both vehicles to GB Trade and Logistics Inc. using the existing RIN number at ServiceOntario
- [ ] **[W1-D6]** Obtain Ontario licence plates for both vehicles under the business account
- [ ] **[W1-D7]** Begin commercial auto insurance — get minimum 3 quotes from brokers specialising in Ontario commercial fleet (Intact, Aviva, Economical are starting points) — target binding policy by Apr 23
- [ ] **[W1-D8]** Order 2 Bouncie GPS devices (bouncie.com) — use Express shipping — approximately $67/device + $8/month per device — note device IMEI numbers, Gbemiga needs them for the database
- [ ] **[W1-D9]** Open a dedicated Easy Drive bank account (or sub-account under GB Trade and Logistics Inc.) for clean HST tracking and separation of rental revenue
- [ ] **[W1-D10]** Set up HST tracking: all weekly rental fees are HST-taxable — confirm with your accountant how rental revenue will be reported under the existing CRA Business Number

### WEEK 2 — Core Logic (Apr 14–18)

- [ ] **[W2-D1]** Install Bouncie GPS unit in Vehicle #1 — plug into OBD-II port (under dashboard, driver side) — register device in Bouncie app — send device IMEI to Gbemiga
- [ ] **[W2-D2]** Install Bouncie GPS unit in Vehicle #2 — same process — send device IMEI to Gbemiga
- [ ] **[W2-D3]** Purchase a Canadian Twilio phone number through the Twilio console — this will be the sender number for all admin and renter SMS alerts — send the number to Gbemiga
- [ ] **[W2-D4]** Set up WhatsApp Business account — use the Easy Drive phone number — this is the number that appears on the website — send the number to Gbemiga by Apr 14
- [ ] **[W2-D5]** **HARD DEADLINE APR 15** — Create the rental agreement template in PandaDoc (pandadoc.com) using the terms from `BUSINESS_PLAN.md §5`. The template must include: (a) kill switch disclosure and renter consent, (b) all fee structures, (c) Ontario-only use restriction, (d) 72-hour cancellation clause. Once created, share the PandaDoc Template ID with Gbemiga.
- [ ] **[W2-D6]** Engage a paralegal (not a full lawyer — cheaper) to review the rental agreement template for Ontario Consumer Protection Act compliance — specifically the kill switch clause and deposit terms — budget ~$200–$400 for a 1-hour review
- [ ] **[W2-D7]** Join the following Facebook groups and introduce Easy Drive (do not post ads yet — just become a member and learn the community): "GTA Uber Eats Drivers", "DoorDash Drivers Toronto", "SkipTheDishes Ontario Drivers"

### WEEK 3 — UI & Integration (Apr 21–25)

- [ ] **[W3-D1]** Bind commercial insurance policy — must be done before any vehicle is handed to a renter — get the certificate of insurance and file digitally
- [ ] **[W3-D2]** Conduct a full walkthrough of the website as if you are a renter: go to easydrive.ca → click Apply → fill in the 5-step form with test data → submit → log in as admin → review your own application → approve it — note any confusion or broken UX and report to Gbemiga
- [ ] **[W3-D3]** Write and approve all SMS notification templates with Gbemiga: (a) approval SMS to renter, (b) rejection SMS, (c) payment reminder, (d) geofence breach alert to admin, (e) kill switch activation notice to renter
- [ ] **[W3-D4]** Create a physical vehicle handoff checklist (1 page, printed): pre-rental condition photos, odometer reading, fuel level, key handover confirmation, renter signature
- [ ] **[W3-D5]** Create a vehicle condition report template for returns: same as above but focused on damage comparison vs. pickup condition
- [ ] **[W3-D6]** Do a final content review of the entire website — check all copy, pricing, FAQ answers, and legal disclosures are accurate — sign off with Gbemiga by Apr 25
- [ ] **[W3-D7]** Confirm safety certificates are current on both vehicles (required at point of first rental under Ontario HTA)

### WEEK 4 — QA & Launch (Apr 28 – May 2)

- [ ] **[W4-D1]** Confirm insurance certificate received and filed — no renter gets a car without this
- [ ] **[W4-D2]** Write 3 different Facebook group posts (one per group) announcing Easy Drive soft launch — posts should be genuine and personal, not corporate — include WhatsApp number, starting price, and 1-sentence benefit. Do NOT post until Gbemiga confirms the site is live and stable.
- [ ] **[W4-D3]** Prepare both vehicles for first rental: clean, full tank of gas, safety cert verified, Bouncie device confirmed active, all paperwork ready
- [ ] **[W4-D4]** Conduct first vehicle handoff: use physical checklist, take timestamped condition photos, confirm renter has signed PandaDoc agreement (Gbemiga confirms agreement status in admin panel before handing keys)
- [ ] **[W4-D5]** Monitor the admin dashboard daily for the first week — check alerts panel every morning — escalate any geofence breach, payment failure, or system alert to Gbemiga immediately
- [ ] **[W4-D6]** Collect feedback from first renter after 48 hours — WhatsApp message asking: "How was the pickup experience? Anything confusing or unclear?" — bring feedback to retrospective

---

## SHARED TASKS — Both Owners

| ID | Task | Who Leads | Who Supports | Due |
|----|------|-----------|--------------|-----|
| S1 | Week 1 gate review: admin login confirmed on live site | Gbemiga | Dayo watches | Apr 11 |
| S2 | Week 2 gate review: full E2E flow tested in prod | Gbemiga | Dayo as test renter | Apr 18 |
| S3 | Week 3 gate review: both do full renter walkthrough, both sign off | Dayo | Gbemiga fixes issues | Apr 25 |
| S4 | Week 4 retrospective: what broke, what to add to Phase 2 backlog | Both | Both | May 2 |
| S5 | Kill switch live test on real vehicle | Gbemiga (activates) | Dayo (in the car) | Apr 18 |
| S6 | First vehicle handoff — both present | Dayo (leads) | Gbemiga (confirms system) | May 1 |

---

## BLOCKED TASKS (Cannot Start Until Dependency Met)

| Task | Blocked On | Blocking Who |
|------|-----------|--------------|
| Wire PandaDoc template ID into API [W2-G3] | Dayo creates template [W2-D5] | Gbemiga |
| Add WhatsApp number to site [W3-G3] | Dayo provides number [W2-D4] | Gbemiga |
| Bouncie GPS events in DB [W2-G5] | Dayo installs devices [W2-D1, W2-D2] | Gbemiga |
| Kill switch test [W2-G7] | Bouncie devices installed + vehicles purchased | Both |
| First rental handoff [W4-D4] | Insurance bound [W3-D1] + agreement signed | Both |
| Public Facebook posts [W4-D2] | Gbemiga confirms site live + stable | Dayo |

---

## PRIORITY LEGEND
Tasks marked with **HARD DEADLINE** or appearing in the Blocked table are on the critical path.
Missing them delays every task below them.

**P0 — Launch blocker:** Cannot go live without this
**P1 — Launch quality:** Degrades experience if missing but system still works
**P2 — Phase 2:** Deliberately deferred

All tasks above are P0 unless otherwise noted.

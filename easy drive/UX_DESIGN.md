# Easy Drive — UX & Product Design Document
**Lead Product Designer Document**
**Version 1.0 | April 2026**

> *"Good design is invisible."*
> Philosophy: reduce friction at every step. The renter is a gig driver checking their phone
> between deliveries. The admin is running a business solo. Neither has time for complexity.

---

## 1. Discovery — Who Are We Designing For?

### Persona A — The Renter: "Kwame"
| Attribute | Detail |
|---|---|
| Age | 28 |
| Background | Recent immigrant from Ghana; working Uber Eats full-time |
| Device | Android smartphone (primary), no desktop |
| Tech comfort | Moderate — uses apps daily but not tech-savvy |
| Pain point | Was rejected by Enterprise due to no Canadian credit history |
| Goal | Get a reliable car this week and start earning |
| Motivation | $1,200–$1,800/week gross income from delivery; car is the bottleneck |
| Fear | Being scammed; unclear fees; losing his deposit |

**Design implication:** Mobile-first. Trust signals everywhere. Plain language. No jargon.
Progress indicators at every step. Transparent pricing shown upfront.

---

### Persona B — The Admin: "Owner (you)"
| Attribute | Detail |
|---|---|
| Role | Sole operator, owner of GB Trade and Logistics Inc. |
| Device | Laptop primary; phone for urgent alerts |
| Tech comfort | High — comfortable with business software |
| Pain point | Needs to manage fleet + renters solo; can't afford to miss a payment failure or geofence breach |
| Goal | Spend less than 1 hour/day on admin tasks |
| Motivation | Build a profitable, low-maintenance operation |
| Fear | Vehicle theft; non-payment; being legally exposed |

**Design implication:** Dashboard-first. Critical information (alerts, overdue payments) visible
immediately. Bulk actions. Keyboard shortcuts where possible. No unnecessary clicks.

---

## 2. User Journey Maps

### Journey 1 — Renter Application (Kwame's Path)

```
[Discovers Easy Drive]          [Visits easydrive.ca]
 Facebook group post         →   Landing page loads
 "No credit check, $300/wk"      < 2 seconds on 4G
         │
         ▼
[Reads pricing + how it works]
 Clear weekly rates             Trust badges (GPS, insured)
 "How does it work" section     Photo of actual vehicle
         │
         ▼
[Clicks "Apply Now"]
 Multi-step form — 5 steps      One action per screen
 Progress bar visible           Auto-save on each step
         │
         ▼
[Uploads documents]
 ID photo → takes photo inline  Driver abstract → PDF upload
 Gig screenshot → screenshot    Large tap targets on mobile
         │
         ▼
[Submits Application]
 Confirmation screen            SMS sent immediately
 "We'll review within 24hrs"    Clear next steps shown
         │
         ▼
[Admin approves + sends DocuSign link]
 SMS: "You're approved! Sign here: [link]"
         │
         ▼
[Renter signs agreement]
 Opens link on phone            PandaDoc mobile-optimised
 Signs with finger              Receives PDF copy by email
         │
         ▼
[Vehicle handoff]
 Renter portal activated        Shows rental start date
 Next payment date visible      Contact admin button
         │
         ▼
[Weekly — checks portal]
 Payment status                 Next payment countdown
 Contact / report issue         View signed agreement
```

**Key drop-off risks to design against:**
- Step 4 (document upload) — friction is highest here. Use camera capture on mobile.
- Post-submission wait — show clear status tracking to reduce support enquiries.

---

### Journey 2 — Admin Daily Workflow

```
[Morning: Open dashboard]
 Unacknowledged alerts visible   Realtime, no refresh
 Active fleet status at a glance KPI cards prominent
         │
         ▼
[New application arrives]
 Alert in feed + SMS             Open application card
 Review documents in-page        One-click approve/reject
         │
         ▼
[Approve: select vehicle + rate]
 Available vehicles dropdown     Rate picker ($300–$450)
 Auto-triggers: Stripe setup     PandaDoc agreement sent
 No manual follow-up needed
         │
         ▼
[Payment fails (Stripe webhook)]
 Red critical alert appears      SMS already sent to renter
 See renter contact details      One-tap to call or message
 Kill switch button available    Requires reason before activate
         │
         ▼
[Weekly: review revenue]
 Payments page                   Gross per vehicle
 Maintenance log                 Net after costs
```

---

## 3. Design System

### 3.1 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#007A87` | Teal — CTAs, links, active states |
| `--color-primary-dark` | `#005F6B` | Teal dark — hover states |
| `--color-primary-light` | `#E6F4F6` | Teal light — selected backgrounds |
| `--color-navy` | `#0D2B55` | Headers, admin sidebar, badges |
| `--color-navy-light` | `#1A3F73` | Navy hover |
| `--color-success` | `#16A34A` | Active rental, paid, approved |
| `--color-warning` | `#D97706` | Pending, upcoming payment |
| `--color-danger` | `#DC2626` | Critical alert, overdue, rejected |
| `--color-gray-50` | `#F9FAFB` | Page backgrounds |
| `--color-gray-100` | `#F3F4F6` | Card backgrounds |
| `--color-gray-200` | `#E5E7EB` | Borders |
| `--color-gray-500` | `#6B7280` | Secondary text |
| `--color-gray-900` | `#111827` | Primary text |
| `--color-white` | `#FFFFFF` | |

**Colour rules:**
- Teal is reserved for primary actions only — one CTA per screen
- Red appears ONLY for critical states. Never decorative.
- Green appears ONLY for success/active states. Never decorative.
- Admin sidebar: Navy. Renter portal: White with teal accents.

---

### 3.2 Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display (hero heading) | Inter | 800 | 36–48px |
| Page heading (H1) | Inter | 700 | 24–30px |
| Section heading (H2) | Inter | 600 | 18–20px |
| Card title | Inter | 600 | 16px |
| Body | Inter | 400 | 14–16px |
| Caption / label | Inter | 500 | 12px |
| Mono (plate numbers, IDs) | JetBrains Mono | 500 | 13px |

**Rules:**
- Plate numbers always in mono — never ambiguous
- All monetary values: bold, black, left-aligned
- Status badges: uppercase, 11px, letter-spacing 0.05em

---

### 3.3 Spacing System (4px base grid)

```
4px  → xs  (icon gap, tight labels)
8px  → sm  (internal card padding, list item gap)
12px → md  (form field gap)
16px → lg  (card padding default)
24px → xl  (section gap)
32px → 2xl (page section gap)
48px → 3xl (hero sections)
```

---

### 3.4 Component Specs

#### Button — Primary
```
Background:   #007A87
Text:         #FFFFFF, 14px, font-weight 600
Padding:      12px 24px
Border-radius: 8px
Hover:        background #005F6B, transition 150ms
Active:       scale(0.98)
Disabled:     opacity 0.4, cursor not-allowed
Min-width:    120px (never a tiny CTA)
Min-height:   44px (WCAG touch target)
```

#### Button — Secondary
```
Background:   transparent
Border:       1.5px solid #E5E7EB
Text:         #374151, 14px, font-weight 500
Padding:      12px 24px
Border-radius: 8px
Hover:        background #F9FAFB
```

#### Button — Danger (Kill Switch)
```
Background:   #DC2626
Text:         #FFFFFF, 14px, font-weight 700
Padding:      12px 24px
Border-radius: 8px
Hover:        background #B91C1C
Requires:     Confirmation modal before action fires
```

#### Status Badge
```
Border-radius: 9999px (pill)
Padding:       2px 10px
Font:          11px, uppercase, letter-spacing 0.05em, weight 600

active:        bg #DCFCE7, text #15803D
pending:       bg #FEF9C3, text #A16207
rented:        bg #DBEAFE, text #1D4ED8
rejected:      bg #FEE2E2, text #991B1B
terminated:    bg #F3F4F6, text #6B7280
```

#### Card
```
Background:    #FFFFFF
Border:        1px solid #E5E7EB
Border-radius: 12px
Padding:       20px
Shadow:        0 1px 3px rgba(0,0,0,0.06)
Hover (linked card): shadow 0 4px 12px rgba(0,0,0,0.08), translateY(-1px)
```

#### Form Input
```
Border:        1.5px solid #D1D5DB
Border-radius: 8px
Padding:       10px 14px
Font:          14px, #111827
Focus:         border-color #007A87, box-shadow 0 0 0 3px rgba(0,122,135,0.15)
Error:         border-color #DC2626, bg #FFF5F5
Height:        44px minimum (WCAG touch target)
```

#### Alert Banner (Admin)
```
Critical: left-border 4px #DC2626, bg #FFF5F5
Warning:  left-border 4px #D97706, bg #FFFBEB
Info:     left-border 4px #007A87, bg #E6F4F6
```

---

### 3.5 Icon System
Use **Lucide React** — consistent stroke width (1.5px), 20×20px default.
Key icons mapped to business concepts:

| Concept | Icon |
|---|---|
| Kill switch | `power` (red) |
| GPS / Location | `map-pin` |
| Alert | `triangle-alert` |
| Vehicle | `car` |
| Payment | `credit-card` |
| Renter | `user` |
| Document | `file-text` |
| Approved | `circle-check` |
| Rejected | `circle-x` |
| Pending | `clock` |
| Call renter | `phone` |

---

## 4. Screen Designs

### Screen 1 — Landing Page (Public)

**Primary user goal:** Convert a gig driver who found us on Facebook into an applicant.
**Success metric:** Application start rate ≥ 30% of landing page visitors.

```
┌────────────────────────────────────────────┐
│  EASY DRIVE          [Apply Now ↗]         │  ← Sticky nav, teal CTA always visible
├────────────────────────────────────────────┤
│                                            │
│  Drive more.                               │  ← H1: 40px bold, white on navy bg
│  No credit check.                          │
│  From $300/week.                           │
│                                            │
│  [Apply in 5 minutes →]                   │  ← Primary CTA: teal, large
│                                            │
│  ★ For Uber Eats · DoorDash · SkipThe...  │  ← Platform logos (trust)
└────────────────────────────────────────────┘
│                                            │
│  HOW IT WORKS                              │  ← 3-step horizontal (mobile: vertical)
│  ①Apply  ②Get approved  ③Pick up & earn   │
│                                            │
├────────────────────────────────────────────┤
│  PRICING                                   │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Economy      │  │ Mid-size     │        │
│  │ $300–$330/wk │  │ $370–$400/wk│        │
│  │ Corolla/Civic│  │ RAV4/CR-V   │        │
│  │ [Apply Now]  │  │ [Apply Now] │        │
│  └──────────────┘  └──────────────┘        │
│                                            │
│  All plans include:                        │
│  ✓ Unlimited mileage  ✓ Insurance          │
│  ✓ No hard credit check  ✓ GPS security   │
│  ✓ $500 refundable deposit                 │
│                                            │
├────────────────────────────────────────────┤
│  TRUST SIGNALS                             │
│  "Incorporated Ontario business"           │
│  "GPS + Kill switch security"              │
│  "Vehicles insured for delivery use"       │
│                                            │
├────────────────────────────────────────────┤
│  FAQ                                       │
│  ▸ Do you check credit?  ▸ What do I need?│
│  ▸ How does the deposit work?              │
│  ▸ Can I drive for Uber Eats?              │
│                                            │
├────────────────────────────────────────────┤
│  [Apply Now — Takes 5 minutes]             │  ← Bottom CTA repeat
│  WhatsApp us: +1 (XXX) XXX-XXXX           │
└────────────────────────────────────────────┘
```

**Mobile adaptations:**
- Hero: 36px heading, single column
- Pricing cards: full width, stacked
- Sticky bottom bar with "Apply Now" button on mobile
- WhatsApp chat button (floating, bottom-right)

---

### Screen 2 — Multi-Step Application Form

**Primary user goal:** Submit a complete application without abandoning.
**Success metric:** Form completion rate ≥ 70% of starts.

**Step indicators (persistent top bar):**
```
● ─── ○ ─── ○ ─── ○ ─── ○
1   2   3   4   5
Personal · Licence · Gig · Docs · Review
```

**Step 1 — Personal Info**
```
┌────────────────────────────────────────────┐
│ ← Back              Step 1 of 5           │
│                                            │
│ Tell us about yourself                     │
│                                            │
│ Full Name *                                │
│ [________________________]                 │
│                                            │
│ Phone Number *                             │
│ [+1 (___) ___-____      ]                 │
│ We'll send your approval by SMS            │
│                                            │
│ Email Address *                            │
│ [________________________]                 │
│                                            │
│                    [Continue →]            │
└────────────────────────────────────────────┘
```

**Step 4 — Document Upload (highest friction — special treatment)**
```
┌────────────────────────────────────────────┐
│ ← Back              Step 4 of 5           │
│                                            │
│ Upload your documents                      │
│ Stored securely · Only seen by Easy Drive │
│                                            │
│ 📷 Government ID (front)                  │
│ ┌──────────────────────────────────────┐   │
│ │    📸 Tap to take photo or upload    │   │  ← camera capture on mobile
│ └──────────────────────────────────────┘   │
│                                            │
│ 📄 Ontario Driver Abstract                 │
│ ┌──────────────────────────────────────┐   │
│ │    📎 Upload PDF from MTO            │   │
│ │    How to get yours →                │   │  ← inline help link
│ └──────────────────────────────────────┘   │
│                                            │
│ 📱 Gig Account Screenshot                 │
│ ┌──────────────────────────────────────┐   │
│ │    📸 Tap to take screenshot         │   │
│ │    Must show your name + active status│   │
│ └──────────────────────────────────────┘   │
│                                            │
│                    [Continue →]            │
└────────────────────────────────────────────┘
```

**Step 5 — Review + Submit**
```
┌────────────────────────────────────────────┐
│ ← Back              Step 5 of 5           │
│                                            │
│ Review your application                    │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ Kwame Asante                 ✏ Edit  │   │
│ │ +1 (416) 555-0192                    │   │
│ │ kwame@email.com                      │   │
│ │ Licence G · 0 at-fault              │   │
│ │ Platform: Uber Eats                  │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ Documents                                  │
│ ✓ Government ID uploaded                   │
│ ✓ Driver Abstract uploaded                 │
│ ✓ Gig account screenshot uploaded          │
│                                            │
│ ───────────────────────────────────────    │
│ By submitting you confirm you have read    │
│ and agree to the GPS tracking notice and   │
│ ignition interrupt disclosure.             │
│ [Read full terms]                          │
│                                            │
│         [Submit Application]               │  ← teal, full-width on mobile
└────────────────────────────────────────────┘
```

---

### Screen 3 — Application Submitted (Confirmation)

**Primary user goal:** Set expectations; reduce anxiety about wait time.
**Empty state design principle:** Tell the user exactly what happens next.

```
┌────────────────────────────────────────────┐
│                                            │
│              ✅                            │
│         Application Received               │
│                                            │
│  Thanks, Kwame! We've received your        │
│  application and will review it within     │
│  24 hours.                                 │
│                                            │
│  ─────────── What happens next ─────────  │
│                                            │
│  ① We review your documents           ✓   │
│  ② You get an SMS with our decision   …   │
│  ③ Sign your rental agreement         …   │
│  ④ Pick up your vehicle               …   │
│                                            │
│  Questions? WhatsApp us:                   │
│  [💬 Message Easy Drive]                   │
│                                            │
└────────────────────────────────────────────┘
```

---

### Screen 4 — Renter Portal Dashboard

**Primary user goal:** Know at a glance: is my rental active, what do I owe, when is it due?
**Success metric:** Support contacts about "what's my payment status" drop to near zero.

```
┌────────────────────────────────────────────┐
│ Easy Drive          Hi Kwame 👋            │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  YOUR RENTAL                         │  │
│  │  2019 Toyota Corolla                 │  │
│  │  🔵 BKNY-247          [ACTIVE]       │  │  ← plate in mono, status badge
│  │                                      │  │
│  │  Since: April 8, 2026               │  │
│  │  Rate:  $330 / week                  │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  NEXT PAYMENT                              │
│  ┌──────────────────────────────────────┐  │
│  │  $330 due in 4 days                  │  │
│  │  April 15, 2026                      │  │
│  │  Card ending in ···· 4242            │  │
│  │                    [Update card →]   │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  QUICK ACTIONS                             │
│  [📄 View Agreement] [📞 Contact Us]      │
│  [💳 Payment History]                     │
│                                            │
│  IMPORTANT REMINDERS                       │
│  • Vehicle stays in Ontario at all times   │
│  • Report any accident within 1 hour       │
│  • Give 72 hours notice to end rental      │
│                                            │
└────────────────────────────────────────────┘
```

**States to design:**
- Pending payment setup → "Complete setup" CTA
- Pending signature → "Sign your agreement" CTA
- Payment failed → Red banner: "Action required" with update card link
- Rental ended → "Apply again" CTA

---

### Screen 5 — Admin Dashboard

**Primary user goal:** See everything critical without scrolling.
**Success metric:** Admin can action any alert within 60 seconds of opening app.

```
┌──────────────┬─────────────────────────────────────────┐
│ EASY DRIVE   │   Dashboard                             │
│ ──────────── │ ─────────────────────────────────────── │
│ 🏠 Dashboard │ ┌────────┐┌────────┐┌────────┐┌──────┐ │
│ 🚗 Fleet     │ │Active  ││Avail.  ││Alerts  ││Month.│ │
│ 📋 Apply     │ │  2     ││  0     ││  1 🔴  ││$2.6K │ │
│ 💳 Payments  │ └────────┘└────────┘└────────┘└──────┘ │
│ ⚙️ Settings  │                                         │
│              │ ┌──────────────────┐ ┌────────────────┐ │
│              │ │ LIVE ALERTS      │ │ ACTIVE RENTALS │ │
│              │ │ ─────────────── │ │ ─────────────  │ │
│              │ │ 🔴 BKNY-247      │ │ Kwame Asante   │ │
│              │ │ Geofence breach  │ │ BKNY-247       │ │
│              │ │ Left Ontario 2m  │ │ $330/wk        │ │
│              │ │ [View] [Dismiss] │ │ [View →]       │ │
│              │ │                 │ │                │ │
│              │ │ ✅ No more alerts│ │ [View fleet →] │ │
│              │ └──────────────── ┘ └────────────────┘ │
└──────────────┴─────────────────────────────────────────┘
```

---

### Screen 6 — Admin: Application Review

**Primary user goal:** Review all documents and approve/reject in under 2 minutes.
**Design principle:** All information on one screen — no tab switching.

```
┌────────────────────────────────────────────────────────┐
│ ← Applications     Kwame Asante           [PENDING]    │
├─────────────────────────────┬──────────────────────────┤
│ APPLICANT INFO              │ DOCUMENTS                │
│ ─────────────────────────── │ ─────────────────────── │
│ 📞 +1 (416) 555-0192        │ [ID Photo]  [Abstract]  │
│ ✉  kwame@email.com          │ [Gig Screenshot]        │
│ 🪪 Licence G                │                         │
│ 🚗 0 at-fault accidents     │ Click to open full size │
│ 🟢 No suspension            │                         │
│ 📱 Uber Eats                │                         │
├─────────────────────────────┴──────────────────────────┤
│ QUICK CHECKS                                           │
│ ✅ Licence not suspended    ✅ <3 at-fault accidents   │
│ ✅ Active gig account       ✅ Documents uploaded      │
├────────────────────────────────────────────────────────┤
│ APPROVE RENTAL              │  REJECT APPLICATION     │
│ ──────────────────────────  │  ───────────────────    │
│ Vehicle: [Select vehicle ▾] │                         │
│ 2019 Toyota Corolla         │  Reason (required):     │
│ BKNY-247 · Available        │  [___________________]  │
│                             │                         │
│ Weekly Rate:                │                         │
│ [$300][●$330][$370][$400]  │  [Reject Application]   │
│                             │                         │
│ [✓ Approve & Send Agreement]│                         │
└────────────────────────────────────────────────────────┘
```

---

### Screen 7 — Admin: Rental Detail + Kill Switch

**Primary user goal:** See renter, vehicle, payment status, and control the vehicle if needed.
**Highest-stakes screen:** Kill switch requires deliberate confirmation — no accidental taps.

```
┌────────────────────────────────────────────────────────┐
│ ← Rentals   Kwame Asante / BKNY-247        [ACTIVE]   │
├────────────────────────────────────────────────────────┤
│ RENTER                        VEHICLE                  │
│ Kwame Asante                  2019 Toyota Corolla      │
│ +1 (416) 555-0192 [📞 Call]  BKNY-247 · Grey          │
│ kwame@email.com               Kill switch: OFF 🟢      │
│ Uber Eats                     GPS: Active              │
│                               Last seen: 12 min ago    │
│                               37.4°N, -79.3°W (Ontario)│
├────────────────────────────────────────────────────────┤
│ PAYMENTS                                               │
│ ✅ Apr 8    $330 paid   ✅ Apr 15   $330 paid          │
│ ⏳ Apr 22   $330 due in 3 days                        │
│ 🔒 Deposit  $500 on hold                              │
├────────────────────────────────────────────────────────┤
│ VEHICLE CONTROL                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │  ⚠️  IGNITION INTERRUPT (KILL SWITCH)            │  │
│ │  Status: DISABLED (vehicle can start normally)   │  │
│ │                                                  │  │
│ │  Reason for activation (required):               │  │
│ │  [____________________________________________]   │  │
│ │                                                  │  │
│ │        [ 🔴 Enable Kill Switch ]                 │  │  ← disabled until reason entered
│ │                                                  │  │
│ │  ⚠️ Renter will be notified by SMS               │  │
│ │  ⚠️ Vehicle will not restart after next shutoff  │  │
│ └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│ [📄 View Agreement]  [🔚 End Rental]  [⚙ Maintenance] │
└────────────────────────────────────────────────────────┘
```

**Kill switch confirmation modal (fires on button click):**
```
┌──────────────────────────────────────────┐
│  ⚠️ Confirm Kill Switch Activation       │
│                                          │
│  You are about to remotely disable       │
│  vehicle BKNY-247.                       │
│                                          │
│  • Renter Kwame Asante will be notified  │
│  • Vehicle will not restart after shutoff│
│  • This action is logged and audited     │
│                                          │
│  Reason: [non-payment — 3 days overdue]  │
│                                          │
│  [Cancel]        [Confirm — Activate]    │
└──────────────────────────────────────────┘
```

---

## 5. Empty States & Error States

### Empty States

| Screen | Empty State Message |
|---|---|
| Admin alerts feed | "✅ All clear — no unacknowledged alerts" |
| Admin applications | "No pending applications. Share your link to get started." |
| Admin fleet | "No vehicles yet. Add your first vehicle to get started." |
| Renter payment history | "No payments yet — your first payment will appear here." |
| Renter portal (no active rental) | "You don't have an active rental. [Apply Now]" |

### Error States

| Scenario | Error Message |
|---|---|
| Application: suspended licence | "We're unable to accept applications with a currently suspended licence." |
| Application: 3+ at-fault accidents | "We require fewer than 3 at-fault accidents in the past 3 years." |
| Application: already submitted | "You already have a pending application. We'll contact you within 24 hours." |
| Payment method: card declined | "Your payment didn't go through. Please update your card to avoid service interruption." |
| Document upload failed | "Upload failed — file must be under 10MB. Try again or WhatsApp us the file directly." |
| GPS offline | "Vehicle GPS signal lost. Last known location: [date/time]. Contact renter if needed." |

---

## 6. Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|---|---|
| Colour contrast | All text on white: minimum 4.5:1 ratio. Teal (#007A87) on white = 4.8:1 ✓ |
| Touch targets | All buttons and inputs: minimum 44×44px |
| Focus states | Visible ring on all interactive elements (3px teal ring) |
| Form labels | Every input has an associated `<label>` — never placeholder-only |
| Error messages | Announced via `aria-live="polite"` — screen reader compatible |
| Loading states | Spinner + "Loading…" text — never silent |
| Images | All document thumbnails have descriptive `alt` text |
| Language | `lang="en"` on `<html>`; plain language throughout |

---

## 7. Mobile-First Breakpoints

| Breakpoint | Value | Notes |
|---|---|---|
| Mobile (default) | < 640px | Primary design surface for renters |
| Tablet | 640px–1024px | Application form at full width |
| Desktop | > 1024px | Admin dashboard 2-column layout |

**Mobile-specific patterns:**
- Sticky "Apply Now" bar: fixed bottom, full width, z-50
- WhatsApp float button: fixed bottom-right, 56×56px
- Admin sidebar collapses to bottom tab bar on mobile
- File upload: `capture="environment"` for in-browser camera
- Phone input: `inputmode="tel"` for numeric keyboard

---

## 8. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Landing → application start | ≥ 30% | Google Analytics event |
| Application form completion | ≥ 70% | Step abandonment funnel |
| Application → approval time | < 24 hours | Supabase timestamp delta |
| Support contacts per renter/week | < 0.5 | WhatsApp message volume |
| Admin time per application review | < 2 minutes | Session recording (Hotjar) |
| Payment failure resolution time | < 48 hours | Alert → payment success delta |
| Renter portal weekly active use | ≥ 60% of active renters | Supabase auth event |

---

*Easy Drive UX designed under the Lead Product Designer framework.*
*All components are WCAG 2.1 AA compliant. Design iterates on real usage data.*
*Document version controlled in: `c:/projects/easy drive/UX_DESIGN.md`*

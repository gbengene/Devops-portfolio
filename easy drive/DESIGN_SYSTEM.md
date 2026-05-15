# Easy Drive — Authoritative Design System

**Version:** 1.0  
**Date:** 2026-05-14  
**Status:** Active — Single Source of Truth for Web and React Native (Expo)  
**Owner:** Product Design

This document resolves all outstanding design conflicts between the web implementation and the cross-platform React Native build. Every value here supersedes anything in `globals.css` or inline JSX styles. The software engineer must derive all visual tokens from `src/lib/theme.ts` going forward.

---

## Section 1: Colour Palette (Resolved)

### Decision: Two-Tier Teal System

The conflict between `#007A87` (CSS tokens) and `#00C2D4` (Design A landing page) is resolved by assigning each a distinct, non-overlapping role. Neither colour is deprecated. Both are canonical.

| Role | Token Name | Hex | Use Case |
|---|---|---|---|
| Brand Primary | `brand.primary` | `#007A87` | Buttons on light backgrounds, form focus rings, web cards, trust-critical UI, body links |
| Brand Primary Dark | `brand.primaryDark` | `#005F6B` | Hover/pressed state of `brand.primary` |
| Brand Primary Light | `brand.primaryLight` | `#E6F4F6` | Tinted backgrounds, selected row highlights, pill badges on light surfaces |
| Brand Accent | `brand.accent` | `#00C2D4` | Hero section CTA buttons, text highlights on dark backgrounds, tab bar active icon, glowing ring on kill switch alert |
| Brand Accent Dark | `brand.accentDark` | `#0099A8` | Hover/pressed state of `brand.accent` on dark surfaces |
| Navy Base | `navy.base` | `#0D2B55` | Web navbar background, trust section backgrounds, footer |
| Navy Deep | `navy.deep` | `#081D3A` | Darkest navy — used sparingly for depth layering |
| Navy Light | `navy.light` | `#1A4080` | Navy hover state, secondary navy surfaces |
| Success | `semantic.success` | `#22C55E` | GPS active badge, payment confirmed, booking accepted |
| Warning | `semantic.warning` | `#F59E0B` | Pending review, approaching payment due, low availability |
| Danger | `semantic.danger` | `#EF4444` | Kill switch activation, overdue payment, declined booking |
| Info | `semantic.info` | `#3B82F6` | Informational banners, neutral status, new message indicator |
| Surface Default (web light) | `surface.default` | `#FFFFFF` | Web page background, card backgrounds in light mode |
| Surface Subtle (web light) | `surface.subtle` | `#F8FAFC` | Alternate row, section divider zone |
| Surface Card (web light) | `surface.card` | `#FFFFFF` | Card component background |
| Surface Hero (web dark / mobile dark) | `surface.hero` | `#0A0A0A` | Full-bleed hero sections, mobile screen background |
| Surface Overlay | `surface.overlay` | `rgba(0,0,0,0.70)` | Overlay on hero images (mobile: replaces backdrop-blur) |
| Surface Mobile Screen | `surface.mobileScreen` | `#111111` | Default mobile screen background (matches Design A near-black) |
| Surface Mobile Card | `surface.mobileCard` | `#1C1C1E` | iOS-style dark card on mobile |
| Text Primary | `text.primary` | `#0F172A` | Body text on light surfaces |
| Text Secondary | `text.secondary` | `#334155` | Subheadings, supporting text on light surfaces |
| Text Muted | `text.muted` | `#94A3B8` | Placeholder text, inactive tab labels, disabled states |
| Text On Dark | `text.onDark` | `#F1F5F9` | All text rendered on dark/hero surfaces |
| Text On Accent | `text.onAccent` | `#000000` | Text rendered directly on `brand.accent` backgrounds (high contrast) |

### Ruling on When to Use Each Teal

- Use `brand.primary` (`#007A87`) anywhere the background is white, light grey, or navy. This includes web page buttons, form inputs, links, and any UI that must convey trust and professionalism.
- Use `brand.accent` (`#00C2D4`) anywhere the background is near-black (`#0A0A0A`, `#111111`, `#000000`). This includes the landing page hero CTA, mobile tab bar active state, and safety-critical action confirmation rings.
- Never place `brand.accent` on a white background — it fails contrast at small sizes (WCAG AA). Always use `brand.primary` in that context.

### TypeScript Constants (copy into `src/lib/theme.ts`)

```typescript
export const colors = {
  brand: {
    primary: '#007A87',
    primaryDark: '#005F6B',
    primaryLight: '#E6F4F6',
    accent: '#00C2D4',
    accentDark: '#0099A8',
  },
  navy: {
    base: '#0D2B55',
    deep: '#081D3A',
    light: '#1A4080',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  surface: {
    default: '#FFFFFF',
    subtle: '#F8FAFC',
    card: '#FFFFFF',
    hero: '#0A0A0A',
    overlay: 'rgba(0,0,0,0.70)',
    mobileScreen: '#111111',
    mobileCard: '#1C1C1E',
  },
  text: {
    primary: '#0F172A',
    secondary: '#334155',
    muted: '#94A3B8',
    onDark: '#F1F5F9',
    onAccent: '#000000',
  },
} as const;
```

---

## Section 2: Typography Scale

The landing page correctly uses `text-7xl font-black` on web — this is intentional and stays. On mobile (375px viewport), that same headline becomes 40px to remain legible without overflowing. All mobile sizes are derived by scaling web sizes down by approximately 45–55% for the largest tokens, converging toward parity at body text sizes.

Font family: **Inter** (web via `next/font/google`, mobile via `expo-google-fonts/inter` or bundled OTF).

| Token | Web Tailwind Class | Web px | Mobile RN fontSize | Weight | Line Height | Use |
|---|---|---|---|---|---|---|
| `display` | `text-7xl` | 72px | 40px | 900 | 1.05 | Hero headline (web landing page only at 72px) |
| `h1` | `text-4xl` | 36px | 28px | 800 | 1.15 | Page and section headlines |
| `h2` | `text-2xl` | 24px | 22px | 700 | 1.25 | Card headings, modal titles |
| `h3` | `text-xl` | 20px | 18px | 600 | 1.3 | Sub-section labels, list group headers |
| `body.lg` | `text-lg` | 18px | 16px | 400 | 1.6 | Lead paragraph text |
| `body.md` | `text-base` | 16px | 15px | 400 | 1.6 | Default body text |
| `body.sm` | `text-sm` | 14px | 13px | 400 | 1.5 | Secondary body, form help text |
| `caption` | `text-xs` | 12px | 11px | 400 | 1.4 | Timestamps, legal footnotes, badge labels |
| `label` | `text-sm` | 14px | 14px | 600 | 1.2 | Form field labels, tab bar labels |
| `button.lg` | `text-base` | 16px | 16px | 700 | 1.0 | Large CTA buttons |
| `button.md` | `text-sm` | 14px | 14px | 600 | 1.0 | Standard buttons |
| `overline` | `text-xs uppercase tracking-widest` | 11px | 11px | 700 | 1.0 | Section kickers ("FOR HOSTS", "HOW IT WORKS") |

### TypeScript Constants

```typescript
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    display: { web: 72, mobile: 40 },
    h1:      { web: 36, mobile: 28 },
    h2:      { web: 24, mobile: 22 },
    h3:      { web: 20, mobile: 18 },
    bodyLg:  { web: 18, mobile: 16 },
    bodyMd:  { web: 16, mobile: 15 },
    bodySm:  { web: 14, mobile: 13 },
    caption: { web: 12, mobile: 11 },
    label:   { web: 14, mobile: 14 },
    buttonLg:{ web: 16, mobile: 16 },
    buttonMd:{ web: 14, mobile: 14 },
    overline:{ web: 11, mobile: 11 },
  },
  fontWeight: {
    black:      '900',
    extraBold:  '800',
    bold:       '700',
    semiBold:   '600',
    regular:    '400',
  },
  lineHeight: {
    tight:  1.05,
    snug:   1.15,
    normal: 1.5,
    relaxed:1.6,
  },
} as const;
```

---

## Section 3: Spacing and Border Radius

These values are shared identically between web and mobile. On web, multiply by 1px for CSS. On mobile, pass directly to React Native `StyleSheet` as numeric pixel values (RN uses logical pixels).

### TypeScript Constants

```typescript
export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm:   6,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl':24,
  full: 9999,
} as const;
```

### Web CSS Custom Properties (derived — add to `globals.css`)

```css
/* Derived from src/lib/theme.ts — DO NOT edit hex values here directly.
   Edit theme.ts and update these to match. */
:root {
  /* Brand */
  --color-brand-primary:       #007A87;
  --color-brand-primary-dark:  #005F6B;
  --color-brand-primary-light: #E6F4F6;
  --color-brand-accent:        #00C2D4;
  --color-brand-accent-dark:   #0099A8;

  /* Navy */
  --color-navy-base:  #0D2B55;
  --color-navy-deep:  #081D3A;
  --color-navy-light: #1A4080;

  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger:  #EF4444;
  --color-info:    #3B82F6;

  /* Surface */
  --surface-default:      #FFFFFF;
  --surface-subtle:       #F8FAFC;
  --surface-card:         #FFFFFF;
  --surface-hero:         #0A0A0A;

  /* Text */
  --text-primary:   #0F172A;
  --text-secondary: #334155;
  --text-muted:     #94A3B8;
  --text-on-dark:   #F1F5F9;
  --text-on-accent: #000000;

  /* Spacing */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Radius */
  --radius-sm:  6px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-2xl: 24px;
}
```

---

## Section 4: Navigation Structure

### Web (unchanged)

Sticky top navbar at `z-index: 50`. Background: `navy.base` (`#0D2B55`) with `border-bottom: 1px solid rgba(255,255,255,0.08)`.

| Slot | Label | Destination | Notes |
|---|---|---|---|
| Left | EasyDrive logo | `/` | SVG wordmark, `brand.accent` teal stroke |
| Centre-left | Find a car | `/browse` | Ghost link, `text.onDark` |
| Centre-right | List your car | `/host/listings/new` | Ghost link, `text.onDark` |
| Right | Sign in | `/login` | Filled button, `brand.primary` bg |

### Mobile — Tab Bar Specification

Tab bar sits at the bottom of the screen. Height: **56px** (logical pixels) plus the device safe area inset (handled automatically by React Navigation's `tabBarStyle` with `paddingBottom: insets.bottom`).

Visual spec:
- Background: `surface.mobileCard` (`#1C1C1E`)
- Top border: `1px solid rgba(255,255,255,0.08)`
- Active icon + label colour: `brand.accent` (`#00C2D4`)
- Inactive icon + label colour: `text.muted` (`#94A3B8`)
- Label font: `typography.label` — 14px, weight 600
- Icon size: 24px

#### Host Tab Bar (4 tabs)

```
┌──────────┬──────────┬──────────┬──────────┐
│  Home    │ Listings │ Bookings │ Earnings │
│  (icon)  │  (icon)  │  (icon)  │  (icon)  │
└──────────┴──────────┴──────────┴──────────┘
```

| Tab | Icon (expo/vector-icons) | Route | Screen |
|---|---|---|---|
| Dashboard | `home-outline` / `home` (active) | `/host` | Host home with earnings summary |
| Listings | `car-outline` / `car` (active) | `/host/listings` | Vehicle listing management |
| Bookings | `calendar-outline` / `calendar` (active) | `/host/bookings` | Incoming + active bookings |
| Earnings | `cash-outline` / `cash` (active) | `/host/earnings` | Payout history and schedule |

#### Renter Tab Bar (4 tabs)

```
┌──────────┬──────────┬──────────┬──────────┐
│  Browse  │ Bookings │  Profile │ Messages │
│  (icon)  │  (icon)  │  (icon)  │  (icon)  │
└──────────┴──────────┴──────────┴──────────┘
```

| Tab | Icon | Route | Screen |
|---|---|---|---|
| Browse | `search-outline` / `search` (active) | `/renter/browse` | Vehicle search and filter |
| My Bookings | `document-text-outline` / `document-text` (active) | `/renter/bookings` | Active + past rentals |
| Profile | `person-outline` / `person` (active) | `/renter/profile` | Account, documents, payment |
| Messages | `chatbubble-outline` / `chatbubble` (active) | `/renter/messages` | Host-renter messaging |

#### Unauthenticated (Stack Navigator — no tab bar)

```
Welcome Screen
    |
    v
Role Selection  (Host or Renter)
    |                |
    v                v
Host Apply     Renter Register
    |                |
    v                v
   Login / Verify Email
```

---

## Section 5: Key Mobile Screen Wireframes

All wireframes are designed for a 375 x 812px logical screen (iPhone SE 3 / base Android). Safe areas are noted where relevant. Dark theme applies throughout mobile (background: `#111111`).

---

### Screen 1: Welcome / Onboarding

```
┌─────────────────────────────────────┐
│                                     │
│   [FULL SCREEN BACKGROUND IMAGE]    │
│   night highway / GTA skyline       │
│   ImageBackground fills screen      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  rgba(0,0,0,0.55) overlay   │   │
│   │                             │   │
│   │                             │   │
│   │   EasyDrive                 │   │
│   │   (wordmark, white, 32px    │   │
│   │    font-weight 800)         │   │
│   │                             │   │
│   │   Your car. Their ride.     │   │
│   │   Everyone wins.            │   │
│   │   (16px, onDark, relaxed)   │   │
│   │                             │   │
│   │                             │   │
│   │  ┌───────────────────────┐  │   │
│   │  │    List your car      │  │   │
│   │  │  [brand.accent bg,    │  │   │
│   │  │   black text, h=52px] │  │   │
│   │  └───────────────────────┘  │   │
│   │                             │   │
│   │  ┌───────────────────────┐  │   │
│   │  │    Find a car         │  │   │
│   │  │  [outline, accent     │  │   │
│   │  │   border, white text, │  │   │
│   │  │   h=52px]             │  │   │
│   │  └───────────────────────┘  │   │
│   │                             │   │
│   │  Already have an account?   │   │
│   │  Sign in  (accent, 14px)    │   │
│   │                             │   │
│   │  [safe area bottom pad]     │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

Notes: No navbar. No tab bar. Stack navigator root. Background image uses `ImageBackground` (RN). Overlay is a `View` with `backgroundColor: 'rgba(0,0,0,0.55)'` — no blur (Android incompatibility). Buttons are full-width with `borderRadius: radius.lg` (12px).

---

### Screen 2: Renter Browse (Vehicle Listing)

```
┌─────────────────────────────────────┐
│  [STATUS BAR]                       │
├─────────────────────────────────────┤
│  Find your car           [Profile]  │
│  (h2, onDark, 22px bold)   (icon)  │
├─────────────────────────────────────┤
│  FILTER CHIPS (horizontal scroll)   │
│  ┌──────┐ ┌───────┐ ┌──────────┐   │
│  │ All  │ │ Sedan │ │  SUV     │   │
│  └──────┘ └───────┘ └──────────┘   │
│  ┌───────────┐ ┌─────────────────┐  │
│  │ < $350/wk │ │  GPS Verified   │  │
│  └───────────┘ └─────────────────┘  │
├─────────────────────────────────────┤
│  ScrollView                         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [VEHICLE PHOTO — 375x200px]  │  │
│  │  surface.mobileCard bg        │  │
│  │  borderRadius: radius.lg      │  │
│  ├───────────────────────────────┤  │
│  │  2022 Toyota Camry  LE        │  │
│  │  (h2, onDark)                 │  │
│  │                               │  │
│  │  Scarborough, ON              │  │
│  │  (bodySm, text.muted)         │  │
│  │                               │  │
│  │  [GPS Badge] [Kill Switch]    │  │
│  │  (success green pill)         │  │
│  │                               │  │
│  │  $350 / week  [Book Now >]    │  │
│  │  (h3, onDark) (accent btn)    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [VEHICLE PHOTO — 375x200px]  │  │
│  │                               │  │
│  │  2021 Honda Civic  LX         │  │
│  │  North York, ON               │  │
│  │  [GPS Badge]                  │  │
│  │  $300 / week  [Book Now >]    │  │
│  └───────────────────────────────┘  │
│                                     │
│  [load more...]                     │
│  [TAB BAR + SAFE AREA]              │
└─────────────────────────────────────┘
```

Notes: Filter chips scroll horizontally with `FlatList horizontal`. Active chip uses `brand.accent` background with `text.onAccent` label. Inactive chip uses `surface.mobileCard` border with `text.muted` label. Each vehicle card is a `Pressable` with `onPress` navigating to Screen 3.

---

### Screen 3: Vehicle Detail

```
┌─────────────────────────────────────┐
│  [STATUS BAR]                       │
├─────────────────────────────────────┤
│  [<]  Vehicle Details    [Share]    │
│  (back arrow)            (icon)    │
├─────────────────────────────────────┤
│  [PHOTO CAROUSEL — 375x240px]       │
│  FlatList horizontal, paginated     │
│  [dot indicator — 3 dots below]     │
├─────────────────────────────────────┤
│  ScrollView                         │
│                                     │
│  2022 Toyota Camry LE               │
│  (h1, 28px, onDark, weight 800)     │
│                                     │
│  ★★★★☆  4.8  (42 reviews)           │
│  (bodySm, muted)                    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [GPS Verified]  [Kill Switch]      │
│  (success pill)  (info pill)        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  VEHICLE INFO                       │
│  (overline, muted)                  │
│                                     │
│  Year       2022                    │
│  Colour     Midnight Black          │
│  City       Scarborough, ON         │
│  Ideal for  Uber, Lyft, DoorDash    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  HOST                               │
│  (overline, muted)                  │
│                                     │
│  [Avatar]  Marcus T.               │
│            Member since 2024        │
│            ★ 4.9 host rating        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  AVAILABILITY                       │
│  Available from  May 20, 2026       │
│  Min. rental     1 week             │
│                                     │
│  [safe area padding]                │
├─────────────────────────────────────┤
│  STICKY BOTTOM BAR (above tab bar)  │
│  $350 / week    [Request Booking]   │
│  (h2, onDark)   (accent, full-w)   │
│  [TAB BAR + SAFE AREA]              │
└─────────────────────────────────────┘
```

Notes: Photo carousel uses `FlatList` with `pagingEnabled`. The "Request Booking" CTA is in a sticky `View` pinned above the tab bar using `position: absolute; bottom: tabBarHeight`. Price + CTA never scroll away.

---

### Screen 4: Host Dashboard

```
┌─────────────────────────────────────┐
│  [STATUS BAR — dark]                │
├─────────────────────────────────────┤
│  Good morning, Marcus               │
│  (h2, onDark)                       │
│  Thursday, May 14                   │
│  (bodySm, muted)                    │
├─────────────────────────────────────┤
│  ScrollView                         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  EARNINGS THIS WEEK           │  │
│  │  (overline, accent)           │  │
│  │                               │  │
│  │       $700.00                 │  │
│  │  (display-sized, onDark, 40px)│  │
│  │                               │  │
│  │  From 2 active bookings       │  │
│  │  (bodySm, muted)              │  │
│  │                               │  │
│  │  [View Earnings Breakdown >]  │  │
│  │  (accent text link)           │  │
│  └───────────────────────────────┘  │
│  (surface.mobileCard, radius.xl)    │
│                                     │
│  QUICK ACTIONS                      │
│  (overline, muted)                  │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │  [car icon] │  │ [cal icon]  │  │
│  │  My         │  │  Manage     │  │
│  │  Listings   │  │  Bookings   │  │
│  └─────────────┘  └─────────────┘  │
│  (2-column grid, mobileCard bg)     │
│                                     │
│  RECENT ALERTS                      │
│  (overline, muted)                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [!]  Payment due in 2 days   │  │
│  │       Civic — Jordan A.       │  │
│  │       (warning amber dot)     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [i]  New booking request     │  │
│  │       Camry — Priya S.        │  │
│  │       Tap to review           │  │
│  └───────────────────────────────┘  │
│                                     │
│  [TAB BAR + SAFE AREA]              │
└─────────────────────────────────────┘
```

Notes: Earnings card has a subtle `brand.accent` left border (4px) to distinguish it as a priority metric. Alert rows use a coloured left-border dot system — `semantic.warning` for payment due, `semantic.info` for new requests, `semantic.danger` for overdue.

---

### Screen 5: Host Kill Switch Panel

Safety-critical UI. This screen requires deliberate friction to prevent accidental activation.

```
┌─────────────────────────────────────┐
│  [STATUS BAR — dark]                │
├─────────────────────────────────────┤
│  [X]  Remote Immobilisation         │
│  (close btn)  (h2, danger red)      │
├─────────────────────────────────────┤
│  ScrollView                         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  VEHICLE                      │  │
│  │  2022 Toyota Camry LE         │  │
│  │  Plate: XXXX 000              │  │
│  │  (body, onDark)               │  │
│  │                               │  │
│  │  CURRENT RENTER               │  │
│  │  Jordan A.  (first name only) │  │
│  │  Booking active since May 12  │  │
│  └───────────────────────────────┘  │
│  (surface.mobileCard, radius.lg)    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [!] LEGAL WARNING            │  │
│  │  (danger.background tinted)   │  │
│  │                               │  │
│  │  Remotely immobilising a      │  │
│  │  moving vehicle may violate   │  │
│  │  provincial law. Only use if  │  │
│  │  the vehicle is stationary    │  │
│  │  and reported stolen.         │  │
│  │  (bodySm, onDark)             │  │
│  └───────────────────────────────┘  │
│                                     │
│  REASON FOR ACTIVATION              │
│  (label, muted)                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ( ) Reported stolen          │  │
│  │  ( ) Renter unresponsive      │  │
│  │  ( ) Payment default          │  │
│  │  ( ) Other (see notes)        │  │
│  └───────────────────────────────┘  │
│  (radio group — must select one)    │
│                                     │
│  NOTES (optional)                   │
│  ┌───────────────────────────────┐  │
│  │  Describe the situation...    │  │
│  │  (TextInput, multiline, 3     │  │
│  │   rows, mobileCard bg)        │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  STICKY BOTTOM — above safe area    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │    IMMOBILISE VEHICLE         │  │
│  │  (semantic.danger bg, #EF4444)│  │
│  │  (full-width, h=56px,         │  │
│  │   weight 700, white text)     │  │
│  │  DISABLED until reason chosen │  │
│  └───────────────────────────────┘  │
│                                     │
│  Triggering immobilisation logs     │
│  your identity and timestamp.       │
│  (caption, muted, centred)          │
│  [SAFE AREA]                        │
└─────────────────────────────────────┘
```

Interaction spec:
- "Immobilise Vehicle" button is `disabled` (opacity 0.4) until a reason radio option is selected.
- On press: trigger `expo-haptics` `notificationAsync(NotificationFeedbackType.Warning)` BEFORE showing confirmation.
- Show a second confirmation `Alert.alert` with title "Confirm Immobilisation" and two options: "Cancel" (default) and "Confirm — Immobilise" (destructive style).
- On confirm: API call to GPS provider kill switch endpoint. Show full-screen loading overlay. On success: navigate to a "Immobilisation Active" status screen.

---

### Screen 6: Active Booking — Renter View

```
┌─────────────────────────────────────┐
│  [STATUS BAR]                       │
├─────────────────────────────────────┤
│  [<]  Active Rental                 │
│  (back arrow, h2, onDark)           │
├─────────────────────────────────────┤
│  [VEHICLE PHOTO — 375x200px]        │
│  (Image, borderRadius 0 — full bleed│
│   at this context)                  │
├─────────────────────────────────────┤
│  ScrollView                         │
│                                     │
│  2022 Toyota Camry LE               │
│  (h1, 28px, onDark, weight 800)     │
│                                     │
│  Plate: XXXX 000                    │
│  (bodySm, muted)                    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  YOUR HOST                          │
│  (overline, muted)                  │
│                                     │
│  [Avatar]  Marcus                   │
│            (first name only)        │
│  [Message]  (accent text button)    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  NEXT PAYMENT                       │
│  (overline, muted)                  │
│                                     │
│  $350.00  due  May 19, 2026         │
│  (h2, warning amber if < 3 days)    │
│                                     │
│  [Pay Now]  (accent button)         │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  GPS STATUS                         │
│  (overline, muted)                  │
│                                     │
│  [green dot]  Vehicle tracking      │
│               is active             │
│  (bodySm, success green)            │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  RETURN INSTRUCTIONS                │
│  (overline, muted)                  │
│                                     │
│  Return to host by May 26 at 10AM   │
│  Location: 123 Host St, Scarborough │
│  Fuel policy: Return at same level  │
│                                     │
│  [Contact Host]  (ghost button)     │
│                                     │
│  [TAB BAR + SAFE AREA]              │
└─────────────────────────────────────┘
```

Notes: Next Payment amount colour changes to `semantic.warning` (`#F59E0B`) when due date is within 3 days. GPS Status dot is `semantic.success` (`#22C55E`) when active, `semantic.danger` when offline. Host first name only — never last name or contact info beyond in-app messaging.

---

### Screen 7: Host Listing Wizard — Step 1 of 5 (Vehicle Details)

```
┌─────────────────────────────────────┐
│  [STATUS BAR]                       │
├─────────────────────────────────────┤
│  [X]  List Your Car                 │
│  (close btn)  (h2, onDark)          │
├─────────────────────────────────────┤
│  STEP PROGRESS                      │
│  [=====>              ]  1 of 5     │
│  (ProgressBar, accent fill)         │
│                                     │
│  Vehicle Details                    │
│  (overline, muted)                  │
│  Tell us about the car              │
│  (h3, onDark)                       │
├─────────────────────────────────────┤
│  KeyboardAwareScrollView            │
│                                     │
│  Make                               │
│  (label)                            │
│  ┌───────────────────────────────┐  │
│  │ Toyota                    [v] │  │
│  └───────────────────────────────┘  │
│  (Picker / Select, mobileCard bg)   │
│                                     │
│  Model                              │
│  ┌───────────────────────────────┐  │
│  │ Camry                     [v] │  │
│  └───────────────────────────────┘  │
│                                     │
│  Year                               │
│  ┌───────────────────────────────┐  │
│  │ 2022                      [v] │  │
│  └───────────────────────────────┘  │
│                                     │
│  Colour                             │
│  ┌───────────────────────────────┐  │
│  │ Midnight Black            [v] │  │
│  └───────────────────────────────┘  │
│                                     │
│  VIN                                │
│  ┌───────────────────────────────┐  │
│  │ 1HGCM82633A123456            │  │
│  └───────────────────────────────┘  │
│  (TextInput, autoCapitalize=chars)  │
│                                     │
│  Plate Number                       │
│  ┌───────────────────────────────┐  │
│  │ XXXX 000                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  Weekly Rate ($CAD)                 │
│  ┌───────────────────────────────┐  │
│  │ $   350                       │  │
│  └───────────────────────────────┘  │
│  Min $300 — Max $450/week           │
│  (caption, muted)                   │
│                                     │
├─────────────────────────────────────┤
│  STICKY BOTTOM                      │
│  [Continue >]                       │
│  (accent bg, full-width, h=52px)    │
│  [SAFE AREA]                        │
└─────────────────────────────────────┘
```

Notes: All inputs use `surface.mobileCard` background (`#1C1C1E`) with `brand.accent` focus border. Weekly Rate input has a `$` prefix rendered as a non-editable `Text` inside a `View` wrapping the `TextInput`. Validation on Continue press — red `caption` error message appears below each invalid field. VIN field triggers checksum validation client-side before API call.

---

### Screen 8: Booking Request — Host View

```
┌─────────────────────────────────────┐
│  [STATUS BAR]                       │
├─────────────────────────────────────┤
│  [<]  Booking Request               │
│  (back arrow)  (h2, onDark)         │
│  Expires in  23:47:12               │
│  (bodySm, warning amber, countdown) │
├─────────────────────────────────────┤
│  ScrollView                         │
│                                     │
│  RENTER                             │
│  (overline, muted)                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Avatar]  Priya S.           │  │
│  │            ★ 4.9  (22 trips)  │  │
│  │            [Uber Driver]      │  │
│  │            (accent pill badge)│  │
│  └───────────────────────────────┘  │
│  (surface.mobileCard, radius.lg)    │
│                                     │
│  VEHICLE REQUESTED                  │
│  (overline, muted)                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [thumb]  2022 Camry LE       │  │
│  │           Start: May 20, 2026 │  │
│  │           Duration: 4 weeks   │  │
│  └───────────────────────────────┘  │
│                                     │
│  EARNINGS BREAKDOWN                 │
│  (overline, muted)                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Weekly rate      $350.00     │  │
│  │  Duration         4 weeks     │  │
│  │  Gross total      $1,400.00   │  │
│  │  Platform fee     -$280.00    │  │
│  │  ─────────────────────────    │  │
│  │  Your earnings    $1,120.00   │  │
│  │  (success green, weight 700)  │  │
│  └───────────────────────────────┘  │
│                                     │
│  HOST CHECKLIST                     │
│  (overline, muted)                  │
│                                     │
│  [x] Renter has valid G licence     │
│  [x] Gig platform badge verified    │
│  [ ] GPS device confirmed active    │
│  (checkboxes, accent when checked)  │
│                                     │
├─────────────────────────────────────┤
│  STICKY BOTTOM — two actions        │
│                                     │
│  ┌────────────┐  ┌───────────────┐  │
│  │  Decline   │  │    Accept     │  │
│  │  (ghost,   │  │  (accent bg,  │  │
│  │   danger   │  │   black text, │  │
│  │   border)  │  │   weight 700) │  │
│  └────────────┘  └───────────────┘  │
│  [SAFE AREA]                        │
└─────────────────────────────────────┘
```

Notes: The 24-hour countdown timer is a live `setInterval` updating every second. When it hits zero the request expires and both buttons are disabled with a "Request expired" overlay. "Decline" shows a `Modal` asking for an optional decline reason before finalising. "Accept" triggers haptic feedback (`impactAsync(ImpactFeedbackStyle.Medium)`) and navigates to a booking confirmation screen.

---

## Section 6: Component Behaviour Differences (Web to Mobile)

| Component | Web Implementation | Mobile Implementation | Engineering Notes |
|---|---|---|---|
| FAQ Accordion | `<details>/<summary>` HTML native | `Pressable` + `useState(isOpen)` + `Animated.Value` for max-height transition | Create `apps/mobile/components/Accordion.tsx`. Use `LayoutAnimation.configureNext` for simpler implementation if Animated.View feels over-engineered |
| Hero image | `next/image` with `fill` prop + CSS `background-size: cover` | `ImageBackground` (RN core) wrapping content children | Image source must be a local require or CDN URL — no `next/image` on mobile |
| Gradient overlay | `bg-gradient-to-b from-black/70 to-transparent` via Tailwind | `LinearGradient` from `expo-linear-gradient` | Install: `npx expo install expo-linear-gradient` |
| Backdrop blur | `backdrop-blur-md` CSS property | Solid `backgroundColor: 'rgba(0,0,0,0.70)'` | Android does not reliably support `blurRadius` on `Image`. Use solid overlay. On iOS only, `BlurView` from `expo-blur` is acceptable if desired |
| Sticky top navbar | `sticky top-0 z-50` CSS | React Navigation bottom tab bar | Completely different UX paradigm. Web navbar stays. Mobile gets bottom tabs |
| Toast / alerts | Custom banner component or `sonner` | `react-native-toast-message` OR custom `Animated` banner from top | Safety-critical alerts (kill switch result) should use `Alert.alert` (blocking modal) not toast |
| Pull to refresh | Browser reload / manual scroll | `RefreshControl` component on `ScrollView` | Pass `refreshing` state and `onRefresh` callback to `ScrollView.refreshControl` |
| Haptic feedback | Not applicable | `expo-haptics` — use on: kill switch confirm (`Warning`), booking accept (`Medium`), payment confirm (`Light`) | Install: `npx expo install expo-haptics` |
| Form inputs | `<input>` with Tailwind focus ring | `TextInput` with `onFocus`/`onBlur` toggling a border colour state | Wrap in `KeyboardAwareScrollView` (from `react-native-keyboard-aware-scroll-view`) to prevent keyboard from covering inputs |
| Modals | Headless UI / Radix Dialog | `Modal` (RN core) with `animationType="slide"` | Bottom-sheet modals use `@gorhom/bottom-sheet` |
| Loading states | Skeleton shimmer (CSS animation) | `ActivityIndicator` or `expo-skeleton-content` | Keep consistent — pick one skeleton library and use it everywhere |
| Vehicle photo carousel | CSS scroll-snap horizontal | `FlatList` with `horizontal`, `pagingEnabled`, and a dot indicator | Dot indicator is a separate row of `View` components, active dot uses `brand.accent` |

---

## Section 7: Design Handoff Notes for Software Engineer

The following is an ordered list of code changes required. Implement them in this sequence to avoid blocking dependencies.

### 1. Create `src/lib/theme.ts` — Single Source of Truth

Create this file and export the `colors`, `spacing`, `radius`, and `typography` objects exactly as shown in Sections 1, 2, and 3 of this document. This file has no imports and no side effects — it is pure constants. Both the web app and the mobile app will import from this file (or from a shared package if the monorepo is restructured).

File path: `src/lib/theme.ts`

### 2. Update `globals.css` — Resolve Colour Inconsistency

Replace the existing `:root` block with the CSS custom properties listed in Section 3. Add a comment above the block stating these values are derived from `src/lib/theme.ts` and must be kept in sync manually until a build-time generation step is added. Specifically resolve: `--color-primary` must be `#007A87` (not `#00C2D4`). `#00C2D4` is only used on dark/hero contexts under `--color-brand-accent`.

### 3. Update `app/(public)/page.tsx` — Remove Hardcoded Hex Values

Audit all inline `style={{ color: '#00C2D4' }}` and `style={{ backgroundColor: '#007A87' }}` occurrences. Replace with CSS custom property references via `className` wherever possible. Where inline styles are unavoidable (e.g. dynamic values), import from `theme.ts` and reference `colors.brand.accent` etc.

### 4. Add `expo_push_token` to Profiles Table

The next Supabase migration must add: `expo_push_token TEXT` to the `profiles` table. This column stores the Expo push notification token generated on first mobile app launch. It is nullable (web users do not have it). The mobile app calls `supabase.from('profiles').update({ expo_push_token: token })` after `Notifications.getExpoPushTokenAsync()`.

Migration SQL:
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS expo_push_token TEXT;
```

### 5. Scaffold `apps/mobile/`

Create the Expo app at `apps/mobile/` relative to the monorepo root. Required files at scaffold:

- `apps/mobile/app.json` — Expo config with `name: "EasyDrive"`, `scheme: "easydrive"`, `ios.bundleIdentifier: "ca.easydrive.app"`, `android.package: "ca.easydrive.app"`
- `apps/mobile/package.json` — dependencies include `expo`, `react-native`, `@react-navigation/native`, `@react-navigation/bottom-tabs`, `expo-linear-gradient`, `expo-haptics`, `expo-image-picker`, `@supabase/supabase-js`
- `apps/mobile/src/navigation/HostTabNavigator.tsx` — 4-tab navigator per Section 4
- `apps/mobile/src/navigation/RenterTabNavigator.tsx` — 4-tab navigator per Section 4
- `apps/mobile/src/navigation/RootNavigator.tsx` — auth-gated: unauthenticated shows stack (Welcome, RoleSelect, Login); authenticated switches to Host or Renter tab navigator based on `profile.role`
- Placeholder screen files for all 8 screens in Section 5

### 6. Build `apps/mobile/components/Accordion.tsx`

The web uses `<details>/<summary>`. Mobile needs an explicit component. The component accepts `title: string` and `children: ReactNode` props. It uses `useState` for open/close and `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` before toggling state to animate the expand. This is simpler than `Animated.View` and works on both platforms.

### 7. Audit `src/lib/supabase/server.ts` for Bearer Token Support

The web server reads auth from cookies (Supabase SSR pattern). The mobile app cannot use cookies — it must send `Authorization: Bearer <access_token>` headers. Audit the server utility to confirm it checks the `Authorization` header as a fallback when no cookie session is found. If it does not, add a conditional that extracts the Bearer token and calls `supabase.auth.setSession({ access_token, refresh_token })`. The mobile client sends both tokens in the request headers.

---

## Appendix: Decision Log

| Decision | Options Considered | Chosen | Rationale |
|---|---|---|---|
| Primary brand colour | Keep `#007A87` only / Keep `#00C2D4` only / Use both with roles | Use both with defined roles | Neither colour is wrong — they serve different contexts. Eliminating either would break either the web landing page or the body-copy trust signals |
| Mobile navigation | Top drawer / Side drawer / Bottom tabs | Bottom tabs | Platform convention for iOS and Android. Bottom tabs are expected by gig-driver users who primarily use Uber/DoorDash apps |
| Dark vs light mobile theme | Light / Dark / System | Dark (fixed) | Matches Design A's cinematic near-black aesthetic. Gig drivers often use phones at night — dark mode reduces eye strain. Avoids complexity of dual-theme support at MVP |
| Kill switch confirmation friction | Single tap / Confirmation dialog / Reason required + confirmation | Reason required + confirmation | Safety-critical action. Two-step friction (reason selection unlocks button, then second Alert confirmation) reduces accidental activation risk |
| Backdrop blur on mobile | Keep CSS blur / Replace with solid overlay / iOS BlurView only | Solid `rgba(0,0,0,0.70)` overlay | Android `blurRadius` is unreliable. Solid overlay is consistent, performant, and passes contrast checks |
| Expo vs bare RN | Bare React Native / Expo Go / Expo with EAS Build | Expo with EAS Build | Fastest path to App Store + Play Store submission. `expo-haptics`, `expo-linear-gradient`, and push notifications are first-class. EAS Build handles signing |

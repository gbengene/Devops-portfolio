/**
 * Easy Drive — Design Token Source of Truth
 *
 * This file is the single source of truth for all visual tokens.
 * Web (Next.js): import and reference these values in inline styles or
 *   use the derived CSS custom properties in globals.css.
 * Mobile (Expo / React Native): import directly — RN StyleSheet
 *   accepts these numeric and string values as-is.
 *
 * DO NOT hardcode hex values anywhere in the codebase. Import from here.
 * Derived from: DESIGN_SYSTEM.md v1.0 — 2026-05-14
 */

// ── Colours ──────────────────────────────────────────────────────────────────

export const colors = {
  brand: {
    // Use on light/navy backgrounds — web buttons, forms, links, trust-critical UI
    primary:      '#007A87',
    primaryDark:  '#005F6B',  // hover / pressed state of primary
    primaryLight: '#E6F4F6',  // tinted backgrounds, selected row highlights

    // Use on dark/black backgrounds ONLY — hero CTAs, mobile tab active, kill switch ring
    accent:       '#00C2D4',
    accentDark:   '#0099A8',  // hover / pressed state of accent on dark surfaces
  },

  navy: {
    base:  '#0D2B55',  // web navbar, trust sections, footer
    deep:  '#081D3A',  // depth layering — use sparingly
    light: '#1A4080',  // navy hover / secondary navy surfaces
  },

  semantic: {
    success: '#22C55E',  // GPS active badge, payment confirmed, booking accepted
    warning: '#F59E0B',  // pending review, approaching due date, low availability
    danger:  '#EF4444',  // kill switch activation, overdue payment, declined booking
    info:    '#3B82F6',  // informational banners, neutral status, new message indicator
  },

  surface: {
    // Light-mode web surfaces
    default:      '#FFFFFF',  // web page background, card backgrounds
    subtle:        '#F8FAFC',  // alternate row, section divider zone
    card:          '#FFFFFF',  // card component background

    // Dark / hero surfaces — mobile default + web dark sections (Design System keys)
    hero:          '#0A0A0A',  // full-bleed hero sections — matches dark2
    overlay:       'rgba(0,0,0,0.70)',  // overlay on hero images (no backdrop-blur on Android)
    mobileScreen:  '#111111',  // default mobile screen background — matches dark4
    mobileCard:    '#1C1C1E',  // iOS-style dark card on mobile

    // Graduated near-black shades used in web landing dark sections.
    // Named dark1–dark5 in ascending brightness order.
    dark1: '#050505',  // deepest — bold full-width CTA bg
    dark2: '#0A0A0A',  // counter strip, footer, mobile CTA bar bg (alias: surface.hero)
    dark3: '#0D0D0D',  // two-column section bg, why section bg
    dark4: '#111111',  // how-it-works right column bg (alias: surface.mobileScreen)
    dark5: '#141414',  // testimonial card bg
  },

  text: {
    primary:   '#0F172A',  // body text on light surfaces
    secondary: '#334155',  // subheadings, supporting text on light surfaces
    muted:     '#94A3B8',  // placeholder, inactive tab labels, disabled states

    // Text on dark / hero surfaces
    onDark:    '#F1F5F9',  // all text on dark / hero backgrounds
    onAccent:  '#000000',  // text on brand.accent (#00C2D4) background — high contrast required
  },

  border: {
    light:      '#E5E7EB',                  // card / input borders on light surfaces
    dark:       'rgba(255,255,255,0.10)',    // subtle borders on dark surfaces
    darkStrong: 'rgba(255,255,255,0.25)',   // stronger border on dark surfaces
    accent:     'rgba(0,194,212,0.40)',     // accent-tinted border
    accentSubtle: 'rgba(0,194,212,0.20)',  // very subtle accent border
  },
} as const

// ── Spacing ───────────────────────────────────────────────────────────────────
// Shared between web and mobile. Web: append 'px'. Mobile: pass as RN numeric.

export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl': 48,
  '3xl': 64,
} as const

// ── Border Radius ─────────────────────────────────────────────────────────────

export const radius = {
  sm:   6,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 24,
  full: 9999,
} as const

// ── Typography ────────────────────────────────────────────────────────────────
// web: use Tailwind class equivalents (see DESIGN_SYSTEM.md Section 2)
// mobile: use fontSize.mobile directly in StyleSheet

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    display:  { web: 72,  mobile: 40 },  // Hero headline
    h1:       { web: 36,  mobile: 28 },  // Page and section headlines
    h2:       { web: 24,  mobile: 22 },  // Card headings, modal titles
    h3:       { web: 20,  mobile: 18 },  // Sub-section labels, list group headers
    bodyLg:   { web: 18,  mobile: 16 },  // Lead paragraph text
    bodyMd:   { web: 16,  mobile: 15 },  // Default body text
    bodySm:   { web: 14,  mobile: 13 },  // Secondary body, form help text
    caption:  { web: 12,  mobile: 11 },  // Timestamps, legal footnotes, badge labels
    label:    { web: 14,  mobile: 14 },  // Form field labels, tab bar labels
    buttonLg: { web: 16,  mobile: 16 },  // Large CTA buttons
    buttonMd: { web: 14,  mobile: 14 },  // Standard buttons
    overline: { web: 11,  mobile: 11 },  // Section kickers ("FOR HOSTS", "HOW IT WORKS")
  },
  fontWeight: {
    black:     '900',
    extraBold: '800',
    bold:      '700',
    semiBold:  '600',
    regular:   '400',
  },
  lineHeight: {
    tight:   1.05,
    snug:    1.15,
    normal:  1.5,
    relaxed: 1.6,
  },
} as const

// ── Shadows — Web (CSS box-shadow strings) ────────────────────────────────────

export const shadows = {
  card:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  modal:     '0 20px 60px rgba(0,0,0,0.18)',
} as const

// ── Shadows — Mobile (React Native StyleSheet shadow props) ───────────────────

export const rnShadows = {
  card: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius:  3,
    elevation:     2,
  },
  modal: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius:  20,
    elevation:     10,
  },
} as const

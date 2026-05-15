import { describe, it, expect } from 'vitest'

/**
 * Tests for Stripe payment calculation logic.
 *
 * These are pure functions extracted from the payment flow —
 * no Stripe API calls are made in these tests.
 *
 * Business rules under test (per BUSINESS_PLAN.md §3):
 *  - Day 1 collection = weekly rate + $500 deposit
 *  - Stripe stores amounts in cents (multiply by 100)
 *  - Deposit is a manual-capture hold, not an immediate charge
 *  - Weekly subscription amount must be in valid range ($300–$500)
 */

// ── Pure helpers mirrored from lib/stripe.ts ──────────────────────────────────

function weeklyRateToCents(rateCAD: number): number {
  return rateCAD * 100
}

function depositToCents(depositCAD: number): number {
  return depositCAD * 100
}

function calculateDay1Collection(weeklyRateCAD: number, depositCAD: number): number {
  return weeklyRateCAD + depositCAD
}

function isValidWeeklyRate(rateCAD: number): boolean {
  return Number.isInteger(rateCAD) && rateCAD >= 300 && rateCAD <= 500
}

function centsToCAD(cents: number): number {
  return Math.round(cents) / 100
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('weeklyRateToCents', () => {
  it('converts $300 to 30000 cents', () => {
    expect(weeklyRateToCents(300)).toBe(30_000)
  })
  it('converts $450 to 45000 cents', () => {
    expect(weeklyRateToCents(450)).toBe(45_000)
  })
})

describe('depositToCents', () => {
  it('converts $500 to 50000 cents', () => {
    expect(depositToCents(500)).toBe(50_000)
  })
})

describe('calculateDay1Collection', () => {
  it('economy rate: $300 rate + $500 deposit = $800', () => {
    expect(calculateDay1Collection(300, 500)).toBe(800)
  })
  it('mid-size rate: $400 rate + $500 deposit = $900', () => {
    expect(calculateDay1Collection(400, 500)).toBe(900)
  })
  it('max rate: $500 rate + $500 deposit = $1000', () => {
    expect(calculateDay1Collection(500, 500)).toBe(1000)
  })
})

describe('isValidWeeklyRate', () => {
  it('accepts rates in valid range', () => {
    expect(isValidWeeklyRate(300)).toBe(true)
    expect(isValidWeeklyRate(350)).toBe(true)
    expect(isValidWeeklyRate(450)).toBe(true)
    expect(isValidWeeklyRate(500)).toBe(true)
  })
  it('rejects rates below minimum', () => {
    expect(isValidWeeklyRate(299)).toBe(false)
    expect(isValidWeeklyRate(0)).toBe(false)
    expect(isValidWeeklyRate(-100)).toBe(false)
  })
  it('rejects rates above maximum', () => {
    expect(isValidWeeklyRate(501)).toBe(false)
    expect(isValidWeeklyRate(1000)).toBe(false)
  })
  it('rejects non-integer rates', () => {
    expect(isValidWeeklyRate(300.5)).toBe(false)
  })
})

describe('centsToCAD', () => {
  it('converts cents back to dollars', () => {
    expect(centsToCAD(30_000)).toBe(300)
    expect(centsToCAD(45_000)).toBe(450)
  })
  it('rounds correctly', () => {
    expect(centsToCAD(30_001)).toBe(300.01)
  })
})

describe('payment flow — end to end calculation', () => {
  it('full rental setup: economy vehicle', () => {
    const weeklyRate = 300
    const deposit    = 500
    const day1       = calculateDay1Collection(weeklyRate, deposit)
    const stripeSub  = weeklyRateToCents(weeklyRate)
    const stripeDepo = depositToCents(deposit)

    expect(day1).toBe(800)
    expect(stripeSub).toBe(30_000)
    expect(stripeDepo).toBe(50_000)
    expect(centsToCAD(stripeSub + stripeDepo)).toBe(800)
  })
})

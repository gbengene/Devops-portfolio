import { describe, it, expect } from 'vitest'

/**
 * Tests for application eligibility rules.
 *
 * These rules are the core gatekeeping logic of the business —
 * they determine which drivers can rent. Any change here
 * must be reviewed against the Business Plan.
 *
 * Rules (per BUSINESS_PLAN.md §8):
 *  1. Licence must NOT be suspended
 *  2. At-fault accidents must be < 3 (in past 3 years)
 *  3. Must have an active gig platform account
 *  4. Must provide all required documents
 */

interface ApplicantInput {
  licence_suspended:    boolean
  at_fault_accidents:   number
  gig_platform:         string | null
  id_document_url:      string | null
  driver_abstract_url:  string | null
}

type EligibilityResult =
  | { eligible: true }
  | { eligible: false; reason: string }

/**
 * Pure eligibility check — mirrors the logic in api/applications/route.ts.
 * Extracted here so it can be tested independently of HTTP/Supabase.
 */
function checkEligibility(applicant: ApplicantInput): EligibilityResult {
  if (applicant.licence_suspended) {
    return { eligible: false, reason: 'Licence is currently suspended.' }
  }
  if (applicant.at_fault_accidents >= 3) {
    return { eligible: false, reason: 'Three or more at-fault accidents in the past 3 years.' }
  }
  if (!applicant.gig_platform) {
    return { eligible: false, reason: 'No active gig platform account provided.' }
  }
  if (!applicant.id_document_url || !applicant.driver_abstract_url) {
    return { eligible: false, reason: 'Required documents not uploaded.' }
  }
  return { eligible: true }
}

const BASE: ApplicantInput = {
  licence_suspended:   false,
  at_fault_accidents:  0,
  gig_platform:        'uber_eats',
  id_document_url:     'documents/uuid/id.jpg',
  driver_abstract_url: 'documents/uuid/abstract.pdf',
}

describe('checkEligibility — happy path', () => {
  it('approves a fully eligible applicant', () => {
    expect(checkEligibility(BASE)).toEqual({ eligible: true })
  })

  it('allows exactly 2 at-fault accidents', () => {
    expect(checkEligibility({ ...BASE, at_fault_accidents: 2 })).toEqual({ eligible: true })
  })

  it('allows 0 at-fault accidents', () => {
    expect(checkEligibility({ ...BASE, at_fault_accidents: 0 })).toEqual({ eligible: true })
  })
})

describe('checkEligibility — rejection rules', () => {
  it('rejects a suspended licence', () => {
    const result = checkEligibility({ ...BASE, licence_suspended: true })
    expect(result.eligible).toBe(false)
    if (!result.eligible) expect(result.reason).toMatch(/suspended/i)
  })

  it('rejects exactly 3 at-fault accidents', () => {
    const result = checkEligibility({ ...BASE, at_fault_accidents: 3 })
    expect(result.eligible).toBe(false)
    if (!result.eligible) expect(result.reason).toMatch(/at-fault/i)
  })

  it('rejects 5 at-fault accidents', () => {
    const result = checkEligibility({ ...BASE, at_fault_accidents: 5 })
    expect(result.eligible).toBe(false)
  })

  it('rejects when no gig platform', () => {
    const result = checkEligibility({ ...BASE, gig_platform: null })
    expect(result.eligible).toBe(false)
    if (!result.eligible) expect(result.reason).toMatch(/gig/i)
  })

  it('rejects when ID document is missing', () => {
    const result = checkEligibility({ ...BASE, id_document_url: null })
    expect(result.eligible).toBe(false)
    if (!result.eligible) expect(result.reason).toMatch(/document/i)
  })

  it('rejects when driver abstract is missing', () => {
    const result = checkEligibility({ ...BASE, driver_abstract_url: null })
    expect(result.eligible).toBe(false)
    if (!result.eligible) expect(result.reason).toMatch(/document/i)
  })

  it('suspension check runs before accident check (priority order)', () => {
    // Both conditions true — should return suspension reason first
    const result = checkEligibility({
      ...BASE,
      licence_suspended: true,
      at_fault_accidents: 5,
    })
    expect(result.eligible).toBe(false)
    if (!result.eligible) expect(result.reason).toMatch(/suspended/i)
  })
})

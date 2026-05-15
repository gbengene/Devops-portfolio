import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  sanitizePhone,
  sanitizeEmail,
  sanitizeLicenceNumber,
  sanitizeInt,
  sanitizeEnum,
  sanitizeApplicationPayload,
} from '@/lib/validations/sanitize'

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })
  it('strips control characters', () => {
    expect(sanitizeString('hello\x00world\x1F')).toBe('helloworld')
  })
  it('returns empty string for non-string input', () => {
    expect(sanitizeString(123)).toBe('')
    expect(sanitizeString(null)).toBe('')
    expect(sanitizeString(undefined)).toBe('')
  })
  it('caps at 1000 characters', () => {
    expect(sanitizeString('a'.repeat(2000))).toHaveLength(1000)
  })
})

describe('sanitizePhone', () => {
  it('normalises a 10-digit number to E.164', () => {
    expect(sanitizePhone('4165550192')).toBe('+14165550192')
  })
  it('normalises a formatted number', () => {
    expect(sanitizePhone('(416) 555-0192')).toBe('+14165550192')
  })
  it('accepts 11-digit with country code', () => {
    expect(sanitizePhone('14165550192')).toBe('+14165550192')
  })
  it('returns null for invalid numbers', () => {
    expect(sanitizePhone('123')).toBeNull()
    expect(sanitizePhone('not a phone')).toBeNull()
    expect(sanitizePhone(null)).toBeNull()
  })
})

describe('sanitizeEmail', () => {
  it('lowercases and trims', () => {
    expect(sanitizeEmail('  USER@EMAIL.COM  ')).toBe('user@email.com')
  })
  it('accepts valid emails', () => {
    expect(sanitizeEmail('kwame@gmail.com')).toBe('kwame@gmail.com')
    expect(sanitizeEmail('a+tag@sub.domain.ca')).toBe('a+tag@sub.domain.ca')
  })
  it('returns null for invalid emails', () => {
    expect(sanitizeEmail('notanemail')).toBeNull()
    expect(sanitizeEmail('@nodomain')).toBeNull()
    expect(sanitizeEmail(42)).toBeNull()
  })
})

describe('sanitizeLicenceNumber', () => {
  it('uppercases and strips non-alphanumeric', () => {
    expect(sanitizeLicenceNumber('a1234-12345-12345')).toBe('A1234-12345-12345')
  })
  it('returns null for too short', () => {
    expect(sanitizeLicenceNumber('abc')).toBeNull()
  })
  it('returns null for non-string', () => {
    expect(sanitizeLicenceNumber(null)).toBeNull()
  })
})

describe('sanitizeInt', () => {
  it('returns clamped value', () => {
    expect(sanitizeInt(5, 0, 10)).toBe(5)
    expect(sanitizeInt(-5, 0, 10)).toBe(0)
    expect(sanitizeInt(20, 0, 10)).toBe(10)
  })
  it('floors decimals', () => {
    expect(sanitizeInt(2.9, 0, 10)).toBe(2)
  })
  it('returns null for NaN', () => {
    expect(sanitizeInt('abc', 0, 10)).toBeNull()
    expect(sanitizeInt(null, 0, 10)).toBeNull()
  })
})

describe('sanitizeEnum', () => {
  const platforms = ['uber_eats', 'doordash', 'skip', 'instacart'] as const
  it('returns valid values', () => {
    expect(sanitizeEnum('uber_eats', platforms)).toBe('uber_eats')
  })
  it('returns null for invalid values', () => {
    expect(sanitizeEnum('lyft', platforms)).toBeNull()
    expect(sanitizeEnum(42, platforms)).toBeNull()
  })
})

describe('sanitizeApplicationPayload — business rules', () => {
  const valid = {
    full_name:              'Kwame Asante',
    phone:                  '4165550192',
    ontario_licence_number: 'A1234-12345-12345',
    licence_class:          'G',
    at_fault_accidents:     0,
    licence_suspended:      false,
    gig_platform:           'uber_eats',
  }

  it('accepts a valid payload', () => {
    const result = sanitizeApplicationPayload(valid)
    expect(result.full_name).toBe('Kwame Asante')
    expect(result.phone).toBe('+14165550192')
    expect(result.licence_class).toBe('G')
    expect(result.gig_platform).toBe('uber_eats')
    expect(result.licence_suspended).toBe(false)
  })

  it('rejects an invalid gig platform', () => {
    const result = sanitizeApplicationPayload({ ...valid, gig_platform: 'random_app' })
    expect(result.gig_platform).toBeNull()
  })

  it('clamps at_fault_accidents to 0-20 range', () => {
    const result = sanitizeApplicationPayload({ ...valid, at_fault_accidents: 999 })
    expect(result.at_fault_accidents).toBe(20)
  })

  it('coerces licence_suspended to boolean', () => {
    // Only true === true; any other value becomes false
    expect(sanitizeApplicationPayload({ ...valid, licence_suspended: 'yes' }).licence_suspended).toBe(false)
    expect(sanitizeApplicationPayload({ ...valid, licence_suspended: true }).licence_suspended).toBe(true)
  })
})

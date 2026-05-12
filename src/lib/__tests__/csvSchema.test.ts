import { describe, it, expect } from 'vitest'
import { normalizeCategory, CATEGORY_MAP } from '../csvSchema'

describe('normalizeCategory', () => {
  it('returns Other for empty string', () => {
    expect(normalizeCategory('')).toBe('Other')
  })

  it('returns Other for whitespace-only string', () => {
    expect(normalizeCategory('   ')).toBe('Other')
  })

  it('returns Other for null-like input', () => {
    expect(normalizeCategory(null as unknown as string)).toBe('Other')
  })

  it('maps SAVINGS/INVESTMENTS to Savings / Investment', () => {
    expect(normalizeCategory('SAVINGS/INVESTMENTS')).toBe('Savings / Investment')
  })

  it('maps SAVINGS/INVESTMENT to Savings / Investment', () => {
    expect(normalizeCategory('SAVINGS/INVESTMENT')).toBe('Savings / Investment')
  })

  it('maps lowercase savings/investments via CATEGORY_MAP', () => {
    expect(normalizeCategory('savings/investments')).toBe('Savings / Investment')
  })

  it('converts unknown category to title case', () => {
    expect(normalizeCategory('food and dining')).toBe('Food And Dining')
  })

  it('collapses internal whitespace', () => {
    expect(normalizeCategory('food   and   dining')).toBe('Food And Dining')
  })

  it('trims leading and trailing whitespace', () => {
    expect(normalizeCategory('  groceries  ')).toBe('Groceries')
  })

  it('preserves single-word categories in title case', () => {
    expect(normalizeCategory('TRANSPORT')).toBe('Transport')
  })
})

describe('CATEGORY_MAP', () => {
  it('has SAVINGS/INVESTMENTS key', () => {
    expect(CATEGORY_MAP['SAVINGS/INVESTMENTS']).toBe('Savings / Investment')
  })

  it('has SAVINGS/INVESTMENT key', () => {
    expect(CATEGORY_MAP['SAVINGS/INVESTMENT']).toBe('Savings / Investment')
  })
})

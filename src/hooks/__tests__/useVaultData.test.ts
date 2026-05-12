import { describe, it, expect } from 'vitest'
import { isCCPayment, extractFee, computeVaultData } from '../useVaultData'

describe('isCCPayment', () => {
  it('returns false for empty string', () => {
    expect(isCCPayment('')).toBe(false)
  })

  it('returns false for null-like input', () => {
    expect(isCCPayment(null as unknown as string)).toBe(false)
  })

  it('returns true for exact match', () => {
    expect(isCCPayment('CC Bill Payment')).toBe(true)
  })

  it('returns true case-insensitively', () => {
    expect(isCCPayment('cc bill payment')).toBe(true)
    expect(isCCPayment('CC BILL PAYMENT')).toBe(true)
  })

  it('returns true when embedded in longer string', () => {
    expect(isCCPayment('Monthly CC Bill Payment for Visa')).toBe(true)
  })

  it('returns false for unrelated notes', () => {
    expect(isCCPayment('Grocery run')).toBe(false)
  })
})

describe('extractFee', () => {
  it('returns 0 for empty string', () => {
    expect(extractFee('')).toBe(0)
  })

  it('returns 0 for null-like input', () => {
    expect(extractFee(null as unknown as string)).toBe(0)
  })

  it('returns 0 when no "fee" keyword present', () => {
    expect(extractFee('Regular transaction')).toBe(0)
  })

  it('extracts numeric value from fee note', () => {
    expect(extractFee('Service fee 150')).toBe(150)
  })

  it('extracts decimal fee value', () => {
    expect(extractFee('Bank fee 25.50')).toBe(25.5)
  })

  it('handles comma-formatted numbers', () => {
    expect(extractFee('Transfer fee 1,500.00')).toBe(1500)
  })

  it('returns 0 when fee keyword present but no number follows', () => {
    expect(extractFee('includes fee charges')).toBe(0)
  })
})

const makeCSV = (rows: string[]) =>
  ['Date,Category,Description,Amount,Payment Method,Notes', ...rows].join('\n')

describe('computeVaultData', () => {
  it('handles empty CSV (header only)', () => {
    const result = computeVaultData(makeCSV([]))
    expect(result.transactions).toHaveLength(0)
    expect(result.totalExpenses).toBe(0)
    expect(result.totalSavings).toBe(0)
    expect(result.totalFees).toBe(0)
  })

  it('parses a basic transaction', () => {
    const csv = makeCSV(['2024-01-15,Food,Lunch,250,GCash,'])
    const result = computeVaultData(csv)
    expect(result.transactions).toHaveLength(1)
    expect(result.transactions[0].amount).toBe(250)
    expect(result.transactions[0].category).toBe('Food')
    expect(result.totalExpenses).toBe(250)
  })

  it('excludes CC payments from totalExpenses', () => {
    const csv = makeCSV([
      '2024-01-15,Food,Lunch,250,GCash,',
      '2024-01-16,Bills,CC Payment,5000,Bank,CC Bill Payment',
    ])
    const result = computeVaultData(csv)
    expect(result.totalExpenses).toBe(250)
  })

  it('excludes CC payments from byCategory', () => {
    const csv = makeCSV([
      '2024-01-15,Food,Lunch,250,GCash,',
      '2024-01-16,Bills,CC Payment,5000,Bank,CC Bill Payment',
    ])
    const result = computeVaultData(csv)
    expect(result.byCategory['Bills']).toBeUndefined()
    expect(result.byCategory['Food']).toBe(250)
  })

  it('excludes CC payments from byDay', () => {
    const csv = makeCSV([
      '2024-01-15,Food,Lunch,250,GCash,',
      '2024-01-16,Bills,CC Payment,5000,Bank,CC Bill Payment',
    ])
    const result = computeVaultData(csv)
    expect(result.byDay).toHaveLength(1)
    expect(result.byDay[0].date).toBe('2024-01-15')
  })

  it('counts Savings / Investment in totalSavings not totalExpenses', () => {
    const csv = makeCSV([
      '2024-01-15,Food,Lunch,250,GCash,',
      '2024-01-16,Savings/Investments,Stocks,1000,Bank,',
    ])
    const result = computeVaultData(csv)
    expect(result.totalSavings).toBe(1000)
    expect(result.totalExpenses).toBe(250)
    expect(result.byCategory['Savings / Investment']).toBeUndefined()
  })

  it('sums fees across transactions', () => {
    const csv = makeCSV([
      '2024-01-15,Food,Lunch,250,GCash,Service fee 10',
      '2024-01-16,Transport,Grab,150,GCash,Transfer fee 5',
    ])
    const result = computeVaultData(csv)
    expect(result.totalFees).toBe(15)
  })

  it('sorts transactions newest-first', () => {
    const csv = makeCSV([
      '2024-01-10,Food,Lunch,100,GCash,',
      '2024-01-15,Transport,Grab,200,GCash,',
      '2024-01-05,Bills,Rent,3000,Bank,',
    ])
    const result = computeVaultData(csv)
    expect(result.transactions[0].date).toBe('2024-01-15')
    expect(result.transactions[2].date).toBe('2024-01-05')
  })

  it('sorts byDay oldest-first', () => {
    const csv = makeCSV([
      '2024-01-10,Food,Lunch,100,GCash,',
      '2024-01-15,Transport,Grab,200,GCash,',
      '2024-01-05,Bills,Rent,3000,Bank,',
    ])
    const result = computeVaultData(csv)
    expect(result.byDay[0].date).toBe('2024-01-05')
    expect(result.byDay[2].date).toBe('2024-01-15')
  })

  it('aggregates multiple transactions on same day in byDay', () => {
    const csv = makeCSV([
      '2024-01-10,Food,Lunch,100,GCash,',
      '2024-01-10,Transport,Grab,50,GCash,',
    ])
    const result = computeVaultData(csv)
    expect(result.byDay).toHaveLength(1)
    expect(result.byDay[0].amount).toBe(150)
  })

  it('parses comma-formatted amounts', () => {
    const csv = makeCSV(['2024-01-15,Food,Big purchase,1500,GCash,'])
    const result = computeVaultData(csv)
    expect(result.transactions[0].amount).toBe(1500)
  })
})

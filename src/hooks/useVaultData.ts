import { useMemo } from 'react'
import Papa from 'papaparse'
import type { Transaction } from '../lib/csvSchema'
import { normalizeCategory } from '../lib/csvSchema'

interface RawRow {
  Date?: string
  Category?: string
  Description?: string
  Amount?: string | number
  'Payment Method'?: string
  Notes?: string
  [key: string]: string | number | undefined
}

export interface VaultData {
  transactions: Transaction[]
  totalExpenses: number
  totalSavings: number
  totalFees: number
  byCategory: Record<string, number>
  byDay: { date: string; amount: number }[]
}

function isCCPayment(notes: string): boolean {
  return notes?.toLowerCase().includes('cc bill payment') ?? false
}

function extractFee(notes: string): number {
  if (!notes) return 0
  const lower = notes.toLowerCase()
  if (!lower.includes('fee')) return 0
  // grab first numeric value found after "fee" keyword
  const match = notes.match(/[\d,]+\.?\d*/g)
  if (!match) return 0
  const val = parseFloat(match[0].replace(/,/g, ''))
  return isNaN(val) ? 0 : val
}

export function useVaultData(csvText: string | null): VaultData | null {
  return useMemo(() => {
    if (!csvText) return null

    const result = Papa.parse<RawRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    })

    const transactions: Transaction[] = result.data.map((row) => {
      const notes = String(row['Notes'] ?? row['notes'] ?? '')
      const rawAmount = row['Amount'] ?? row['amount'] ?? '0'
      const amount = typeof rawAmount === 'number'
        ? rawAmount
        : parseFloat(String(rawAmount).replace(/,/g, '')) || 0

      return {
        date: String(row['Date'] ?? row['date'] ?? ''),
        category: normalizeCategory(String(row['Category'] ?? row['category'] ?? 'Other')),
        description: String(row['Description'] ?? row['description'] ?? ''),
        amount,
        paymentMethod: String(row['Payment Method'] ?? row['payment_method'] ?? ''),
        notes,
        isCCPayment: isCCPayment(notes),
      }
    })

    // sort newest first
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    let totalExpenses = 0
    let totalSavings = 0
    let totalFees = 0
    const byCategory: Record<string, number> = {}
    const byDayMap: Record<string, number> = {}

    for (const tx of transactions) {
      if (tx.isCCPayment) continue

      const cat = tx.category

      if (cat === 'Savings / Investment') {
        totalSavings += tx.amount
      } else {
        totalExpenses += tx.amount
        byCategory[cat] = (byCategory[cat] ?? 0) + tx.amount
        byDayMap[tx.date] = (byDayMap[tx.date] ?? 0) + tx.amount
      }

      totalFees += extractFee(tx.notes)
    }

    const byDay = Object.entries(byDayMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return { transactions, totalExpenses, totalSavings, totalFees, byCategory, byDay }
  }, [csvText])
}

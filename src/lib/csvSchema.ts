export interface Transaction {
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  notes: string
  isCCPayment: boolean
}

export const CATEGORY_MAP: Record<string, string> = {
  'SAVINGS/INVESTMENTS': 'Savings / Investment',
  'SAVINGS/INVESTMENT': 'Savings / Investment',
}

function toTitleCase(s: string): string {
  return s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

export function normalizeCategory(raw: string): string {
  const cleaned = (raw?.trim() ?? '').replace(/\s+/g, ' ')
  if (!cleaned) return 'Other'
  const mapped = CATEGORY_MAP[cleaned.toUpperCase()]
  return mapped ?? toTitleCase(cleaned)
}

export const PIE_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#06b6d4',
  '#f97316',
  '#ec4899',
]

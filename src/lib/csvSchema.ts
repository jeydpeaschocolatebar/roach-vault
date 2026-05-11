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
  'Savings/Investments': 'Savings / Investment',
  'Savings/Investment': 'Savings / Investment',
  'savings/investments': 'Savings / Investment',
}

export function normalizeCategory(raw: string): string {
  return CATEGORY_MAP[raw?.trim()] ?? raw?.trim() ?? 'Other'
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

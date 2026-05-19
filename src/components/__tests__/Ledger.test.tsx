import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Ledger } from '../Ledger'
import type { Transaction } from '../../lib/csvSchema'

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    date: '2024-01-15',
    category: 'Food',
    description: 'Lunch',
    amount: 250,
    paymentMethod: 'GCash',
    notes: '',
    isCCPayment: false,
    ...overrides,
  }
}

const BASE_TXS: Transaction[] = [
  tx({ date: '2024-01-10', category: 'Food', description: 'Breakfast', amount: 100, paymentMethod: 'GCash' }),
  tx({ date: '2024-01-15', category: 'Transport', description: 'Grab', amount: 200, paymentMethod: 'GCash' }),
  tx({ date: '2024-01-20', category: 'Food', description: 'Dinner', amount: 500, paymentMethod: 'Cash' }),
  tx({ date: '2024-01-25', category: 'Bills', description: 'Electric', amount: 1500, paymentMethod: 'Bank' }),
  tx({ date: '2024-01-16', isCCPayment: true, description: 'CC Payment', amount: 5000, paymentMethod: 'Bank', notes: 'CC Bill Payment' }),
]

describe('Ledger', () => {
  it('renders all transactions', () => {
    render(<Ledger transactions={BASE_TXS} />)
    expect(screen.getByText('Breakfast')).toBeInTheDocument()
    expect(screen.getByText('Grab')).toBeInTheDocument()
    expect(screen.getByText('Dinner')).toBeInTheDocument()
    expect(screen.getByText('Electric')).toBeInTheDocument()
  })

  it('shows CC payments as muted with excluded badge', () => {
    render(<Ledger transactions={BASE_TXS} />)
    expect(screen.getByText('excluded')).toBeInTheDocument()
    const row = screen.getByText('CC Payment').closest('tr')!
    expect(row.className).toContain('opacity-40')
  })

  it('filters by category', async () => {
    const user = userEvent.setup()
    render(<Ledger transactions={BASE_TXS} />)
    const select = screen.getByDisplayValue('All categories')
    await user.selectOptions(select, 'Food')
    expect(screen.getByText('Breakfast')).toBeInTheDocument()
    expect(screen.getByText('Dinner')).toBeInTheDocument()
    expect(screen.queryByText('Grab')).not.toBeInTheDocument()
    expect(screen.queryByText('Electric')).not.toBeInTheDocument()
  })

  it('filters by payment method', async () => {
    const user = userEvent.setup()
    render(<Ledger transactions={BASE_TXS} />)
    const select = screen.getByDisplayValue('All methods')
    await user.selectOptions(select, 'Cash')
    expect(screen.getByText('Dinner')).toBeInTheDocument()
    expect(screen.queryByText('Breakfast')).not.toBeInTheDocument()
  })

  it('filters by date range', async () => {
    const user = userEvent.setup()
    render(<Ledger transactions={BASE_TXS} />)
    const [fromInput] = screen.getAllByTitle('From date')
    await user.clear(fromInput)
    await user.type(fromInput, '2024-01-14')
    expect(screen.queryByText('Breakfast')).not.toBeInTheDocument()
    expect(screen.getByText('Grab')).toBeInTheDocument()
  })

  it('shows empty state when no results match filters', async () => {
    const user = userEvent.setup()
    render(<Ledger transactions={BASE_TXS} />)
    const select = screen.getByDisplayValue('All categories')
    await user.selectOptions(select, 'Bills')
    const [fromInput] = screen.getAllByTitle('From date')
    await user.clear(fromInput)
    await user.type(fromInput, '2024-02-01')
    expect(screen.getByText('No transactions match filters')).toBeInTheDocument()
  })

  it('shows active filter count badge', async () => {
    const user = userEvent.setup()
    render(<Ledger transactions={BASE_TXS} />)
    await user.selectOptions(screen.getByDisplayValue('All categories'), 'Food')
    await user.selectOptions(screen.getByDisplayValue('All methods'), 'GCash')
    expect(screen.getByText(/2 active/)).toBeInTheDocument()
  })

  it('clears all filters on reset', async () => {
    const user = userEvent.setup()
    render(<Ledger transactions={BASE_TXS} />)
    await user.selectOptions(screen.getByDisplayValue('All categories'), 'Food')
    await user.click(screen.getByText('Clear all'))
    expect(screen.getByText('Grab')).toBeInTheDocument()
    expect(screen.getByText('Electric')).toBeInTheDocument()
  })

  it('sorts by amount ascending', async () => {
    const user = userEvent.setup()
    render(<Ledger transactions={BASE_TXS} />)
    const amountHeader = screen.getByRole('columnheader', { name: /Amount/i })
    await user.click(amountHeader) // desc first
    await user.click(amountHeader) // then asc
    const cells = screen.getAllByRole('cell').filter((c) => c.className.includes('green-400'))
    const amounts = cells.map((c) => parseFloat((c.textContent ?? '').replace(/[₱,]/g, '')))
    const sorted = [...amounts].sort((a, b) => a - b)
    expect(amounts).toEqual(sorted)
  })

  it('sorts by date descending by default', () => {
    render(<Ledger transactions={BASE_TXS} />)
    const rows = screen.getAllByRole('row').slice(1) // skip header
    const dates = rows
      .map((r) => within(r).queryAllByRole('cell')[0]?.textContent ?? '')
      .filter(Boolean)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)
  })

  it('paginates — next/prev buttons work', async () => {
    const user = userEvent.setup()
    const many = Array.from({ length: 25 }, (_, i) =>
      tx({ date: `2024-01-${String(i + 1).padStart(2, '0')}`, description: `Tx ${i + 1}` }),
    )
    render(<Ledger transactions={many} />)
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
    const [prevBtn, nextBtn] = screen.getAllByRole('button')
    await user.click(nextBtn)
    expect(screen.getByText(/Page 2 of/)).toBeInTheDocument()
    await user.click(prevBtn)
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
  })

  it('shows correct row range text', () => {
    const many = Array.from({ length: 25 }, (_, i) =>
      tx({ description: `Tx ${i + 1}` }),
    )
    render(<Ledger transactions={many} />)
    expect(screen.getByText(/Showing 1–20 of 25/)).toBeInTheDocument()
  })
})

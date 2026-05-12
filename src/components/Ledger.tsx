import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import type { Transaction } from '../lib/csvSchema'

interface Props {
  transactions: Transaction[]
}

type SortField = 'date' | 'amount'
type SortDir = 'asc' | 'desc'

function SortIndicator({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <span className="ml-1 opacity-30">↕</span>
  return <span className="ml-1 text-green-400">{sortDir === 'asc' ? '▲' : '▼'}</span>
}

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

const INPUT_CLS = 'bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-400'

export function Ledger({ transactions }: Props) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMethod, setFilterMethod] = useState('')

  const isFiltered = dateFrom || dateTo || filterCategory || filterMethod

  const categories = useMemo(
    () => [...new Set(transactions.map((t) => t.category))].sort(),
    [transactions],
  )
  const methods = useMemo(
    () => [...new Set(transactions.map((t) => t.paymentMethod).filter(Boolean))].sort(),
    [transactions],
  )

  const processed = useMemo(() => {
    let rows = [...transactions]
    if (dateFrom) rows = rows.filter((t) => t.date >= dateFrom)
    if (dateTo) rows = rows.filter((t) => t.date <= dateTo)
    if (filterCategory) rows = rows.filter((t) => t.category === filterCategory)
    if (filterMethod) rows = rows.filter((t) => t.paymentMethod === filterMethod)
    rows.sort((a, b) => {
      const cmp =
        sortField === 'date'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : a.amount - b.amount
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [transactions, sortField, sortDir, dateFrom, dateTo, filterCategory, filterMethod])

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
    setPage(0)
  }

  function handleFilter(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value)
      setPage(0)
    }
  }

  function resetFilters() {
    setDateFrom('')
    setDateTo('')
    setFilterCategory('')
    setFilterMethod('')
    setSortField('date')
    setSortDir('desc')
    setPage(0)
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size)
    setPage(0)
  }

  const totalPages = Math.ceil(processed.length / pageSize)
  const visible = processed.slice(page * pageSize, (page + 1) * pageSize)
  const rangeStart = processed.length === 0 ? 0 : page * pageSize + 1
  const rangeEnd = Math.min((page + 1) * pageSize, processed.length)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
      <h2 className="text-green-400 text-sm uppercase tracking-widest mb-4">Indestructible Ledger</h2>

      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs uppercase tracking-widest text-slate-500">Filters</span>
            {isFiltered && (
              <span className="text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded-full px-2 py-0.5 leading-none">
                {[dateFrom || dateTo, filterCategory, filterMethod].filter(Boolean).length} active
              </span>
            )}
          </div>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Date Range</label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={dateFrom}
                onChange={handleFilter(setDateFrom)}
                className={INPUT_CLS}
                title="From date"
              />
              <span className="text-slate-600 text-xs">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={handleFilter(setDateTo)}
                className={INPUT_CLS}
                title="To date"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Category</label>
            <select value={filterCategory} onChange={handleFilter(setFilterCategory)} className={INPUT_CLS}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Method</label>
            <select value={filterMethod} onChange={handleFilter(setFilterMethod)} className={INPUT_CLS}>
              <option value="">All methods</option>
              {methods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-slate-500 text-xs uppercase border-b border-slate-700">
              <th
                className="pb-2 pr-4 cursor-pointer hover:text-slate-300 select-none whitespace-nowrap"
                onClick={() => handleSort('date')}
              >
                Date<SortIndicator field="date" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="pb-2 pr-4">Category</th>
              <th className="pb-2 pr-4">Description</th>
              <th
                className="pb-2 pr-4 text-right cursor-pointer hover:text-slate-300 select-none whitespace-nowrap"
                onClick={() => handleSort('amount')}
              >
                Amount<SortIndicator field="amount" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="pb-2 pr-4">Method</th>
              <th className="pb-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                  No transactions match filters
                </td>
              </tr>
            ) : (
              visible.map((tx, i) => (
                <tr
                  key={page * pageSize + i}
                  className={`border-b border-slate-700/50 ${
                    tx.isCCPayment ? 'opacity-40' : 'hover:bg-slate-700/30'
                  }`}
                >
                  <td className="py-2 pr-4 text-slate-400 whitespace-nowrap">{tx.date}</td>
                  <td className="py-2 pr-4 text-slate-300 whitespace-nowrap">{tx.category}</td>
                  <td className="py-2 pr-4 text-slate-300">
                    {tx.isCCPayment && (
                      <span className="text-xs bg-slate-700 text-slate-400 rounded px-1 mr-1">excluded</span>
                    )}
                    {tx.description}
                  </td>
                  <td className="py-2 pr-4 text-right text-green-400 font-mono whitespace-nowrap">
                    {fmt(tx.amount)}
                  </td>
                  <td className="py-2 pr-4 text-slate-400 whitespace-nowrap">{tx.paymentMethod}</td>
                  <td className="py-2 text-slate-500 text-xs max-w-xs truncate">{tx.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
        <span>
          {processed.length === 0
            ? 'No results'
            : `Showing ${rangeStart}–${rangeEnd} of ${processed.length}`}
          {isFiltered && processed.length !== transactions.length && (
            <span className="ml-1 text-slate-500">({transactions.length - processed.length} filtered out)</span>
          )}
        </span>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={INPUT_CLS}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="p-1 rounded hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="p-1 rounded hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

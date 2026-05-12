import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Transaction } from '../lib/csvSchema'

interface Props {
  transactions: Transaction[]
}

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export function Ledger({ transactions }: Props) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const totalPages = Math.ceil(transactions.length / pageSize)
  const visible = transactions.slice(page * pageSize, (page + 1) * pageSize)
  const rangeStart = page * pageSize + 1
  const rangeEnd = Math.min((page + 1) * pageSize, transactions.length)

  function handlePageSizeChange(size: number) {
    setPageSize(size)
    setPage(0)
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
      <h2 className="text-green-400 text-sm uppercase tracking-widest mb-4">Indestructible Ledger</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-slate-500 text-xs uppercase border-b border-slate-700">
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2 pr-4">Category</th>
              <th className="pb-2 pr-4">Description</th>
              <th className="pb-2 pr-4 text-right">Amount</th>
              <th className="pb-2 pr-4">Method</th>
              <th className="pb-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((tx, i) => (
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
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
        <span>
          Showing {rangeStart}–{rangeEnd} of {transactions.length}
        </span>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-400"
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
            <span>Page {page + 1} of {totalPages}</span>
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

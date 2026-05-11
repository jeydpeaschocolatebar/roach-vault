import type { Transaction } from '../lib/csvSchema'

interface Props {
  transactions: Transaction[]
}

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function Ledger({ transactions }: Props) {
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
            {transactions.map((tx, i) => (
              <tr
                key={i}
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
    </div>
  )
}

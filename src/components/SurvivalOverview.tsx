import { TrendingDown, PiggyBank, Zap } from 'lucide-react'

interface Props {
  totalExpenses: number
  totalSavings: number
  totalFees: number
}

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function SurvivalOverview({ totalExpenses, totalSavings, totalFees }: Props) {
  const cards = [
    {
      label: 'Total Expenses',
      value: fmt(totalExpenses),
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'border-red-900/50',
    },
    {
      label: 'Savings / Investment',
      value: fmt(totalSavings),
      icon: PiggyBank,
      color: 'text-green-400',
      bg: 'border-green-900/50',
    },
    {
      label: 'Total Fees',
      value: fmt(totalFees),
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'border-yellow-900/50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className={`bg-slate-800 border ${bg} rounded-lg p-5 flex items-center gap-4`}>
          <Icon className={`w-8 h-8 ${color} shrink-0`} />
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

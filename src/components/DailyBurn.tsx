import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts'

interface Props {
  byDay: { date: string; amount: number }[]
}

export function DailyBurn({ byDay }: Props) {
  if (byDay.length === 0) return null

  const formatted = byDay.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mb-6">
      <h2 className="text-green-400 text-sm uppercase tracking-widest mb-4">Daily Burn</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={formatted} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => '₱' + (v / 1000).toFixed(0) + 'k'}
          />
          <Tooltip
            formatter={(val) =>
              '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })
            }
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

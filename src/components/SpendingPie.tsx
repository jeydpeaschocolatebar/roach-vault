import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PIE_COLORS } from '../lib/csvSchema'

interface Props {
  byCategory: Record<string, number>
}

export function SpendingPie({ byCategory }: Props) {
  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) return null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mb-6">
      <h2 className="text-green-400 text-sm uppercase tracking-widest mb-4">Spending Breakdown</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val) =>
              '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })
            }
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
          />
          <Legend
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

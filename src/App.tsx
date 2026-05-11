import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { UploadZone } from './components/UploadZone'
import { SurvivalOverview } from './components/SurvivalOverview'
import { SpendingPie } from './components/SpendingPie'
import { DailyBurn } from './components/DailyBurn'
import { Ledger } from './components/Ledger'
import { useVaultData } from './hooks/useVaultData'

export default function App() {
  const [csvText, setCsvText] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const data = useVaultData(csvText)

  if (!csvText || !data) {
    return <UploadZone onLoad={(text, name) => { setCsvText(text); setFileName(name) }} />
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-400 tracking-widest">🪳 ROACHVAULT</h1>
          <p className="text-slate-500 text-xs mt-0.5">{fileName} · {data.transactions.length} transactions</p>
        </div>
        <button
          onClick={() => { setCsvText(null); setFileName('') }}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Eject
        </button>
      </div>

      <SurvivalOverview
        totalExpenses={data.totalExpenses}
        totalSavings={data.totalSavings}
        totalFees={data.totalFees}
      />
      <SpendingPie byCategory={data.byCategory} />
      <DailyBurn byDay={data.byDay} />
      <Ledger transactions={data.transactions} />
    </div>
  )
}

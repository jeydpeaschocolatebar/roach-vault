import { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload } from 'lucide-react'

interface Props {
  onLoad: (csvText: string, fileName: string) => void
}

export function UploadZone({ onLoad }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function readFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      onLoad(text, file.name)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) readFile(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readFile(file)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-green-400 tracking-widest mb-1">🪳 ROACHVAULT</h1>
        <p className="text-slate-400 text-sm tracking-wider">SURVIVAL IS THE ONLY STRATEGY</p>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          w-full max-w-md border-2 border-dashed rounded-lg p-12 cursor-pointer
          flex flex-col items-center gap-4 transition-all duration-200
          ${dragOver
            ? 'border-green-400 bg-green-400/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
            : 'border-slate-600 hover:border-green-500 hover:bg-slate-800/50'
          }
        `}
      >
        <Upload className={`w-10 h-10 ${dragOver ? 'text-green-400' : 'text-slate-500'}`} />
        <div className="text-center">
          <p className="text-slate-300 font-medium">Drop your CSV here</p>
          <p className="text-slate-500 text-sm mt-1">or click to browse</p>
        </div>
        <p className="text-slate-600 text-xs">Date, Category, Description, Amount, Payment Method, Notes</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

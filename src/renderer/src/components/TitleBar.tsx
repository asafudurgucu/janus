import { Lock, Minus, Square, X } from 'lucide-react'
import { useStore } from '../store'

export default function TitleBar({ minimal = false }: { minimal?: boolean }): JSX.Element {
  const { lock, locked } = useStore()
  const isMac = navigator.platform.toLowerCase().includes('mac')

  return (
    <div className="drag-region flex h-10 shrink-0 items-center justify-between border-b border-ink-600 bg-ink-800/80 px-3 backdrop-blur">
      {/* Reserve space for the macOS traffic lights so nothing overlaps them. */}
      <div className="flex items-center gap-2.5" style={{ paddingLeft: isMac ? 70 : 4 }}>
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent-dim text-[12px] font-bold text-white shadow-sm">
          J
        </div>
        <span className="text-[13px] font-semibold tracking-tight text-slate-200">Janus</span>
        {!minimal && <span className="text-[11px] font-medium text-slate-600">SSH Manager</span>}
      </div>

      <div className="no-drag flex items-center gap-1">
        {!minimal && !locked && (
          <button onClick={() => lock()} className="btn-ghost mr-1 px-2.5 py-1 text-[12px]" title="Vault'u kilitle">
            <Lock size={13} /> Kilitle
          </button>
        )}
        {!isMac && (
          <div className="flex items-center">
            <button onClick={() => window.janus.window.minimize()} className="rounded-md p-2 text-slate-400 hover:bg-ink-600 hover:text-white">
              <Minus size={14} />
            </button>
            <button onClick={() => window.janus.window.maximize()} className="rounded-md p-2 text-slate-400 hover:bg-ink-600 hover:text-white">
              <Square size={11} />
            </button>
            <button onClick={() => window.janus.window.close()} className="rounded-md p-2 text-slate-400 hover:bg-bad hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import { Lock, Minus, Square, X } from 'lucide-react'
import { useStore } from '../store'
import logo from '../assets/logo-mark.png'

export default function TitleBar({ minimal = false }: { minimal?: boolean }): JSX.Element {
  const { lock, locked } = useStore()
  const isMac = navigator.platform.toLowerCase().includes('mac')

  return (
    <div className="drag-region flex h-10 shrink-0 items-center justify-between border-b border-ink-600 bg-ink-800/80 px-3 backdrop-blur">
      {/* Reserve space for the macOS traffic lights so nothing overlaps them. */}
      <div className="flex items-center gap-2.5" style={{ paddingLeft: isMac ? 70 : 4 }}>
        {/* Brand wordmark (transparent, white "Janus"). */}
        <img src={logo} alt="Janus" className="h-[18px] w-auto select-none" draggable={false} />
        {!minimal && (
          <span className="ml-1 text-[11px] font-medium text-slate-600">
            SSH Manager <span className="text-slate-700">|</span>{' '}
            <span className="text-slate-400">The Asaf Effect</span>
          </span>
        )}
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

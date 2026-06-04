import { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { SearchAddon } from '@xterm/addon-search'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useStore } from '../store'
import type { Tab } from '../store'

const THEME = {
  background: '#0a0b0d',
  foreground: '#e4e7ec',
  cursor: '#818cf8',
  cursorAccent: '#0a0b0d',
  selectionBackground: '#2c3340',
  black: '#0b0e14',
  red: '#fb5d6b',
  green: '#34d399',
  yellow: '#fbbf24',
  blue: '#6366f1',
  magenta: '#a78bfa',
  cyan: '#22d3ee',
  white: '#cbd5e1',
  brightBlack: '#475569',
  brightRed: '#fb7185',
  brightGreen: '#4ade80',
  brightYellow: '#fbbf24',
  brightBlue: '#818cf8',
  brightMagenta: '#c4b5fd',
  brightCyan: '#67e8f9',
  brightWhite: '#f1f5f9'
}

export default function TerminalView({ tab }: { tab: Tab }): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const searchRef = useRef<SearchAddon | null>(null)
  const { vault, setTabStatus } = useStore()
  const settings = vault?.settings
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!hostRef.current) return
    const term = new Terminal({
      fontFamily: settings?.fontFamily || 'JetBrains Mono, monospace',
      fontSize: settings?.fontSize || 13,
      cursorStyle: settings?.cursorStyle || 'bar',
      cursorBlink: settings?.cursorBlink ?? true,
      scrollback: settings?.scrollback || 10000,
      allowProposedApi: true,
      theme: THEME
    })
    const fit = new FitAddon()
    const search = new SearchAddon()
    term.loadAddon(fit)
    term.loadAddon(new WebLinksAddon())
    term.loadAddon(search)
    term.open(hostRef.current)
    fit.fit()
    termRef.current = term
    fitRef.current = fit
    searchRef.current = search

    // Intercept Cmd/Ctrl+F to open the in-terminal search box.
    term.attachCustomKeyEventHandler((e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f' && e.type === 'keydown') {
        setShowSearch(true)
        setTimeout(() => searchInputRef.current?.focus(), 10)
        return false
      }
      return true
    })

    const sessionId = tab.id
    const keyDisposable = term.onData((d) => window.janus.ssh.data(sessionId, d))
    const offData = window.janus.ssh.onData(sessionId, (data) => term.write(data))
    const offStatus = window.janus.ssh.onStatus(sessionId, (p) => {
      setTabStatus(sessionId, p.status as Tab['status'])
      if (p.status === 'error' && p.message) {
        term.writeln(`\r\n\x1b[31m✖ Bağlantı hatası: ${p.message}\x1b[0m`)
      }
      if (p.status === 'disconnected') {
        term.writeln('\r\n\x1b[33m⚠ Bağlantı kapandı.\x1b[0m')
      }
    })

    const { cols, rows } = term
    window.janus.ssh
      .connect(sessionId, tab.serverId, cols, rows)
      .catch((e) => term.writeln(`\r\n\x1b[31m✖ ${(e as Error).message}\x1b[0m`))

    const resize = (): void => {
      try {
        fit.fit()
        window.janus.ssh.resize(sessionId, term.cols, term.rows)
      } catch {
        /* noop */
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(hostRef.current)

    return () => {
      ro.disconnect()
      keyDisposable.dispose()
      offData()
      offStatus()
      window.janus.ssh.disconnect(sessionId)
      term.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab.id])

  useEffect(() => {
    const t = setTimeout(() => fitRef.current?.fit(), 30)
    return () => clearTimeout(t)
  })

  const SEARCH_OPTS = { decorations: { matchOverviewRuler: '#6366f1', activeMatchColorOverviewRuler: '#818cf8' } }

  return (
    <div className="relative h-full w-full bg-ink-900">
      {showSearch && (
        <div className="absolute right-4 top-3 z-10 flex items-center gap-1 rounded-lg border border-ink-500 bg-ink-800 p-1 shadow-lg">
          <Search size={14} className="ml-1.5 text-slate-500" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              searchRef.current?.findNext(e.target.value, SEARCH_OPTS)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') searchRef.current?.findNext(query, SEARCH_OPTS)
              if (e.key === 'Escape') {
                setShowSearch(false)
                termRef.current?.focus()
              }
            }}
            placeholder="Terminalde ara…"
            className="w-44 bg-transparent px-1 py-1 text-sm text-slate-100 outline-none placeholder:text-slate-600"
          />
          <button onClick={() => searchRef.current?.findPrevious(query, SEARCH_OPTS)} className="rounded p-1 text-slate-400 hover:bg-ink-600">
            <ChevronUp size={14} />
          </button>
          <button onClick={() => searchRef.current?.findNext(query, SEARCH_OPTS)} className="rounded p-1 text-slate-400 hover:bg-ink-600">
            <ChevronDown size={14} />
          </button>
          <button onClick={() => { setShowSearch(false); termRef.current?.focus() }} className="rounded p-1 text-slate-400 hover:bg-ink-600">
            <X size={14} />
          </button>
        </div>
      )}
      <div ref={hostRef} className="xterm-host h-full w-full" />
    </div>
  )
}

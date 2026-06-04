import { useEffect, useState, useCallback } from 'react'
import {
  Folder,
  File,
  ArrowUp,
  RefreshCw,
  Download,
  Upload,
  FolderPlus,
  Trash2,
  Pencil,
  Home,
  Link2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useStore } from '../store'
import type { Tab } from '../store'
import type { SftpEntry } from '@shared/types'

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

export default function SftpPanel({ tab }: { tab: Tab }): JSX.Element {
  const { setTabStatus } = useStore()
  const serverId = tab.serverId
  const [path, setPath] = useState('.')
  const [entries, setEntries] = useState<SftpEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(
    async (target: string) => {
      setLoading(true)
      setError(null)
      try {
        const { cwd, entries: list } = await window.janus.sftp.list(serverId, target)
        setEntries(list)
        setPath(cwd) // always the resolved absolute path
        setTabStatus(tab.id, 'connected')
      } catch (e) {
        setError((e as Error).message)
        setTabStatus(tab.id, 'error')
      } finally {
        setLoading(false)
      }
    },
    [serverId, tab.id, setTabStatus]
  )

  useEffect(() => {
    load('.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function up(): void {
    if (path === '/') return
    const parent = path.replace(/\/+$/, '').split('/').slice(0, -1).join('/') || '/'
    load(parent)
  }

  async function action<T>(key: string, fn: () => Promise<T>): Promise<void> {
    setBusy(key)
    setError(null)
    try {
      await fn()
      await load(path)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const displayPath = path || '/'

  return (
    <div className="flex h-full flex-col bg-ink-900">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-ink-600 bg-ink-800 px-3 py-2">
        <button onClick={() => load('.')} className="btn-ghost px-2 py-1.5" title="Ev dizini">
          <Home size={15} />
        </button>
        <button onClick={up} className="btn-ghost px-2 py-1.5" title="Üst dizin">
          <ArrowUp size={15} />
        </button>
        <button onClick={() => load(path)} className="btn-ghost px-2 py-1.5" title="Yenile">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
        <div className="mx-2 flex flex-1 items-center gap-2 truncate rounded-md border border-ink-500 bg-ink-900 px-3 py-1.5 text-xs text-slate-300">
          <Link2 size={13} className="shrink-0 text-slate-500" />
          <span className="truncate font-mono">{displayPath}</span>
        </div>
        <button
          onClick={() => action('upload', async () => { await window.janus.sftp.upload(serverId, path === '.' ? '.' : path) })}
          className="btn-ghost border border-ink-500"
          title="Dosya yükle"
        >
          {busy === 'upload' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Yükle
        </button>
        <button
          onClick={() =>
            action('mkdir', async () => {
              const name = prompt('Yeni klasör adı:')
              if (name) await window.janus.sftp.mkdir(serverId, `${path.replace(/\/$/, '')}/${name}`)
            })
          }
          className="btn-ghost border border-ink-500"
          title="Yeni klasör"
        >
          <FolderPlus size={15} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-bad/10 px-4 py-2 text-xs text-bad">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* File table */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-ink-800 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left font-medium">İsim</th>
              <th className="w-24 px-4 py-2 text-right font-medium">Boyut</th>
              <th className="w-44 px-4 py-2 text-left font-medium">Değiştirilme</th>
              <th className="w-28 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.path} className="group border-b border-ink-700/50 hover:bg-ink-800">
                <td
                  className="cursor-pointer px-4 py-1.5"
                  onClick={() => e.type === 'directory' && load(e.path)}
                  onDoubleClick={() => e.type === 'directory' && load(e.path)}
                >
                  <div className="flex items-center gap-2">
                    {e.type === 'directory' ? (
                      <Folder size={15} className="shrink-0 text-accent" />
                    ) : (
                      <File size={15} className="shrink-0 text-slate-400" />
                    )}
                    <span className={e.type === 'directory' ? 'text-slate-100' : 'text-slate-300'}>{e.name}</span>
                  </div>
                </td>
                <td className="px-4 py-1.5 text-right font-mono text-xs text-slate-500">
                  {e.type === 'file' ? fmtSize(e.size) : '—'}
                </td>
                <td className="px-4 py-1.5 text-xs text-slate-500">{new Date(e.mtime).toLocaleString('tr-TR')}</td>
                <td className="px-4 py-1.5">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                    {e.type === 'file' && (
                      <button
                        onClick={() => action(`dl-${e.path}`, async () => { await window.janus.sftp.download(serverId, e.path) })}
                        className="rounded p-1 text-slate-400 hover:bg-ink-500 hover:text-white"
                        title="İndir"
                      >
                        <Download size={13} />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        action(`rn-${e.path}`, async () => {
                          const name = prompt('Yeni isim:', e.name)
                          if (name && name !== e.name) {
                            const dir = e.path.split('/').slice(0, -1).join('/')
                            await window.janus.sftp.rename(serverId, e.path, `${dir}/${name}`)
                          }
                        })
                      }
                      className="rounded p-1 text-slate-400 hover:bg-ink-500 hover:text-white"
                      title="Yeniden adlandır"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() =>
                        confirm(`"${e.name}" silinsin mi?`) &&
                        action(`rm-${e.path}`, async () => {
                          await window.janus.sftp.remove(serverId, e.path, e.type === 'directory')
                        })
                      }
                      className="rounded p-1 text-slate-400 hover:bg-bad hover:text-white"
                      title="Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && entries.length === 0 && !error && (
          <div className="py-12 text-center text-sm text-slate-500">Bu klasör boş.</div>
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Yükleniyor…
          </div>
        )}
      </div>
    </div>
  )
}

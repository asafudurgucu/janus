import { Terminal as TerminalIcon, FolderTree, Pencil, Server, Tag, Clock, Globe, User, KeyRound } from 'lucide-react'
import { useStore } from '../store'

function timeAgo(ts?: number): string {
  if (!ts) return 'hiç'
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'az önce'
  if (m < 60) return `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} saat önce`
  return `${Math.floor(h / 24)} gün önce`
}

export default function ServerDetail(): JSX.Element {
  const { vault, selectedServerId, openTerminal, openSftp, openServerForm } = useStore()
  const server = vault?.servers.find((s) => s.id === selectedServerId)

  if (!server) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-ink-700 text-accent">
          <Server size={40} />
        </div>
        <h2 className="text-lg font-semibold text-slate-300">Janus'a hoş geldin</h2>
        <p className="mt-1 max-w-sm text-sm">
          Soldan bir sunucu seç ya da çift tıklayarak bağlan. Yeni sunucu eklemek için{' '}
          <kbd className="rounded bg-ink-600 px-1.5 py-0.5 text-xs">+</kbd> butonunu kullan.
        </p>
      </div>
    )
  }

  const auth =
    server.authMethod === 'password' ? 'Parola' : server.authMethod === 'key' ? 'SSH Anahtarı' : 'SSH Agent'

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: server.color || '#3a465c' }}
        >
          <Server size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-white">{server.name}</h1>
          <p className="text-slate-400">
            {server.username}@{server.host}:{server.port}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {server.tags.map((t) => (
              <span key={t} className="chip">
                <Tag size={10} /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button onClick={() => openTerminal(server.id)} className="btn-primary">
          <TerminalIcon size={16} /> Terminal Aç
        </button>
        <button onClick={() => openSftp(server.id)} className="btn-ghost border border-ink-500">
          <FolderTree size={16} /> SFTP
        </button>
        <button onClick={() => openServerForm(server)} className="btn-ghost border border-ink-500">
          <Pencil size={16} /> Düzenle
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoCard icon={Globe} label="Host" value={`${server.host}:${server.port}`} />
        <InfoCard icon={User} label="Kullanıcı" value={server.username} />
        <InfoCard icon={KeyRound} label="Kimlik doğrulama" value={auth} />
        <InfoCard icon={Clock} label="Son bağlantı" value={timeAgo(server.lastConnectedAt)} />
      </div>

      {server.notes && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Notlar</h3>
          <div className="whitespace-pre-wrap rounded-lg border border-ink-600 bg-ink-800 p-4 text-sm text-slate-300">
            {server.notes}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Globe; label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ink-600 bg-ink-800 px-4 py-3">
      <Icon size={18} className="text-accent" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className="truncate text-sm text-slate-200">{value}</div>
      </div>
    </div>
  )
}

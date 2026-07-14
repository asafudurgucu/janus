import { useEffect, useState } from 'react'
import {
  Settings,
  Type,
  ShieldCheck,
  Download,
  Upload,
  KeyRound,
  Check,
  AlertCircle,
  RefreshCw,
  Linkedin,
  Palette,
  Clock,
  Cloud,
  Plug,
  FileUp,
  FileDown,
  Bell,
  Loader2
} from 'lucide-react'
import { useStore } from '../store'
import type { ThemeId } from '@shared/types'

export default function SettingsPanel(): JSX.Element {
  const { vault, updateSettings } = useStore()
  const s = vault?.settings
  if (!s) return <div />

  return (
    <div className="flex h-full flex-col bg-ink-900">
      <div className="border-b border-ink-600 px-6 py-4">
        <h1 className="flex items-center gap-2 text-lg font-bold text-white">
          <Settings size={20} className="text-accent" /> Ayarlar
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Theme */}
          <ThemeSection current={s.theme} onPick={(t) => updateSettings({ theme: t })} />

          {/* Session & security */}
          <SessionSection />

          {/* Terminal appearance */}
          <Section icon={Type} title="Terminal Görünümü">
            <Row label="Yazı tipi">
              <input
                value={s.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                className="field"
              />
            </Row>
            <Row label="Font boyutu">
              <input
                type="number"
                min={8}
                max={32}
                value={s.fontSize}
                onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                className="field"
              />
            </Row>
            <Row label="İmleç stili">
              <select value={s.cursorStyle} onChange={(e) => updateSettings({ cursorStyle: e.target.value as never })} className="field">
                <option value="bar">Çizgi</option>
                <option value="block">Blok</option>
                <option value="underline">Alt çizgi</option>
              </select>
            </Row>
            <Row label="Geçmiş satır sayısı (scrollback)">
              <input
                type="number"
                value={s.scrollback}
                onChange={(e) => updateSettings({ scrollback: Number(e.target.value) })}
                className="field"
              />
            </Row>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={s.cursorBlink}
                onChange={(e) => updateSettings({ cursorBlink: e.target.checked })}
                className="h-4 w-4 accent-accent"
              />
              İmleç yanıp sönsün
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={s.autoReconnect}
                onChange={(e) => updateSettings({ autoReconnect: e.target.checked })}
                className="h-4 w-4 accent-accent"
              />
              Bağlantı koparsa otomatik yeniden bağlan
            </label>
          </Section>

          {/* Integrations */}
          <IntegrationsSection />

          {/* Vault */}
          <VaultSection />

          <CloudSoon />

          <AboutSection />
        </div>
      </div>
    </div>
  )
}

function AboutSection(): JSX.Element {
  const [version, setVersion] = useState('—')
  const [checking, setChecking] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    window.janus.updates.version().then(setVersion).catch(() => undefined)
    const off = window.janus.updates.onStatus((s) => {
      if (s.phase === 'checking') setNote('Kontrol ediliyor…')
      else if (s.phase === 'not-available') setNote('En güncel sürümü kullanıyorsun ✓')
      else if (s.phase === 'available') setNote(`Yeni sürüm mevcut: v${s.version}`)
      else if (s.phase === 'error') setNote(`Hata: ${s.error}`)
      else setNote(null)
      if (s.phase !== 'checking') setChecking(false)
    })
    return off
  }, [])

  async function check(): Promise<void> {
    setChecking(true)
    setNote('Kontrol ediliyor…')
    try {
      await window.janus.updates.check()
    } catch (e) {
      setNote(`Hata: ${(e as Error).message}`)
      setChecking(false)
    }
  }

  return (
    <Section icon={ShieldCheck} title="Hakkında & Güncellemeler">
      <p className="text-sm text-slate-400">
        <strong className="text-slate-200">Janus</strong> — profesyonel SSH ve sunucu yöneticisi.
        <br />
        Tüm verilerin tek bir AES-256-GCM ile şifreli dosyada saklanır. Şifren cihazından asla çıkmaz.
      </p>
      <div className="mt-3 flex items-center justify-between rounded-lg border border-ink-600 bg-ink-900/50 px-4 py-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Yüklü sürüm</div>
          <div className="font-mono text-sm text-slate-200">v{version}</div>
        </div>
        <button onClick={check} disabled={checking} className="btn-ghost border border-ink-500">
          <RefreshCw size={15} className={checking ? 'animate-spin' : ''} /> Güncellemeleri kontrol et
        </button>
      </div>
      {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}

      <div className="mt-4 flex items-center justify-between border-t border-ink-600 pt-4">
        <span className="text-xs text-slate-500">
          a product of <span className="font-semibold text-slate-300">The Asaf Effect</span>
        </span>
        <button
          onClick={() => window.open('https://www.linkedin.com/in/asaf-üdürgücü-a55a4a1b8/')}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-ink-600 hover:text-accent"
          title="LinkedIn"
        >
          <Linkedin size={14} /> asaf üdürgücü
        </button>
      </div>
    </Section>
  )
}

function VaultSection(): JSX.Element {
  const [oldP, setOldP] = useState('')
  const [newP, setNewP] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [importPw, setImportPw] = useState('')

  async function changePw(): Promise<void> {
    setMsg(null)
    try {
      await window.janus.vault.changePassword(oldP, newP)
      setMsg({ type: 'ok', text: 'Master parola güncellendi.' })
      setOldP('')
      setNewP('')
    } catch (e) {
      setMsg({ type: 'err', text: (e as Error).message })
    }
  }

  async function exportVault(): Promise<void> {
    setMsg(null)
    try {
      const path = await window.janus.vault.export()
      if (path) setMsg({ type: 'ok', text: `Dışa aktarıldı: ${path}` })
    } catch (e) {
      setMsg({ type: 'err', text: (e as Error).message })
    }
  }

  async function importVault(): Promise<void> {
    setMsg(null)
    if (!importPw) return setMsg({ type: 'err', text: 'İçe aktarılacak dosyanın parolasını gir.' })
    try {
      const res = await window.janus.vault.import(importPw)
      if (res) {
        useStore.setState({ vault: res })
        setMsg({ type: 'ok', text: 'Vault içe aktarıldı.' })
        setImportPw('')
      }
    } catch (e) {
      setMsg({ type: 'err', text: (e as Error).message })
    }
  }

  return (
    <Section icon={KeyRound} title="Vault & Güvenlik">
      <div className="space-y-3">
        <p className="text-xs text-slate-500">Master parolayı değiştir:</p>
        <div className="grid grid-cols-2 gap-3">
          <input type="password" value={oldP} onChange={(e) => setOldP(e.target.value)} className="field" placeholder="Mevcut parola" />
          <input type="password" value={newP} onChange={(e) => setNewP(e.target.value)} className="field" placeholder="Yeni parola" />
        </div>
        <button onClick={changePw} disabled={!oldP || !newP} className="btn-ghost border border-ink-500">
          <KeyRound size={15} /> Parolayı Güncelle
        </button>
      </div>

      <div className="mt-4 border-t border-ink-600 pt-4">
        <p className="mb-2 text-xs text-slate-500">Yedekleme — şifreli, taşınabilir tek dosya:</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportVault} className="btn-ghost border border-ink-500">
            <Download size={15} /> Dışa Aktar
          </button>
          <div className="flex gap-2">
            <input type="password" value={importPw} onChange={(e) => setImportPw(e.target.value)} className="field w-44" placeholder="Dosya parolası" />
            <button onClick={importVault} className="btn-ghost border border-ink-500">
              <Upload size={15} /> İçe Aktar
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs ${msg.type === 'ok' ? 'bg-good/10 text-good' : 'bg-bad/10 text-bad'}`}>
          {msg.type === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />} {msg.text}
        </div>
      )}
    </Section>
  )
}

function IntegrationsSection(): JSX.Element {
  const { vault, updateSettings, importSshConfig } = useStore()
  const s = vault!.settings
  const [busy, setBusy] = useState<'imp' | 'exp' | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function doImport(): Promise<void> {
    setBusy('imp')
    setMsg(null)
    try {
      const { added, skipped } = await importSshConfig()
      setMsg(`İçe aktarıldı: ${added} sunucu eklendi${skipped ? `, ${skipped} zaten vardı` : ''}.`)
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(null)
    }
  }
  async function doExport(): Promise<void> {
    setBusy('exp')
    setMsg(null)
    try {
      const path = await window.janus.sshConfig.export()
      setMsg(`Dışa aktarıldı: ${path}`)
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <Section icon={Plug} title="Entegrasyonlar">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={s.notifications}
          onChange={(e) => updateSettings({ notifications: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <Bell size={14} className="text-slate-500" /> Masaüstü bildirimleri (komut bitince, sunucu düşünce)
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={s.backgroundMonitor}
          onChange={(e) => updateSettings({ backgroundMonitor: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        Arka planda tüm sunucuları izle — geçmiş grafikleri + %90 eşik uyarıları (60sn'de bir)
      </label>

      <div className="mt-2 border-t border-ink-600 pt-3">
        <p className="mb-2 text-xs text-slate-500">
          <span className="font-mono">~/.ssh/config</span> ile senkron:
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={doImport} disabled={!!busy} className="btn-ghost border border-ink-500">
            {busy === 'imp' ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />} İçe aktar
          </button>
          <button onClick={doExport} disabled={!!busy} className="btn-ghost border border-ink-500">
            {busy === 'exp' ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />} Dışa aktar
          </button>
        </div>
      </div>
      {msg && <p className="mt-2 break-all text-xs text-slate-400">{msg}</p>}
    </Section>
  )
}

function Section({ icon: Icon, title, children }: { icon: typeof Type; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-200">
        <Icon size={16} className="text-accent" /> {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="grid grid-cols-[200px_1fr] items-center gap-3">
      <label className="text-sm text-slate-400">{label}</label>
      {children}
    </div>
  )
}

const THEMES: { id: ThemeId; name: string; bg: string; accent: string }[] = [
  { id: 'midnight', name: 'Midnight', bg: '#0a0b0d', accent: '#6366f1' },
  { id: 'slate', name: 'Slate', bg: '#16191f', accent: '#6366f1' },
  { id: 'carbon', name: 'Carbon', bg: '#0d0d0f', accent: '#3b82f6' },
  { id: 'ocean', name: 'Ocean', bg: '#080c14', accent: '#06b6d4' },
  { id: 'plum', name: 'Plum', bg: '#0e0a12', accent: '#a855f7' },
  { id: 'forest', name: 'Forest', bg: '#090e0b', accent: '#10b981' },
  { id: 'coffee', name: 'Coffee', bg: '#1c1612', accent: '#c7925c' },
  { id: 'claude', name: 'Claude', bg: '#201c19', accent: '#cc7857' },
  { id: 'sand', name: 'Sand', bg: '#24211c', accent: '#84a97a' }
]

function ThemeSection({ current, onPick }: { current: ThemeId; onPick: (t: ThemeId) => void }): JSX.Element {
  return (
    <Section icon={Palette} title="Tema">
      <div className="grid grid-cols-5 gap-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            className={`rounded-lg border p-2 transition-colors ${
              current === t.id ? 'border-accent ring-1 ring-accent' : 'border-ink-500 hover:border-ink-400'
            }`}
          >
            <div className="mb-2 flex h-12 items-end rounded-md p-1.5" style={{ background: t.bg }}>
              <span className="h-2 w-full rounded-full" style={{ background: t.accent }} />
            </div>
            <div className={`text-center text-xs ${current === t.id ? 'text-white' : 'text-slate-400'}`}>{t.name}</div>
          </button>
        ))}
      </div>
    </Section>
  )
}

function SessionSection(): JSX.Element {
  const { vault, updateSettings } = useStore()
  const s = vault!.settings
  const [remembered, setRemembered] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    window.janus.vault.status().then((st) => setRemembered(st.hasRemembered)).catch(() => undefined)
  }, [])

  async function toggleRemember(on: boolean): Promise<void> {
    setBusy(true)
    try {
      if (on) await window.janus.vault.remember()
      else await window.janus.vault.forget()
      setRemembered(on)
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section icon={Clock} title="Oturum & Güvenlik">
      <Row label="Boşta otomatik kilit">
        <select
          value={s.lockAfterMinutes}
          onChange={(e) => updateSettings({ lockAfterMinutes: Number(e.target.value) })}
          className="field"
        >
          <option value={0}>Kapalı</option>
          <option value={5}>5 dakika sonra</option>
          <option value={15}>15 dakika sonra</option>
          <option value={30}>30 dakika sonra</option>
          <option value={60}>1 saat sonra</option>
        </select>
      </Row>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          disabled={busy}
          checked={remembered}
          onChange={(e) => toggleRemember(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        Bu cihazda otomatik giriş yap (parola OS kasasında şifreli saklanır)
      </label>
      <p className="text-xs text-slate-500">
        Kapatırsan her açılışta master parola sorulur. Açıkken bu cihazda parola sorulmadan girilir.
      </p>
    </Section>
  )
}

function CloudSoon(): JSX.Element {
  return (
    <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <Cloud size={17} className="text-accent" />
        <span className="font-semibold text-slate-200">Bulut Senkronizasyonu & Hesaplar</span>
        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
          Yakında
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-400">
        Çok yakında: <span className="text-slate-300">kullanıcı hesabıyla giriş</span>, cihazlar arası şifreli
        senkronizasyon ve ekip içi sunucu paylaşımı. Sunucuların her cihazında, güvenle yanında.
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <Plug size={12} /> The Asaf Effect ekosistemiyle geliyor.
      </p>
    </div>
  )
}

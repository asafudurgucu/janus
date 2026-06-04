import { useEffect, useState } from 'react'
import { Settings, Type, ShieldCheck, Download, Upload, KeyRound, Check, AlertCircle, RefreshCw, Linkedin } from 'lucide-react'
import { useStore } from '../store'

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
          </Section>

          {/* Vault */}
          <VaultSection />

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

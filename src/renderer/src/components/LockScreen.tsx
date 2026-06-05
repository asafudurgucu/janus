import { useEffect, useState } from 'react'
import { KeyRound, Upload, AlertCircle, Fingerprint } from 'lucide-react'
import { useStore } from '../store'
import logo from '../assets/logo.png'

export default function LockScreen(): JSX.Element {
  const { hasVault, createVault, unlock } = useStore()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [remember, setRemember] = useState(false)
  const [touchOk, setTouchOk] = useState(false)

  const isCreate = !hasVault

  // Offer Touch ID when a password is remembered on this device (macOS).
  useEffect(() => {
    if (isCreate) return
    ;(async () => {
      try {
        const status = await window.janus.vault.status()
        const avail = await window.janus.system.touchIdAvailable()
        setTouchOk(status.hasRemembered && avail)
      } catch {
        /* ignore */
      }
    })()
  }, [isCreate])

  async function touchUnlock(): Promise<void> {
    setError(null)
    setBusy(true)
    try {
      await window.janus.system.touchIdPrompt('Janus kilidini aç')
      const vault = await window.janus.vault.autoUnlock()
      useStore.setState({ vault, locked: false, hasVault: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)
    if (isCreate) {
      if (password.length < 4) return setError('Parola en az 4 karakter olmalı.')
      if (password !== confirm) return setError('Parolalar eşleşmiyor.')
    }
    setBusy(true)
    try {
      if (isCreate) await createVault(password, remember)
      else await unlock(password, remember)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function importVault(): Promise<void> {
    setError(null)
    if (!password) return setError('İçe aktarmak için dosyanın parolasını girin.')
    setBusy(true)
    try {
      const res = await window.janus.vault.import(password)
      if (res) {
        useStore.setState({ vault: res, locked: false, hasVault: true })
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-ink-900">
      {/* subtle ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      <div className="relative w-[396px] rounded-2xl border border-ink-600 bg-ink-800/70 p-8 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          {/* Brand wordmark — black background drops out via screen blend. */}
          <img
            src={logo}
            alt="Janus"
            className="h-24 w-auto select-none"
            style={{ mixBlendMode: 'screen' }}
            draggable={false}
          />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {isCreate ? 'Vault oluştur' : 'Tekrar hoş geldin'}
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
              {isCreate
                ? 'Tüm sunucuların tek bir şifreli dosyada saklanır.'
                : 'Sunucularına erişmek için master parolanı gir.'}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Master Parola</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isCreate && (
            <div>
              <label className="label">Parolayı Doğrula</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="field"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-bad/10 px-3 py-2 text-xs text-bad">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Bu cihazda beni hatırla (otomatik giriş)
          </label>

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Lütfen bekle…' : isCreate ? 'Vault Oluştur' : 'Kilidi Aç'}
          </button>
        </form>

        {touchOk && (
          <button onClick={touchUnlock} disabled={busy} className="btn-ghost mt-3 w-full border border-ink-500">
            <Fingerprint size={16} /> Touch ID ile aç
          </button>
        )}

        <div className="mt-4 border-t border-ink-600 pt-4">
          <button onClick={importVault} disabled={busy} className="btn-ghost w-full text-xs">
            <Upload size={14} /> Mevcut bir vault dosyası içe aktar
          </button>
        </div>

        {isCreate && (
          <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-600">
            Master parolanı unutursan kayıtlarına erişemezsin. Parola cihazından çıkmaz;
            yalnızca dosyayı AES-256-GCM ile şifreler.
          </p>
        )}
      </div>

      <div className="absolute bottom-5 left-0 right-0 text-center text-[11px] tracking-wide text-slate-600">
        The Asaf Effect · 2026
      </div>
    </div>
  )
}

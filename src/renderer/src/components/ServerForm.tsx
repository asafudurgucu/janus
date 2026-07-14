import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { X, Plus, Sparkles, Copy, Check, UploadCloud, Loader2 } from 'lucide-react'
import { useStore } from '../store'
import Modal from './Modal'
import type { ServerProfile, AuthMethod } from '@shared/types'

const COLORS = ['#5b8cff', '#3ecf8e', '#f0b429', '#f0506e', '#a78bfa', '#22d3ee', '#fb923c', '#94a3b8']

function blank(partial?: Partial<ServerProfile>): ServerProfile {
  return {
    id: uuid(),
    name: '',
    host: '',
    port: 22,
    username: 'root',
    authMethod: 'password',
    password: '',
    privateKey: '',
    passphrase: '',
    groupId: null,
    tags: [],
    color: COLORS[0],
    notes: '',
    jumpHostId: null,
    keepaliveInterval: 30,
    vncPort: 5900,
    vncPassword: '',
    rdpPort: 3389,
    rdpUsername: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...partial
  }
}

export default function ServerForm(): JSX.Element {
  const { editingServer, closeServerForm, upsertServer, vault } = useStore()
  const [form, setForm] = useState<ServerProfile>(() => editingServer ? { ...blank(), ...editingServer } : blank(editingServer ?? undefined))
  const [tagInput, setTagInput] = useState('')
  const [genPub, setGenPub] = useState('')
  const [keyBusy, setKeyBusy] = useState<'gen' | 'install' | null>(null)
  const [keyMsg, setKeyMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const groups = vault?.groups ?? []
  const otherServers = (vault?.servers ?? []).filter((s) => s.id !== form.id)
  const isEdit = !!editingServer?.host

  function set<K extends keyof ServerProfile>(key: K, value: ServerProfile[K]): void {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addTag(): void {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t])
    setTagInput('')
  }

  async function generateKey(): Promise<void> {
    setKeyBusy('gen')
    setKeyMsg(null)
    try {
      const k = await window.janus.ssh.keygen('ed25519', `janus-${form.name || 'key'}`)
      setForm((f) => ({ ...f, privateKey: k.privateKey, passphrase: '' }))
      setGenPub(k.publicKey)
      setKeyMsg('Anahtar üretildi ve özel anahtar alanına yazıldı.')
    } catch (e) {
      setKeyMsg((e as Error).message)
    } finally {
      setKeyBusy(null)
    }
  }

  // Installs the public key using the server's CURRENTLY SAVED auth (e.g. password),
  // so you can switch a password server over to key auth in one go.
  async function installKey(): Promise<void> {
    if (!genPub) return
    setKeyBusy('install')
    setKeyMsg(null)
    try {
      await window.janus.ssh.installKey(form.id, genPub)
      setKeyMsg('✓ Public key sunucuya kuruldu. Kimlik doğrulamayı "SSH Anahtarı" bırakıp kaydet.')
    } catch (e) {
      setKeyMsg('Kurulamadı: ' + (e as Error).message)
    } finally {
      setKeyBusy(null)
    }
  }

  async function save(): Promise<void> {
    if (!form.name.trim() || !form.host.trim()) return
    await upsertServer(form)
    closeServerForm()
  }

  return (
    <Modal
      title={isEdit ? 'Sunucuyu Düzenle' : 'Yeni Sunucu'}
      onClose={closeServerForm}
      width={560}
      footer={
        <>
          <button onClick={closeServerForm} className="btn-ghost">
            İptal
          </button>
          <button onClick={save} disabled={!form.name.trim() || !form.host.trim()} className="btn-primary">
            {isEdit ? 'Kaydet' : 'Ekle'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">İsim *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className="field" placeholder="Üretim Web Sunucusu" autoFocus />
          </div>
          <div>
            <label className="label">Host / IP *</label>
            <input value={form.host} onChange={(e) => set('host', e.target.value)} className="field" placeholder="192.168.1.10" />
          </div>
          <div>
            <label className="label">Port</label>
            <input type="number" value={form.port} onChange={(e) => set('port', Number(e.target.value) || 22)} className="field" />
          </div>
          <div>
            <label className="label">Kullanıcı adı</label>
            <input value={form.username} onChange={(e) => set('username', e.target.value)} className="field" placeholder="root" />
          </div>
          <div>
            <label className="label">Kimlik doğrulama</label>
            <select value={form.authMethod} onChange={(e) => set('authMethod', e.target.value as AuthMethod)} className="field">
              <option value="password">Parola</option>
              <option value="key">SSH Anahtarı</option>
              <option value="agent">SSH Agent</option>
            </select>
          </div>
        </div>

        {form.authMethod === 'password' && (
          <div>
            <label className="label">Parola</label>
            <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} className="field" placeholder="••••••••" />
          </div>
        )}

        {form.authMethod === 'key' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button onClick={generateKey} disabled={!!keyBusy} className="btn-ghost border border-ink-500 text-xs">
                {keyBusy === 'gen' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Yeni anahtar üret (ed25519)
              </button>
              {isEdit && genPub && (
                <button onClick={installKey} disabled={!!keyBusy} className="btn-ghost border border-ink-500 text-xs">
                  {keyBusy === 'install' ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Sunucuya kur
                </button>
              )}
            </div>
            {keyMsg && <p className="text-xs text-slate-400">{keyMsg}</p>}

            {genPub && (
              <div>
                <label className="label flex items-center justify-between">
                  Public key (authorized_keys)
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(genPub)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1200)
                    }}
                    className="text-accent hover:underline"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </label>
                <textarea readOnly value={genPub} className="field h-16 font-mono text-[10px]" />
              </div>
            )}

            <div>
              <label className="label">Özel Anahtar (PEM)</label>
              <textarea
                value={form.privateKey}
                onChange={(e) => set('privateKey', e.target.value)}
                className="field h-28 font-mono text-xs"
                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
              />
            </div>
            <div>
              <label className="label">Passphrase (opsiyonel)</label>
              <input type="password" value={form.passphrase} onChange={(e) => set('passphrase', e.target.value)} className="field" />
            </div>
          </div>
        )}

        {form.authMethod === 'agent' && (
          <p className="rounded-md bg-ink-700 px-3 py-2 text-xs text-slate-400">
            Sistemdeki SSH agent ($SSH_AUTH_SOCK) kullanılacak.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Grup</label>
            <select value={form.groupId ?? ''} onChange={(e) => set('groupId', e.target.value || null)} className="field">
              <option value="">— Grupsuz —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Jump Host (bastion)</label>
            <select value={form.jumpHostId ?? ''} onChange={(e) => set('jumpHostId', e.target.value || null)} className="field">
              <option value="">— Yok —</option>
              {otherServers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Etiketler</label>
          <div className="mb-2 flex flex-wrap gap-1">
            {form.tags.map((t) => (
              <span key={t} className="chip">
                {t}
                <button onClick={() => set('tags', form.tags.filter((x) => x !== t))} className="text-slate-500 hover:text-bad">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="field"
              placeholder="prod, web, frankfurt…"
            />
            <button onClick={addTag} className="btn-ghost shrink-0">
              <Plus size={14} /> Ekle
            </button>
          </div>
        </div>

        <div>
          <label className="label">Renk</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set('color', c)}
                className={`h-7 w-7 rounded-full border-2 ${form.color === c ? 'border-white' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-ink-600 bg-ink-900/40 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Uzak Masaüstü (VNC)</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">VNC portu</label>
              <input
                type="number"
                value={form.vncPort ?? 5900}
                onChange={(e) => set('vncPort', Number(e.target.value) || 5900)}
                className="field"
              />
            </div>
            <div>
              <label className="label">VNC parolası</label>
              <input type="password" value={form.vncPassword} onChange={(e) => set('vncPassword', e.target.value)} className="field" placeholder="opsiyonel" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-600">
            Bağlantı SSH tüneli üzerinden sunucuda <span className="font-mono">127.0.0.1:{form.vncPort ?? 5900}</span>'a yapılır. VNC sunucusu çalışıyor olmalı.
          </p>
        </div>

        <div className="rounded-lg border border-ink-600 bg-ink-900/40 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Windows Uzak Masaüstü (RDP)</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">RDP portu</label>
              <input
                type="number"
                value={form.rdpPort ?? 3389}
                onChange={(e) => set('rdpPort', Number(e.target.value) || 3389)}
                className="field"
              />
            </div>
            <div>
              <label className="label">RDP kullanıcı adı</label>
              <input value={form.rdpUsername} onChange={(e) => set('rdpUsername', e.target.value)} className="field" placeholder="Administrator" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-600">
            "RDP ile bağlan" sistemin uzak masaüstü istemcisini açar (Mac'te Microsoft Remote Desktop). Görüntü gelir, parola istemcide sorulur.
          </p>
        </div>

        <div>
          <label className="label">Notlar</label>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className="field h-20" placeholder="Bu sunucu hakkında notlar…" />
        </div>
      </div>
    </Modal>
  )
}

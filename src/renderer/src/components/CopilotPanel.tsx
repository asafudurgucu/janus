import { useRef, useState, useEffect } from 'react'
import { Sparkles, Send, Loader2, Copy, Check, Settings2, Server, Trash2, Paperclip, X, ArrowDown } from 'lucide-react'
import { useStore } from '../store'
import type { AiMessage } from '@shared/types'

const SUGGESTIONS = [
  'Son hatayı açıkla',
  'Diski en çok ne dolduruyor?',
  'nginx için güvenli reload komutu',
  'Bu sunucuyu nasıl sertleştiririm?'
]

const CTX_ESTIMATE = 100_000 // rough soft window for the usage bar

export default function CopilotPanel(): JSX.Element {
  const { vault, selectedServerId, setSidePanel } = useStore()
  const server = vault?.servers.find((s) => s.id === selectedServerId)
  const ai = vault?.settings.ai
  const configured = !!ai && (ai.provider === 'custom' || !!ai.apiKey)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [rateLimit, setRateLimit] = useState<string | null>(null)
  const [attachment, setAttachment] = useState<{ name: string; content: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  const tokenEstimate = Math.ceil(messages.reduce((n, m) => n + m.content.length, 0) / 4)

  async function ask(history: AiMessage[]): Promise<void> {
    setBusy(true)
    setError(null)
    try {
      const system =
        'Sen Janus Copilot\'sun — Janus (SSH & sunucu yöneticisi masaüstü uygulaması) içine gömülü, uzman bir Linux/DevOps/SSH/veritabanı asistanısın. ' +
        'Kısa, net ve doğrudan cevap ver (Türkçe). Kabuk komutu önerirken üç backtick + bash bloğu kullan. Yıkıcı komutlarda uyar. ' +
        (server
          ? `Kullanıcının şu an seçili sunucusu: "${server.name}" — ${server.username}@${server.host}:${server.port}.`
          : 'Şu an seçili bir sunucu yok.')
      const reply = await window.janus.ai.chat(history, system)
      setMessages([...history, { role: 'assistant', content: reply.text }])
      setTruncated(reply.truncated)
      setRateLimit(reply.rateLimit ?? null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function send(text: string): Promise<void> {
    let q = text.trim()
    if ((!q && !attachment) || busy) return
    if (attachment) q = `[Ekli dosya: ${attachment.name}]\n\`\`\`\n${attachment.content}\n\`\`\`\n\n${q}`
    setInput('')
    setAttachment(null)
    await ask([...messages, { role: 'user', content: q }])
  }

  async function continueReply(): Promise<void> {
    if (busy) return
    await ask([...messages, { role: 'user', content: 'Kaldığın yerden devam et.' }])
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>): void {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > 200_000) {
      setError('Dosya 200KB\'den büyük — metin dosyası ekle.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setAttachment({ name: f.name, content: String(reader.result || '').slice(0, 200_000) })
    reader.readAsText(f)
  }

  return (
    <div className="flex h-full flex-col bg-ink-900">
      <div className="flex items-center justify-between border-b border-ink-600 px-6 py-4">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white">
            <Sparkles size={20} className="text-accent" /> AI Copilot
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            {server ? (
              <>
                <Server size={12} /> bağlam: {server.name}
              </>
            ) : (
              'genel asistan · soldan bir sunucu seçersen bağlamı bilir'
            )}
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="btn-ghost border border-ink-500 text-xs">
            <Trash2 size={14} /> Temizle
          </button>
        )}
      </div>

      {!configured ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-slate-500">
          <Sparkles size={40} className="opacity-40" />
          <p className="max-w-sm">
            AI Copilot'u kullanmak için kendi API anahtarını (Claude veya OpenAI) ekle. Anahtarın şifreli
            vault'ta saklanır, yalnızca senin adına isteği yapar.
          </p>
          <button onClick={() => setSidePanel('settings')} className="btn-primary">
            <Settings2 size={15} /> Ayarlar → AI Copilot
          </button>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="mx-auto max-w-2xl">
                <p className="mb-3 text-sm text-slate-500">Bir şey sor ya da hızlı başla:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="chip hover:border-accent hover:text-accent">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((m, i) => (
                <Message key={i} msg={m} />
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={15} className="animate-spin" /> düşünüyor…
                </div>
              )}
              {truncated && !busy && (
                <button onClick={continueReply} className="btn-ghost border border-ink-500 text-xs">
                  <ArrowDown size={13} /> Devam et (yanıt kesildi)
                </button>
              )}
              {error && <div className="rounded-md bg-bad/10 px-3 py-2 text-xs text-bad">{error}</div>}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-ink-600 p-4">
            <div className="mx-auto max-w-2xl">
              {/* context + limit indicator */}
              <div className="mb-1.5 flex items-center gap-2 text-[10px] text-slate-600">
                <span>bağlam ~{(tokenEstimate / 1000).toFixed(1)}k token</span>
                <div className="h-1 w-20 overflow-hidden rounded-full bg-ink-600">
                  <div
                    className={`h-full ${tokenEstimate / CTX_ESTIMATE > 0.8 ? 'bg-warn' : 'bg-accent'}`}
                    style={{ width: `${Math.min(100, (tokenEstimate / CTX_ESTIMATE) * 100)}%` }}
                  />
                </div>
                {rateLimit && <span className="ml-auto">{rateLimit}</span>}
              </div>

              {attachment && (
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-ink-500 bg-ink-800 px-2 py-1 text-xs text-slate-300">
                  <Paperclip size={12} className="text-accent" /> {attachment.name}
                  <button onClick={() => setAttachment(null)} className="text-slate-500 hover:text-bad">
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn-ghost shrink-0 border border-ink-500 px-2.5 py-2"
                  title="Dosya ekle (log, config, kod)"
                >
                  <Paperclip size={16} />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send(input)
                    }
                  }}
                  rows={1}
                  placeholder="Copilot'a sor…  (Enter gönder, Shift+Enter yeni satır)"
                  className="field max-h-32 flex-1 resize-none"
                />
                <button onClick={() => send(input)} disabled={busy || (!input.trim() && !attachment)} className="btn-primary shrink-0">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Message({ msg }: { msg: AiMessage }): JSX.Element {
  const isUser = msg.role === 'user'
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
          isUser ? 'bg-accent/15 text-slate-100' : 'border border-ink-600 bg-ink-800 text-slate-200'
        }`}
      >
        {parseBlocks(msg.content)}
      </div>
    </div>
  )
}

function parseBlocks(text: string): JSX.Element[] {
  const parts: JSX.Element[] = []
  const re = /```(\w*)\n?([\s\S]*?)```/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++} className="whitespace-pre-wrap">{text.slice(last, m.index)}</span>)
    parts.push(<CodeBlock key={key++} code={m[2].trimEnd()} />)
    last = re.lastIndex
  }
  if (last < text.length) parts.push(<span key={key++} className="whitespace-pre-wrap">{text.slice(last)}</span>)
  return parts
}

function CodeBlock({ code }: { code: string }): JSX.Element {
  const [copied, setCopied] = useState(false)
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-ink-600 bg-black/40">
      <div className="flex items-center justify-between border-b border-ink-600 px-2 py-1">
        <span className="text-[10px] uppercase tracking-wide text-slate-600">shell</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-400 hover:bg-ink-600 hover:text-white"
        >
          {copied ? <Check size={11} className="text-good" /> : <Copy size={11} />} {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs text-good">{code}</pre>
    </div>
  )
}

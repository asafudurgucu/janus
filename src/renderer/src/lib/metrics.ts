export function fmtBytes(b?: number): string {
  if (!b || b < 0) return '—'
  const u = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = b
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`
}

export function fmtUptime(sec?: number): string {
  if (!sec) return '—'
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d > 0) return `${d}g ${h}s`
  if (h > 0) return `${h}s ${m}dk`
  return `${m}dk`
}

/** 0..1 ratio → color classes for text and bar. */
export function tier(ratio: number): { color: string; bar: string } {
  if (ratio >= 0.9) return { color: 'text-bad', bar: 'bg-bad' }
  if (ratio >= 0.75) return { color: 'text-warn', bar: 'bg-warn' }
  return { color: 'text-good', bar: 'bg-good' }
}

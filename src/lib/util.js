export const SEV = {
  Low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30', hex: '#34d399' },
  Medium: { text: 'text-yellow-300', bg: 'bg-yellow-500/10', ring: 'ring-yellow-500/30', hex: '#fde047' },
  High: { text: 'text-orange-400', bg: 'bg-orange-500/10', ring: 'ring-orange-500/30', hex: '#fb923c' },
  Critical: { text: 'text-red-400', bg: 'bg-red-500/10', ring: 'ring-red-500/30', hex: '#f87171' },
}

export const fmtTime = (t) =>
  t ? new Date(t).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

export function ago(t, now = Date.now()) {
  const m = Math.max(0, Math.round((now - t) / 60000))
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`
}

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function download(filename, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Report body that is hashed. Verification re-hashes exactly these fields (NFR-07).
export const reportBody = (r) =>
  JSON.stringify({ reportId: r.reportId, incidentId: r.incidentId, summary: r.summary, severity: r.severity, host: r.host, indicators: r.indicators, timeline: r.timeline, generatedDate: r.generatedDate })

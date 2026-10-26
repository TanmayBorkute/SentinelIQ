import { X } from 'lucide-react'
import { SEV } from '../lib/util.js'

export function Card({ title, icon, action, children, className = '' }) {
  const Icon = icon
  return (
    <section className={`glass rounded-2xl p-4 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            {Icon && <Icon size={15} className="text-cyan-400" />}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value, sub, icon, tone = 'text-cyan-400' }) {
  const Icon = icon
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        {label}
        {Icon && <Icon size={15} className={tone} />}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-zinc-500">{sub}</div>}
    </div>
  )
}

export function SevBadge({ severity }) {
  const c = SEV[severity]
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${c.text} ${c.bg} ${c.ring}`}>{severity}</span>
}

const STATUS_TONE = {
  New: 'text-cyan-300 bg-cyan-500/10 ring-cyan-500/30',
  'False Positive': 'text-zinc-400 bg-zinc-500/10 ring-zinc-500/30',
  'Escalated to Incident': 'text-violet-300 bg-violet-500/10 ring-violet-500/30',
  Open: 'text-cyan-300 bg-cyan-500/10 ring-cyan-500/30',
  Investigating: 'text-yellow-300 bg-yellow-500/10 ring-yellow-500/30',
  Contained: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/30',
  Closed: 'text-zinc-400 bg-zinc-500/10 ring-zinc-500/30',
}
export function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${STATUS_TONE[status] || STATUS_TONE.Closed}`}>{status}</span>
}

const CAT_TONE = {
  Malware: 'text-red-300 bg-red-500/10 ring-red-500/30',
  Credential: 'text-violet-300 bg-violet-500/10 ring-violet-500/30',
  Exfiltration: 'text-orange-300 bg-orange-500/10 ring-orange-500/30',
  Phishing: 'text-pink-300 bg-pink-500/10 ring-pink-500/30',
  Insider: 'text-amber-300 bg-amber-500/10 ring-amber-500/30',
  Misconfiguration: 'text-sky-300 bg-sky-500/10 ring-sky-500/30',
}
export function CategoryBadge({ category }) {
  if (!category) return null
  return <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ${CAT_TONE[category] || 'text-zinc-300 bg-zinc-500/10 ring-zinc-500/30'}`}>{category}</span>
}

const VARIANTS = {
  primary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:brightness-110',
  ghost: 'border border-white/15 text-zinc-200 hover:bg-white/5',
  danger: 'border border-red-500/40 text-red-300 hover:bg-red-500/10',
}
export function Button({ variant = 'primary', className = '', ...p }) {
  return (
    <button
      {...p}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  )
}

export const inputCls = 'rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-cyan-500/60'

export function Empty({ children }) {
  return <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-zinc-500">{children}</div>
}

export function ConfBar({ value }) {
  const color = value >= 95 ? 'from-red-500 to-orange-400' : value >= 85 ? 'from-orange-400 to-yellow-300' : 'from-cyan-500 to-blue-400'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-12 font-mono text-xs font-semibold text-zinc-100">{value}%</span>
    </div>
  )
}

export function Drawer({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="anim-in relative flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#0a0b11]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-zinc-400 hover:bg-white/10"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  )
}

// ---------- charts (plain SVG, no dependency) ----------
export function Donut({ data, size = 140 }) {
  const total = data.reduce((a, d) => a + d.value, 0)
  const r = 50
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label="Incidents by severity">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
        {total > 0 && data.filter((d) => d.value > 0).map((d) => {
          const len = (d.value / total) * c
          const el = (
            <circle key={d.label} cx="70" cy="70" r={r} fill="none" stroke={d.color} strokeWidth="16"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />
          )
          offset += len
          return el
        })}
        <text x="70" y="68" textAnchor="middle" className="fill-zinc-100 text-2xl font-bold">{total}</text>
        <text x="70" y="86" textAnchor="middle" className="fill-zinc-500 text-[10px]">active</text>
      </svg>
      <ul className="space-y-1.5 text-xs">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-zinc-300">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            {d.label}<span className="ml-auto pl-4 font-mono text-zinc-500">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Bars({ data, color = '#22d3ee' }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex h-36 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="font-mono text-[11px] text-zinc-400">{d.value}</span>
          <div className="w-full rounded-t-md" style={{ height: `${(d.value / max) * 100}%`, minHeight: 3, backgroundColor: color, opacity: 0.85 }} />
          <span className="text-[10px] text-zinc-500">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function Sparkline({ values, width = 320, height = 70 }) {
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? width / (values.length - 1) : width
  const pts = values.map((v, i) => [i * step, height - 6 - (v / max) * (height - 14)])
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Alert volume over time">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${width} ${height} L0 ${height} Z`} fill="url(#spark)" />
      <path d={path} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

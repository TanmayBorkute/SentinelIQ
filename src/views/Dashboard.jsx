import { useMemo } from 'react'
import { Activity, Siren, ShieldAlert, Cpu, Lock, Bell, ListChecks } from 'lucide-react'
import { Card, Stat, Donut, Bars, Sparkline, SevBadge, Empty } from '../components/ui.jsx'
import { SEVERITIES } from '../state/store.js'
import { SEV, ago } from '../lib/util.js'

export default function Dashboard({ s, me, go, now }) {
  const visible = useMemo(() => s.alerts.filter((a) => a.confidenceScore >= s.rules.threshold), [s.alerts, s.rules.threshold])
  const openAlerts = visible.filter((a) => a.status === 'New').length
  const active = s.incidents.filter((i) => i.status !== 'Closed')
  const critical = active.filter((i) => i.severity === 'Critical').length
  const isolated = s.assets.filter((a) => a.isolated).length

  const donut = SEVERITIES.map((k) => ({ label: k, value: active.filter((i) => i.severity === k).length, color: SEV[k].hex }))

  const buckets = [
    { label: '<80', value: visible.filter((a) => a.confidenceScore < 80).length },
    { label: '80-90', value: visible.filter((a) => a.confidenceScore >= 80 && a.confidenceScore < 90).length },
    { label: '90-95', value: visible.filter((a) => a.confidenceScore >= 90 && a.confidenceScore < 95).length },
    { label: '95+', value: visible.filter((a) => a.confidenceScore >= 95).length },
  ]

  const byCategory = Object.entries(
    visible.filter((a) => a.status === 'New').reduce((acc, a) => ({ ...acc, [a.category || 'Other']: (acc[a.category || 'Other'] || 0) + 1 }), {}),
  ).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([label, value]) => ({ label: label.length > 9 ? `${label.slice(0, 8)}…` : label, value }))

  // alerts per 10-minute bucket across the last 2 hours
  const spark = Array.from({ length: 12 }, (_, k) => {
    const end = now - (11 - k) * 600000
    return s.alerts.filter((a) => a.timestamp > end - 600000 && a.timestamp <= end).length
  })

  const pipeline = ['Open', 'Investigating', 'Contained', 'Closed'].map((k) => ({ k, v: s.incidents.filter((i) => i.status === k).length }))
  const maxP = Math.max(1, ...pipeline.map((p) => p.v))
  const escalated = s.incidents.filter((i) => i.escalated && i.status !== 'Closed')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Open alerts" value={openAlerts} sub={`${s.alerts.length - visible.length} below threshold`} icon={Activity} />
        <Stat label="Active incidents" value={active.length} sub={`${s.incidents.length} total`} icon={Siren} tone="text-yellow-300" />
        <Stat label="Critical open" value={critical} sub="require CISO visibility" icon={ShieldAlert} tone="text-red-400" />
        <Stat label="Isolated assets" value={isolated} sub={`of ${s.assets.length} monitored`} icon={Lock} tone="text-emerald-400" />
        <Stat label="AI accuracy" value={`${s.model.accuracy}%`} sub={`${s.model.modelVersion} · ${s.model.falsePositivesLearned} FPs learned`} icon={Cpu} tone="text-violet-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Alert volume (last 2h)" icon={Activity} className="lg:col-span-2">
          <Sparkline values={spark} />
          <div className="mt-1 flex justify-between text-[10px] text-zinc-600"><span>-2h</span><span>now</span></div>
        </Card>
        <Card title="Active incidents by severity" icon={Siren}>
          <Donut data={donut} />
        </Card>
        <Card title="Alerts by AI confidence" icon={Cpu}>
          <Bars data={buckets} />
        </Card>
        <Card title="Open alerts by category" icon={Activity}>
          {byCategory.length === 0 ? <Empty>No open alerts.</Empty> : <Bars data={byCategory} color="#a78bfa" />}
        </Card>
        <Card title="Incident pipeline" icon={ListChecks}>
          <div className="space-y-3">
            {pipeline.map((p) => (
              <div key={p.k}>
                <div className="mb-1 flex justify-between text-xs text-zinc-400"><span>{p.k}</span><span className="font-mono">{p.v}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" style={{ width: `${(p.v / maxP) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title={me.role === 'CISO / Management' ? 'Escalations awaiting you' : 'Escalated incidents'} icon={Bell}>
          {escalated.length === 0 ? <Empty>No active escalations.</Empty> : (
            <ul className="space-y-2">
              {escalated.map((i) => (
                <li key={i.incidentId}>
                  <button onClick={() => go('incidents', i.incidentId)} className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left text-xs hover:bg-white/5">
                    <span><span className="font-mono text-cyan-300">{i.incidentId}</span> <span className="text-zinc-400">{i.host}</span></span>
                    {i.acknowledgedBy ? <span className="text-emerald-400">Acknowledged</span> : <SevBadge severity={i.severity} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Recent activity" icon={ListChecks}>
        <ul className="divide-y divide-white/5 text-xs">
          {s.audit.slice(0, 6).map((l) => (
            <li key={l.logId} className="flex items-center justify-between gap-3 py-2">
              <span className="truncate text-zinc-300"><span className="text-zinc-500">{l.actor}</span> · {l.action}</span>
              <span className="shrink-0 text-zinc-600">{ago(l.at, now)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

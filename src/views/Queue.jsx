import { useState, useMemo } from 'react'
import { Search, CheckCircle2, XCircle, UserCheck, Radar, Play, FileText, ArrowUpRight, Lock, BadgeCheck, Check } from 'lucide-react'
import { Card, SevBadge, StatusBadge, CategoryBadge, Button, ConfBar, Empty, Drawer, inputCls } from '../components/ui.jsx'
import { PLAYBOOKS } from '../data/index.js'
import { SEVERITIES, can, canCorrelate, canReport, canContain, closeBlocker } from '../state/store.js'
import { fmtTime, ago, sha256Hex, reportBody } from '../lib/util.js'

function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`rounded-full px-3 py-1 text-xs ring-1 transition ${value === o ? 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/40' : 'text-zinc-400 ring-white/10 hover:bg-white/5'}`}>
          {o}
        </button>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ alerts (UC-02)
export function AlertsView({ s, d, me, now }) {
  const [filter, setFilter] = useState('New')
  const [q, setQ] = useState('')
  const canTriage = can(me.role, 'triage')

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return s.alerts
      .filter((a) => a.confidenceScore >= s.rules.threshold)
      .filter((a) => filter === 'All' || a.status === filter)
      .filter((a) => !term || `${a.alertId} ${a.host} ${a.sourceLog} ${a.ioc}`.toLowerCase().includes(term))
      .sort((x, y) => y.confidenceScore - x.confidenceScore || y.timestamp - x.timestamp)
  }, [s.alerts, s.rules.threshold, filter, q])

  const suppressed = s.alerts.filter((a) => a.confidenceScore < s.rules.threshold).length

  return (
    <Card title="Security alerts" icon={Search}
      action={<span className="text-[11px] text-zinc-500">Threshold {s.rules.threshold}% · {suppressed} suppressed</span>}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Chips options={['New', 'Escalated to Incident', 'False Positive', 'All']} value={filter} onChange={setFilter} />
        <input className={`${inputCls} w-full sm:w-64`} placeholder="Search host, log, IOC…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {rows.length === 0 ? <Empty>No alerts match this view.</Empty> : (
        <ul className="space-y-2">
          {rows.map((a) => <AlertRow key={a.alertId} a={a} d={d} me={me} canTriage={canTriage} now={now} />)}
        </ul>
      )}
    </Card>
  )
}

function AlertRow({ a, d, me, canTriage, now }) {
  const [sev, setSev] = useState('High')
  const act = () => ({ actor: me.name, at: Date.now() })
  return (
    <li className="anim-in rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-cyan-300">{a.alertId}</span>
            <StatusBadge status={a.status} />
            <CategoryBadge category={a.category} />
            <span className="text-zinc-500">{a.host} · {a.ip} · {ago(a.timestamp, now)}</span>
          </div>
          <p className="mt-1 truncate text-sm text-zinc-200">{a.sourceLog}</p>
          {a.ioc !== 'none' && <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-500">IOC candidate: {a.ioc}</p>}
        </div>
        <ConfBar value={a.confidenceScore} />
      </div>
      {canTriage && a.status === 'New' && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
          <select value={sev} onChange={(e) => setSev(e.target.value)} aria-label="Severity" className={`${inputCls} py-1 text-xs`}>
            {SEVERITIES.map((k) => <option key={k}>{k}</option>)}
          </select>
          <Button onClick={() => d({ type: 'CREATE_INCIDENT', alertId: a.alertId, severity: sev, ...act() })}><CheckCircle2 size={13} /> Create incident</Button>
          <Button variant="ghost" onClick={() => d({ type: 'FALSE_POSITIVE', alertId: a.alertId, ...act() })}><XCircle size={13} /> False positive</Button>
        </div>
      )}
    </li>
  )
}

// -------------------------------------------------------------- incidents (UC-06)
const STEPS = ['Created', 'Investigating', 'Correlated', 'Contained', 'Reported', 'Closed']
const stepDone = (i) => [true, Boolean(i.responder), i.correlated, ['Contained', 'Closed'].includes(i.status), Boolean(i.reportId), i.status === 'Closed']

export function IncidentsView({ s, d, me, openId, setOpenId, now }) {
  const [filter, setFilter] = useState('Active')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return s.incidents
      .filter((i) => (filter === 'All' ? true : filter === 'Active' ? i.status !== 'Closed' : i.status === filter))
      .filter((i) => !term || `${i.incidentId} ${i.host} ${i.title}`.toLowerCase().includes(term))
      .sort((x, y) => SEVERITIES.indexOf(y.severity) - SEVERITIES.indexOf(x.severity) || y.createdDate - x.createdDate)
  }, [s.incidents, filter, q])

  const open = s.incidents.find((i) => i.incidentId === openId)

  return (
    <>
      <Card title="Incident cases" icon={Search}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Chips options={['Active', 'Investigating', 'Contained', 'Closed', 'All']} value={filter} onChange={setFilter} />
          <input className={`${inputCls} w-full sm:w-64`} placeholder="Search incidents…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {rows.length === 0 ? <Empty>No incidents here. Analysts create them from validated alerts.</Empty> : (
          <ul className="space-y-2">
            {rows.map((i) => (
              <li key={i.incidentId}>
                <button onClick={() => setOpenId(i.incidentId)} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-cyan-500/40 hover:bg-white/[0.03]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-cyan-300">{i.incidentId}</span>
                      <SevBadge severity={i.severity} />
                      <StatusBadge status={i.status} />
                      <CategoryBadge category={i.category} />
                      {i.escalated && <span className="inline-flex items-center gap-1 text-red-300"><ArrowUpRight size={12} />Escalated</span>}
                    </div>
                    <span className="text-[11px] text-zinc-500">{ago(i.createdDate, now)}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-200">{i.title}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{i.host} · {i.responder ? `Responder: ${i.responder}` : 'Unassigned'}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Drawer open={Boolean(open)} onClose={() => setOpenId(null)} title={open ? `${open.incidentId} · ${open.host}` : ''}>
        {open && <IncidentDetail inc={open} s={s} d={d} me={me} />}
      </Drawer>
    </>
  )
}

function IncidentDetail({ inc, s, d, me }) {
  const [pb, setPb] = useState(inc.playbook || PLAYBOOKS[0].playbookId)
  const [busy, setBusy] = useState(false)
  const act = () => ({ actor: me.name, at: Date.now() })
  const done = stepDone(inc)
  const blocker = closeBlocker(inc)
  const respond = can(me.role, 'respond')
  const asset = s.assets.find((a) => a.hostname === inc.host)

  async function generate() {
    setBusy(true)
    const at = Date.now()
    const report = {
      reportId: `RPT-${s.reports.length + 1}`, incidentId: inc.incidentId, severity: inc.severity, host: inc.host,
      indicators: inc.indicators, timeline: inc.timeline, generatedDate: at,
      summary: `${inc.title} on ${inc.host}. Severity ${inc.severity}. ${inc.indicators.length} matched indicator(s); ${inc.playbookRuns.length} playbook run(s).`,
    }
    report.sha256 = await sha256Hex(reportBody(report))
    d({ type: 'ADD_REPORT', report, actor: me.name, at })
    setBusy(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <SevBadge severity={inc.severity} /><StatusBadge status={inc.status} /><CategoryBadge category={inc.category} />
        {inc.escalated && <span className="text-xs text-red-300">Escalated{inc.acknowledgedBy ? ` · ack. ${inc.acknowledgedBy}` : ''}</span>}
      </div>
      <p className="text-sm text-zinc-200">{inc.title}</p>

      <ol className="grid grid-cols-6 gap-1" aria-label="Workflow progress">
        {STEPS.map((label, k) => (
          <li key={label} className="text-center">
            <div className={`mx-auto grid h-6 w-6 place-items-center rounded-full text-[10px] ring-1 ${done[k] ? 'bg-cyan-500 text-black ring-cyan-400' : 'text-zinc-500 ring-white/15'}`}>
              {done[k] ? <Check size={12} /> : k + 1}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">{label}</div>
          </li>
        ))}
      </ol>

      {respond && inc.status !== 'Closed' && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex flex-wrap gap-2">
            {!inc.responder && <Button onClick={() => d({ type: 'ASSIGN', incidentId: inc.incidentId, responder: me.name, ...act() })}><UserCheck size={13} /> Assign to me</Button>}
            <Button variant="ghost" disabled={!canCorrelate(inc)} onClick={() => d({ type: 'CORRELATE', incidentId: inc.incidentId, ...act() })}><Radar size={13} /> Correlate threat intel</Button>
            <Button variant="ghost" disabled={!canReport(inc) || busy} onClick={generate}><FileText size={13} /> Forensic report</Button>
            <Button variant="danger" disabled={inc.escalated} onClick={() => d({ type: 'ESCALATE', incidentId: inc.incidentId, ...act() })}><ArrowUpRight size={13} /> Escalate</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={pb} onChange={(e) => setPb(e.target.value)} aria-label="Playbook" className={`${inputCls} py-1 text-xs`}>
              {PLAYBOOKS.map((p) => <option key={p.playbookId} value={p.playbookId}>{p.name}{p.playbookId === inc.playbook ? ' (suggested)' : ''}</option>)}
            </select>
            <Button disabled={!canContain(inc)} onClick={() => d({ type: 'RUN_PLAYBOOK', incidentId: inc.incidentId, playbookId: pb, ...act() })}><Play size={13} /> Run playbook &amp; contain</Button>
            <Button disabled={Boolean(blocker)} onClick={() => d({ type: 'CLOSE', incidentId: inc.incidentId, ...act() })}><Lock size={13} /> Close case</Button>
          </div>
          {blocker && <p className="text-[11px] text-zinc-500">To close: {blocker.toLowerCase()}.</p>}
          {!inc.responder && <p className="text-[11px] text-zinc-500">Assign a responder before investigating (BR-03).</p>}
          {inc.responder && !inc.correlated && <p className="text-[11px] text-zinc-500">A forensic report needs threat-intel correlation first (BR-05).</p>}
        </div>
      )}

      {me.role === 'CISO / Management' && inc.escalated && !inc.acknowledgedBy && (
        <Button onClick={() => d({ type: 'ACK', incidentId: inc.incidentId, ...act() })}><BadgeCheck size={13} /> Acknowledge escalation</Button>
      )}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Affected asset</h3>
        <div className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300">
          {asset ? <>{asset.hostname} · {asset.ipAddress} · {asset.kind} · <span className={asset.isolated ? 'text-emerald-400' : 'text-zinc-500'}>{asset.isolated ? 'Isolated' : 'Connected'}</span></> : inc.host}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Threat intelligence</h3>
        {!inc.correlated ? <p className="text-xs text-zinc-500">Not yet correlated.</p>
          : inc.indicators.length === 0 ? <p className="text-xs text-zinc-500">No matching indicators in the feed.</p>
          : inc.indicators.map((x) => (
            <div key={x.indicatorId} className="rounded-lg border border-orange-500/30 bg-orange-500/5 px-3 py-2 text-xs">
              <div className="font-mono text-orange-300 break-all">{x.type}: {x.indicatorId}</div>
              <div className="mt-0.5 text-zinc-400">{x.tag} · risk score {x.riskScore}</div>
            </div>
          ))}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Timeline</h3>
        <ol className="relative space-y-3 border-l border-white/10 pl-4">
          {[...inc.timeline].reverse().map((t, k) => (
            <li key={k} className="text-xs">
              <span className="absolute -left-[5px] mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
              <div className="text-zinc-200">{t.text}</div>
              <div className="text-[11px] text-zinc-500">{t.actor} · {fmtTime(t.at)}</div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

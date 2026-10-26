// SentinelIQ state store: one reducer that enforces the SRS business rules (BR-01..BR-05).
import { USERS, ASSETS, ALERT_SEEDS, PLAYBOOKS, seedAlerts, seedIncidents, SEED_ISOLATED, SEED_REPORTS, IOC_FEED } from '../data/index.js'

export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical']

export const PERMS = {
  'SOC Analyst': { views: ['dashboard', 'alerts', 'incidents'], can: ['triage'] },
  'Incident Responder': { views: ['dashboard', 'incidents', 'response', 'reports'], can: ['respond', 'assets'] },
  'Security Administrator': { views: ['dashboard', 'alerts', 'incidents', 'response', 'reports', 'admin'], can: ['admin', 'assets'] },
  'CISO / Management': { views: ['dashboard', 'incidents', 'reports'], can: ['ack'] },
}
export const can = (role, p) => Boolean(PERMS[role]?.can.includes(p))

// Live feed: picks one of the seed alerts and jitters its confidence (stands in for AIDetectionModel.analyzeEvent()).
export function randomAlert() {
  const t = ALERT_SEEDS[Math.floor(Math.random() * ALERT_SEEDS.length)]
  const asset = ASSETS.find((a) => a.hostname === t.host)
  const jitter = (Math.random() - 0.5) * 6
  return {
    sourceLog: t.sourceLog, host: t.host, ip: asset.ipAddress, ioc: t.ioc, category: t.category, playbook: t.playbook,
    confidenceScore: Math.round(Math.min(99.5, Math.max(40, t.base + jitter)) * 10) / 10,
  }
}

export function initialState() {
  const now = Date.now()
  const ago = (min) => now - min * 60000
  return {
    version: 3, n: 40, session: null, toasts: [],
    users: USERS,
    alerts: seedAlerts(now),
    incidents: seedIncidents(now),
    assets: ASSETS.map((a) => ({ ...a, isolated: SEED_ISOLATED.includes(a.hostname) })),
    reports: SEED_REPORTS,
    audit: [
      { logId: 'LOG-2', actor: 'Rishika', action: 'executePlaybook PB-02 on INC-2002; DC-01 isolated', at: ago(55) },
      { logId: 'LOG-1', actor: 'System', action: 'Platform initialised', at: ago(130) },
    ],
    notifications: [
      { id: 'N-2', msg: 'Ransomware-style activity on WS-FIN-021 (ALT-1009, 98.9%)', level: 'critical', at: ago(8), read: false },
      { id: 'N-1', msg: 'INC-2001 is Critical and has been escalated to CISO / Management', level: 'critical', at: ago(90), read: false },
    ],
    rules: { threshold: 60, autoEscalate: true },
    model: { modelId: 'MDL-SENTINEL-X9', modelVersion: 'v2.4.1', accuracy: 96.8, falsePositivesLearned: 14 },
  }
}

const KEY = 'sentineliq.state.v3'
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s.version === 3) return { ...s, toasts: [] }
    }
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return initialState()
}
export function saveState(s) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...s, toasts: [] })) } catch { /* ignore quota/private mode */ }
}

// ---- guards shared by the reducer and the UI so buttons and rules never disagree ----
export const canCorrelate = (i) => Boolean(i.responder) && !i.correlated && i.status !== 'Closed'
export const canReport = (i) => Boolean(i.responder) && i.correlated && !i.reportId // BR-05
export const canContain = (i) => Boolean(i.responder) && i.status === 'Investigating'
export const closeBlocker = (i) => {
  if (i.status !== 'Contained') return 'Contain the threat first'
  if (!i.reportId) return 'Generate the forensic report first'
  if (i.severity === 'Critical' && !i.escalated) return 'Critical incidents must be escalated (BR-01)'
  return null
}

const note = (s, msg, level, at) => {
  const n = s.n + 1
  const item = { id: `N-${n}`, msg, level, at, read: false }
  return { ...s, n, notifications: [item, ...s.notifications].slice(0, 100), toasts: [...s.toasts, item].slice(-4) }
}
const audit = (s, actor, action, at) => {
  const n = s.n + 1
  return { ...s, n, audit: [{ logId: `LOG-${n}`, actor, action, at }, ...s.audit].slice(0, 500) } // BR-04
}
const patchInc = (s, id, fn) => ({ ...s, incidents: s.incidents.map((i) => (i.incidentId === id ? fn(i) : i)) })
const line = (i, text, actor, at) => ({ ...i, timeline: [...i.timeline, { text, actor, at }] })
const find = (s, id) => s.incidents.find((i) => i.incidentId === id)

export function reducer(s, a) {
  const { at, actor } = a
  switch (a.type) {
    case 'LOGIN': return audit({ ...s, session: a.userId }, a.name, 'login', at)
    case 'LOGOUT': return audit({ ...s, session: null }, a.name, 'logout', at)

    case 'INGEST_ALERT': { // UC-03
      const n = s.n + 1
      const alert = { alertId: `ALT-${1000 + n}`, ...a.alert, status: 'New', timestamp: at }
      let t = { ...s, n, alerts: [alert, ...s.alerts].slice(0, 200) }
      if (alert.confidenceScore >= 95) t = note(t, `High-confidence alert ${alert.alertId} on ${alert.host} (${alert.confidenceScore}%)`, 'warn', at)
      return t
    }

    case 'FALSE_POSITIVE': { // BR-02 / FR-13
      const al = s.alerts.find((x) => x.alertId === a.alertId)
      if (!al || al.status !== 'New') return s
      const m = s.model
      const patch = Number(m.modelVersion.split('.').pop()) + 1
      const model = { ...m, modelVersion: `v2.4.${patch}`, accuracy: Math.min(99.8, Math.round((m.accuracy + 0.2) * 10) / 10), falsePositivesLearned: m.falsePositivesLearned + 1 }
      let t = { ...s, model, alerts: s.alerts.map((x) => (x.alertId === a.alertId ? { ...x, status: 'False Positive' } : x)) }
      t = audit(t, actor, `markFalsePositive ${a.alertId}; model retrained to ${model.modelVersion}`, at)
      return note(t, `AI model retrained: ${model.modelVersion}, accuracy ${model.accuracy}%`, 'info', at)
    }

    case 'CREATE_INCIDENT': { // UC-04 / UC-05
      const al = s.alerts.find((x) => x.alertId === a.alertId)
      if (!al || al.status !== 'New') return s
      const n = s.n + 1
      const auto = a.severity === 'Critical' && s.rules.autoEscalate
      const inc = {
        incidentId: `INC-${2000 + n}`, title: al.sourceLog.slice(0, 52), severity: a.severity, status: 'Open', alertId: al.alertId,
        host: al.host, ioc: al.ioc, category: al.category, playbook: al.playbook, responder: null, indicators: [], correlated: false, escalated: auto, acknowledgedBy: null,
        reportId: null, playbookRuns: [], createdDate: at, closedDate: null,
        timeline: [{ text: `Incident created from ${al.alertId} (${a.severity})`, actor, at }, ...(auto ? [{ text: 'Auto-escalated to CISO / Management (BR-01)', actor: 'System', at }] : [])],
      }
      let t = { ...s, n, incidents: [inc, ...s.incidents], alerts: s.alerts.map((x) => (x.alertId === al.alertId ? { ...x, status: 'Escalated to Incident', incidentId: inc.incidentId } : x)) }
      t = audit(t, actor, `createIncident ${inc.incidentId} severity=${a.severity}`, at)
      return auto ? note(t, `${inc.incidentId} is Critical and has been escalated to CISO / Management`, 'critical', at) : t
    }

    case 'ASSIGN': { // BR-03
      const i = find(s, a.incidentId)
      if (!i || i.responder || i.status === 'Closed') return s
      let t = patchInc(s, i.incidentId, (x) => line({ ...x, responder: a.responder, status: 'Investigating' }, `Assigned to ${a.responder}`, actor, at))
      return audit(t, actor, `assignResponder ${i.incidentId} -> ${a.responder}`, at)
    }

    case 'CORRELATE': { // UC-07
      const i = find(s, a.incidentId)
      if (!i || !canCorrelate(i)) return s
      const hit = IOC_FEED[i.ioc]
      const indicators = hit ? [{ indicatorId: i.ioc, ...hit }] : []
      let t = patchInc(s, i.incidentId, (x) => line({ ...x, correlated: true, indicators }, hit ? `Threat intel matched ${hit.type} ${i.ioc} (risk ${hit.riskScore})` : 'Threat intel: no matching indicators', actor, at))
      return audit(t, actor, `correlateIndicators ${i.incidentId} matches=${indicators.length}`, at)
    }

    case 'RUN_PLAYBOOK': { // UC-10: playbook.execute(incident) + asset.isolate()
      const i = find(s, a.incidentId)
      const pb = PLAYBOOKS.find((p) => p.playbookId === a.playbookId)
      if (!i || !pb || !canContain(i)) return s
      let t = patchInc(s, i.incidentId, (x) => {
        const y = { ...x, status: 'Contained', playbookRuns: [...x.playbookRuns, { playbookId: pb.playbookId, name: pb.name, at }] }
        return pb.steps.reduce((acc, step) => line(acc, `Playbook step: ${step}`, actor, at), line(y, `Executed playbook ${pb.name}`, actor, at))
      })
      t = { ...t, assets: t.assets.map((x) => (x.hostname === i.host ? { ...x, isolated: true } : x)) }
      return audit(t, actor, `executePlaybook ${pb.playbookId} on ${i.incidentId}; ${i.host} isolated`, at)
    }

    case 'SET_ASSET_ISOLATION': {
      const asset = s.assets.find((x) => x.assetId === a.assetId)
      if (!asset) return s
      const t = { ...s, assets: s.assets.map((x) => (x.assetId === a.assetId ? { ...x, isolated: a.value } : x)) }
      return audit(t, actor, `${a.value ? 'isolate' : 'restore'} ${asset.hostname}`, at)
    }

    case 'ESCALATE': { // UC-09
      const i = find(s, a.incidentId)
      if (!i || i.escalated || i.status === 'Closed') return s
      let t = patchInc(s, i.incidentId, (x) => line({ ...x, escalated: true }, 'Escalated to CISO / Management', actor, at))
      t = audit(t, actor, `escalate ${i.incidentId}`, at)
      return note(t, `${i.incidentId} escalated to CISO / Management`, 'critical', at)
    }

    case 'ACK': {
      const i = find(s, a.incidentId)
      if (!i || !i.escalated || i.acknowledgedBy) return s
      const t = patchInc(s, i.incidentId, (x) => line({ ...x, acknowledgedBy: actor }, `Escalation acknowledged by ${actor}`, actor, at))
      return audit(t, actor, `acknowledgeEscalation ${i.incidentId}`, at)
    }

    case 'ADD_REPORT': { // UC-08, NFR-07: the report carries a SHA-256 of its body
      const i = find(s, a.report.incidentId)
      if (!i || !canReport(i)) return s
      let t = { ...s, reports: [a.report, ...s.reports] }
      t = patchInc(t, i.incidentId, (x) => line({ ...x, reportId: a.report.reportId }, `Forensic report ${a.report.reportId} generated`, actor, at))
      return audit(t, actor, `generateForensicReport ${a.report.reportId} for ${i.incidentId}`, at)
    }

    case 'CLOSE': {
      const i = find(s, a.incidentId)
      if (!i || closeBlocker(i)) return s
      const t = patchInc(s, i.incidentId, (x) => line({ ...x, status: 'Closed', closedDate: at }, 'Incident closed', actor, at))
      return audit(t, actor, `close ${i.incidentId}`, at)
    }

    case 'SET_RULES': return audit({ ...s, rules: { ...s.rules, ...a.rules } }, actor, `configureRules ${JSON.stringify(a.rules)}`, at) // UC-12
    case 'SET_ROLE': return audit({ ...s, users: s.users.map((u) => (u.userId === a.userId ? { ...u, role: a.role } : u)) }, actor, `setRole ${a.userId} -> ${a.role}`, at) // UC-13
    case 'ADD_USER': {
      if (s.users.some((u) => u.email === a.user.email)) return s
      return audit({ ...s, users: [...s.users, a.user] }, actor, `addUser ${a.user.email} (${a.user.role})`, at)
    }
    case 'READ_ALL': return { ...s, notifications: s.notifications.map((x) => ({ ...x, read: true })) }
    case 'DISMISS_TOAST': return { ...s, toasts: s.toasts.filter((x) => x.id !== a.id) }
    case 'RESET': return initialState()
    default: return s
  }
}

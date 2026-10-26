import { useReducer, useEffect, useState, useCallback } from 'react'
import {
  ShieldAlert, LayoutDashboard, Activity, Siren, Server, FileText, Settings,
  LogOut, Bell, Radio, X,
} from 'lucide-react'
import { reducer, loadState, saveState, randomAlert, PERMS } from './state/store.js'
import { ago } from './lib/util.js'
import Login from './views/Login.jsx'
import Dashboard from './views/Dashboard.jsx'
import { AlertsView, IncidentsView } from './views/Queue.jsx'
import Response from './views/Response.jsx'
import Reports from './views/Reports.jsx'
import Admin from './views/Admin.jsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'alerts', label: 'Alerts', icon: Activity },
  { id: 'incidents', label: 'Incidents', icon: Siren },
  { id: 'response', label: 'Response', icon: Server },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'admin', label: 'Admin', icon: Settings },
]

const TOAST_TONE = {
  critical: 'border-red-500/40 bg-red-500/10 text-red-100',
  warn: 'border-orange-500/40 bg-orange-500/10 text-orange-100',
  info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100',
}

function Toast({ t, onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 6000)
    return () => clearTimeout(id)
  }, [onDone])
  return (
    <div role="status" className={`anim-in flex items-start gap-3 rounded-xl border px-4 py-3 text-xs shadow-xl backdrop-blur ${TOAST_TONE[t.level] || TOAST_TONE.info}`}>
      <span className="flex-1">{t.msg}</span>
      <button onClick={onDone} aria-label="Dismiss"><X size={13} /></button>
    </div>
  )
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, undefined, loadState)
  const [view, setView] = useState('dashboard')
  const [openId, setOpenId] = useState(null)
  const [live, setLive] = useState(true)
  const [bell, setBell] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const me = s.users.find((u) => u.userId === s.session) || null

  useEffect(() => { saveState(s) }, [s])

  // clock for relative times
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  // live detection feed: AIDetectionModel.analyzeEvent() output arriving on a timer
  useEffect(() => {
    if (!me || !live) return undefined
    const id = setInterval(() => dispatch({ type: 'INGEST_ALERT', alert: randomAlert(), at: Date.now() }), 20000)
    return () => clearInterval(id)
  }, [me, live])

  const go = useCallback((v, incidentId) => {
    setView(v)
    setOpenId(incidentId || null)
    setBell(false)
  }, [])

  const login = (u) => { dispatch({ type: 'LOGIN', userId: u.userId, name: u.name, at: Date.now() }); setView('dashboard') }
  const logout = () => { dispatch({ type: 'LOGOUT', name: me.name, at: Date.now() }); setOpenId(null) }

  if (!me) return <Login users={s.users} onLogin={login} />

  const allowed = PERMS[me.role].views
  const current = allowed.includes(view) ? view : 'dashboard'
  const unread = s.notifications.filter((n) => !n.read).length
  const props = { s, d: dispatch, me, now }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-black/30 p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 text-lg font-bold"><ShieldAlert className="text-cyan-400" /> SentinelIQ</div>
        <nav className="space-y-1">
          {NAV.filter((n) => allowed.includes(n.id)).map((n) => (
            <button key={n.id} onClick={() => go(n.id)} aria-current={current === n.id ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${current === n.id ? 'bg-cyan-500/15 text-cyan-300' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'}`}>
              <n.icon size={16} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-white/10 p-3 text-xs">
          <div className="font-medium text-zinc-100">{me.name}</div>
          <div className="text-zinc-500">{me.role}</div>
          <button onClick={logout} className="mt-3 flex items-center gap-2 text-zinc-400 hover:text-zinc-100"><LogOut size={13} /> Sign out</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#07080c]/80 px-4 py-3 backdrop-blur md:px-6">
          <h1 className="text-sm font-semibold capitalize md:text-base">{current}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setLive((v) => !v)} aria-pressed={live}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ring-1 ${live ? 'text-emerald-300 ring-emerald-500/40' : 'text-zinc-500 ring-white/10'}`}>
              <Radio size={12} className={live ? 'live-dot' : ''} /> {live ? 'Live feed' : 'Paused'}
            </button>
            <div className="relative">
              <button onClick={() => { setBell((b) => !b); if (!bell) dispatch({ type: 'READ_ALL' }) }} aria-label="Notifications" className="relative rounded-lg p-2 text-zinc-300 hover:bg-white/10">
                <Bell size={16} />
                {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
              </button>
              {bell && (
                <div className="anim-in absolute right-0 mt-2 w-80 max-w-[85vw] rounded-xl border border-white/10 bg-[#0c0d14] p-2 shadow-2xl">
                  {s.notifications.length === 0 ? <p className="p-3 text-xs text-zinc-500">No notifications.</p> : (
                    <ul className="max-h-80 divide-y divide-white/5 overflow-auto">
                      {s.notifications.slice(0, 15).map((n) => (
                        <li key={n.id} className="px-3 py-2 text-xs text-zinc-300">{n.msg}<div className="text-[10px] text-zinc-600">{ago(n.at, now)}</div></li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 md:hidden"><LogOut size={16} /></button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 md:hidden">
          {NAV.filter((n) => allowed.includes(n.id)).map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs ${current === n.id ? 'bg-cyan-500/15 text-cyan-300' : 'text-zinc-400'}`}>
              <n.icon size={13} /> {n.label}
            </button>
          ))}
        </nav>

        <main className="anim-in mx-auto max-w-6xl p-4 md:p-6" key={current}>
          {current === 'dashboard' && <Dashboard {...props} go={go} />}
          {current === 'alerts' && <AlertsView {...props} />}
          {current === 'incidents' && <IncidentsView {...props} openId={openId} setOpenId={setOpenId} />}
          {current === 'response' && <Response {...props} />}
          {current === 'reports' && <Reports {...props} />}
          {current === 'admin' && <Admin {...props} />}
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[90vw] flex-col gap-2">
        {s.toasts.map((t) => <Toast key={t.id} t={t} onDone={() => dispatch({ type: 'DISMISS_TOAST', id: t.id })} />)}
      </div>
    </div>
  )
}

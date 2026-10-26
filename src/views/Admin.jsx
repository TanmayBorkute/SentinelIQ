import { useState, useMemo } from 'react'
import { Settings, Users, ScrollText, RotateCcw, Cpu } from 'lucide-react'
import { Card, Button, inputCls } from '../components/ui.jsx'
import { PERMS } from '../state/store.js'
import { fmtTime } from '../lib/util.js'

const ROLE_LIST = Object.keys(PERMS)

export default function Admin({ s, d, me }) {
  const [threshold, setThreshold] = useState(s.rules.threshold)
  const [form, setForm] = useState({ name: '', email: '', role: ROLE_LIST[0] })
  const [q, setQ] = useState('')
  const act = () => ({ actor: me.name, at: Date.now() })

  const logs = useMemo(() => {
    const t = q.trim().toLowerCase()
    return s.audit.filter((l) => !t || `${l.actor} ${l.action}`.toLowerCase().includes(t)).slice(0, 80)
  }, [s.audit, q])

  const addUser = (e) => {
    e.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (!form.name.trim() || !email.includes('@')) return
    d({ type: 'ADD_USER', user: { userId: `U-${String(s.users.length + 1).padStart(2, '0')}`, name: form.name.trim(), email, password: 'changeme', role: form.role }, ...act() })
    setForm({ name: '', email: '', role: ROLE_LIST[0] })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="AI detection rules" icon={Settings}>
        <label htmlFor="thr" className="text-xs text-zinc-400">Minimum confidence shown to analysts: <b className="text-zinc-100">{threshold}%</b></label>
        <input id="thr" type="range" min="40" max="99" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
          onPointerUp={() => d({ type: 'SET_RULES', rules: { threshold }, ...act() })}
          onKeyUp={() => d({ type: 'SET_RULES', rules: { threshold }, ...act() })} className="mt-2 w-full accent-cyan-500" />
        <label className="mt-4 flex items-center gap-2 text-xs text-zinc-300">
          <input type="checkbox" checked={s.rules.autoEscalate} onChange={(e) => d({ type: 'SET_RULES', rules: { autoEscalate: e.target.checked }, ...act() })} className="accent-cyan-500" />
          Auto-escalate Critical incidents to CISO / Management (BR-01)
        </label>
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs">
          <Cpu size={18} className="text-violet-400" />
          <div><div className="font-medium text-zinc-100">{s.model.modelId} · {s.model.modelVersion}</div>
            <div className="text-zinc-500">Accuracy {s.model.accuracy}% · {s.model.falsePositivesLearned} false positives learned</div></div>
        </div>
      </Card>

      <Card title="Users & roles" icon={Users}>
        <table className="w-full text-xs">
          <thead className="text-left text-zinc-500"><tr><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Email</th><th className="pb-2 font-medium">Role</th></tr></thead>
          <tbody>
            {s.users.map((u) => (
              <tr key={u.userId} className="border-t border-white/5">
                <td className="py-1.5">{u.name}</td>
                <td className="text-zinc-400">{u.email}</td>
                <td>
                  <select aria-label={`Role for ${u.name}`} value={u.role} disabled={u.userId === me.userId}
                    onChange={(e) => d({ type: 'SET_ROLE', userId: u.userId, role: e.target.value, ...act() })} className={`${inputCls} py-1 text-xs disabled:opacity-50`}>
                    {ROLE_LIST.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={addUser} className="mt-4 grid gap-2 sm:grid-cols-4">
          <input className={`${inputCls} py-1.5 text-xs`} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={`${inputCls} py-1.5 text-xs`} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className={`${inputCls} py-1.5 text-xs`} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLE_LIST.map((r) => <option key={r}>{r}</option>)}
          </select>
          <Button type="submit" className="justify-center">Add user</Button>
        </form>
      </Card>

      <Card title="Audit log" icon={ScrollText} className="lg:col-span-2"
        action={<Button variant="danger" onClick={() => { if (window.confirm('Reset all demo data?')) d({ type: 'RESET' }) }}><RotateCcw size={12} /> Reset demo</Button>}>
        <input className={`${inputCls} mb-3 w-full sm:w-72`} placeholder="Filter log…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-[11px]">
            <tbody>
              {logs.map((l) => (
                <tr key={l.logId} className="border-t border-white/5 align-top">
                  <td className="whitespace-nowrap py-1.5 pr-3 text-zinc-500">{fmtTime(l.at)}</td>
                  <td className="whitespace-nowrap pr-3 font-mono text-cyan-300">{l.logId}</td>
                  <td className="pr-3 text-zinc-400">{l.actor}</td>
                  <td className="text-zinc-200">{l.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

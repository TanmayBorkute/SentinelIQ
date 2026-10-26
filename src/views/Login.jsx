import { useState } from 'react'
import { ShieldAlert, Lock, Cpu, Radar, FileCheck2 } from 'lucide-react'
import { Button, inputCls } from '../components/ui.jsx'

export default function Login({ users, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const u = users.find((x) => x.email === email.trim().toLowerCase() && x.password === password)
    if (!u) return setError('Invalid credentials. The attempt has been logged.')
    onLogin(u)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-grid relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="flex items-center gap-2 text-xl font-bold"><ShieldAlert className="text-cyan-400" /> SentinelIQ</div>
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Detect. Investigate. <span className="text-gradient">Contain.</span>
          </h1>
          <p className="text-zinc-400">One console for AI-scored alerts, incident cases, threat-intel correlation and audit-ready forensic reports.</p>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex items-center gap-3"><Cpu size={16} className="text-cyan-400" /> Confidence-scored detections that retrain on false positives</li>
            <li className="flex items-center gap-3"><Radar size={16} className="text-cyan-400" /> Threat-intelligence correlation and guided playbooks</li>
            <li className="flex items-center gap-3"><FileCheck2 size={16} className="text-cyan-400" /> Tamper-evident forensic reports with SHA-256 integrity</li>
          </ul>
        </div>
        <p className="text-xs text-zinc-600">AI-CIRP v2.0 · Ramdeobaba University</p>
      </div>

      <div className="grid place-items-center px-5 py-10">
        <form onSubmit={submit} className="glass anim-in w-full max-w-sm space-y-4 rounded-2xl p-6">
          <div>
            <h2 className="text-lg font-semibold">Sign in</h2>
            <p className="text-xs text-zinc-500">Use your organisational credentials.</p>
          </div>
          <input className={`${inputCls} w-full`} placeholder="Email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={`${inputCls} w-full`} type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full justify-center py-2"><Lock size={13} /> Sign in</Button>

          <div className="border-t border-white/10 pt-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-zinc-500">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => (
                <button type="button" key={u.userId} onClick={() => { setEmail(u.email); setPassword(u.password); setError('') }}
                  className="rounded-lg border border-white/10 px-2 py-1.5 text-left text-[11px] text-zinc-300 hover:border-cyan-500/50 hover:bg-white/5">
                  <div className="font-medium">{u.role}</div>
                  <div className="truncate text-zinc-500">{u.name}</div>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

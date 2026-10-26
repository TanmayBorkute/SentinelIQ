import { Server, ListChecks, ShieldOff, ShieldCheck } from 'lucide-react'
import { Card, Button } from '../components/ui.jsx'
import { PLAYBOOKS } from '../data/index.js'
import { can } from '../state/store.js'

export default function Response({ s, d, me }) {
  const manage = can(me.role, 'assets')
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card title="Assets" icon={Server} className="lg:col-span-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-zinc-500">
              <tr><th className="pb-2 font-medium">Host</th><th className="pb-2 font-medium">IP</th><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Dept</th><th className="pb-2 font-medium">State</th><th /></tr>
            </thead>
            <tbody>
              {s.assets.map((a) => (
                <tr key={a.assetId} className="border-t border-white/5">
                  <td className="py-2 font-mono text-cyan-300">{a.hostname}</td>
                  <td className="text-zinc-400">{a.ipAddress}</td>
                  <td className="text-zinc-400">{a.kind}</td>
                  <td className="text-zinc-400">{a.dept}</td>
                  <td className={a.isolated ? 'text-emerald-400' : 'text-zinc-500'}>{a.isolated ? 'Isolated' : 'Connected'}</td>
                  <td className="text-right">
                    {manage && (
                      <Button variant={a.isolated ? 'ghost' : 'danger'} onClick={() => d({ type: 'SET_ASSET_ISOLATION', assetId: a.assetId, value: !a.isolated, actor: me.name, at: Date.now() })}>
                        {a.isolated ? <><ShieldCheck size={12} /> Restore</> : <><ShieldOff size={12} /> Isolate</>}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Response playbooks" icon={ListChecks} className="lg:col-span-2">
        <ul className="space-y-3">
          {PLAYBOOKS.map((p) => (
            <li key={p.playbookId} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-sm font-medium text-zinc-100">{p.name} <span className="font-mono text-[11px] text-zinc-500">{p.playbookId}</span></div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-zinc-400">
                {p.steps.map((st) => <li key={st}>{st}</li>)}
              </ol>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-zinc-500">Run a playbook from an incident to contain it and isolate its host.</p>
      </Card>
    </div>
  )
}

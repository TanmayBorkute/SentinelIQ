import { useState } from 'react'
import { FileText, ShieldCheck, ShieldX, Download, Printer } from 'lucide-react'
import { Card, Button, Empty, SevBadge } from '../components/ui.jsx'
import { fmtTime, sha256Hex, reportBody, download } from '../lib/util.js'

export default function Reports({ s }) {
  const [verified, setVerified] = useState({})
  const closed = s.incidents.filter((i) => i.status === 'Closed')

  async function verify(r) {
    const ok = (await sha256Hex(reportBody(r))) === r.sha256
    setVerified((v) => ({ ...v, [r.reportId]: ok }))
  }

  const csv = () => {
    const head = 'incidentId,severity,host,responder,created,closed,escalated\n'
    const rows = closed.map((i) => [i.incidentId, i.severity, i.host, i.responder, new Date(i.createdDate).toISOString(), new Date(i.closedDate).toISOString(), i.escalated].join(',')).join('\n')
    download('compliance-report.csv', head + rows, 'text/csv')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card title="Forensic reports" icon={FileText} className="lg:col-span-3">
        {s.reports.length === 0 ? <Empty>No reports yet. A responder generates one after correlating threat intelligence.</Empty> : (
          <ul className="space-y-3">
            {s.reports.map((r) => (
              <li key={r.reportId} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2"><span className="font-mono text-cyan-300">{r.reportId}</span><span className="text-zinc-400">{r.incidentId}</span><SevBadge severity={r.severity} /></div>
                  <span className="text-zinc-500">{fmtTime(r.generatedDate)}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{r.summary}</p>
                <p className="mt-2 break-all font-mono text-[10px] text-zinc-500">SHA-256 {r.sha256}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button variant="ghost" onClick={() => verify(r)}><ShieldCheck size={12} /> Verify integrity</Button>
                  <Button variant="ghost" onClick={() => download(`${r.reportId}.json`, JSON.stringify(r, null, 2))}><Download size={12} /> Export JSON</Button>
                  <Button variant="ghost" onClick={() => window.print()}><Printer size={12} /> Print / PDF</Button>
                  {verified[r.reportId] === true && <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><ShieldCheck size={13} /> Unmodified</span>}
                  {verified[r.reportId] === false && <span className="inline-flex items-center gap-1 text-xs text-red-400"><ShieldX size={13} /> Hash mismatch</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Compliance summary" icon={FileText} className="lg:col-span-2"
        action={<Button variant="ghost" disabled={closed.length === 0} onClick={csv}><Download size={12} /> CSV</Button>}>
        <dl className="grid grid-cols-3 gap-3 text-center">
          {[['Closed', closed.length], ['Reports', s.reports.length], ['Audit entries', s.audit.length]].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/[0.03] p-3"><dt className="text-[11px] text-zinc-500">{k}</dt><dd className="text-xl font-bold">{v}</dd></div>
          ))}
        </dl>
        <ul className="mt-4 space-y-1.5 text-xs">
          {closed.length === 0 ? <li className="text-zinc-500">No closed incidents yet.</li> : closed.map((i) => (
            <li key={i.incidentId} className="flex justify-between border-t border-white/5 pt-1.5 text-zinc-300">
              <span className="font-mono text-cyan-300">{i.incidentId}</span><span>{i.host}</span><span className="text-zinc-500">{fmtTime(i.closedDate)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

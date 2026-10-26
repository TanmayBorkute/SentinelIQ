// Recomputes the SHA-256 of the seeded forensic report and writes it into src/data/reports.js.
// Run after changing the seed report or the closed incident timeline: node scripts/sign-seed-report.mjs
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { SEED_REPORTS } from '../src/data/reports.js'
import { reportBody } from '../src/lib/util.js'

const file = new URL('../src/data/reports.js', import.meta.url)
let text = readFileSync(file, 'utf8')
for (const r of SEED_REPORTS) {
  const hash = createHash('sha256').update(reportBody(r)).digest('hex')
  text = text.replace(/sha256: '[^']*'/, `sha256: '${hash}'`)
  console.log(r.reportId, hash)
}
writeFileSync(file, text)

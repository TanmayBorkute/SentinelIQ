import { SEED_CLOSED_TIMELINE } from './incidents.js'

// Signed forensic report for INC-2003. sha256 covers the same fields as lib/util.js reportBody(),
// so "Verify integrity" shows "Unmodified". Regenerate with: node scripts/sign-seed-report.mjs
export const SEED_REPORTS = [
  {
    reportId: 'RPT-1', incidentId: 'INC-2003', severity: 'Medium', host: 'DC-01', indicators: [],
    summary: 'Kerberoasting: burst of service-ticket requests on DC-01. Severity Medium. 0 matched indicator(s); 1 playbook run(s).',
    timeline: SEED_CLOSED_TIMELINE,
    generatedDate: Date.UTC(2026, 9, 24, 8, 55),
    sha256: '5e07e6b74e8ece51b055e26a6547e76b6d50a98f32e5a1ef7f22ad7bc0fb72a2',
  },
]

// Three incidents at different lifecycle stages so each role has something to act on:
//   INC-2001 Critical, investigating, NOT yet correlated  -> responder runs the full flow
//   INC-2002 High, contained, correlated, NO report yet    -> shows BR-05 / close blockers
//   INC-2003 Medium, closed, with a signed forensic report -> fills Reports and compliance views
export const SEED_ISOLATED = ['DC-01']

const CLOSED_AT = Date.UTC(2026, 9, 24, 9, 5) // fixed so the seeded report hash stays valid
const T = (m) => CLOSED_AT - m * 60000

export const SEED_CLOSED_TIMELINE = [
  { text: 'Incident created from ALT-1019 (Medium)', actor: 'Sanjana', at: T(95) },
  { text: 'Assigned to Rishika', actor: 'Sanjana', at: T(90) },
  { text: 'Threat intel: no matching indicators', actor: 'Rishika', at: T(70) },
  { text: 'Executed playbook Credential compromise', actor: 'Rishika', at: T(40) },
  { text: 'Forensic report RPT-1 generated', actor: 'Rishika', at: T(10) },
  { text: 'Incident closed', actor: 'Rishika', at: T(0) },
]

export function seedIncidents(now) {
  const ago = (m) => now - m * 60000
  return [
    {
      incidentId: 'INC-2001', title: 'powershell -enc JABz... spawned by winword.exe', severity: 'Critical', status: 'Investigating',
      alertId: 'ALT-1001', host: 'WS-FIN-014', ioc: '185.220.101.7', category: 'Malware', playbook: 'PB-01', responder: 'Rishika',
      indicators: [], correlated: false, escalated: true, acknowledgedBy: null, reportId: null, playbookRuns: [],
      createdDate: ago(90), closedDate: null,
      timeline: [
        { text: 'Incident created from ALT-1001 (Critical)', actor: 'Tanmay', at: ago(90) },
        { text: 'Auto-escalated to CISO / Management (BR-01)', actor: 'System', at: ago(90) },
        { text: 'Assigned to Rishika', actor: 'Tanmay', at: ago(86) },
      ],
    },
    {
      incidentId: 'INC-2002', title: 'New domain admin account created off-hours', severity: 'High', status: 'Contained',
      alertId: 'ALT-1008', host: 'DC-01', ioc: 'none', category: 'Credential', playbook: 'PB-02', responder: 'Rishika',
      indicators: [], correlated: true, escalated: false, acknowledgedBy: null, reportId: null,
      playbookRuns: [{ playbookId: 'PB-02', name: 'Credential compromise', at: ago(55) }],
      createdDate: ago(115), closedDate: null,
      timeline: [
        { text: 'Incident created from ALT-1008 (High)', actor: 'Sanjana', at: ago(115) },
        { text: 'Assigned to Rishika', actor: 'Sanjana', at: ago(110) },
        { text: 'Threat intel: no matching indicators', actor: 'Rishika', at: ago(80) },
        { text: 'Executed playbook Credential compromise', actor: 'Rishika', at: ago(55) },
        { text: 'Playbook step: Disable affected account', actor: 'Rishika', at: ago(55) },
        { text: 'Playbook step: Force password reset and revoke sessions', actor: 'Rishika', at: ago(55) },
      ],
    },
    {
      incidentId: 'INC-2003', title: 'Kerberoasting: burst of service-ticket requests', severity: 'Medium', status: 'Closed',
      alertId: 'ALT-1019', host: 'DC-01', ioc: 'none', category: 'Credential', playbook: 'PB-02', responder: 'Rishika',
      indicators: [], correlated: true, escalated: false, acknowledgedBy: null, reportId: 'RPT-1',
      playbookRuns: [{ playbookId: 'PB-02', name: 'Credential compromise', at: T(40) }],
      createdDate: T(95), closedDate: T(0), timeline: SEED_CLOSED_TIMELINE,
    },
  ]
}

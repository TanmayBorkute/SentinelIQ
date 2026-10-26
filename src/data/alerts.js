import { ASSETS } from './assets.js'

// 19 alerts chosen to produce different outputs on stage. Fields:
//   base       AI confidence (the live feed adds a little jitter around it)
//   category   drives the badge and the suggested playbook
//   ioc        key into IOC_FEED, or 'none' (correlation then returns "no matches")
//   minutesAgo how old the alert is when the demo loads
//   status     seeded workflow state
export const ALERT_SEEDS = [
  { id: 'ALT-1001', sourceLog: 'powershell -enc JABz... spawned by winword.exe', host: 'WS-FIN-014', ioc: '185.220.101.7', base: 97.6, category: 'Malware', playbook: 'PB-01', minutesAgo: 95, status: 'Escalated to Incident', incidentId: 'INC-2001' },
  { id: 'ALT-1002', sourceLog: 'Process hollowing detected in svchost.exe', host: 'SRV-DB-02', ioc: 'e3b0c44298fc1c149afbf4c8996fb924', base: 95.1, category: 'Malware', playbook: 'PB-01', minutesAgo: 70, status: 'New' },
  { id: 'ALT-1003', sourceLog: 'Burst of 212 failed VPN logins from one source', host: 'VPN-GW-01', ioc: 'none', base: 71.3, category: 'Credential', playbook: 'PB-02', minutesAgo: 64, status: 'New' },
  { id: 'ALT-1004', sourceLog: 'DNS tunnelling pattern to evil-update.example', host: 'WS-HR-007', ioc: 'evil-update.example', base: 92.4, category: 'Exfiltration', playbook: 'PB-03', minutesAgo: 58, status: 'New' },
  { id: 'ALT-1005', sourceLog: 'Internal port scan across /24 subnet', host: 'WS-GUEST-03', ioc: 'none', base: 64.2, category: 'Recon', playbook: null, minutesAgo: 55, status: 'False Positive' },
  { id: 'ALT-1006', sourceLog: 'LSASS memory access by unsigned binary', host: 'WS-ENG-022', ioc: 'a1f5d0c7be4390de52ab77c8e1d4f6a2', base: 96.3, category: 'Credential', playbook: 'PB-02', minutesAgo: 49, status: 'New' },
  { id: 'ALT-1007', sourceLog: 'Unusual 4 GB outbound transfer after hours', host: 'SRV-FILE-01', ioc: 'none', base: 83.0, category: 'Exfiltration', playbook: 'PB-03', minutesAgo: 44, status: 'New' },
  { id: 'ALT-1008', sourceLog: 'New domain admin account created off-hours', host: 'DC-01', ioc: 'none', base: 78.5, category: 'Credential', playbook: 'PB-02', minutesAgo: 120, status: 'Escalated to Incident', incidentId: 'INC-2002' },
  { id: 'ALT-1009', sourceLog: 'Mass file rename to .locked on shared drive', host: 'WS-FIN-021', ioc: 'c4ca4238a0b923820dcc509a6f75849b', base: 98.9, category: 'Malware', playbook: 'PB-01', minutesAgo: 8, status: 'New' },
  { id: 'ALT-1010', sourceLog: 'Impossible-travel login to an executive mailbox', host: 'MAIL-GW-01', ioc: 'none', base: 74.8, category: 'Credential', playbook: 'PB-02', minutesAgo: 36, status: 'New' },
  { id: 'ALT-1011', sourceLog: 'Beaconing to 203.0.113.50 every 60 seconds', host: 'WS-ENG-009', ioc: '203.0.113.50', base: 88.7, category: 'Malware', playbook: 'PB-01', minutesAgo: 31, status: 'New' },
  { id: 'ALT-1012', sourceLog: 'Contractor copied 12 GB to USB mass storage', host: 'WS-CNTR-05', ioc: 'none', base: 69.0, category: 'Insider', playbook: 'PB-03', minutesAgo: 27, status: 'New' },
  { id: 'ALT-1013', sourceLog: 'Credentials entered on look-alike payroll login page', host: 'WS-HR-011', ioc: 'secure-login-payroll.example', base: 93.5, category: 'Phishing', playbook: 'PB-02', minutesAgo: 22, status: 'New' },
  { id: 'ALT-1014', sourceLog: 'EDR agent service stopped on production server', host: 'SRV-APP-03', ioc: 'none', base: 81.6, category: 'Malware', playbook: 'PB-01', minutesAgo: 18, status: 'New' },
  { id: 'ALT-1015', sourceLog: 'Cloud storage bucket policy changed to public-read', host: 'CLOUD-S3-DATA', ioc: 'none', base: 86.4, category: 'Misconfiguration', playbook: 'PB-04', minutesAgo: 14, status: 'New' },
  { id: 'ALT-1016', sourceLog: 'New scheduled task created for persistence', host: 'WS-FIN-014', ioc: 'none', base: 76.2, category: 'Malware', playbook: 'PB-01', minutesAgo: 40, status: 'False Positive' },
  { id: 'ALT-1017', sourceLog: 'SQL-injection patterns against /login endpoint', host: 'WEB-APP-01', ioc: '198.51.100.23', base: 90.2, category: 'Web attack', playbook: null, minutesAgo: 11, status: 'New' },
  { id: 'ALT-1018', sourceLog: 'Off-hours VPN login from a first-seen country', host: 'VPN-GW-01', ioc: 'none', base: 58.9, category: 'Credential', playbook: 'PB-02', minutesAgo: 5, status: 'New' },
  { id: 'ALT-1019', sourceLog: 'Kerberoasting: burst of service-ticket requests', host: 'DC-01', ioc: 'none', base: 91.1, category: 'Credential', playbook: 'PB-02', minutesAgo: 1700, status: 'Escalated to Incident', incidentId: 'INC-2003' },
]

export function seedAlerts(now) {
  return ALERT_SEEDS.map((a) => {
    const asset = ASSETS.find((x) => x.hostname === a.host)
    return {
      alertId: a.id, sourceLog: a.sourceLog, host: a.host, ip: asset.ipAddress, ioc: a.ioc,
      confidenceScore: a.base, category: a.category, playbook: a.playbook,
      status: a.status, timestamp: now - a.minutesAgo * 60000, ...(a.incidentId ? { incidentId: a.incidentId } : {}),
    }
  })
}

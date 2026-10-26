const ROWS = [
  ['WS-FIN-014', '10.0.4.21', 'Workstation', 'Finance'],
  ['WS-FIN-021', '10.0.4.28', 'Workstation', 'Finance'],
  ['SRV-DB-02', '10.0.8.5', 'Database server', 'Engineering'],
  ['VPN-GW-01', '10.0.1.1', 'VPN gateway', 'IT'],
  ['WS-HR-007', '10.0.4.77', 'Workstation', 'HR'],
  ['WS-HR-011', '10.0.4.81', 'Workstation', 'HR'],
  ['SRV-FILE-01', '10.0.8.12', 'File server', 'IT'],
  ['DC-01', '10.0.8.2', 'Domain controller', 'IT'],
  ['WS-ENG-022', '10.0.5.40', 'Workstation', 'Engineering'],
  ['WS-ENG-009', '10.0.5.19', 'Workstation', 'Engineering'],
  ['WS-GUEST-03', '10.0.9.9', 'Workstation', 'Guest network'],
  ['WS-CNTR-05', '10.0.9.31', 'Workstation', 'Contractor'],
  ['MAIL-GW-01', '10.0.2.10', 'Mail gateway', 'IT'],
  ['SRV-APP-03', '10.0.8.33', 'Application server', 'Operations'],
  ['CLOUD-S3-DATA', '172.31.4.12', 'Cloud storage', 'Data platform'],
  ['WEB-APP-01', '10.0.6.5', 'Web server', 'Operations'],
]

export const ASSETS = ROWS.map(([hostname, ipAddress, kind, dept], i) => ({
  assetId: `A-${String(i + 1).padStart(2, '0')}`, hostname, ipAddress, kind, dept, isolated: false,
}))

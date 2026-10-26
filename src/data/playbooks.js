export const PLAYBOOKS = [
  { playbookId: 'PB-01', name: 'Malware containment', steps: ['Isolate host from network', 'Kill malicious process tree', 'Snapshot memory for forensics', 'Block IOC at perimeter'] },
  { playbookId: 'PB-02', name: 'Credential compromise', steps: ['Disable affected account', 'Force password reset and revoke sessions', 'Review privileged group changes', 'Enable step-up MFA'] },
  { playbookId: 'PB-03', name: 'Data exfiltration', steps: ['Throttle egress for the host', 'Capture network flow records', 'Block destination domain/IP', 'Notify data owner'] },
  { playbookId: 'PB-04', name: 'Cloud misconfiguration', steps: ['Revert public access policy', 'Snapshot access logs', 'Rotate exposed keys', 'Run storage exposure scan'] },
]

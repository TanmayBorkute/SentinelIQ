// Threat-intelligence feed (UC-07). Keys are indicator values; alerts reference them via `ioc`.
// Documentation-range IPs (203.0.113.x, 198.51.100.x) and .example domains are safe, non-routable demo values.
export const IOC_FEED = {
  '185.220.101.7': { type: 'IP', riskScore: 94, tag: 'Tor exit / C2 relay' },
  'e3b0c44298fc1c149afbf4c8996fb924': { type: 'Hash', riskScore: 88, tag: 'Process-injection loader' },
  'evil-update.example': { type: 'Domain', riskScore: 91, tag: 'DNS tunnelling' },
  'a1f5d0c7be4390de52ab77c8e1d4f6a2': { type: 'Hash', riskScore: 96, tag: 'Credential dumper' },
  'c4ca4238a0b923820dcc509a6f75849b': { type: 'Hash', riskScore: 99, tag: 'Ransomware dropper' },
  '203.0.113.50': { type: 'IP', riskScore: 82, tag: 'C2 beacon infrastructure' },
  'secure-login-payroll.example': { type: 'Domain', riskScore: 90, tag: 'Phishing kit' },
  '198.51.100.23': { type: 'IP', riskScore: 77, tag: 'Automated web scanner' },
}

# SentinelIQ demo scenarios

The seed data (`src/data/`) is built so different clicks give visibly different results. "Reset demo" (Admin → Audit log) restores it at any time.

## What the data contains

| Data | Count | Notes |
| --- | --- | --- |
| Alerts | 19 | 14 New, 2 False Positive, 3 already escalated. Confidence 58.9% to 98.9%. |
| Incidents | 3 | One per stage: investigating, contained (no report yet), closed (signed report). |
| Assets | 16 | Workstations, servers, gateway, domain controller, cloud storage. DC-01 starts isolated. |
| Threat-intel feed | 8 | 4 hashes/IPs/domains with high risk scores; the rest of the alerts have no feed match. |
| Playbooks | 4 | Malware, credential, exfiltration, cloud misconfiguration. |
| Users | 5 | Analyst x2, responder, admin, CISO. |
| Forensic reports | 1 | RPT-1 for INC-2003, with a valid SHA-256 hash. |

## Alerts and what each one shows

| Alert | Confidence | Category | Threat-intel result | Why use it |
| --- | --- | --- | --- | --- |
| ALT-1009 ransomware-style file renames (WS-FIN-021) | 98.9% | Malware | Hash, risk 99, ransomware dropper | Best "wow" case: top of the queue. Create it as Critical to see auto-escalation, toast and CISO notification. |
| ALT-1006 LSASS access (WS-ENG-022) | 96.3% | Credential | Hash, risk 96, credential dumper | Suggested playbook is Credential compromise. |
| ALT-1002 process hollowing (SRV-DB-02) | 95.1% | Malware | Hash, risk 88, injection loader | Simple Critical/High case on a database server. |
| ALT-1013 look-alike payroll login (WS-HR-011) | 93.5% | Phishing | Domain, risk 90, phishing kit | Phishing badge, HR asset. |
| ALT-1004 DNS tunnelling (WS-HR-007) | 92.4% | Exfiltration | Domain, risk 91 | Suggested playbook is Data exfiltration. |
| ALT-1017 SQL injection (WEB-APP-01) | 90.2% | Web attack | IP, risk 77, scanner | No suggested playbook; shows the default. |
| ALT-1011 beaconing every 60 s (WS-ENG-009) | 88.7% | Malware | IP, risk 82, C2 | Mid-range risk score. |
| ALT-1015 public storage bucket (CLOUD-S3-DATA) | 86.4% | Misconfiguration | No match | Only alert that suggests the Cloud misconfiguration playbook. |
| ALT-1007, 1010, 1014 | 74.8% to 83.0% | Exfiltration / Credential / Malware | No match | Shows the "no matching indicators" path. |
| ALT-1003 VPN brute force, ALT-1012 USB copy | 71.3%, 69.0% | Credential, Insider | No match | Low-confidence triage; hidden when the threshold is raised. |
| ALT-1018 off-hours VPN login | 58.9% | Credential | No match | Suppressed at the default 60% threshold. |

## Five-minute walkthrough

1. **Analyst (analyst@sentineliq.io).** Dashboard shows 13 open alerts, 1 below threshold, and the category chart. Open Alerts: ALT-1009 is first. Create it as **Critical**: a red toast appears and the incident is escalated automatically. Mark ALT-1003 as a **false positive** and watch the AI model move from v2.4.1 to v2.4.2.
2. **Responder (responder@sentineliq.io).** Open INC-2001. Forensic report and Close are disabled with an explanation. Click Correlate threat intel (Tor exit / C2 relay, risk 94), run the suggested playbook (host gets isolated), generate the report, then close. Then open the new ALT-1009 incident to repeat the flow on the ransomware hash.
3. **INC-2002.** Already contained and correlated, but has no report. Generate the report, then Close becomes available.
4. **CISO (ciso@sentineliq.io).** Dashboard lists escalations awaiting acknowledgement. Open one and click Acknowledge.
5. **Admin (admin@sentineliq.io).** Drag the confidence threshold to 75: the alert queue shrinks. Drag to 55: ALT-1018 appears. Turn off auto-escalate and create another Critical incident to show the manual escalation requirement before close. Review the audit log.

## Tamper-evidence demo (NFR-07)

1. Sign in as responder or admin, open Reports, click **Verify integrity** on RPT-1: "Unmodified".
2. In the browser dev tools, open Application → Local Storage → `sentineliq.state.v3`, change a word in RPT-1's `summary`, and reload.
3. Click Verify integrity again: "Hash mismatch".

## Changing the seed data

Edit the files in `src/data/`. If you change `incidents.js` (closed incident timeline) or `reports.js`, run `node scripts/sign-seed-report.mjs` to refresh the seeded report hash. Bump `version` in `src/state/store.js` (and `KEY`) so browsers drop the old saved state.

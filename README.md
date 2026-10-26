# SentinelIQ — AI Cyber Incident Response & Investigation Platform (AI-CIRP v2.0)

MCA Semester III project (course 25CS60TP1379-1), Ramdeobaba University.
Team: Tanmay, Rishika, Purwanshu, Sanjana. Requirements follow IEEE 830-1998 / ISO/IEC/IEEE 29148:2018.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
```

Optional AI microservice: `cd backend_ai_engine && pip install fastapi uvicorn pydantic && uvicorn main:app --reload --port 8000`.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| SOC Analyst | analyst@sentineliq.io | analyst |
| Incident Responder | responder@sentineliq.io | responder |
| Security Administrator | admin@sentineliq.io | admin |
| CISO / Management | ciso@sentineliq.io | ciso |

## Features

- Role-based navigation and permissions (UC-01, UC-13) for four actors.
- Dashboard with KPIs, alert-volume sparkline, severity donut, confidence histogram and incident pipeline.
- Live detection feed (UC-03) with confidence scores, search, filters and threshold-based suppression (UC-12).
- Incident workspace: workflow stepper, timeline, threat-intel correlation (UC-07), playbook execution and asset isolation (UC-10), escalation and CISO acknowledgement (UC-09).
- Forensic reports with a SHA-256 hash and a one-click integrity check (NFR-07), JSON export, print/PDF, compliance CSV (UC-08, UC-11).
- Admin: rule configuration, user and role management, searchable audit log (BR-04), AI model status.
- State persists in localStorage; "Reset demo" in Admin restores the seed data.

## Business rules enforced

BR-01 Critical incidents are escalated (auto, or required before closing). BR-02 False positives retrain the model.
BR-03 A responder is assigned before investigation actions. BR-04 Every action is audited.
BR-05 A forensic report requires correlation first.

## Folder structure

```
sentineliq/
├── index.html · package.json · vite.config.js · eslint.config.js · .gitignore
├── docs/
│   └── demo-scenarios.md        what to click on stage and what each alert shows
├── scripts/
│   └── sign-seed-report.mjs     re-signs the seeded forensic report after data edits
├── backend_ai_engine/
│   ├── main.py                  FastAPI AI detection microservice
│   └── requirements.txt
└── src/
    ├── main.jsx · App.jsx · index.css      entry, app shell, global styles
    ├── data/                    seed data: alerts, incidents, assets, threatIntel, playbooks, users, reports
    ├── state/store.js           reducer, permissions and business rules (BR-01..BR-05)
    ├── lib/util.js              formatting, SHA-256, download helpers
    ├── components/ui.jsx        cards, badges, buttons, drawer, SVG charts
    └── views/                   Login, Dashboard, Queue (alerts + incidents), Response, Reports, Admin
```

Put the SRS (`.docx`), the presentation (`.pptx`) and the four UML diagrams in `docs/` as well.

## Demo data

19 alerts, 3 incidents (investigating, contained, closed), 16 assets, 8 threat-intel indicators, 4 playbooks and a signed
sample report. See `docs/demo-scenarios.md` for the walkthrough.

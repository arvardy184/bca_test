# JKL CreditFlow

**Digital Vehicle Financing Platform** — a coding-assessment prototype for a
fictional multifinance company, PT JKL Finance.

## What this is

A static frontend prototype that digitizes a manual vehicle financing
application process (physical KTP/SPK/forms, manual data entry, manual
approval, manual document handoffs) into a centralized digital workflow —
**"Input Once, Process Faster."** There is no backend: all data is realistic
mock data persisted to the browser's `localStorage`.

From document-centric to digital workflow:

- Digital application instead of physical forms
- One customer/vehicle/loan record as the single source of truth
- Role-based workflow routing and approval
- Real-time status tracking with a full audit trail

## Tech stack

Vite, React 18, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), React Router
v6, Lucide React, Recharts, Vitest + React Testing Library.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run the unit/integration test suite
npm run build    # production build to dist/
```

No environment variables or external services are required.

## Demo roles

The login page has a "Demo Access" section that logs you in as one of four
roles, each with a different sidebar and set of permitted actions (enforced
client-side only — see Security Note below):

| Role | Can do |
| --- | --- |
| Sales Dealer | Create applications, submit drafts, manage customers/documents |
| Marketing | Review submitted applications, send to approval or back for revision |
| Marketing Supervisor | Approve, reject, or request revision; view reports |
| Back Office | Process approved applications through to disbursement; view reports |

## Project structure

```
src/
  components/    # shared UI (StatusBadge, KpiCard, AppShell...) + shadcn primitives under ui/
  pages/         # one file per route
  layouts/       # (AppShell lives under components/layout)
  context/       # AuthContext + DataContext (all localStorage persistence lives here)
  data/          # mock reference & seed data
  types/         # domain types
  utils/         # pure logic: formatting, masking, validation, financing calc, workflow engine
  routes/        # RequireAuth / RequireRole guards
```

The workflow state machine (`src/utils/workflow.ts`) is the single source of
truth for which role can move an application from one status to another;
every status change goes through `DataContext.transitionApplication`, which
also appends an audit log entry.

## Security note

This is a frontend-only prototype. Role checks (`RequireRole`, sidebar
visibility) are a UI convenience, not real access control. A production
implementation must enforce authorization, encryption, secure document
storage, audit logging, and validation on the server — never trust the
client to gate access to real customer or financial data.

## Deployment

Static build, deployable to Vercel or Netlify as-is:

- `vercel.json` and `netlify.toml` are included with SPA rewrite rules so
  client-side routes resolve correctly on refresh/deep-link.
- Build command: `npm run build`; output directory: `dist`.

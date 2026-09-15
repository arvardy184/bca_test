# JKL CreditFlow — Design Spec

Date: 2026-09-15
Status: Approved for implementation

## 1. Purpose

A static frontend prototype for a fictional Indonesian vehicle-financing
company, "PT JKL Finance," built as a software-engineering recruitment
assessment. It demonstrates transforming a manual, paper-based vehicle
loan application process (physical KTP, SPK, forms, manual approval,
manual handoffs) into a centralized digital workflow: "Input Once,
Process Faster." No backend, no real auth, no real API — realistic mock
data persisted to `localStorage`, deployable as-is to Vercel or Netlify.

## 2. Non-goals

- No real authentication, no server, no database, no env vars.
- No real credit-scoring model (risk indicator is explicitly labeled "Demo").
- No real file upload/storage (documents are simulated: file name + status only).
- No production-grade authorization (frontend role-gating only, with an
  explicit in-app note that a backend must enforce this for real).

## 3. Tech stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- shadcn/ui (Radix primitives) for the component system
- React Router v6 for client-side routing
- Lucide React for icons
- Recharts for charts on the Reports page
- npm as package manager; `npm install`, `npm run dev`, `npm run build` must all work with no configuration

## 4. Roles

Four demo roles, selectable at login (mock credentials, no real auth):

1. **Sales Dealer** — creates applications, manages own customers/documents.
2. **Marketing** — reviews submitted applications, moves them to approval.
3. **Marketing Supervisor** — approves/rejects/requests revision.
4. **Back Office** — handles disbursement post-approval.

Each role sees a different sidebar nav and dashboard, enforced only in
the frontend (route guards + conditional nav). A visible note in the
Settings/Architecture area states: "Production implementation should
enforce authorization, encryption, secure document storage, audit
logging, and server-side validation — frontend role checks here are for
demonstration only."

## 5. Information architecture / routes

```
/login
/                          Dashboard (role-aware)
/applications              Application list
/applications/new          5-step wizard
/applications/:id          Application detail
/approvals                 Approval Queue (Supervisor)
/disbursement              Back Office
/customers
/customers/:id
/documents                 Document Center
/reports
/settings
/403                        Permission denied
* (404)
```

`AppShell` layout wraps all authenticated routes (sidebar + header +
outlet). `/login` uses a standalone `AuthLayout`.

## 6. Data model (`src/types`)

```
User          { id, name, role, avatarInitials }
Customer      { id, name, nik, dob, maritalStatus, spouse?, phone, email,
                address, occupation, monthlyIncome, createdAt }
Dealer        { id, name, city }
Vehicle       { id, brand, model, type, color, price }
LoanApplication {
  id, code (APP-YYYY-#####), customerId, vehicleId, dealerId,
  financing: { vehiclePrice, downPayment, financedAmount, tenor,
               interestRate, insurance, estimatedInstallment },
  documents: DocumentRef[], status, createdBy, currentPIC,
  createdAt, updatedAt, riskLevel? ('Low'|'Medium'|'High')
}
Document      { id, applicationId, type, fileName, status, uploadedBy, uploadedAt }
Approval      { id, applicationId, approver, action, notes, timestamp }
AuditLog      { id, applicationId, actor, action, timestamp, metadata? }
```

Status enum (single source of truth in `utils/workflow.ts`):
`Draft, Submitted, Under Review, Need Revision, Waiting Approval,
Approved, Rejected, Document Pending, Signed, Ready for Disbursement,
Disbursed`.

## 7. Workflow engine

`utils/workflow.ts` exports:

- `STATUS_FLOW` — ordered pipeline stages for the funnel visualization.
- `canTransition(currentStatus, nextStatus, role): boolean` encoding:
  - Sales Dealer: `Draft → Submitted`
  - Marketing: `Submitted → Under Review`, `Under Review → Need Revision`,
    `Under Review → Waiting Approval`
  - Marketing Supervisor: `Waiting Approval → Approved`,
    `Waiting Approval → Rejected`, `Waiting Approval → Need Revision`
  - Back Office: `Approved → Document Pending`,
    `Document Pending → Signed`, `Signed → Ready for Disbursement`,
    `Ready for Disbursement → Disbursed`
- Every transition performed through the UI calls a single
  `transitionApplication()` helper (in the data context) that updates
  the application, appends an `AuditLog` entry, and (where relevant) an
  `Approval` entry — so every status change is traceable.

## 8. State & persistence

- `DataProvider` (React context) owns all applications/customers/
  documents/approvals/audit logs. On first load it seeds
  `localStorage` from `src/data/seed.ts` if empty, then all reads/
  writes go through context methods (`createApplication`,
  `transitionApplication`, `addDocument`, etc.), persisting to
  `localStorage` after each mutation.
- `AuthProvider` holds the current demo user/role in `localStorage`;
  drives route guarding (`<RequireRole>`) and nav visibility.
- No external state library needed (Context + hooks is sufficient at
  this scale).

## 9. Mock data

At least 12 seeded applications spread across the full status range,
using Indonesian names (Budi Santoso, Siti Rahma, Andi Pratama, Dimas
Saputra, Rizky Maulana, Fajar Nugroho, Nadia Putri, Aldi Wijaya, Rina
Maharani, Yoga Prasetyo, +2 more), realistic vehicles (Toyota Avanza/
Innova, Honda Brio/HR-V, Mitsubishi Xpander, Daihatsu Terios, Suzuki
Ertiga) and dealers (Auto Prima Malang, Jaya Motor Surabaya, Central
Auto Jakarta). Currency formatted as `Rp 250.000.000`; dates as
`15 Sep 2026`.

## 10. Page specs (condensed — full behavior per original brief)

- **Login** — title/subtitle, username/password fields (cosmetic),
  "Demo Access" quick-login buttons per role.
- **Dashboard** — greeting, 6 KPI cards with trend deltas, pipeline
  funnel (Draft→Disbursed), recent applications table, processing
  performance metrics, "Digitalization Impact" before/after panel.
  Content varies slightly by role (e.g. Back Office sees disbursement-
  weighted KPIs).
- **Applications list** — search, status/date/dealer filters, export
  (mock, triggers a toast), status-badged table, row click → detail.
- **New Application wizard** — 5 steps (Customer, Vehicle, Financing,
  Documents, Review) with a persistent step indicator, per-field
  validation (NIK 16 digits, phone format, numeric income), conditional
  spouse fields, dynamic installment calculation (clearly labeled
  "Estimated"), drag-and-drop-styled document slots (local state only),
  and a review step that creates the application (status `Submitted`),
  writes it + documents + an initial audit log to localStorage, shows a
  success toast, and navigates to the detail page.
- **Application detail** — status header, vertical workflow timeline
  with timestamps, customer/vehicle/financing/document sections,
  per-document status + mock preview + verify action, approval history
  timeline, and an audit trail list. Role-appropriate action bar (e.g.
  Marketing sees "Send to Review", Supervisor sees Approve/Reject/
  Request Revision, Back Office sees disbursement actions) — all backed
  by `canTransition`.
- **Approval Queue** (Supervisor) — cards/table with a "Demo Risk
  Indicator" (Low/Medium/High, explicitly labeled non-real), SLA aging,
  Approve/Reject/Request Revision actions each behind a confirmation
  dialog (reject/revision require a reason/notes textarea).
- **Disbursement** (Back Office) — tabs (Ready / Processing /
  Completed), contract/document/signature/disbursement status chips,
  "Process Disbursement" confirmation → status `Disbursed` + audit log.
- **Customers** — list (masked NIK) + profile (personal data,
  application history, documents, financing history).
- **Document Center** — filterable document list/cards across all
  applications, masked PII, verification status.
- **Reports** — Recharts: applications by status, by month, approval
  rate, avg. processing time, applications by dealer, using realistic
  (non-extreme) numbers; includes the Digitalization Impact narrative.
- **Settings** — current demo user/role display, security note about
  production authorization/encryption requirements.
- **403 / 404 / empty states** — "You don't have permission to access
  this resource," "No applications found," etc., wherever a list or
  guarded route can be empty/blocked.

## 11. Visual design system

Off-white background, dark navy text, subtle blue accent for primary
actions/links, green for approved/success, amber for pending, red for
rejected/error, neutral gray for inactive. Moderate rounded corners
(cards `rounded-lg`/`rounded-xl`), minimal shadows, no gradients, no
decorative illustrations. Status badges use consistent color-to-status
mapping defined once in `components/StatusBadge.tsx`. Typography: a
clean system/sans stack (e.g. Inter) sized for high information density
without clutter — banking-app feel, not a SaaS marketing site.

## 12. Security representation (explicitly cosmetic, documented as such)

- NIK masked by default everywhere except within a confirmed detail
  context (`3573********1234` style helper in `utils/mask.ts`).
- No plaintext password ever rendered (login field is `type=password`;
  demo-login buttons bypass typing it entirely).
- Role-based UI gating via `<RequireRole>` route wrapper — paired with
  an in-app note that this is not a substitute for server-side
  authorization.
- Every state-changing action produces an `AuditLog` row, viewable on
  the application detail page.

## 13. Deployment

Static Vite build (`dist/`). Both `vercel.json` and `netlify.toml`
included with SPA rewrite rules (`/* → /index.html`) so client-side
routes resolve on refresh/deep-link. No environment variables, no
serverless functions required.

## 14. Out of scope / explicitly acknowledged limitations

- Document "upload" only stores a file name + status client-side —
  no real file bytes are persisted.
- Risk indicator and installment calculation are illustrative, not
  real underwriting/amortization formulas — both are labeled as such
  in the UI.
- Multi-user concurrency is not modeled; all data lives in one
  browser's localStorage.

# JKL CreditFlow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the JKL CreditFlow static frontend prototype — a role-based digital vehicle-financing workflow app (login → application wizard → review/approval → disbursement → reports) with realistic mock data persisted to localStorage, deployable to Vercel/Netlify with no backend.

**Architecture:** Vite + React 18 + TypeScript SPA. A pure-function core (`utils/`: formatting, masking, validation, financing calc, workflow state machine) is unit-tested with Vitest. Two React contexts (`AuthContext`, `DataContext`) wrap all localStorage-backed state and are the only place components touch persistence. Pages are composed from shadcn/ui primitives and shared domain components; every status transition flows through one `transitionApplication()` call so every change is audit-logged.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix), React Router v6, Lucide React, Recharts, Vitest + React Testing Library, npm.

**Spec:** `docs/superpowers/specs/2026-09-15-jkl-creditflow-design.md`

## Global Constraints

- npm only; `npm install`, `npm run dev`, `npm run build` must work with zero configuration and no env vars.
- No backend, no real network calls, no real file upload — localStorage is the only persistence.
- Currency format: `Rp 250.000.000` (dot thousands separator, no decimals). Date format: `15 Sep 2026`. Datetime adds `HH:mm`.
- Colors: blue = primary/in-progress, green = approved/success, amber = pending, red = rejected/error, gray = inactive/draft. Defined once in `utils/workflow.ts` (`STATUS_META`) and reused everywhere — never hardcode a status color in a page.
- NIK is masked (`3573********1234`) by default anywhere it's displayed outside a field the user is actively editing.
- Every state-changing action on a `LoanApplication` (create, transition, verify document) must append an `AuditLog` row via the `DataContext` — never mutate status without going through `transitionApplication`.
- **Testing strategy (deliberate adaptation, approved in spec review):** pure logic in `utils/` and the two contexts are TDD'd with Vitest/RTL. Presentational pages/components are verified manually via `npm run dev` per the task's acceptance checklist — writing RTL tests for every page would over-engineer a UI-first prototype. Every task still ends in a runnable, visually-checkable state.
- Every task ends with `npm run build` succeeding (no TypeScript errors) before moving on.

---

## File Structure

```
vercel.json, netlify.toml, README.md
src/
  main.tsx, App.tsx, index.css
  lib/utils.ts                     # shadcn's cn() helper
  types/index.ts                   # all domain types
  utils/
    format.ts   mask.ts   id.ts
    validation.ts
    financing.ts
    workflow.ts
  data/
    dealers.ts  vehicleCatalog.ts  users.ts
    customers.ts  applications.ts  seed.ts
  context/
    AuthContext.tsx
    DataContext.tsx
  routes/
    RequireAuth.tsx  RequireRole.tsx
  components/
    ui/            # shadcn primitives
    layout/AppShell.tsx  Sidebar.tsx  Header.tsx  MobileNav.tsx
    common/StatusBadge.tsx  RiskBadge.tsx  KpiCard.tsx  EmptyState.tsx
           ConfirmDialog.tsx  PageHeader.tsx
    applications/ApplicationsTable.tsx  ApplicationFilters.tsx
                 WorkflowTimeline.tsx  ApprovalHistory.tsx  AuditTrail.tsx
                 DocumentChecklist.tsx  PipelineFunnel.tsx
    wizard/StepIndicator.tsx  StepCustomer.tsx  StepVehicle.tsx
           StepFinancing.tsx  StepDocuments.tsx  StepReview.tsx
  pages/
    LoginPage.tsx  DashboardPage.tsx  ApplicationsListPage.tsx
    NewApplicationPage.tsx  ApplicationDetailPage.tsx
    ApprovalQueuePage.tsx  DisbursementPage.tsx
    CustomersListPage.tsx  CustomerDetailPage.tsx
    DocumentsPage.tsx  ReportsPage.tsx  SettingsPage.tsx
    ForbiddenPage.tsx  NotFoundPage.tsx
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `tailwind.config.ts`, `postcss.config.js`

**Interfaces:**
- Produces: a running Vite React-TS app at `/`, path alias `@/*` → `src/*`, Tailwind active.

- [ ] **Step 1:** Scaffold with `npm create vite@latest . -- --template react-ts` (run in the empty project root; confirm overwrite of nothing since dir is empty).
- [ ] **Step 2:** `npm install`, then `npm install -D tailwindcss postcss autoprefixer` and `npx tailwindcss init -p`. Configure `tailwind.config.ts` `content: ["./index.html", "./src/**/*.{ts,tsx}"]` and a `theme.extend.colors` block with `navy`, `brand` (blue), `success` (green), `warning` (amber), `danger` (red) scales (500/600/700 shades each). Add Tailwind directives to `src/index.css` plus `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');` and set `body { font-family: 'Inter', system-ui, sans-serif; }` and a light off-white `background`/navy `foreground` base style.
- [ ] **Step 3:** Add path alias: in `tsconfig.json` add `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }`; in `vite.config.ts` add `resolve: { alias: { '@': path.resolve(__dirname, './src') } }` (import `path` and `node:url`/`fileURLToPath` as needed for ESM `__dirname`).
- [ ] **Step 4:** Replace the default `src/App.tsx` with a minimal placeholder (`<div className="p-8 text-navy-900">JKL CreditFlow</div>`) and clear boilerplate CSS from `src/index.css` other than the Tailwind directives/font rule above.
- [ ] **Step 5:** Run `npm run build` and `npm run dev` (start then stop) to confirm both succeed with no errors.
- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "chore: scaffold Vite React TS app with Tailwind"
```

---

### Task 2: Testing tooling

**Files:**
- Modify: `package.json`, `vite.config.ts`
- Create: `src/setupTests.ts`, `src/utils/format.smoke.test.ts` (temporary smoke test, deleted in Task 5 once real format tests exist)

**Interfaces:**
- Produces: `npm test` runs Vitest once (CI mode); `npm run test:watch` for local iteration.

- [ ] **Step 1:** `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`.
- [ ] **Step 2:** In `vite.config.ts`, add a `test` block: `{ environment: 'jsdom', globals: true, setupFiles: './src/setupTests.ts' }` (cast config with `/// <reference types="vitest/config" />` at top or use `defineConfig` from `vitest/config` merged with Vite's). Create `src/setupTests.ts` with `import '@testing-library/jest-dom';`.
- [ ] **Step 3:** Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
- [ ] **Step 4:** Write a trivial smoke test in `src/utils/format.smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('test pipeline', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5:** Run `npm test` — expect PASS (1 test).
- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "chore: add Vitest + Testing Library"
```

---

### Task 3: shadcn/ui setup

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/{button,card,input,label,select,textarea,dialog,tabs,badge,table,dropdown-menu,avatar,separator,toast,toaster,use-toast,progress,sheet,checkbox,radio-group,alert}.tsx`
- Modify: `tailwind.config.ts`, `src/index.css`, `src/App.tsx`

**Interfaces:**
- Produces: `cn()` from `@/lib/utils`, and every shadcn primitive importable from `@/components/ui/<name>`.

- [ ] **Step 1:** `npx shadcn@latest init` — choose defaults matching this project (TypeScript, Tailwind CSS variables, `@/*` alias, `src/index.css` as global css, neutral base color). Confirm it writes `components.json` and updates `tailwind.config.ts`/`src/index.css` with the CSS variable theme.
- [ ] **Step 2:** `npx shadcn@latest add button card input label select textarea dialog tabs badge table dropdown-menu avatar separator toast progress sheet checkbox radio-group alert` — accept generated files under `src/components/ui/`.
- [ ] **Step 3:** Add `<Toaster />` (from `@/components/ui/toaster`) to `src/App.tsx` root so toasts can be triggered from any page later.
- [ ] **Step 4:** Run `npm run build`. Expect PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "chore: add shadcn/ui primitives"
```

---

### Task 4: Domain types

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces (exact names/shapes every later task imports from `@/types`):

```ts
export type Role = 'sales_dealer' | 'marketing' | 'marketing_supervisor' | 'back_office';

export type ApplicationStatus =
  | 'Draft' | 'Submitted' | 'Under Review' | 'Need Revision'
  | 'Waiting Approval' | 'Approved' | 'Rejected'
  | 'Document Pending' | 'Signed' | 'Ready for Disbursement' | 'Disbursed';

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type MaritalStatus = 'Single' | 'Married';

export interface User { id: string; name: string; role: Role; initials: string; }

export interface Spouse { name: string; nik: string; dob: string; }

export interface Customer {
  id: string; name: string; nik: string; dob: string;
  maritalStatus: MaritalStatus; spouse?: Spouse;
  phone: string; email: string; address: string;
  occupation: string; monthlyIncome: number; createdAt: string;
}

export interface Dealer { id: string; name: string; city: string; }

export interface Vehicle {
  id: string; brand: string; model: string; type: string;
  color: string; price: number;
}

export interface Financing {
  vehiclePrice: number; downPayment: number; financedAmount: number;
  tenor: number; interestRate: number; insurance: number;
  estimatedInstallment: number;
}

export type DocumentType = 'KTP' | 'Kartu Keluarga' | 'SPK' | 'Bukti Bayar Tanda Jadi' | 'Form Aplikasi';
export type DocumentStatus = 'Missing' | 'Uploaded' | 'Under Verification' | 'Verified' | 'Rejected';

export interface DocumentRecord {
  id: string; applicationId: string; type: DocumentType;
  fileName: string | null; status: DocumentStatus;
  uploadedBy: string | null; uploadedAt: string | null;
}

export interface Approval {
  id: string; applicationId: string; approver: string;
  action: 'Approved' | 'Rejected' | 'Revision Requested';
  notes: string; timestamp: string;
}

export interface AuditLog {
  id: string; applicationId: string; actor: string; action: string;
  timestamp: string; metadata?: Record<string, string>;
}

export interface LoanApplication {
  id: string; code: string;
  customerId: string; vehicleId: string; dealerId: string;
  financing: Financing; status: ApplicationStatus; riskLevel: RiskLevel;
  createdBy: string; currentPIC: string;
  createdAt: string; updatedAt: string;
}
```

- [ ] **Step 1:** Create the file with the exact contents above.
- [ ] **Step 2:** Run `npx tsc --noEmit` — expect PASS (no consumers yet, so this only checks the file parses).
- [ ] **Step 3: Commit.**

```bash
git add -A
git commit -m "feat: add domain types"
```

---

### Task 5: Format, mask, id utils

**Files:**
- Create: `src/utils/format.ts`, `src/utils/format.test.ts`, `src/utils/mask.ts`, `src/utils/mask.test.ts`, `src/utils/id.ts`, `src/utils/id.test.ts`
- Delete: `src/utils/format.smoke.test.ts`

**Interfaces:**
- Produces: `formatCurrency(amount: number): string`, `formatDate(iso: string): string`, `formatDateTime(iso: string): string`, `maskNIK(nik: string): string`, `generateId(prefix: string): string`, `generateApplicationCode(year: number, sequence: number): string`.

- [ ] **Step 1: Write failing tests** `src/utils/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateTime } from './format';

describe('formatCurrency', () => {
  it('formats with Rp prefix and dot thousands separator', () => {
    expect(formatCurrency(250000000)).toBe('Rp 250.000.000');
    expect(formatCurrency(0)).toBe('Rp 0');
  });
});

describe('formatDate', () => {
  it('formats as D MMM YYYY', () => {
    expect(formatDate('2026-09-15T09:12:00.000Z')).toMatch(/^\d{2} Sep 2026$/);
  });
});

describe('formatDateTime', () => {
  it('appends HH:mm', () => {
    expect(formatDateTime('2026-09-15T09:12:00.000Z')).toMatch(/^\d{2} Sep 2026 \d{2}:\d{2}$/);
  });
});
```

- [ ] **Step 2:** Run `npm test src/utils/format.test.ts` — expect FAIL (module not found).
- [ ] **Step 3: Implement** `src/utils/format.ts`:

```ts
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatCurrency(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(iso)} ${hh}:${mm}`;
}
```

- [ ] **Step 4:** Run `npm test src/utils/format.test.ts` — expect PASS.
- [ ] **Step 5: Write failing test** `src/utils/mask.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { maskNIK } from './mask';

describe('maskNIK', () => {
  it('keeps first 4 and last 4 digits, masks the middle', () => {
    expect(maskNIK('3573010101900001')).toBe('3573********0001');
  });
  it('returns input unchanged if not 16 digits', () => {
    expect(maskNIK('12345')).toBe('12345');
  });
});
```

- [ ] **Step 6:** Run test — expect FAIL. **Implement** `src/utils/mask.ts`:

```ts
export function maskNIK(nik: string): string {
  if (nik.length !== 16) return nik;
  return `${nik.slice(0, 4)}********${nik.slice(-4)}`;
}
```

- [ ] **Step 7:** Run — expect PASS.
- [ ] **Step 8: Write failing test** `src/utils/id.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateId, generateApplicationCode } from './id';

describe('generateId', () => {
  it('produces unique prefixed ids', () => {
    const a = generateId('doc');
    const b = generateId('doc');
    expect(a).not.toBe(b);
    expect(a.startsWith('doc-')).toBe(true);
  });
});

describe('generateApplicationCode', () => {
  it('formats as APP-YYYY-##### with 5-digit zero-padded sequence', () => {
    expect(generateApplicationCode(2026, 128)).toBe('APP-2026-00128');
  });
});
```

- [ ] **Step 9:** Run — expect FAIL. **Implement** `src/utils/id.ts`:

```ts
let counter = 0;

export function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

export function generateApplicationCode(year: number, sequence: number): string {
  return `APP-${year}-${String(sequence).padStart(5, '0')}`;
}
```

- [ ] **Step 10:** Run all three test files — expect PASS. Delete `src/utils/format.smoke.test.ts`.
- [ ] **Step 11: Commit.**

```bash
git add -A
git commit -m "feat: add format, mask, and id utils with tests"
```

---

### Task 6: Validation utils

**Files:**
- Create: `src/utils/validation.ts`, `src/utils/validation.test.ts`

**Interfaces:**
- Produces: `isValidNIK(v: string): boolean`, `isValidPhone(v: string): boolean`, `isValidEmail(v: string): boolean`, `isValidIncome(v: string): boolean`.

- [ ] **Step 1: Write failing tests** `src/utils/validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { isValidNIK, isValidPhone, isValidEmail, isValidIncome } from './validation';

describe('isValidNIK', () => {
  it('requires exactly 16 digits', () => {
    expect(isValidNIK('3573010101900001')).toBe(true);
    expect(isValidNIK('123')).toBe(false);
    expect(isValidNIK('357301010190000a')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts Indonesian mobile formats', () => {
    expect(isValidPhone('081234567890')).toBe(true);
    expect(isValidPhone('+6281234567890')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('requires an @ and a domain', () => {
    expect(isValidEmail('budi@example.com')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
  });
});

describe('isValidIncome', () => {
  it('requires a positive numeric string', () => {
    expect(isValidIncome('8000000')).toBe(true);
    expect(isValidIncome('0')).toBe(false);
    expect(isValidIncome('8jt')).toBe(false);
  });
});
```

- [ ] **Step 2:** Run — expect FAIL. **Implement** `src/utils/validation.ts`:

```ts
export function isValidNIK(value: string): boolean {
  return /^\d{16}$/.test(value);
}

export function isValidPhone(value: string): boolean {
  return /^(\+62|62|0)8\d{8,11}$/.test(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidIncome(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) > 0;
}
```

- [ ] **Step 3:** Run — expect PASS.
- [ ] **Step 4: Commit.**

```bash
git add -A
git commit -m "feat: add validation utils with tests"
```

---

### Task 7: Financing calculation util

**Files:**
- Create: `src/utils/financing.ts`, `src/utils/financing.test.ts`

**Interfaces:**
- Produces:

```ts
export interface FinancingInput {
  vehiclePrice: number; downPayment: number; tenor: number;
  interestRate: number; insurance: number;
}
export interface FinancingResult { financedAmount: number; estimatedInstallment: number; }
export function calculateFinancing(input: FinancingInput): FinancingResult;
```

- [ ] **Step 1: Write failing test** `src/utils/financing.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateFinancing } from './financing';

describe('calculateFinancing', () => {
  it('computes financed amount as price minus down payment', () => {
    const result = calculateFinancing({
      vehiclePrice: 250_000_000, downPayment: 50_000_000,
      tenor: 60, interestRate: 6.5, insurance: 5_000_000,
    });
    expect(result.financedAmount).toBe(200_000_000);
  });

  it('spreads financed amount + flat interest + insurance evenly over the tenor', () => {
    const result = calculateFinancing({
      vehiclePrice: 200_000_000, downPayment: 40_000_000,
      tenor: 60, interestRate: 6, insurance: 0,
    });
    // financed = 160,000,000; interest = 160,000,000 * 0.06 * (60/12) = 48,000,000
    // total payable = 208,000,000 / 60 = 3,466,667 (rounded)
    expect(result.estimatedInstallment).toBe(3_466_667);
  });

  it('returns whole-rupiah integers (no fractional rupiah)', () => {
    const result = calculateFinancing({
      vehiclePrice: 199_999_999, downPayment: 33_333_333,
      tenor: 36, interestRate: 5.5, insurance: 1_000_000,
    });
    expect(Number.isInteger(result.estimatedInstallment)).toBe(true);
  });
});
```

- [ ] **Step 2:** Run — expect FAIL. **Implement** `src/utils/financing.ts`:

```ts
export interface FinancingInput {
  vehiclePrice: number;
  downPayment: number;
  tenor: number;
  interestRate: number;
  insurance: number;
}

export interface FinancingResult {
  financedAmount: number;
  estimatedInstallment: number;
}

export function calculateFinancing(input: FinancingInput): FinancingResult {
  const financedAmount = input.vehiclePrice - input.downPayment;
  const totalInterest = financedAmount * (input.interestRate / 100) * (input.tenor / 12);
  const totalPayable = financedAmount + totalInterest + input.insurance;
  const estimatedInstallment = Math.round(totalPayable / input.tenor);
  return { financedAmount, estimatedInstallment };
}
```

- [ ] **Step 3:** Run — expect PASS.
- [ ] **Step 4: Commit.**

```bash
git add -A
git commit -m "feat: add financing calculation util with tests"
```

---

### Task 8: Workflow state machine

**Files:**
- Create: `src/utils/workflow.ts`, `src/utils/workflow.test.ts`

**Interfaces:**
- Consumes: `ApplicationStatus`, `Role` from `@/types`.
- Produces:

```ts
export const STATUS_FLOW: ApplicationStatus[]; // main happy-path pipeline, for the funnel viz
export const STATUS_META: Record<ApplicationStatus, { label: string; color: 'blue' | 'green' | 'amber' | 'red' | 'gray' }>;
export function canTransition(current: ApplicationStatus, next: ApplicationStatus, role: Role): boolean;
export function nextStatusesFor(current: ApplicationStatus, role: Role): ApplicationStatus[];
```

- [ ] **Step 1: Write failing tests** `src/utils/workflow.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { canTransition, nextStatusesFor, STATUS_FLOW, STATUS_META } from './workflow';

describe('canTransition', () => {
  it('allows Sales Dealer to submit a Draft', () => {
    expect(canTransition('Draft', 'Submitted', 'sales_dealer')).toBe(true);
  });
  it('does not allow Sales Dealer to approve', () => {
    expect(canTransition('Waiting Approval', 'Approved', 'sales_dealer')).toBe(false);
  });
  it('allows Marketing to move Submitted to Under Review, and Under Review to Waiting Approval or Need Revision', () => {
    expect(canTransition('Submitted', 'Under Review', 'marketing')).toBe(true);
    expect(canTransition('Under Review', 'Waiting Approval', 'marketing')).toBe(true);
    expect(canTransition('Under Review', 'Need Revision', 'marketing')).toBe(true);
  });
  it('allows Marketing Supervisor to approve, reject, or request revision from Waiting Approval', () => {
    expect(canTransition('Waiting Approval', 'Approved', 'marketing_supervisor')).toBe(true);
    expect(canTransition('Waiting Approval', 'Rejected', 'marketing_supervisor')).toBe(true);
    expect(canTransition('Waiting Approval', 'Need Revision', 'marketing_supervisor')).toBe(true);
  });
  it('allows Back Office to progress Approved through Disbursed', () => {
    expect(canTransition('Approved', 'Document Pending', 'back_office')).toBe(true);
    expect(canTransition('Document Pending', 'Signed', 'back_office')).toBe(true);
    expect(canTransition('Signed', 'Ready for Disbursement', 'back_office')).toBe(true);
    expect(canTransition('Ready for Disbursement', 'Disbursed', 'back_office')).toBe(true);
  });
  it('rejects a transition not in the role map', () => {
    expect(canTransition('Draft', 'Disbursed', 'sales_dealer')).toBe(false);
  });
});

describe('nextStatusesFor', () => {
  it('lists the allowed next statuses for a role+status pair', () => {
    expect(nextStatusesFor('Waiting Approval', 'marketing_supervisor').sort()).toEqual(
      ['Approved', 'Need Revision', 'Rejected'].sort()
    );
  });
  it('returns an empty array when the role has no transitions from that status', () => {
    expect(nextStatusesFor('Disbursed', 'sales_dealer')).toEqual([]);
  });
});

describe('STATUS_META', () => {
  it('has an entry for every status referenced by STATUS_FLOW', () => {
    STATUS_FLOW.forEach((status) => expect(STATUS_META[status]).toBeDefined());
  });
});
```

- [ ] **Step 2:** Run — expect FAIL. **Implement** `src/utils/workflow.ts`:

```ts
import type { ApplicationStatus, Role } from '@/types';

export const STATUS_FLOW: ApplicationStatus[] = [
  'Draft', 'Submitted', 'Under Review', 'Waiting Approval', 'Approved',
  'Document Pending', 'Signed', 'Ready for Disbursement', 'Disbursed',
];

export const STATUS_META: Record<ApplicationStatus, { label: string; color: 'blue' | 'green' | 'amber' | 'red' | 'gray' }> = {
  Draft: { label: 'Draft', color: 'gray' },
  Submitted: { label: 'Submitted', color: 'blue' },
  'Under Review': { label: 'Under Review', color: 'blue' },
  'Need Revision': { label: 'Need Revision', color: 'amber' },
  'Waiting Approval': { label: 'Waiting Approval', color: 'amber' },
  Approved: { label: 'Approved', color: 'green' },
  Rejected: { label: 'Rejected', color: 'red' },
  'Document Pending': { label: 'Document Pending', color: 'amber' },
  Signed: { label: 'Signed', color: 'blue' },
  'Ready for Disbursement': { label: 'Ready for Disbursement', color: 'blue' },
  Disbursed: { label: 'Disbursed', color: 'green' },
};

const ROLE_TRANSITIONS: Record<Role, Partial<Record<ApplicationStatus, ApplicationStatus[]>>> = {
  sales_dealer: {
    Draft: ['Submitted'],
  },
  marketing: {
    Submitted: ['Under Review'],
    'Under Review': ['Need Revision', 'Waiting Approval'],
  },
  marketing_supervisor: {
    'Waiting Approval': ['Approved', 'Rejected', 'Need Revision'],
  },
  back_office: {
    Approved: ['Document Pending'],
    'Document Pending': ['Signed'],
    Signed: ['Ready for Disbursement'],
    'Ready for Disbursement': ['Disbursed'],
  },
};

export function nextStatusesFor(current: ApplicationStatus, role: Role): ApplicationStatus[] {
  return ROLE_TRANSITIONS[role]?.[current] ?? [];
}

export function canTransition(current: ApplicationStatus, next: ApplicationStatus, role: Role): boolean {
  return nextStatusesFor(current, role).includes(next);
}
```

- [ ] **Step 3:** Run — expect PASS.
- [ ] **Step 4: Commit.**

```bash
git add -A
git commit -m "feat: add workflow state machine with tests"
```

---

### Task 9: Reference data (dealers, vehicle catalog, users)

**Files:**
- Create: `src/data/dealers.ts`, `src/data/vehicleCatalog.ts`, `src/data/users.ts`, `src/data/referenceData.test.ts`

**Interfaces:**
- Consumes: `Dealer`, `User`, `Role` from `@/types`.
- Produces:

```ts
export const DEALERS: Dealer[]; // from data/dealers.ts
export const VEHICLE_BRANDS: string[];
export const VEHICLE_MODELS: Record<string, { models: string[]; typesByModel: Record<string, string[]>; basePrice: Record<string, number> }>;
export const VEHICLE_COLORS: string[];
export const DEMO_USERS: Record<Role, User>; // from data/users.ts
```

- [ ] **Step 1: Write failing test** `src/data/referenceData.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { DEALERS } from './dealers';
import { VEHICLE_BRANDS, VEHICLE_MODELS, VEHICLE_COLORS } from './vehicleCatalog';
import { DEMO_USERS } from './users';

describe('reference data', () => {
  it('has at least 3 dealers with name and city', () => {
    expect(DEALERS.length).toBeGreaterThanOrEqual(3);
    DEALERS.forEach((d) => {
      expect(d.name).toBeTruthy();
      expect(d.city).toBeTruthy();
    });
  });

  it('has 5 vehicle brands each with at least one model and a base price', () => {
    expect(VEHICLE_BRANDS.length).toBe(5);
    VEHICLE_BRANDS.forEach((brand) => {
      const entry = VEHICLE_MODELS[brand];
      expect(entry.models.length).toBeGreaterThan(0);
      entry.models.forEach((model) => {
        expect(entry.basePrice[model]).toBeGreaterThan(0);
        expect(entry.typesByModel[model].length).toBeGreaterThan(0);
      });
    });
  });

  it('has at least 4 vehicle colors', () => {
    expect(VEHICLE_COLORS.length).toBeGreaterThanOrEqual(4);
  });

  it('has exactly one demo user per role', () => {
    expect(Object.keys(DEMO_USERS).sort()).toEqual(
      ['back_office', 'marketing', 'marketing_supervisor', 'sales_dealer'].sort()
    );
  });
});
```

- [ ] **Step 2:** Run — expect FAIL. **Implement** `src/data/dealers.ts`:

```ts
import type { Dealer } from '@/types';

export const DEALERS: Dealer[] = [
  { id: 'dealer-1', name: 'Auto Prima Malang', city: 'Malang' },
  { id: 'dealer-2', name: 'Jaya Motor Surabaya', city: 'Surabaya' },
  { id: 'dealer-3', name: 'Central Auto Jakarta', city: 'Jakarta' },
];
```

**Implement** `src/data/vehicleCatalog.ts`:

```ts
export const VEHICLE_BRANDS = ['Toyota', 'Honda', 'Mitsubishi', 'Suzuki', 'Daihatsu'] as const;

export const VEHICLE_COLORS = ['White', 'Black', 'Silver', 'Red', 'Gray'];

export const VEHICLE_MODELS: Record<string, {
  models: string[];
  typesByModel: Record<string, string[]>;
  basePrice: Record<string, number>;
}> = {
  Toyota: {
    models: ['Avanza', 'Innova'],
    typesByModel: { Avanza: ['1.3 G MT', '1.5 Veloz CVT'], Innova: ['2.0 G MT', 'Zenix Hybrid'] },
    basePrice: { Avanza: 235_000_000, Innova: 415_000_000 },
  },
  Honda: {
    models: ['Brio', 'HR-V'],
    typesByModel: { Brio: ['Satya E MT', 'RS CVT'], 'HR-V': ['1.5 E CVT', 'RS Turbo'] },
    basePrice: { Brio: 175_000_000, 'HR-V': 385_000_000 },
  },
  Mitsubishi: {
    models: ['Xpander'],
    typesByModel: { Xpander: ['GLS MT', 'Ultimate CVT'] },
    basePrice: { Xpander: 260_000_000 },
  },
  Suzuki: {
    models: ['Ertiga'],
    typesByModel: { Ertiga: ['GL MT', 'Hybrid GX'] },
    basePrice: { Ertiga: 230_000_000 },
  },
  Daihatsu: {
    models: ['Terios'],
    typesByModel: { Terios: ['X MT', 'R CVT'] },
    basePrice: { Terios: 255_000_000 },
  },
};
```

**Implement** `src/data/users.ts`:

```ts
import type { Role, User } from '@/types';

export const DEMO_USERS: Record<Role, User> = {
  sales_dealer: { id: 'user-sales', name: 'Andi Wirawan', role: 'sales_dealer', initials: 'AW' },
  marketing: { id: 'user-marketing', name: 'Budi Hartono', role: 'marketing', initials: 'BH' },
  marketing_supervisor: { id: 'user-supervisor', name: 'Citra Dewi', role: 'marketing_supervisor', initials: 'CD' },
  back_office: { id: 'user-backoffice', name: 'Doni Firmansyah', role: 'back_office', initials: 'DF' },
};
```

- [ ] **Step 3:** Run — expect PASS.
- [ ] **Step 4: Commit.**

```bash
git add -A
git commit -m "feat: add dealer, vehicle catalog, and demo user reference data"
```

---

### Task 10: Seed data (customers, applications, documents, approvals, audit logs)

**Files:**
- Create: `src/data/customers.ts`, `src/data/applications.ts`, `src/data/seed.ts`, `src/data/seed.test.ts`

**Interfaces:**
- Consumes: types from `@/types`, `DEALERS`, `VEHICLE_MODELS`, `VEHICLE_BRANDS`, `VEHICLE_COLORS` from `@/data/vehicleCatalog` and `@/data/dealers`, `DEMO_USERS`, `generateId`/`generateApplicationCode`, `STATUS_FLOW`.
- Produces:

```ts
export interface SeedCustomer extends Customer {}
export const SEED_CUSTOMERS: Customer[];         // 14 customers, Indonesian names
export interface SeedVehicle extends Vehicle {}
export const SEED_VEHICLES: Vehicle[];           // one per application
export const SEED_APPLICATIONS: LoanApplication[]; // >= 12
export const SEED_DOCUMENTS: DocumentRecord[];
export const SEED_APPROVALS: Approval[];
export const SEED_AUDIT_LOGS: AuditLog[];

// seed.ts
export interface SeedBundle {
  customers: Customer[]; vehicles: Vehicle[]; applications: LoanApplication[];
  documents: DocumentRecord[]; approvals: Approval[]; auditLogs: AuditLog[];
}
export function buildSeedBundle(): SeedBundle;
```

- [ ] **Step 1: Write failing test** `src/data/seed.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildSeedBundle } from './seed';
import { isValidNIK } from '@/utils/validation';

describe('buildSeedBundle', () => {
  const bundle = buildSeedBundle();

  it('has at least 12 applications and 12 customers', () => {
    expect(bundle.applications.length).toBeGreaterThanOrEqual(12);
    expect(bundle.customers.length).toBeGreaterThanOrEqual(12);
  });

  it('gives every customer a valid 16-digit NIK', () => {
    bundle.customers.forEach((c) => expect(isValidNIK(c.nik)).toBe(true));
  });

  it('references only customer/vehicle/dealer ids that exist', () => {
    const customerIds = new Set(bundle.customers.map((c) => c.id));
    const vehicleIds = new Set(bundle.vehicles.map((v) => v.id));
    const dealerIds = new Set(['dealer-1', 'dealer-2', 'dealer-3']);
    bundle.applications.forEach((app) => {
      expect(customerIds.has(app.customerId)).toBe(true);
      expect(vehicleIds.has(app.vehicleId)).toBe(true);
      expect(dealerIds.has(app.dealerId)).toBe(true);
    });
  });

  it('spreads applications across multiple distinct statuses', () => {
    const statuses = new Set(bundle.applications.map((a) => a.status));
    expect(statuses.size).toBeGreaterThanOrEqual(6);
  });

  it('gives every application exactly 5 document slots', () => {
    bundle.applications.forEach((app) => {
      const docs = bundle.documents.filter((d) => d.applicationId === app.id);
      expect(docs.length).toBe(5);
    });
  });

  it('every document references an application that exists', () => {
    const appIds = new Set(bundle.applications.map((a) => a.id));
    bundle.documents.forEach((d) => expect(appIds.has(d.applicationId)).toBe(true));
  });
});
```

- [ ] **Step 2:** Run — expect FAIL.
- [ ] **Step 3: Implement** `src/data/customers.ts` — 14 `Customer` records using the Indonesian names from the spec (Budi Santoso, Siti Rahma, Andi Pratama, Dimas Saputra, Rizky Maulana, Fajar Nugroho, Nadia Putri, Aldi Wijaya, Rina Maharani, Yoga Prasetyo, plus 4 more e.g. Wulan Setiawati, Bagus Kurniawan, Melati Anggraini, Eko Wibowo), each with a unique valid 16-digit `nik` (e.g. `"3573010101" + 6-digit sequence`), realistic `dob`, `maritalStatus` (mix of Single/Married, spouse object present when Married), Indonesian `phone` (`"0812" + 8 digits`), `email`, `address` (realistic Indonesian street/city string), `occupation`, `monthlyIncome` (5,000,000–25,000,000 range), `createdAt`.
- [ ] **Step 4: Implement** `src/data/applications.ts`:
  - Build one `Vehicle` per application by picking a brand/model/type/color from the catalog (varying across the 12+ entries) and a `price` from `basePrice`.
  - Build one `LoanApplication` per vehicle: `financing` computed via `calculateFinancing` with a down payment of 15–25% of price, `tenor` in `[12, 24, 36, 48, 60]`, `interestRate` around 5.5–7.5, `insurance` 2–6% of price; `status` distributed across at least: `Draft, Submitted, Under Review, Need Revision, Waiting Approval, Approved, Rejected, Document Pending, Signed, Ready for Disbursement, Disbursed` (12 applications → one of each status is a natural fit; add 2 extra applications reusing `Submitted`/`Waiting Approval` so the Approval Queue and list views have more than one row); `riskLevel` assigned Low/Medium/High roughly evenly; `createdBy`/`currentPIC` set to a `DEMO_USERS` name appropriate to the current status (e.g. a `Draft`/`Submitted` app's PIC is the Sales Dealer or Marketing name; a `Waiting Approval` app's PIC is the Supervisor name); `code` via `generateApplicationCode(2026, sequence)`; `createdAt`/`updatedAt` as ISO strings in September 2026, ordered so later statuses have earlier `createdAt` and monotonically later `updatedAt`.
  - Export `SEED_VEHICLES` and `SEED_APPLICATIONS`.
  - Also export `SEED_DOCUMENTS`: for every application, 5 `DocumentRecord`s (`KTP`, `Kartu Keluarga`, `SPK`, `Bukti Bayar Tanda Jadi`, `Form Aplikasi`), with `status` consistent with the application's stage (a `Draft` app has mostly `Missing`/`Uploaded`; an `Approved`+ app has all `Verified`).
  - Also export `SEED_APPROVALS`: an `Approval` row for every application that has passed through `Waiting Approval` (i.e. status is `Approved`, `Rejected`, or any Back Office stage), with `action` matching the outcome.
  - Also export `SEED_AUDIT_LOGS`: for every application, a chronological list of entries mirroring section 15 of the spec (`Application created`, per-document `... uploaded`, `Application reviewed`, `Submitted for approval`, `Approval requested`/`Approved`/`Rejected`/`Revision requested`, `Disbursement processed` where applicable), `actor` set to the relevant `DEMO_USERS` name.
- [ ] **Step 5: Implement** `src/data/seed.ts`:

```ts
import { SEED_CUSTOMERS } from './customers';
import { SEED_VEHICLES, SEED_APPLICATIONS, SEED_DOCUMENTS, SEED_APPROVALS, SEED_AUDIT_LOGS } from './applications';
import type { Customer, Vehicle, LoanApplication, DocumentRecord, Approval, AuditLog } from '@/types';

export interface SeedBundle {
  customers: Customer[];
  vehicles: Vehicle[];
  applications: LoanApplication[];
  documents: DocumentRecord[];
  approvals: Approval[];
  auditLogs: AuditLog[];
}

export function buildSeedBundle(): SeedBundle {
  return {
    customers: SEED_CUSTOMERS,
    vehicles: SEED_VEHICLES,
    applications: SEED_APPLICATIONS,
    documents: SEED_DOCUMENTS,
    approvals: SEED_APPROVALS,
    auditLogs: SEED_AUDIT_LOGS,
  };
}
```

- [ ] **Step 6:** Run `npm test src/data/seed.test.ts` — expect PASS. Fix any data inconsistencies the tests surface (e.g. missing document slot, dangling id) directly in `customers.ts`/`applications.ts`.
- [ ] **Step 7:** Run `npm test` (full suite) — expect all PASS.
- [ ] **Step 8: Commit.**

```bash
git add -A
git commit -m "feat: add seed data for customers, applications, documents, approvals, audit logs"
```

---

### Task 11: DataContext (localStorage-backed CRUD)

**Files:**
- Create: `src/context/DataContext.tsx`, `src/context/DataContext.test.tsx`

**Interfaces:**
- Consumes: `buildSeedBundle` from `@/data/seed`, `canTransition` from `@/utils/workflow`, `generateId`/`generateApplicationCode` from `@/utils/id`, types from `@/types`.
- Produces:

```ts
export interface CreateApplicationInput {
  customer: Omit<Customer, 'id' | 'createdAt'>;
  vehicle: Omit<Vehicle, 'id'>;
  dealerId: string;
  financing: Financing;
  documents: { type: DocumentType; fileName: string | null; status: DocumentStatus }[];
  createdBy: string;
}

export interface DataContextValue {
  customers: Customer[]; dealers: Dealer[]; vehicles: Vehicle[];
  applications: LoanApplication[]; documents: DocumentRecord[];
  approvals: Approval[]; auditLogs: AuditLog[];
  getApplicationById(id: string): LoanApplication | undefined;
  getCustomerById(id: string): Customer | undefined;
  getVehicleById(id: string): Vehicle | undefined;
  getDealerById(id: string): Dealer | undefined;
  getDocumentsForApplication(applicationId: string): DocumentRecord[];
  getApprovalsForApplication(applicationId: string): Approval[];
  getAuditLogsForApplication(applicationId: string): AuditLog[];
  createApplication(input: CreateApplicationInput): LoanApplication;
  transitionApplication(
    applicationId: string, nextStatus: ApplicationStatus,
    actor: { name: string; role: Role }, notes?: string
  ): boolean; // false if canTransition() rejects it
  verifyDocument(documentId: string, actorName: string): void;
  addAuditLog(applicationId: string, actor: string, action: string, metadata?: Record<string, string>): void;
}
export function DataProvider(props: { children: React.ReactNode }): JSX.Element;
export function useData(): DataContextValue;
```
- localStorage keys: `jkl.customers`, `jkl.vehicles`, `jkl.applications`, `jkl.documents`, `jkl.approvals`, `jkl.auditLogs`. On mount, if `jkl.applications` is missing, seed all six keys from `buildSeedBundle()`.

- [ ] **Step 1: Write failing tests** `src/context/DataContext.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}

describe('DataContext', () => {
  beforeEach(() => localStorage.clear());

  it('seeds localStorage with at least 12 applications on first load', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    expect(result.current.applications.length).toBeGreaterThanOrEqual(12);
    expect(JSON.parse(localStorage.getItem('jkl.applications')!).length).toBe(
      result.current.applications.length
    );
  });

  it('does not re-seed on a second mount (persists customer edits across reloads)', () => {
    const { result, unmount } = renderHook(() => useData(), { wrapper });
    const countBefore = result.current.applications.length;
    act(() => {
      result.current.createApplication({
        customer: {
          name: 'Test Customer', nik: '1234567890123456', dob: '1990-01-01',
          maritalStatus: 'Single', phone: '081234567890', email: 't@example.com',
          address: 'Jl. Test', occupation: 'Engineer', monthlyIncome: 10_000_000,
        },
        vehicle: { brand: 'Toyota', model: 'Avanza', type: '1.3 G MT', color: 'White', price: 235_000_000 },
        dealerId: 'dealer-1',
        financing: {
          vehiclePrice: 235_000_000, downPayment: 40_000_000, financedAmount: 195_000_000,
          tenor: 36, interestRate: 6, insurance: 3_000_000, estimatedInstallment: 6_000_000,
        },
        documents: [
          { type: 'KTP', fileName: 'ktp.pdf', status: 'Uploaded' },
          { type: 'Kartu Keluarga', fileName: null, status: 'Missing' },
          { type: 'SPK', fileName: null, status: 'Missing' },
          { type: 'Bukti Bayar Tanda Jadi', fileName: null, status: 'Missing' },
          { type: 'Form Aplikasi', fileName: 'form.pdf', status: 'Uploaded' },
        ],
        createdBy: 'Andi Wirawan',
      });
    });
    unmount();
    const { result: second } = renderHook(() => useData(), { wrapper });
    expect(second.current.applications.length).toBe(countBefore + 1);
  });

  it('createApplication sets status Draft and writes 5 documents', () => {
    localStorage.clear();
    const { result } = renderHook(() => useData(), { wrapper });
    let created: ReturnType<typeof result.current.createApplication>;
    act(() => {
      created = result.current.createApplication({
        customer: {
          name: 'Test Customer 2', nik: '1234567890123457', dob: '1990-01-01',
          maritalStatus: 'Single', phone: '081234567890', email: 't2@example.com',
          address: 'Jl. Test', occupation: 'Engineer', monthlyIncome: 10_000_000,
        },
        vehicle: { brand: 'Honda', model: 'Brio', type: 'Satya E MT', color: 'Black', price: 175_000_000 },
        dealerId: 'dealer-2',
        financing: {
          vehiclePrice: 175_000_000, downPayment: 30_000_000, financedAmount: 145_000_000,
          tenor: 24, interestRate: 6, insurance: 2_000_000, estimatedInstallment: 6_500_000,
        },
        documents: [
          { type: 'KTP', fileName: null, status: 'Missing' },
          { type: 'Kartu Keluarga', fileName: null, status: 'Missing' },
          { type: 'SPK', fileName: null, status: 'Missing' },
          { type: 'Bukti Bayar Tanda Jadi', fileName: null, status: 'Missing' },
          { type: 'Form Aplikasi', fileName: null, status: 'Missing' },
        ],
        createdBy: 'Andi Wirawan',
      });
    });
    expect(created!.status).toBe('Draft');
    expect(result.current.getDocumentsForApplication(created!.id).length).toBe(5);
  });

  it('transitionApplication updates status and appends an audit log when allowed by canTransition', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const draftApp = result.current.applications.find((a) => a.status === 'Draft')!;
    let ok = false;
    act(() => {
      ok = result.current.transitionApplication(
        draftApp.id, 'Submitted', { name: 'Andi Wirawan', role: 'sales_dealer' }
      );
    });
    expect(ok).toBe(true);
    const updated = result.current.getApplicationById(draftApp.id)!;
    expect(updated.status).toBe('Submitted');
    const logs = result.current.getAuditLogsForApplication(draftApp.id);
    expect(logs.some((l) => l.action.toLowerCase().includes('submit'))).toBe(true);
  });

  it('transitionApplication refuses a transition canTransition disallows and logs nothing new', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const draftApp = result.current.applications.find((a) => a.status === 'Draft')!;
    const logsBefore = result.current.getAuditLogsForApplication(draftApp.id).length;
    let ok = true;
    act(() => {
      ok = result.current.transitionApplication(
        draftApp.id, 'Disbursed', { name: 'Andi Wirawan', role: 'sales_dealer' }
      );
    });
    expect(ok).toBe(false);
    expect(result.current.getApplicationById(draftApp.id)!.status).toBe('Draft');
    expect(result.current.getAuditLogsForApplication(draftApp.id).length).toBe(logsBefore);
  });

  it('verifyDocument marks a document Verified and appends an audit log', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const anyApp = result.current.applications[0];
    const doc = result.current.getDocumentsForApplication(anyApp.id)[0];
    act(() => {
      result.current.verifyDocument(doc.id, 'Budi Hartono');
    });
    const updatedDoc = result.current.getDocumentsForApplication(anyApp.id).find((d) => d.id === doc.id)!;
    expect(updatedDoc.status).toBe('Verified');
    expect(
      result.current.getAuditLogsForApplication(anyApp.id).some((l) => l.action.includes('verified'))
    ).toBe(true);
  });
});
```

- [ ] **Step 2:** Run — expect FAIL.
- [ ] **Step 3: Implement** `src/context/DataContext.tsx` (localStorage read/write helpers per key, `useState` initialized lazily from localStorage-or-seed, a `persist(key, value)` helper called after every mutating setter, and the methods per the interface above — `createApplication` generates a `Customer` id via `generateId('cust')`, `Vehicle` id via `generateId('veh')`, application `id` via `generateId('app')` and `code` via `generateApplicationCode(2026, applications.length + 1)`, status `'Draft'`, `riskLevel` defaulting to `'Medium'`, `currentPIC`/`createdBy` from input, timestamps via `new Date().toISOString()`, and writes an initial `AuditLog` "Application created"; `transitionApplication` looks up the application, calls `canTransition(app.status, nextStatus, actor.role)`, and only on `true` updates `status`/`updatedAt`/`currentPIC`, appends an `AuditLog`, and — when `nextStatus` is `Approved`/`Rejected`/`Need Revision` from `Waiting Approval` — also appends an `Approval` record; `verifyDocument` sets that document's `status` to `'Verified'` and appends an `AuditLog`).
- [ ] **Step 4:** Run `npm test src/context/DataContext.test.tsx` — expect PASS. Iterate on the implementation until all assertions pass (in particular the "does not re-seed" and "refuses disallowed transition" cases).
- [ ] **Step 5:** Run `npm test` (full suite) and `npm run build` — expect PASS.
- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "feat: add DataContext with localStorage persistence and workflow transitions"
```

---

### Task 12: AuthContext

**Files:**
- Create: `src/context/AuthContext.tsx`, `src/context/AuthContext.test.tsx`

**Interfaces:**
- Consumes: `DEMO_USERS` from `@/data/users`, `Role`/`User` from `@/types`.
- Produces:

```ts
export interface AuthContextValue {
  currentUser: User | null;
  loginAsRole(role: Role): void;
  logout(): void;
}
export function AuthProvider(props: { children: React.ReactNode }): JSX.Element;
export function useAuth(): AuthContextValue;
```
- localStorage key: `jkl.currentUserRole`.

- [ ] **Step 1: Write failing tests** `src/context/AuthContext.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no current user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.currentUser).toBeNull();
  });

  it('loginAsRole sets the current user to that role\'s demo user and persists it', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.loginAsRole('marketing_supervisor'));
    expect(result.current.currentUser?.role).toBe('marketing_supervisor');
    expect(localStorage.getItem('jkl.currentUserRole')).toBe('marketing_supervisor');
  });

  it('restores the logged-in user from localStorage on mount', () => {
    localStorage.setItem('jkl.currentUserRole', 'back_office');
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.currentUser?.role).toBe('back_office');
  });

  it('logout clears the current user and localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.loginAsRole('sales_dealer'));
    act(() => result.current.logout());
    expect(result.current.currentUser).toBeNull();
    expect(localStorage.getItem('jkl.currentUserRole')).toBeNull();
  });
});
```

- [ ] **Step 2:** Run — expect FAIL. **Implement** `src/context/AuthContext.tsx` with a `useState<User | null>` lazily initialized by reading `jkl.currentUserRole` and mapping through `DEMO_USERS`; `loginAsRole` sets state and `localStorage.setItem`; `logout` sets state to `null` and `localStorage.removeItem`.
- [ ] **Step 3:** Run — expect PASS.
- [ ] **Step 4: Commit.**

```bash
git add -A
git commit -m "feat: add AuthContext for demo role login"
```

---

### Task 13: Route guards, App shell wiring, 403/404 pages

**Files:**
- Create: `src/routes/RequireAuth.tsx`, `src/routes/RequireRole.tsx`, `src/pages/ForbiddenPage.tsx`, `src/pages/NotFoundPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useAuth` from `@/context/AuthContext`, `Role` from `@/types`.
- Produces: `<RequireAuth>{children}</RequireAuth>` (redirects to `/login` if `currentUser` is null), `<RequireRole roles={Role[]}>{children}</RequireRole>` (renders `<Navigate to="/403" />` if `currentUser.role` isn't in `roles`; note in a code comment that this is a client-side convenience only, per the spec's security section). Wire `AuthProvider` and `DataProvider` around the router in `App.tsx`, with every route below `RequireAuth` (except `/login`) rendering a placeholder `<div>{PageName}</div>` for now — later tasks replace each placeholder.

- [ ] **Step 1:** Install router: `npm install react-router-dom`.
- [ ] **Step 2:** Implement `RequireAuth.tsx` and `RequireRole.tsx` using `useAuth()` + `<Navigate>` from `react-router-dom`.
- [ ] **Step 3:** Implement `ForbiddenPage.tsx` ("You don't have permission to access this resource." + a button back to `/`) and `NotFoundPage.tsx` ("Page not found" + a button back to `/`).
- [ ] **Step 4:** Rewrite `src/App.tsx`: wrap the app in `<AuthProvider><DataProvider><BrowserRouter>...</BrowserRouter></DataProvider></AuthProvider>` plus `<Toaster />`. Define all routes from spec section 5 (`/login`, `/`, `/applications`, `/applications/new`, `/applications/:id`, `/approvals`, `/disbursement`, `/customers`, `/customers/:id`, `/documents`, `/reports`, `/settings`, `/403`, `*`), each authenticated route wrapped in `<RequireAuth>` and rendering a temporary placeholder page component (e.g. `<div className="p-8">Dashboard (placeholder)</div>`).
- [ ] **Step 5:** Run `npm run dev`, manually visit `/login` (renders placeholder), then in the browser console run `localStorage.setItem('jkl.currentUserRole','sales_dealer')` and reload `/` — confirm the dashboard placeholder renders instead of a redirect to `/login`. Visit `/nonexistent` — confirm `NotFoundPage` renders.
- [ ] **Step 6:** Run `npm run build` — expect PASS.
- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "feat: add route guards, 403/404 pages, and route skeleton"
```

---

### Task 14: AppShell layout (Sidebar, Header, MobileNav)

**Files:**
- Create: `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/MobileNav.tsx`
- Modify: `src/App.tsx` (wrap authenticated routes in `AppShell`)

**Interfaces:**
- Consumes: `useAuth`, `Role`.
- Produces: `<AppShell>{children}</AppShell>` — desktop: fixed left sidebar (width ~256px) + header + `<main>` content area; mobile (`<lg`): sidebar becomes a `Sheet` drawer triggered by a hamburger button in the header.
- Nav item map per role (exact labels from spec section on roles), each `{ label: string; to: string; icon: LucideIcon }`:
  - `sales_dealer`: Dashboard(`/`), New Application(`/applications/new`), My Applications(`/applications`), Customers(`/customers`), Documents(`/documents`)
  - `marketing`: Dashboard(`/`), Applications(`/applications`), Review Queue(`/applications`), Customers(`/customers`), Documents(`/documents`)
  - `marketing_supervisor`: Dashboard(`/`), Approval Queue(`/approvals`), Applications(`/applications`), Reports(`/reports`)
  - `back_office`: Dashboard(`/`), Approved Applications(`/applications`), Documents(`/documents`), Disbursement(`/disbursement`), Reports(`/reports`)
  - all roles get a bottom section: Settings(`/settings`) + current user name/role/avatar initials + a Logout action (calls `useAuth().logout()` then navigates to `/login`).

- [ ] **Step 1:** Implement `Sidebar.tsx`: "JKL" wordmark + "CreditFlow" subtitle at top, `<nav>` of `NavLink`s (active state = subtle blue background + navy text, inactive = gray text) built from the role→nav-item map above, bottom section as described.
- [ ] **Step 2:** Implement `Header.tsx`: breadcrumb (derived from current path segments, simple capitalized-segment join for now), page title (passed as a prop or read from route context — for this task just accept a `title: string` prop), a disabled-looking search `Input` with a `Search` icon (functional wiring comes with each page later), a `Bell` notification icon button (opens a `DropdownMenu` with 2-3 static realistic notifications, e.g. "APP-2026-00127 needs your review"), and a user avatar/name matching `currentUser`.
- [ ] **Step 3:** Implement `MobileNav.tsx` using shadcn `Sheet`: hamburger `Menu` icon button in `Header` (visible below `lg`) opens a `Sheet` containing the same `Sidebar` content.
- [ ] **Step 4:** Implement `AppShell.tsx` composing `Sidebar` (hidden below `lg`, fixed on `lg+`), `Header` (with `MobileNav` trigger), and `<main className="lg:pl-64">{children}</main>`.
- [ ] **Step 5:** In `App.tsx`, wrap every authenticated route's placeholder with `<AppShell title="...">...</AppShell>`.
- [ ] **Step 6:** Manually verify in `npm run dev`: log in as each of the 4 demo roles (via localStorage as in Task 13, or wait for Task 15's login page) and confirm the sidebar nav items match the list above exactly; resize the browser below 1024px and confirm the sidebar collapses into the hamburger `Sheet`.
- [ ] **Step 7:** Run `npm run build` — expect PASS.
- [ ] **Step 8: Commit.**

```bash
git add -A
git commit -m "feat: add responsive AppShell with role-based sidebar and header"
```

---

### Task 15: Login page

**Files:**
- Create: `src/pages/LoginPage.tsx`
- Modify: `src/App.tsx` (mount `LoginPage` at `/login`)

**Interfaces:**
- Consumes: `useAuth().loginAsRole`, `useNavigate` from `react-router-dom`.

- [ ] **Step 1:** Implement `LoginPage.tsx`: centered card on an off-white background, "JKL CreditFlow" title + "Digital Vehicle Financing Platform" subtitle, a cosmetic form (`Username`/`Password` `Input`s + "Sign In" `Button` that, on submit, just calls `loginAsRole('sales_dealer')` and navigates to `/` — since there's no real auth, treat manual sign-in as a Sales Dealer demo login and say so via helper text), a `Separator` labeled "Demo Access", and 4 buttons ("Sales Dealer", "Marketing", "Marketing Supervisor", "Back Office") each calling `loginAsRole(role)` then `navigate('/')`.
- [ ] **Step 2:** Wire `/login` in `App.tsx` to render `LoginPage` (outside `AppShell`, outside `RequireAuth`); if a user is already logged in and visits `/login`, redirect to `/`.
- [ ] **Step 3:** Manually verify: from a cleared localStorage, load `/login`, click each of the 4 demo buttons in turn (logging out between via the Sidebar logout action) and confirm the header/sidebar reflect the correct name and role-specific nav each time.
- [ ] **Step 4:** Run `npm run build` — expect PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "feat: add login page with demo role quick-login"
```

---

### Task 16: Shared domain components

**Files:**
- Create: `src/components/common/StatusBadge.tsx`, `src/components/common/RiskBadge.tsx`, `src/components/common/KpiCard.tsx`, `src/components/common/EmptyState.tsx`, `src/components/common/ConfirmDialog.tsx`, `src/components/common/PageHeader.tsx`

**Interfaces:**
- `StatusBadge({ status: ApplicationStatus | DocumentStatus })` — looks up color via `STATUS_META` for `ApplicationStatus`; for `DocumentStatus` use a small local map (`Missing`→gray, `Uploaded`→blue, `Under Verification`→amber, `Verified`→green, `Rejected`→red). Renders a shadcn `Badge` with the matching color classes.
- `RiskBadge({ level: RiskLevel })` — Low=green, Medium=amber, High=red; always rendered with a small "Demo" superscript/tooltip text "Demo Risk Indicator" nearby (via title attribute or adjacent muted text) so it's never mistaken for a real score.
- `KpiCard({ label: string; value: string; trend?: { direction: 'up'|'down'; label: string } })` — a `Card` with big value, label, and an optional small trend line (`ArrowUp`/`ArrowDown` icon + green/red text).
- `EmptyState({ icon: LucideIcon; title: string; description: string; action?: { label: string; onClick(): void } })`.
- `ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, confirmVariant?: 'default'|'destructive', onConfirm, children? })` — wraps shadcn `Dialog`; `children` lets callers inject a reason/notes `Textarea` for reject/revision flows.
- `PageHeader({ breadcrumb: string[]; title: string; subtitle?: string; actions?: React.ReactNode })`.

- [ ] **Step 1:** Implement all six components per the interfaces above, using only shadcn primitives + Lucide icons + Tailwind utility classes (no new dependencies).
- [ ] **Step 2:** Temporarily render one instance of each inside the Dashboard placeholder page to eyeball them via `npm run dev` (e.g. a row of `KpiCard`s, a `StatusBadge` for each `ApplicationStatus`, a `RiskBadge` for each level) — this scratch render is removed in Task 17 once the real Dashboard replaces it.
- [ ] **Step 3:** Run `npm run build` — expect PASS.
- [ ] **Step 4: Commit.**

```bash
git add -A
git commit -m "feat: add shared StatusBadge, RiskBadge, KpiCard, EmptyState, ConfirmDialog, PageHeader"
```

---

### Task 17: Dashboard page

**Files:**
- Create: `src/components/applications/PipelineFunnel.tsx`, `src/pages/DashboardPage.tsx`
- Modify: `src/App.tsx` (mount `DashboardPage` at `/`)

**Interfaces:**
- Consumes: `useData()`, `useAuth()`, `STATUS_FLOW`/`STATUS_META` from `@/utils/workflow`, `formatCurrency`/`formatDate` from `@/utils/format`, `KpiCard`, `StatusBadge`, `PageHeader`.
- `PipelineFunnel({ applications: LoanApplication[] })` — renders `STATUS_FLOW` as a horizontal sequence of stage blocks, each showing the stage label and a count of applications currently `>= that stage` (or exactly at it — pick "currently at this exact status" for clarity, note this in a short code comment) with a bar width proportional to count; stages connected by `ChevronRight` icons.

- [ ] **Step 1:** Implement `PipelineFunnel.tsx` computing per-stage counts from `applications` grouped by `status`, rendering `STATUS_FLOW.map(...)` as flex items with `STATUS_META[stage].color`-derived background tint.
- [ ] **Step 2:** Implement `DashboardPage.tsx`:
  - Header: `"Good morning, {currentUser.name.split(' ')[0]}."` + `"Here's your application overview today."`
  - 6 `KpiCard`s computed live from `applications`: Total Applications (`applications.length`), Pending Review (`status === 'Submitted' || 'Under Review'`), Waiting Approval (`status === 'Waiting Approval'`), Approved (`status === 'Approved'` or further), Disbursed (`status === 'Disbursed'`), Rejected (`status === 'Rejected'`) — each with a small static illustrative trend string (e.g. `"+12.4% vs last month"`), clearly derived not from real history (acceptable per spec since exact percentages aren't mandated to be real).
  - `PipelineFunnel` section titled "Application Pipeline".
  - "Recent Applications" `Table` (top 5 by `updatedAt` desc): columns Application ID, Customer, Vehicle, Amount, Submitted, Status (via `StatusBadge`), Action (`View` button → `/applications/:id`); a "View All Applications" `Button` linking to `/applications`.
  - "Processing Performance" section: 3 static-but-labeled metric cards — Average Processing Time, Document Completion Rate (computed live: percentage of documents across all apps with status `Verified`/`Uploaded` vs `Missing`), Approval Rate (computed live: `Approved`+later ÷ (`Approved`+later + `Rejected`)).
  - "Digitalization Impact" panel: a simple two-column BEFORE/AFTER list matching spec section 21 (Manual Process items vs Digital Workflow items), no invented percentages.
- [ ] **Step 3:** Remove the Task 16 scratch component render from wherever it was placed.
- [ ] **Step 4:** Mount at `/` in `App.tsx` inside `AppShell`.
- [ ] **Step 5:** Manually verify in `npm run dev` for at least 2 different roles that the dashboard renders with real seed numbers, no `NaN`/`undefined`, and "View All Applications" navigates correctly.
- [ ] **Step 6:** Run `npm run build` — expect PASS.
- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "feat: add role-aware dashboard with KPIs, pipeline funnel, and digitalization impact panel"
```

---

### Task 18: Applications list page

**Files:**
- Create: `src/components/applications/ApplicationFilters.tsx`, `src/components/applications/ApplicationsTable.tsx`, `src/pages/ApplicationsListPage.tsx`
- Modify: `src/App.tsx` (mount at `/applications`)

**Interfaces:**
- `ApplicationFilters({ search, onSearchChange, status, onStatusChange, dealerId, onDealerChange, onExport })` — a search `Input`, a status `Select` (all `ApplicationStatus` + "All"), a dealer `Select` (from `DEALERS` + "All"), an "Export" `Button` that calls `onExport` (shows a toast: "Export started — a CSV would be generated in production.").
- `ApplicationsTable({ applications, getCustomerById, getVehicleById, getDealerById })` — prop names match the `DataContextValue` methods from Task 11 so callers can pass them straight through; columns Application ID, Customer, Vehicle, Dealer, Loan Amount, Submitted Date, Status, Current PIC, Action(`View`); renders `EmptyState` when `applications.length === 0`; on small screens, switches to a stacked card layout per row (Tailwind responsive: `hidden md:table` full table + `md:hidden` card list) rather than horizontal scroll.

- [ ] **Step 1:** Implement `ApplicationFilters.tsx` and `ApplicationsTable.tsx` per the interfaces.
- [ ] **Step 2:** Implement `ApplicationsListPage.tsx`: `PageHeader` ("Credit Applications" / "Monitor and manage vehicle financing applications."), local `useState` for search/status/dealer filters, `useMemo` filtered list (search matches `code` or customer name case-insensitively), renders `ApplicationFilters` + `ApplicationsTable`, row/`View` click navigates to `/applications/:id`.
- [ ] **Step 3:** Mount at `/applications` in `App.tsx`.
- [ ] **Step 4:** Manually verify: search narrows results, each filter narrows results, clearing all filters restores the full list, "Export" shows a toast, resizing to mobile width shows the card layout instead of a horizontally-scrolling table, and setting filters so nothing matches shows the empty state.
- [ ] **Step 5:** Run `npm run build` — expect PASS.
- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "feat: add applications list page with search, filters, export toast, and responsive table"
```

---

### Task 19: New Application wizard

**Files:**
- Create: `src/components/wizard/StepIndicator.tsx`, `src/components/wizard/StepCustomer.tsx`, `src/components/wizard/StepVehicle.tsx`, `src/components/wizard/StepFinancing.tsx`, `src/components/wizard/StepDocuments.tsx`, `src/components/wizard/StepReview.tsx`, `src/pages/NewApplicationPage.tsx`
- Modify: `src/App.tsx` (mount at `/applications/new`)

**Interfaces:**
- `NewApplicationPage` owns one `useState<WizardState>` for the whole wizard:

```ts
interface WizardState {
  step: 1 | 2 | 3 | 4 | 5;
  customer: {
    fullName: string; nik: string; dob: string; maritalStatus: MaritalStatus;
    phone: string; email: string; address: string; occupation: string; monthlyIncome: string;
    spouseName: string; spouseNik: string; spouseDob: string;
  };
  vehicle: { dealerId: string; brand: string; model: string; type: string; color: string; price: number };
  financing: { insurance: number; downPayment: number; tenor: number; interestRate: number };
  documents: Record<DocumentType, { fileName: string | null; status: 'Missing' | 'Uploaded' }>;
  errors: Record<string, string>;
}
```
- `StepIndicator({ current: number; labels: string[] })` — 5 numbered circles ("1 Customer" … "5 Review"), completed=green check, current=blue filled, upcoming=gray.
- Each `Step*` component receives `{ state, setState }` slices and an optional `errors` map; `StepDocuments` renders 5 drop-zone-styled `div`s (`onDragOver`/`onDrop` calling `e.preventDefault()` and reading `e.dataTransfer.files[0]?.name`, plus a fallback `<input type=file>` for click-to-select) each showing Missing/Uploaded state and, once uploaded, a "Verified"-eligible checkbox-style toggle that's cosmetic at this stage (only set later via `verifyDocument`, so at upload time it shows "Uploaded", not "Verified").

- [ ] **Step 1:** Implement `StepIndicator.tsx`.
- [ ] **Step 2:** Implement `StepCustomer.tsx`: fields per spec (Full Name, NIK, DOB, Marital Status `Select`, Phone, Email, Address, Occupation, Monthly Income), conditionally rendering Spouse Name/NIK/DOB when `maritalStatus === 'Married'`; on "Next" click, validate via `isValidNIK`/`isValidPhone`/`isValidEmail`/`isValidIncome` plus required-field checks, populate `errors`, and only advance `step` when there are none.
- [ ] **Step 3:** Implement `StepVehicle.tsx`: Dealer `Select` (`DEALERS`), Brand `Select` (`VEHICLE_BRANDS`), Model `Select` (depends on brand via `VEHICLE_MODELS`), Type `Select` (depends on model), Color `Select` (`VEHICLE_COLORS`), Vehicle Price (auto-filled from `basePrice`, editable numeric input). Required-field validation before advancing.
- [ ] **Step 4:** Implement `StepFinancing.tsx`: Insurance, Down Payment, Tenor (`Select`: 12/24/36/48/60), Interest Rate (editable, defaulted e.g. 6.5) inputs; live-computed `calculateFinancing` result shown in a "Financing Summary" `Card` (Vehicle Price, Down Payment, Financed Amount, Tenor, "Estimated Installment" clearly labeled `(Estimated)`), all currency via `formatCurrency`. Validate down payment < vehicle price before advancing.
- [ ] **Step 5:** Implement `StepDocuments.tsx` per the interface above for the 5 required document types; require at minimum KTP + Form Aplikasi uploaded before advancing (show inline validation message listing missing required docs otherwise).
- [ ] **Step 6:** Implement `StepReview.tsx`: read-only summary of all four prior sections plus a "Submit Application" `Button`. On click: call `useData().createApplication(...)` mapping `WizardState` into `CreateApplicationInput` (parse numeric strings, build the `Financing` object via `calculateFinancing`, set `createdBy` to `currentUser.name`), then `transitionApplication(created.id, 'Submitted', { name: currentUser.name, role: currentUser.role })`, show a success toast ("Application APP-... submitted."), and `navigate('/applications/' + created.id)`.
- [ ] **Step 7:** Implement `NewApplicationPage.tsx` wiring `StepIndicator` + the active step component + Back/Next (or Submit on step 5) buttons, holding the single `WizardState`.
- [ ] **Step 8:** Mount at `/applications/new` in `App.tsx`, restricted via `RequireRole roles={['sales_dealer']}` per spec (Sales Dealer creates applications) — note in a code comment this is a demo-only client check.
- [ ] **Step 9:** Manually verify end-to-end as the Sales Dealer role: fill all 5 steps with valid data (including a Married customer to check spouse fields), trigger at least one validation error per step to confirm it blocks advancement, submit, confirm redirect to the new application's detail page (detail page is still a placeholder until Task 20 — confirm at least the URL/id and a "Submitted" status if the placeholder shows it, otherwise confirm via `/applications` list that the new row appears with status Submitted).
- [ ] **Step 10:** Run `npm run build` — expect PASS.
- [ ] **Step 11: Commit.**

```bash
git add -A
git commit -m "feat: add 5-step new application wizard with validation and dynamic financing calc"
```

---

### Task 20: Application detail page

**Files:**
- Create: `src/components/applications/WorkflowTimeline.tsx`, `src/components/applications/ApprovalHistory.tsx`, `src/components/applications/AuditTrail.tsx`, `src/components/applications/DocumentChecklist.tsx`, `src/pages/ApplicationDetailPage.tsx`
- Modify: `src/App.tsx` (mount at `/applications/:id`)

**Interfaces:**
- `WorkflowTimeline({ status: ApplicationStatus; auditLogs: AuditLog[] })` — renders `STATUS_FLOW` vertically (or horizontally on wide screens) with ✓ for stages before current, ● for the current stage, ○ for stages after; timestamp under each completed/current stage looked up from the matching `auditLogs` entry when available.
- `ApprovalHistory({ approvals: Approval[] })` and `AuditTrail({ logs: AuditLog[] })` — simple reverse-chronological timelines (`formatDateTime`, actor, action/notes).
- `DocumentChecklist({ documents: DocumentRecord[]; onVerify(documentId: string): void; canVerify: boolean })` — one row per document: type, file name or "Missing", `StatusBadge`, a disabled-looking "Preview" button (shows a toast "Preview is a static demo — no file is actually stored." on click), and a "Verify" button shown only when `canVerify && status === 'Uploaded'`.

- [ ] **Step 1:** Implement `WorkflowTimeline.tsx`, `ApprovalHistory.tsx`, `AuditTrail.tsx`, `DocumentChecklist.tsx`.
- [ ] **Step 2:** Implement `ApplicationDetailPage.tsx`:
  - Read `:id` via `useParams`; look up the application via `useData().getApplicationById`; if missing, render an `EmptyState`/message "Application not found" with a link back to `/applications` (do not throw).
  - Header: application `code` + customer name, current `StatusBadge` (large).
  - `WorkflowTimeline`.
  - Sections: Customer Information, Vehicle Information, Financing (all fields from spec, currency/date formatted, NIK masked via `maskNIK`), Documents (`DocumentChecklist`, `onVerify` wired to `useData().verifyDocument`, `canVerify` true only for `marketing`/`marketing_supervisor`/`back_office` roles), Approval History (`ApprovalHistory`), Audit Trail (`AuditTrail`).
  - Role-based action bar at the bottom, built from `nextStatusesFor(app.status, currentUser.role)`: render a `Button` per allowed next status (`Approved`→primary "Approve", `Rejected`→destructive "Reject", `Need Revision`→secondary "Request Revision", everything else→primary "Move to {status}"), each opening a `ConfirmDialog`; Reject/Need Revision dialogs include a required `Textarea` for notes (disable the confirm button until non-empty); on confirm, call `useData().transitionApplication(app.id, nextStatus, { name: currentUser.name, role: currentUser.role }, notes)` and show a success toast, or an error toast if it returned `false`.
- [ ] **Step 3:** Mount at `/applications/:id` in `App.tsx`.
- [ ] **Step 4:** Manually verify: open a `Waiting Approval` seed application as Marketing Supervisor, Approve it via the dialog, confirm status badge and timeline update immediately and a new Approval History + Audit Trail row appears; open a `Draft` application as Sales Dealer and confirm only "Submitted" is offered as a next status; open a nonexistent id (`/applications/does-not-exist`) and confirm the not-found message renders instead of a crash.
- [ ] **Step 5:** Run `npm run build` — expect PASS.
- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "feat: add application detail page with timeline, documents, approvals, and audit trail"
```

---

### Task 21: Approval Queue page

**Files:**
- Create: `src/pages/ApprovalQueuePage.tsx`
- Modify: `src/App.tsx` (mount at `/approvals`, `RequireRole roles={['marketing_supervisor']}`)

**Interfaces:**
- Consumes: `useData()`, `RiskBadge`, `StatusBadge`, `ConfirmDialog`, `nextStatusesFor`/`transitionApplication`.

- [ ] **Step 1:** Implement `ApprovalQueuePage.tsx`: `PageHeader` ("Approval Queue" / "Review applications requiring your approval."), a table/card list filtered to `status === 'Waiting Approval'`, columns Application, Customer, Dealer, Loan Amount, Risk Indicator (`RiskBadge`, with the "Demo Risk Indicator" label visible), Submitted, SLA (compute hours since `updatedAt` via a simple `Math.round((Date.now() - new Date(updatedAt).getTime()) / 36e5)` and label `>24h` amber/red, else green — clearly a demo SLA), Action; row click or "Review" button navigates to `/applications/:id`; a persistent bottom action bar with `[Request Revision] [Reject] [Approve]` appears once a row is selected (radio-style row selection or a "select" affordance per row), each wired the same way as Task 20's dialogs (reuse the same `ConfirmDialog` pattern, calling `transitionApplication`). Empty state when no applications are `Waiting Approval`.
- [ ] **Step 2:** Mount at `/approvals`.
- [ ] **Step 3:** Manually verify as Marketing Supervisor: approve one queued application and confirm it disappears from the queue (status no longer `Waiting Approval`) and appears correctly updated on its detail page.
- [ ] **Step 4:** Run `npm run build` — expect PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "feat: add approval queue page for marketing supervisor"
```

---

### Task 22: Disbursement page

**Files:**
- Create: `src/pages/DisbursementPage.tsx`
- Modify: `src/App.tsx` (mount at `/disbursement`, `RequireRole roles={['back_office']}`)

**Interfaces:**
- Consumes: `useData()`, shadcn `Tabs`, `ConfirmDialog`.

- [ ] **Step 1:** Implement `DisbursementPage.tsx`: `PageHeader` ("Disbursement"), `Tabs` with 3 tabs — "Ready for Disbursement" (`status === 'Ready for Disbursement'`), "Processing" (`status` in `['Approved', 'Document Pending', 'Signed']`), "Completed" (`status === 'Disbursed'`). Each tab lists applications as cards showing Contract Status, Document Status, Signature Status, Disbursement Status (derived directly from `status` via a small local label map, e.g. `Document Pending`→Documents: "In Progress", `Signed`→Documents: "Complete", Signature: "Signed"), and, for the "Ready for Disbursement" tab, a "Process Disbursement" button opening a `ConfirmDialog` ("Process Disbursement?" / "Application {code} will be marked as Disbursed.") that on confirm calls `transitionApplication(id, 'Disbursed', actor)`. For `Approved`/`Document Pending`/`Signed` rows in "Processing", show the single next-step button appropriate to that status (`Approved`→"Mark Documents Pending", `Document Pending`→"Mark Signed", `Signed`→"Mark Ready for Disbursement") each via `transitionApplication`, so a Back Office user can walk an application through the full post-approval chain from this one page.
- [ ] **Step 2:** Mount at `/disbursement`.
- [ ] **Step 3:** Manually verify as Back Office: take one `Approved` seed application through Document Pending → Signed → Ready for Disbursement → Disbursed using the buttons on this page, confirming it moves tabs each time and ends up in "Completed".
- [ ] **Step 4:** Run `npm run build` — expect PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "feat: add back office disbursement page with tabbed pipeline and processing actions"
```

---

### Task 23: Customers pages

**Files:**
- Create: `src/pages/CustomersListPage.tsx`, `src/pages/CustomerDetailPage.tsx`
- Modify: `src/App.tsx` (mount at `/customers`, `/customers/:id`)

**Interfaces:**
- Consumes: `useData()`, `maskNIK`, `StatusBadge`.

- [ ] **Step 1:** Implement `CustomersListPage.tsx`: `PageHeader` ("Customers"), a search `Input` (name/masked-NIK-insensitive on name only, since NIK is masked), table columns Customer ID, Name, NIK (masked), Phone, Applications (count via `applications.filter(a => a.customerId === c.id).length`), Latest Application (most recent `code`, linking to its detail), Status (status of latest application via `StatusBadge`); row click → `/customers/:id`; `EmptyState` when search matches nothing.
- [ ] **Step 2:** Implement `CustomerDetailPage.tsx`: look up via `useParams`/`getCustomerById` (not-found message if missing, same pattern as Task 20); sections — Personal Data (all `Customer` fields, NIK masked with a "click to reveal" `Button` that toggles a local `useState` to show the full NIK, demonstrating deliberate, logged-nowhere-but-visible unmasking as a UX affordance, not a security claim), Application History (table of that customer's applications with `StatusBadge`, linking to each detail page), Documents (flattened list of that customer's applications' documents), Financing History (their applications' `financing.financedAmount`/`estimatedInstallment` in a small table).
- [ ] **Step 3:** Mount both routes.
- [ ] **Step 4:** Manually verify: search narrows the customer list, clicking a customer opens their profile with correct application count and history, "reveal NIK" toggles correctly.
- [ ] **Step 5:** Run `npm run build` — expect PASS.
- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "feat: add customers list and customer profile pages"
```

---

### Task 24: Document Center page

**Files:**
- Create: `src/pages/DocumentsPage.tsx`
- Modify: `src/App.tsx` (mount at `/documents`)

**Interfaces:**
- Consumes: `useData()`, `StatusBadge`, `maskNIK`.

- [ ] **Step 1:** Implement `DocumentsPage.tsx`: `PageHeader` ("Document Center"), filters (Document Type `Select`, Application `Select`/search by code, Verification Status `Select`), a card/list of `DocumentRecord`s joined to their application's customer for display (customer name + masked NIK shown per spec's "mask PII wherever possible"), each card showing type, file name, `StatusBadge`, uploaded-by/at, and a link to the parent application's detail page. `EmptyState` when filters match nothing.
- [ ] **Step 2:** Mount at `/documents`.
- [ ] **Step 3:** Manually verify each filter narrows the list correctly and clearing filters restores it.
- [ ] **Step 4:** Run `npm run build` — expect PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "feat: add document center page with filters and masked PII"
```

---

### Task 25: Reports page

**Files:**
- Create: `src/pages/ReportsPage.tsx`
- Modify: `src/App.tsx` (mount at `/reports`, `RequireRole roles={['marketing_supervisor','back_office']}`)

**Interfaces:**
- Consumes: `useData()`, `recharts` (`BarChart`, `LineChart`, `PieChart`, `ResponsiveContainer`, etc.).

- [ ] **Step 1:** `npm install recharts`.
- [ ] **Step 2:** Implement `ReportsPage.tsx` with 5 charts computed from live `applications` data (no hardcoded numbers): (a) Applications by Status — bar chart, one bar per `ApplicationStatus` present in data, colored via `STATUS_META`; (b) Applications by Month — bar/line chart grouping `createdAt` by `YYYY-MM`; (c) Approval Rate — a simple stat + small pie/donut of Approved-or-later vs Rejected; (d) Average Processing Time — computed as the mean difference between `createdAt` and `updatedAt` for applications past `Waiting Approval`, displayed as a stat card (e.g. "4h 32m" style formatting) rather than forcing it into a chart; (e) Applications by Dealer — bar chart grouped by `dealerId` resolved to dealer name. Each chart wrapped in a `Card` with a title and `ResponsiveContainer` (fixed height ~280px) so the page stays responsive on mobile. Include the same "Digitalization Impact" panel as the Dashboard (extract it into a shared `DigitalizationImpact.tsx` component under `components/common/` reused by both pages, updating `DashboardPage.tsx`'s import accordingly).
- [ ] **Step 3:** Mount at `/reports`.
- [ ] **Step 4:** Manually verify all 5 charts render with no console errors/warnings (Recharts commonly warns about missing `width`/`height` — confirm `ResponsiveContainer` has an explicit height and a parent with a defined width) and reflow correctly at mobile width.
- [ ] **Step 5:** Run `npm run build` — expect PASS.
- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "feat: add reports page with Recharts visualizations and shared digitalization impact panel"
```

---

### Task 26: Settings page and final route wiring

**Files:**
- Create: `src/pages/SettingsPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useAuth()`.

- [ ] **Step 1:** Implement `SettingsPage.tsx`: current demo user card (name, role, avatar initials), a "Switch Role" control that lets the user jump straight to another demo role (calls `loginAsRole`), and a clearly-styled "Security & Architecture Note" `Alert`/`Card` containing verbatim: "Production implementation should enforce authorization, encryption, secure document storage, audit logging, and server-side validation. Role checks in this prototype are enforced only in the frontend and are not a substitute for backend authorization."
- [ ] **Step 2:** Mount at `/settings` (available to all authenticated roles). Confirm every route from the Task 13 skeleton now points at a real page component (no remaining `<div>placeholder</div>` routes) — replace `/403`'s route element with `ForbiddenPage` if not already done, and double check `/` , `/applications`, `/applications/new`, `/applications/:id`, `/approvals`, `/disbursement`, `/customers`, `/customers/:id`, `/documents`, `/reports` all reference their real page components.
- [ ] **Step 3:** Manually click through the full nav for each of the 4 roles and confirm no route renders a placeholder or blank page.
- [ ] **Step 4:** Run `npm run build` — expect PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "feat: add settings page and complete route wiring"
```

---

### Task 27: Deployment config and README

**Files:**
- Create: `vercel.json`, `netlify.toml`, `README.md`

**Interfaces:** none (config/docs only).

- [ ] **Step 1:** Create `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2:** Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 3:** Write `README.md` covering: project purpose (link back to "Input Once, Process Faster" framing), tech stack, `npm install && npm run dev` / `npm run build` instructions, the 4 demo roles and what each can do, a summary of the folder structure from this plan's File Structure section, and a "Security Note" paragraph matching Settings page's note (production requires real auth/authorization/encryption/server-side validation — this is a frontend prototype only).
- [ ] **Step 4:** Run `npm run build` and confirm `dist/index.html` + assets are produced; spot-check `vercel.json`/`netlify.toml` are valid JSON/TOML (e.g. `node -e "JSON.parse(require('fs').readFileSync('vercel.json'))"`).
- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "docs: add README and Vercel/Netlify deployment config"
```

---

### Task 28: Final polish pass

**Files:** any file needing a fix found below.

- [ ] **Step 1:** Run `npm test` (full suite), `npm run build`, and `npx tsc --noEmit` — all must pass with zero errors/warnings.
- [ ] **Step 2:** Grep the `src/` tree for `TODO`, `FIXME`, `lorem ipsum`, `console.log` — remove/resolve every hit.
- [ ] **Step 3:** Start `npm run dev` and, for each of the 4 demo roles, click through every nav item in that role's sidebar plus every button on every page reached that way (including opening at least one `ConfirmDialog` per role and cancelling it), watching the browser devtools console for errors/warnings; fix any found.
- [ ] **Step 4:** Confirm every empty/error state is reachable and reads correctly: `/applications` with filters matching nothing, `/customers` search matching nothing, `/documents` filters matching nothing, `/applications/does-not-exist`, `/customers/does-not-exist`, and `/403` (visit a role-restricted route, e.g. `/reports`, logged in as `sales_dealer`).
- [ ] **Step 5:** Resize to a ~390px-wide mobile viewport and re-check the Dashboard, Applications list, Wizard, Application detail, and Reports pages for layout breakage (horizontal scroll on the page body, overlapping text, unreachable controls); fix any found.
- [ ] **Step 6:** Re-run `npm test && npm run build` one final time to confirm the fixes didn't regress anything.
- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "chore: final polish pass — fix console warnings, empty states, and mobile layout issues"
```

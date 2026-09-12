# CLAUDE.md - Global System Brain

## 1) Project Context
- Project name: `frontend-ph-healthcare`
- System purpose: Next.js web client for a healthcare platform with role-based flows for Admin, Doctor, and Patient users.
- Repository status: partially implemented (continuation project, not greenfield).

### Completion Snapshot
- Strongly implemented:
  - Auth/session/routing gate foundation (`src/proxy.ts`, `src/lib/authUtils.ts`, `src/lib/jwtUtils.ts`, `src/lib/tokenUtils.ts`, `src/services/auth.services.ts`)
  - Doctors management table workflows and modals (`src/components/modules/Admin/DoctorsManagement/*`)
  - Admin schedules + doctor schedule table workflows (`src/components/modules/Admin/SchedulesManagement/*`, `src/components/modules/Doctor/DoctorSchedules/*`)
  - Shared server-managed data table hooks/components (`src/hooks/useServerManagedDataTable*.ts`, `src/components/shared/table/*`)
  - Appointment action/service baseline (`src/app/_actions/appointment.actions.ts`, `src/services/appointment.services.ts`)
- Incomplete/in-progress:
  - Multiple placeholder pages rendering simple `<div>...Page</div>` across auth/admin/doctor/common routes
  - Route inconsistency: `src/app/(dashboardLayout)/dashboard/payment/payment-success/page.tsx` points to missing `patientRouteGroup` path
  - Existing TODO markers in login action/form

## 2) Tech Stack (Detected)
- Framework: Next.js 16.2.3 (App Router), React 19.2.5
- Language: TypeScript (`strict: true`)
- Runtime/scripts: Bun (`bun run dev`, `build`, `start`, `lint`)
- Data/form/table: TanStack Query, TanStack Form, TanStack Table
- Validation: Zod
- HTTP/auth integration: Axios wrapper + server actions + cookies/JWT
- Styling/UI: Tailwind CSS 4, shadcn/radix UI, Lucide, Sonner
- Backend/database: external API backend via `NEXT_PUBLIC_API_BASE_URL` (no backend/db code in this repo)

## 3) Architecture Understanding
- Architecture type: modular frontend monolith.
- Main layers:
  1. Route/UI layer (`src/app`, `src/components`)
  2. App state/query layer (`src/providers`, TanStack Query)
  3. Service/API layer (`src/services`, `src/lib/axios/httpClient.ts`)
  4. Auth/routing control layer (`src/proxy.ts`, `src/lib/authUtils.ts`)
- Core data flow:
  - Page/component -> action/service -> `httpClient` -> backend API -> typed response -> UI hydration/render

## 4) Codebase Conventions (STRICT)
- Use `@/` import aliases.
- Next route file conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.
- Naming patterns:
  - Components: PascalCase
  - Hooks: `use*`
  - Services: `*.services.ts`
  - Types: `*.types.ts`
  - Validation schemas: `*.validation.ts`
- Preserve existing stable paths even if misspelled (`Dashboord`, `doctor-schedules-managament`) unless explicitly tasked to migrate.
- Match style of touched files (legacy style is mixed; do not perform style-only rewrites).

## 5) AI Execution Rules
- ALWAYS read all directly related files before editing.
- NEVER replace large working modules when extension is sufficient.
- EXTEND existing utilities/components/hooks before adding new abstractions.
- Maintain backward compatibility for routes, payloads, and API endpoint expectations.

## 6) Safe Editing Protocol
- Make minimal, surgical edits.
- Avoid breaking APIs and route contracts.
- Preserve existing logic unless fixing a proven issue.
- If auth/routing behavior changes, update coupled surfaces together (`proxy`, auth utils, auth services, affected pages/actions).

## 7) Task Strategy
1. Map target module and dependencies.
2. Reuse existing patterns/helpers.
3. Implement smallest complete change set.
4. Validate impact on auth/routing/data flow.
5. Run relevant existing checks for code changes.

## 8) Constraints (CRITICAL)
- Do not introduce new frameworks unless absolutely necessary.
- Do not refactor the entire architecture.
- Do not rename stable modules/routes arbitrarily.
- Do not modify unrelated modules.

## 9) Communication Style
- Output concise, structured, actionable results.
- Lead with concrete outcome.
- Avoid unnecessary explanation and narrative.

@AGENTS.md

# Specification: Medix Frontend Completion & Integration

- **Status**: Approved / Ready for Implementation
- **Author**: Lead Architect (grill-with-docs synthesis)
- **Date**: 2026-09-12
- **Related Documents**: [srs.md](../srs.md), [backend_design.md](../backend_design.md), [frontend_architecture.md](../frontend_architecture.md), [frontend_color_palate.md](../frontend_color_palate.md), [CONTEXT.md](../../CONTEXT.md)

---

## 1. Problem Statement

The Medix backend is ~90% complete (14 modules, 18 Prisma models, Stripe webhooks, RAG pipeline, cron jobs, PDF generation), but the frontend is ~35% complete. Of ~35 frontend routes, only 8 are production-ready; 19 are 6–8 line placeholder stubs, 2 are missing entirely, and 1 (the landing page) renders a Hello World button.

Six critical runtime defects were also discovered:
1. Patient dashboard 404 (missing `page.tsx`)
2. Express route shadowing in `admin.route.ts`
3. Non-functional logout (`onClick` empty)
4. Dead payment router (0 routes registered)
5. Incomplete Stripe webhook failure handling
6. Broken `change-password` relative link in navItems

---

## 2. Proposed Solution

### 2.1 Scope

Complete all remaining frontend implementation and fix all discovered defects, organized as **12 vertical tracer-bullet tickets (TICK-008 through TICK-019)**. Each ticket cuts through all necessary layers (service, server action, page, components, validation).

### 2.2 Deferred Items (Out of Scope)

- **WebRTC Telemedicine / Video Consultations**: Deferred until all frontend stubs are built.
- **Real-Time Notification System**: Deferred. `NotificationDropdown` retains mock data.
- **Dead placeholder pages** (`/diagnostics`, `/health-plans`, `/medicine`, `/ngos`): Kept as future expansion stubs.

### 2.3 Design Constraints

| Constraint | Specification |
|:-----------|:--------------|
| **UI Toolkit** | TanStack Query (data fetching), TanStack Form + Zod (forms), TanStack Table (tables), Recharts (charts) |
| **Component Library** | shadcn/ui + Radix primitives |
| **Color System** | `frontend_color_palate.md` — Clarity Teal primary, Vital Emerald success, Terracotta accent CTAs, Assist Violet AI-only |
| **Portal Differentiation** | Patient: Teal + Terracotta. Doctor: Teal + Neutral. Admin: Grayscale + status badges only |
| **Data Fetching Pattern** | SSR prefetch via `QueryClient.prefetchQuery()` + `<HydrationBoundary>`, client mutations via TanStack Query `useMutation` |
| **Form Pattern** | TanStack Form with Zod validation schema, connected via `AppField` and `AppSubmitButton` shared components |
| **Table Pattern** | `DataTable` with `useServerManagedDataTable` hook for server-side pagination, sorting, and filtering synced to URL params |
| **Server Actions** | Next.js `"use server"` actions in co-located `_action.ts` files for mutations |
| **Status Colors** | Success: `#178A5E`, Info: `#0B7285`, Warning: `#E3A130`, Danger: `#D8464B` |
| **Bug Fix Strategy** | Each defect is folded into its relevant feature ticket |

### 2.4 Ticket Dependency Graph

```
TICK-008 (Landing Page)          --- no deps ---
TICK-009 (Auth Flows + Logout)   --- no deps ---
    |
    +-- TICK-010 (Profile & Password)
    +-- TICK-011 (Patient Dashboard & Health Data)
    |       +-- TICK-012 (Patient Records & Prescriptions)
    |               +-- TICK-013 (Patient Reviews & Invoices)
    +-- TICK-014 (Doctor Dashboard, Appointments & Prescriptions)
    +-- TICK-015 (Admin Tier 1: Core CRUD)
    |       +-- TICK-016 (Admin Tier 2: Relational Tables)
    |               +-- TICK-017 (Admin Tier 3: Joins & Payments)
    +-- TICK-018 (RAG AI Chat Interface)

TICK-019 (Polish & Test Coverage) --- depends on all above ---
```

---

## 3. Test Strategy & Seams

| Layer | Seam | Verification | Tooling |
|:------|:-----|:-------------|:--------|
| **Landing Page** | SSR data fetching + rendering | Specialties and doctors load from API | Manual + RTL |
| **Auth Forms** | TanStack Form → server action → cookie setting | Full flows complete without errors | Manual + RTL |
| **Dashboard Pages** | TanStack Query → hydration → client interactivity | Data renders, mutations invalidate cache | RTL + manual |
| **CRUD Tables** | DataTable + server-managed pagination/filtering | Data loads, CRUD modals work | Manual + RTL |
| **RAG Chat** | POST /rag/query → response display | Returns citations, violet styling | Manual |
| **Bug Fixes** | Route resolution, logout, webhook transitions | All 6 defects verified fixed | Manual + CI |
| **Build Gate** | `pnpm build` | Next.js standalone build succeeds | CI pipeline |

---

## 4. Acceptance Criteria

### Global
- [ ] **AC-GLOBAL-01**: `pnpm build` succeeds with zero TypeScript errors.
- [ ] **AC-GLOBAL-02**: All existing tests (`pnpm test`) continue to pass.
- [ ] **AC-GLOBAL-03**: Color palette from `frontend_color_palate.md` is consistently applied.
- [ ] **AC-GLOBAL-04**: TanStack Query/Form/Table/Recharts are used consistently.

<!-- ### Per-Ticket
- [ ] **AC-008**: Landing page renders hero, specialties from API, top-rated doctors, stats, footer.
- [ ] **AC-009**: Auth pages functional. Logout clears cookies and redirects.
- [ ] **AC-010**: Profile page edits with avatar upload. Change-password works. NavItems link fixed.
- [ ] **AC-011**: `/dashboard` renders patient overview (no 404). Health records page works.
- [ ] **AC-012**: Prescriptions list with PDF download. Medical reports upload/view/delete works.
- [ ] **AC-013**: Review button on COMPLETED+PAID appointments. My-reviews and invoice download.
- [ ] **AC-014**: Doctor dashboard overview. Appointments FSM. Prescriptions authoring. My-reviews.
- [ ] **AC-015**: Admin specialties, patients, admins tables. Route shadowing fixed.
- [ ] **AC-016**: Admin appointments, prescriptions, reviews tables with status badges.
- [ ] **AC-017**: Admin doctor-schedules, doctor-specialties, payments views. Webhook fixed.
- [ ] **AC-018**: Floating violet "Ask Medix AI" button with Sheet chat and citations.
- [ ] **AC-019**: NavItems issues resolved. Test coverage expanded. -->

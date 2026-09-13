# [TICK-019] Polish, Remaining Fixes & Test Coverage Expansion

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-008 through TICK-018 (all)
- **Blocks**: None (Final ticket in suite)

---

## Objective

Final polish pass: fix all remaining minor defects, ensure consistent color palette application, resolve OpenAPI spec discrepancies, and expand automated test coverage for critical paths.

---

## Detailed Tasks

### 1. Minor Defect Fixes
- **`patientProtectedRoutes.exact`** in `src/lib/authUtils.ts` line 36: Change `"/payment/success"` → `"/dashboard/payment/payment-success"` to match actual route path.
- **Browser import in backend**: In `src/app/module/stats/stats.route.ts` line 2, change `import { Role } from '../../../generated/prisma/browser'` to the correct import path (`../../../generated/prisma` or `@prisma/client` enums).
- **OpenAPI spec discrepancies** in `src/app/docs/openapi.ts`: Fix documented endpoints that don't match actual routes (e.g., `/users/create-patient` should be `/auth/register`, `/users/my-profile` should be `/auth/me`).
- **Empty validation file**: Populate `backend/src/app/module/doctorSchedule/doctorSchedule.validation.ts` with Zod schemas and wire validation middleware into `doctorSchedule.route.ts`.

### 2. Color Palette Consistency Audit
- Verify all new pages use the color system from `frontend_color_palate.md`:
  - Patient pages: Teal + Terracotta
  - Doctor pages: Teal + Neutral
  - Admin pages: Grayscale + status badge colors
  - AI components: Assist Violet exclusively
  - Status badges: Success/Info/Warning/Danger from the palette
- Fix any components using hardcoded hex values that don't match the palette.

### 3. Backend Test Coverage Expansion
- Add tests for critical untested paths:
  - **Payment webhook**: Test `checkout.session.completed` flow (mock Stripe signature, verify Payment/Appointment status transitions).
  - **Prescription service**: Test `givePrescription` creates PDF and links to appointment.
  - **Auth service**: Test registration, login, OTP verification flows.
  - **Review service**: Test rating calculation atomicity.
- Target: At least 2-3 new test files covering the above.

### 4. Frontend Test Coverage Expansion
- Test components:
  - **LoginForm**: Test form renders, validation errors display, submit calls action.
  - **DataTable**: Test renders with mock data, pagination controls work.
  - **PatientDashboardContent**: Test stats cards render with mock data.
- Target: At least 2-3 new test files.

### 5. Build & CI Verification
- Run `pnpm build` — verify zero TypeScript errors.
- Run `pnpm test` — verify all existing and new tests pass.
- Run `pnpm lint` — verify no linting errors.
- Run `pnpm typecheck` — verify no type errors.

---

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

All four commands pass with zero errors. Color palette is consistent across all portals. OpenAPI spec matches actual routes.

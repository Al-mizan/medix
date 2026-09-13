# [TICK-011] Patient Dashboard Overview & Health Data

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-009
- **Blocks**: TICK-012

---

## Objective

Build the Patient Dashboard overview page at `/dashboard` (fixing the current 404 bug) and the Patient Health Data management page at `/dashboard/health-records`. Create the missing route directories.

---

## Bug Fix (folded in)

**Patient Dashboard 404**: `getDefaultDashboardRoute("PATIENT")` in `src/lib/authUtils.ts` returns `/dashboard`, but `src/app/(dashboardLayout)/dashboard/` has no `page.tsx`. All logged-in patients hit a 404. Fix by creating `page.tsx` with the comprehensive overview.

---

## Detailed Tasks

### 1. Patient Dashboard Overview (`/dashboard`)
- Create `src/app/(dashboardLayout)/dashboard/page.tsx`.
- SSR prefetch dashboard stats via `GET /api/v1/stats` using TanStack Query.
- Build `PatientDashboardContent.tsx` component with:
  - **Stats Cards**: Total appointments, upcoming appointments, completed appointments, total prescriptions. Use `StatsCard` shared component.
  - **Upcoming Appointments**: List of next 3-5 upcoming `SCHEDULED` appointments with doctor name, date/time, and quick "Pay Now" button for unpaid ones.
  - **Recent Prescriptions**: Last 3 prescriptions with doctor name, date, and link to `/dashboard/my-prescriptions`.
  - **Health Summary**: Quick view of patient's blood group, allergies status, key vitals if `PatientHealthData` exists, with link to `/dashboard/health-records`.
- Use Recharts for appointment status distribution pie chart (similar to admin dashboard pattern).
- Apply Patient portal color scheme: Teal primary + Terracotta accent CTAs.

### 2. Patient Health Data Page (`/dashboard/health-records`)
- Create directory `src/app/(dashboardLayout)/dashboard/health-records/`.
- Create `page.tsx` and `_action.ts`.
- Fetch existing health data via `GET /api/v1/patients/my-profile` (health data is nested in patient profile response).
- Build `HealthRecordsForm.tsx` using TanStack Form + Zod with all 16 clinical fields:
  - `gender` (select: MALE, FEMALE, OTHER)
  - `dateOfBirth` (date picker)
  - `bloodGroup` (select: A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE)
  - `hasAllergies` (checkbox), `hasDiabetes` (checkbox)
  - `height` (number, cm), `weight` (number, kg)
  - `smokingStatus` (checkbox)
  - `dietaryPreferences` (text)
  - `pregnancyStatus` (checkbox)
  - `mentalHealthHistory` (textarea)
  - `immunizationStatus` (text)
  - `hasPastSurgeries` (checkbox)
  - `recentAnxiety` (checkbox), `recentDepression` (checkbox)
  - `maritalStatus` (text)
- Server action: Call `PATCH /api/v1/patients/update-my-profile` with the health data fields.
- Pre-populate form with existing data if available.

### 3. Services
- Add/reuse `getMyProfile()` service for fetching patient data with health records.
- Add `updateMyProfile(payload)` service for updating health data.

---

## Verification

- Navigate to `/dashboard` as a patient — overview page renders (no more 404).
- Stats cards display correct counts.
- Upcoming appointments and recent prescriptions load.
- Navigate to `/dashboard/health-records` — form loads.
- Fill in health data — submits successfully, data persists on reload.
- `pnpm build` succeeds.

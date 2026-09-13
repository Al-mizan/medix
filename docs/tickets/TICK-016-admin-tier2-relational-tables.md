# [TICK-016] Admin Tier 2: Relational & Status Tables (Appointments, Prescriptions, Reviews)

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-015
- **Blocks**: TICK-017

---

## Objective

Build the 3 admin management pages that involve cross-entity references and FSM status display. These are read-heavy with admin-level status management capabilities.

---

## Detailed Tasks

### 1. Appointments Management (`/admin/dashboard/appointments-management`)
- Replace stub in `appointments-management/page.tsx`. Create `_action.ts`.
- SSR prefetch via `GET /api/v1/appointments/all-appointments` using TanStack Query.
- Build `AppointmentsTable.tsx` using DataTable with `useServerManagedDataTable`:
  - Columns: Patient name, Doctor name, Specialty, Schedule date/time, Appointment Status badge (SCHEDULED/INPROGRESS/COMPLETED/CANCELED), Payment Status badge (UNPAID/PAID/REFUNDED/FAILED), Created date, Actions.
  - **View**: `ViewAppointmentDialog.tsx` — full appointment details with patient info, doctor info, payment info, and prescription link.
  - **Status Change** (Admin can cancel appointments): `PATCH /api/v1/appointments/change-appointment-status/:id` with `{ status: "CANCELED" }`.
  - Filter by: appointment status, payment status, doctor, date range.
  - Search by patient name or doctor name.
  - Pagination and sorting.
  - Apply status colors from palette: `SCHEDULED` → Info Teal, `INPROGRESS` → Warning Amber, `COMPLETED` → Success Emerald, `CANCELED` → Danger Red.
- Services: `getAllAppointments(query)` → `GET /api/v1/appointments/all-appointments`.

### 2. Prescriptions Management (`/admin/dashboard/prescriptions-management`)
- Replace stub in `prescriptions-management/page.tsx`. Create `_action.ts`.
- SSR prefetch via `GET /api/v1/prescriptions` using TanStack Query.
- Build `PrescriptionsTable.tsx` using DataTable:
  - Columns: Patient name, Doctor name, Appointment date, Prescription date, Follow-up date, PDF link, Actions.
  - **View**: `ViewPrescriptionDialog.tsx` — full prescription details (instructions, medications list, follow-up date, PDF download link).
  - Admin view is read-only (prescriptions are doctor-managed).
  - Search by patient/doctor name, pagination.
- Services: `getAllPrescriptions(query)` → `GET /api/v1/prescriptions`.

### 3. Reviews Management (`/admin/dashboard/reviews-management`)
- Replace stub in `reviews-management/page.tsx`. Create `_action.ts`.
- SSR prefetch via `GET /api/v1/reviews` using TanStack Query.
- Build `ReviewsTable.tsx` using DataTable:
  - Columns: Patient name, Doctor name, Rating (star display), Comment (truncated), Date, Actions.
  - **View**: `ViewReviewDialog.tsx` — full review content.
  - Admin view is read-only (reviews are patient-managed).
  - Search by patient/doctor name, filter by rating range, pagination.
- Services: `getAllReviews(query)` → `GET /api/v1/reviews`.

---

## Verification

- Admin can view all platform appointments with correct status badges and colors.
- Admin can cancel appointments (status transitions correctly).
- Admin can view all prescriptions and download PDFs.
- Admin can view all reviews with star ratings.
- All tables have search, filtering, sorting, and pagination.
- `pnpm build` succeeds.

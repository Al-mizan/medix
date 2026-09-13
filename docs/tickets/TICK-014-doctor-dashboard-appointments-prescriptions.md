# [TICK-014] Doctor Dashboard, Appointments & Prescriptions

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-009
- **Blocks**: None

---

## Objective

Build the Doctor Dashboard overview page, the Doctor Appointments management page with FSM status transitions, the Doctor Prescriptions authoring page, and the Doctor My-Reviews page. All backend APIs are complete.

---

## Detailed Tasks

### 1. Doctor Dashboard Overview (`/doctor/dashboard`)
- Replace stub in `src/app/(dashboardLayout)/doctor/dashboard/page.tsx`.
- SSR prefetch dashboard stats via `GET /api/v1/stats` using TanStack Query.
- Build `DoctorDashboardContent.tsx` component with:
  - **Stats Cards**: Total patients, total reviews, total revenue, average rating. Use `StatsCard` shared component.
  - **Today's Appointments**: List of today's scheduled appointments with patient name, time slot, and status badge.
  - **Appointment Status Distribution**: Recharts pie/donut chart.
- Apply Doctor portal color scheme: Teal + Neutral (no Terracotta).

### 2. Doctor Appointments Page (`/doctor/dashboard/appointments`)
- Replace stub in `appointments/page.tsx`. Create `_action.ts`.
- SSR prefetch via `GET /api/v1/appointments/my-appointments` using TanStack Query.
- Build `DoctorAppointmentsTable.tsx` using DataTable with `useServerManagedDataTable`:
  - Columns: Patient name, appointment date/time, status badge, payment status badge, actions.
  - **Status Transition Actions** (per FSM rules in `appointment.service.ts`):
    - Doctor can: `SCHEDULED` → `INPROGRESS` ("Start Consultation" button)
    - Doctor can: `INPROGRESS` → `COMPLETED` ("Complete Consultation" button)
    - Doctor CANNOT skip: `SCHEDULED` → `COMPLETED`
    - Doctor CANNOT modify: `COMPLETED` or `CANCELED` appointments
  - Server action: Call `PATCH /api/v1/appointments/change-appointment-status/:id` with `{ status }`.
  - Clicking "Complete" should prompt to create a prescription (link to prescription form).
  - Filtering by status, searching by patient name, pagination.

### 3. Doctor Prescriptions Page (`/doctor/dashboard/prescriptions`)
- Replace stub in `prescriptions/page.tsx`. Create `_action.ts`.
- SSR prefetch via `GET /api/v1/prescriptions/my-prescriptions` using TanStack Query.
- Build `DoctorPrescriptionsTable.tsx` using DataTable:
  - Columns: Patient name, appointment date, prescription date, follow-up date, PDF link, actions.
  - **Create Prescription**: `CreatePrescriptionModal.tsx` with TanStack Form + Zod:
    - Select appointment (dropdown of COMPLETED appointments without prescriptions)
    - Instructions textarea
    - Follow-up date picker
    - Medications: Dynamic array of `{ name, dosage, frequency, duration }` fields (add/remove rows)
  - Server action: Call `POST /api/v1/prescriptions` with payload.
  - **Edit Prescription**: Same form pre-populated, calls `PATCH /api/v1/prescriptions/:id`.
  - **Delete Prescription**: Confirmation dialog, calls `DELETE /api/v1/prescriptions/:id`.

### 4. Doctor My-Reviews Page (`/doctor/dashboard/my-reviews`)
- Replace stub in `my-reviews/page.tsx`. Create `_action.ts`.
- SSR prefetch via `GET /api/v1/reviews/my-reviews` using TanStack Query.
- Build `DoctorReviewsList.tsx`: Read-only card list showing patient name, rating stars, comment, date.
- Doctor cannot edit or delete reviews (patient-only operations).

### 5. Services
- Reuse `getMyAppointments()`, `getMySingleAppointment(id)` for appointments.
- Add `changeAppointmentStatus(id, payload)` → `PATCH /api/v1/appointments/change-appointment-status/:id`.
- Add `getMyPrescriptions()`, `createPrescription(payload)`, `updatePrescription(id, payload)`, `deletePrescription(id)` services.
- Add `getMyReviews()` → `GET /api/v1/reviews/my-reviews`.

---

## Verification

- Navigate to `/doctor/dashboard` — overview with stats and today's appointments loads.
- Navigate to `/doctor/dashboard/appointments` — table loads with correct status badges.
- Transition SCHEDULED → INPROGRESS → COMPLETED — status updates correctly.
- Attempt invalid transitions — blocked with error toast.
- Create prescription for a completed appointment — PDF generated, visible in table.
- Navigate to `/doctor/dashboard/my-reviews` — reviews list loads.
- `pnpm build` succeeds.

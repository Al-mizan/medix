# [TICK-017] Admin Tier 3: Join Tables, Payments & Webhook Fixes

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-016
- **Blocks**: None

---

## Objective

Build the 3 remaining admin management pages (Doctor-Schedules, Doctor-Specialties, Payments) and fix the backend defects in the payment module.

---

## Bug Fixes (folded in)

1. **Dead Payment Router**: `backend/src/app/module/payment/payment.route.ts` has 0 routes registered. Add at minimum a `GET /api/v1/payments` endpoint for admin to list all payments.
2. **Incomplete Webhook Failure Handling**: In `backend/src/app/module/payment/payment.service.ts` lines 148-160, `checkout.session.expired` and `payment_intent.payment_failed` only log to console. They must update the `Payment` record to `status: FAILED` and the `Appointment` to `status: CANCELED`, and free the doctor schedule slot.
3. **Empty Placeholder Files**: Populate `payment.constant.ts`, `payment.interface.ts`, and `payment.validation.ts` with appropriate types and constants.

---

## Detailed Tasks

### 1. Doctor-Schedules Management (`/admin/dashboard/doctor-schedules-managament`)
- Replace stub in `doctor-schedules-managament/page.tsx`. Create `_action.ts`.
- Note: Folder name has a typo (`managament` instead of `management`). Keep as-is to avoid breaking existing nav links.
- SSR prefetch via `GET /api/v1/doctor-schedules` using TanStack Query.
- Build `DoctorSchedulesTable.tsx` using DataTable:
  - Columns: Doctor name, Schedule date/time (start-end), Is Booked badge, Appointment ID (if booked), Actions.
  - **View**: `ViewDoctorScheduleDialog.tsx` — details of the doctor-schedule mapping.
  - Filter by doctor, booked/unbooked status, date range.
  - Read-only for admin (doctors manage their own schedules).
  - Pagination.
- Services: `getAllDoctorSchedules(query)` → `GET /api/v1/doctor-schedules`.

### 2. Doctor-Specialties Management (`/admin/dashboard/doctor-specialties-management`)
- Replace stub in `doctor-specialties-management/page.tsx`. Create `_action.ts`.
- This is a join table view showing which doctors have which specialties.
- Build a view that displays:
  - Grouped by specialty: Each specialty card showing a list of associated doctors.
  - OR a flat DataTable with columns: Doctor name, Specialty name.
  - This is primarily a read-only overview (specialty assignments are managed in the Doctor CRUD form).
- Services: Reuse `getDoctors()` with specialty includes, or query doctor-specialties directly.

### 3. Payments Management (`/admin/dashboard/payments-management`)
- Replace stub in `payments-management/page.tsx`. Create `_action.ts`.
- SSR prefetch via new `GET /api/v1/payments` endpoint.
- Build `PaymentsTable.tsx` using DataTable:
  - Columns: Transaction ID, Patient name, Doctor name, Amount, Payment Status badge (PAID/UNPAID/REFUNDED/FAILED), Invoice link, Stripe Event ID, Date, Actions.
  - **View**: `ViewPaymentDialog.tsx` — full payment details with Stripe metadata.
  - **Invoice Download**: Link to `invoiceUrl` (Cloudinary PDF).
  - Filter by payment status, date range.
  - Search by transaction ID or patient/doctor name.
  - Pagination.
  - Apply status colors: PAID → Success Emerald, UNPAID → Warning Amber, FAILED → Danger Red, REFUNDED → Info Teal.
- Services: `getAllPayments(query)` → `GET /api/v1/payments`.

### 4. Backend Payment Module Fixes
- **Add payment routes** in `payment.route.ts`:
  ```typescript
  router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), PaymentController.getAllPayments);
  ```
- **Add `getAllPayments`** method in `payment.controller.ts` and `payment.service.ts` using QueryBuilder.
- **Fix webhook handlers** in `payment.service.ts`:
  - `checkout.session.expired`: Update `Payment.status` → `FAILED`, `Appointment.status` → `CANCELED`, free `DoctorSchedule.isBooked` → `false`.
  - `payment_intent.payment_failed`: Same logic.
- **Populate empty files** with interfaces and constants.

---

## Verification

- Admin can view all doctor-schedule mappings with booked/unbooked status.
- Admin can view doctor-specialty associations.
- Admin can view all payments with status badges and invoice download links.
- Backend: Simulating `checkout.session.expired` webhook correctly marks payment as FAILED and cancels appointment.
- `pnpm build` succeeds (frontend and backend).

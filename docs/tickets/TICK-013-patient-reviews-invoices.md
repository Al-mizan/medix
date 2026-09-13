# [TICK-013] Patient Reviews & Invoice Downloads

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-012
- **Blocks**: None

---

## Objective

Implement patient review submission (inline on appointment cards + dedicated My Reviews page) and invoice viewing/downloading. The backend Review module has full CRUD with atomic `averageRating` recalculation, and the Payment module generates Cloudinary-hosted invoice PDFs.

---

## Detailed Tasks

### 1. Review Submission on Appointment Cards
- In `PatientAppointmentsList.tsx` (or the component rendering patient appointment cards in `/dashboard/my-appointments`):
  - Add a **"Leave Review"** button on each appointment card, visible ONLY when:
    - `appointment.status === "COMPLETED"` AND `appointment.paymentStatus === "PAID"`
    - AND no existing review for this appointment (check via a field on the appointment object or a separate query).
  - Clicking "Leave Review" opens a `ReviewDialog.tsx` modal with:
    - Star rating input (1-5 stars, clickable star icons)
    - Comment textarea
    - TanStack Form + Zod validation
  - Server action: Call `POST /api/v1/reviews` with `{ appointmentId, rating, comment }`.
  - On success: Invalidate appointment query, show success toast.

### 2. My Reviews Page (`/dashboard/my-reviews`)
- Create directory `src/app/(dashboardLayout)/dashboard/my-reviews/`.
- Create `page.tsx` and `_action.ts`.
- Add navigation item to `patientNavItems` in `navItems.ts`:
  ```
  { title: "My Reviews", href: "/dashboard/my-reviews", icon: "Star" }
  ```
- SSR prefetch reviews via `GET /api/v1/reviews/my-reviews` using TanStack Query.
- Build `PatientReviewsList.tsx` component:
  - Card-based layout showing: doctor name, rating stars, comment, date.
  - **Edit** button opening `EditReviewDialog.tsx` (same form as create, pre-populated).
  - **Delete** button with confirmation dialog.
  - Server actions for `PATCH /api/v1/reviews/:id` and `DELETE /api/v1/reviews/:id`.

### 3. Invoice Download
- In the patient appointments list or a dedicated section:
  - For appointments with `paymentStatus === "PAID"`, show a **"Download Invoice"** button/link.
  - The invoice PDF URL is stored in the `Payment` record's `invoiceUrl` field (Cloudinary URL).
  - Fetch via `GET /api/v1/appointments/my-single-appointment/:id` which includes the payment data.
  - Button opens the `invoiceUrl` in a new tab for PDF viewing/download.

### 4. Services
- Add `getMyReviews()` → `GET /api/v1/reviews/my-reviews`.
- Add `createReview(payload)` → `POST /api/v1/reviews`.
- Add `updateReview(id, payload)` → `PATCH /api/v1/reviews/:id`.
- Add `deleteReview(id)` → `DELETE /api/v1/reviews/:id`.

---

## Verification

- Complete an appointment (COMPLETED + PAID) → "Leave Review" button appears.
- Submit review → rating saves, doctor's `averageRating` updates.
- Navigate to `/dashboard/my-reviews` → review list loads.
- Edit a review → changes persist.
- Delete a review → removed from list, doctor rating recalculated.
- Click "Download Invoice" on a paid appointment → PDF opens.
- `pnpm build` succeeds.

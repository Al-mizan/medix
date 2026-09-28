# [TICK-030] Skeleton Screens, Inline Form Validation & Mobile Audit

- **Status**: Ready
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-026, TICK-027
- **Blocks**: TICK-031

---

## Objective

Eliminate visual layout shifts and abrupt loading states with tailored skeleton screen loaders, connect inline field-level Zod validation errors to all patient and booking forms, and audit mobile viewports down to 375px.

---

## Detailed Tasks

### 1. Viewport-Matching Skeleton Loaders
- Create dedicated skeleton state components in `frontend/src/components/modules/`:
  - `DoctorListSkeleton.tsx` for `/consultation`.
  - `DashboardStatsSkeleton.tsx` for `/dashboard` and `/doctor/dashboard`.
  - `AppointmentsTableSkeleton.tsx` for `/dashboard/my-appointments`.
- Replace generic spinning circles with layout skeletons during TanStack Query `isLoading` states.

### 2. Inline Form Error States
- Wire Zod schema validation errors directly beneath form inputs using TanStack Form's field error state in:
  - Login form (`frontend/src/components/modules/Auth/LoginForm.tsx`)
  - Registration form (`frontend/src/components/modules/Auth/RegisterForm.tsx`)
  - Appointment booking modal (`frontend/src/components/modules/Patient/Appointments/BookAppointmentModal.tsx`)

### 3. Mobile Viewport Audit
- Audit layouts at 375px (iPhone SE), 414px (iPhone 14), and 768px (Tablet):
  - Ensure zero horizontal scrolling or clipping.
  - Verify touch targets meet minimum 44x44px accessibility guidelines.
  - Ensure Primary CTA on the landing page remains visible above the fold on mobile viewports.

---

## Verification

- [ ] Network throttling in Chrome DevTools shows skeleton screens matching final layout shape.
- [ ] Submitting invalid form inputs triggers inline red error text under respective fields without page reload or generic error popups.
- [ ] No horizontal scrollbars appear at 375px width.

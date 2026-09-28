# [TICK-025] Universal Pagination Standardization Across Backend & Frontend

- **Status**: Ready
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-023
- **Blocks**: TICK-026

---

## Objective

Standardize paginated responses across all list queries in the backend to ensure unbounded queries never overwhelm server memory or client tables.

---

## Detailed Tasks

### 1. Backend Service Pagination Audit
- Inspect services invoking `prisma.*.findMany`:
  - `appointment.service.ts`
  - `doctorSchedule.service.ts`
  - `prescription.service.ts`
  - `review.service.ts`
  - `schedule.service.ts`
- Ensure all endpoints accept standard pagination parameters (`page`, `limit`) and return the unified meta envelope:
  ```json
  "meta": { "page": 1, "limit": 10, "total": 45, "totalPage": 5 }
  ```

### 2. Frontend Table Consumer Alignment
- Verify that table consumers (`useServerManagedDataTable`, `DoctorsList`, `AppointmentsManagement`) parse and display paginated rows and navigation controls without layout truncation.

---

## Verification

- [ ] Every list endpoint returns standard pagination metadata.
- [ ] Passing `?page=2&limit=5` returns exactly 5 items offset appropriately.
- [ ] No unbounded database queries exist in the codebase.

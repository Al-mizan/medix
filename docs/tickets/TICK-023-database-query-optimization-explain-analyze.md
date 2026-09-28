# [TICK-023] Database Query Optimization & Composite Index Tuning

- **Status**: Done
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: None
- **Blocks**: TICK-024, TICK-025

---

## Objective

Identify and optimize slow queries in Prisma Postgres using `EXPLAIN (ANALYZE, BUFFERS)`, eliminate potential N+1 relation lookups, and add composite indexes for high-frequency filters (e.g. appointment status & cron cancellation).

---

## Detailed Tasks

### 1. EXPLAIN ANALYZE Execution
- Profile the top 3 high-volume database queries using PostgreSQL query analyzer:
  - Doctor search with specialty joins.
  - Patient appointment listings ordered by date.
  - Background cron query: `status = 'SCHEDULED' AND createdAt < NOW() - 25 min`.

### 2. Composite Index Addition in Prisma Schema
- In `backend/prisma/schema/appointment.prisma`, add:
  ```prisma
  @@index([status, createdAt], name: "idx_appointment_status_createdAt")
  ```
- Generate Prisma client and run `pnpm prisma db push` or create a migration.

### 3. N+1 Relation Audit & Fixes
- Audit `backend/src/app/module/appointment/appointment.service.ts` and `prescription.service.ts`:
  - Ensure all related user/doctor/patient models are eager-loaded via Prisma `include` or `select` rather than queried in loop iterations.

---

## Verification

- [x] Query plan confirms `Index Scan` on `idx_appointment_status_createdAt` for appointment cleanup cron query.
- [x] No sequential scans on `Doctor` or `Appointment` tables for primary filtered listings.
- [x] `pnpm prisma generate` completes cleanly without validation errors.


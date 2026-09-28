# [TICK-024] Core Endpoints Redis Caching Layer & Invalidation

- **Status**: Done
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-021, TICK-023
- **Blocks**: TICK-026, TICK-032

---

## Objective

Extend the existing `redisService` to cache expensive, read-heavy API responses (doctors list, individual doctor details, specialties list, and schedules) with automated invalidation on create/update/delete mutations.

---

## Detailed Tasks

### 1. Reusable Cache Helper
- In `backend/src/app/lib/redis.ts`, add generic helper:
  ```typescript
  async function withCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T>
  ```
  - Gracefully falls back to `fetcher()` if Redis is temporarily unreachable.

### 2. Service-Layer Caching Implementation
- Wrap read methods in:
  - `DoctorService.getAllDoctors`: Cache key `doctors:list:{queryHash}`, TTL: 300s.
  - `DoctorService.getDoctorById`: Cache key `doctors:detail:{id}`, TTL: 180s.
  - `SpecialtyService.getAllSpecialties`: Cache key `specialties:all`, TTL: 1800s.
  - `ScheduleService.getAllSchedules`: Cache key `schedules:list:{queryHash}`, TTL: 120s.

### 3. Automated Invalidation Hooks
- On `DoctorService.updateDoctor` / `deleteDoctor`: Purge `doctors:detail:{id}` and invalidate all `doctors:list:*` keys.
- On `SpecialtyService` mutations: Purge `specialties:all`.

---

## Verification

- [x] Querying `GET /api/v1/doctors` twice results in sub-15ms response on second request.
- [x] Updating a doctor profile invalidates the cache immediately, returning fresh data on the next read.
- [x] Disconnecting Redis does not crash the API (graceful fallback to direct DB query).


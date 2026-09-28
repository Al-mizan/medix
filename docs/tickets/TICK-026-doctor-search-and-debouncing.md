# [TICK-026] Doctor Search-as-You-Type with Real-Time Debouncing

- **Status**: Ready
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-024, TICK-025
- **Blocks**: TICK-030

---

## Objective

Deliver a smooth search-as-you-type experience on the `/consultation` page that filters doctors in real time with 300ms input debouncing, URL parameter synchronization, and non-blocking loading states.

---

## Detailed Tasks

### 1. Custom Debounce Hook
- In `frontend/src/hooks/useDebounce.ts`, implement or verify reusable debouncing hook:
  ```typescript
  export function useDebounce<T>(value: T, delay: number = 300): T
  ```

### 2. Consultation Search Bar Component
- In `frontend/src/components/modules/Consultation/DoctorsList.tsx`:
  - Wire search input to local state.
  - Sync debounced search term to URL parameters (`?searchTerm=...`) using `useRouter` / `useSearchParams` without triggering full page reloads.
  - Display subtle loading spinner inside the input while queries are in-flight.

### 3. Backend Search Optimization
- Verify `backend/src/app/module/doctor/doctor.constant.ts` `doctorSearchableFields` efficiently filters on `name`, `qualification`, `designation`, and `currentWorkingPlace`.

---

## Verification

- [ ] Rapid typing in the search bar triggers only one network request 300ms after user pauses.
- [ ] Direct navigation to `/consultation?searchTerm=cardio` hydrates the search input and loads filtered results.
- [ ] Clearing the search bar immediately resets results to unfiltered doctors.

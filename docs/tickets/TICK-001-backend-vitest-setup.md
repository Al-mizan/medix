# [TICK-001] Setup Vitest & Supertest Testing Framework in Backend

- **Status**: Ready
- **Spec Reference**: [testing_and_documentation_spec.md §2.1, §3](file:///mnt/workspace/Projects/hobby/digital-healthcare/docs/specs/testing_and_documentation_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: None
- **Blocks**: TICK-003, TICK-004

---

## Objective
Establish a sub-second, deterministic testing environment in `backend/` using Vitest and Supertest with mock-heavy unit testing (Prisma Client mocks). Implement tests for QueryBuilder and appointment status state machine.

---

## Detailed Tasks
1. **Dependencies**:
   - Install `vitest`, `supertest`, `@types/supertest`, `@vitest/coverage-v8` in `backend/` as devDependencies.
2. **Configuration**:
   - Create `backend/vitest.config.ts` targeting `src/**/*.test.ts`, with Node environment and TypeScript path aliases.
3. **Mocks & Setup**:
   - Create `backend/tests/setup.ts` with Prisma Client mock helpers.
4. **Test Implementation**:
   - Create `backend/src/app/utils/__tests__/QueryBuilder.test.ts`:
     - Test `.search()` with single and nested relations.
     - Test `.filter()` with range operators (`lt`, `gt`, `gte`, `lte`), set filters (`in`), string filters.
     - Test `.paginate()` computing skip/take and page count.
     - Test `.sort()` and `.dynamicInclude()`.
   - Create `backend/src/app/module/appointment/__tests__/appointment.status.test.ts`:
     - Test Patient can only set `CANCELED` on `SCHEDULED` appointments.
     - Test Doctor can transition `SCHEDULED` → `INPROGRESS` and `INPROGRESS` → `COMPLETED`.
     - Test completed or canceled appointments cannot be updated.
     - Test doctor schedule slot is freed (`isBooked = false`) on cancellation.
5. **Scripts**:
   - Add `"test": "vitest run"` and `"test:watch": "vitest"` to `backend/package.json`.

---

## Verification
```bash
pnpm --filter backend-ph-healthcare test
```
All tests must pass with 0 failures and 0 unhandled promise rejections.

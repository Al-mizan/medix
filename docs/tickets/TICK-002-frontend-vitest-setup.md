# [TICK-002] Setup Vitest & React Testing Library in Frontend

- **Status**: Ready
- **Spec Reference**: [testing_and_documentation_spec.md §2.1, §3](file:///mnt/workspace/Projects/hobby/digital-healthcare/docs/specs/testing_and_documentation_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: None
- **Blocks**: TICK-003, TICK-004

---

## Objective
Establish a modern frontend testing environment in `frontend/` using Vitest, React Testing Library, and jsdom for testing React 19 components and hooks.

---

## Detailed Tasks
1. **Dependencies**:
   - Install `vitest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `jsdom` in `frontend/` as devDependencies.
2. **Configuration**:
   - Create `frontend/vitest.config.ts` configuring `environment: 'jsdom'`, `setupFiles: ['./tests/setup.ts']`, and `@/` path alias pointing to `src/`.
3. **Setup File**:
   - Create `frontend/tests/setup.ts` importing `@testing-library/jest-dom/vitest`.
4. **Sample Component Test**:
   - Create a component test in `frontend/src/` (e.g. testing a button, badge, or card component) verifying render output, className application, and event dispatch.
5. **Scripts**:
   - Add `"test": "vitest run"` and `"test:watch": "vitest"` to `frontend/package.json`.

---

## Verification
```bash
pnpm --filter frontend-ph-healthcare test
```
All frontend tests must pass with 0 failures.

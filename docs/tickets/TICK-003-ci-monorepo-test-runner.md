# [TICK-003] Monorepo Test Runner & CI/CD Pipeline Integration

- **Status**: Ready
- **Spec Reference**: [testing_and_documentation_spec.md §2.1, §4](file:///mnt/workspace/Projects/hobby/digital-healthcare/docs/specs/testing_and_documentation_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-001, TICK-002
- **Blocks**: TICK-004

---

## Objective
Integrate automated testing into the root monorepo scripts and the GitHub Actions CI/CD workflow (`.github/workflows/cicd.yml`), ensuring that any failing unit, integration, or component tests halt deployment to production before Docker image build.

---

## Detailed Tasks
1. **Root `package.json` Scripts**:
   - Add `"test": "pnpm --recursive run test"`
   - Add `"test:backend": "pnpm --filter backend-ph-healthcare test"`
   - Add `"test:frontend": "pnpm --filter frontend-ph-healthcare test"`
2. **CI/CD Pipeline Updates (`.github/workflows/cicd.yml`)**:
   - In `backend-check` job:
     - Add `Test Backend` step (`run: pnpm --filter backend-ph-healthcare test`) after `Generate Prisma Client` and before `Build Backend`.
   - In `frontend-check` job:
     - Add `Test Frontend` step (`run: pnpm --filter frontend-ph-healthcare test`) after `Lint Frontend` and before `Build Frontend`.
3. **Verification**:
   - Run `pnpm test` from monorepo root to verify recursive execution across backend and frontend workspaces.

---

## Verification
```bash
pnpm test
```
Both backend and frontend test suites must execute and terminate with exit code 0.

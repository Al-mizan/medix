# [TICK-032] Automated Integration Testing, Lighthouse CI & Security Audit

- **Status**: Ready
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-021, TICK-022, TICK-024, TICK-031
- **Blocks**: None

---

## Objective

Solidify test coverage across critical backend modules and key frontend views, integrate Lighthouse CI into GitHub Actions with Core Web Vitals thresholds, and execute dependency vulnerability remediation.

---

## Detailed Tasks

### 1. Backend Integration Test Suites
- Create `backend/tests/integration/auth.test.ts`:
  - Test registration, authentication, token refresh, and invalid token rejection.
- Create `backend/tests/integration/appointment.test.ts`:
  - Test booking, slot status transition, and cancellation logic.
- Create `backend/tests/integration/paymentWebhook.test.ts`:
  - Test mock Stripe event signatures and status updates.

### 2. Frontend Component Test Suites
- In `frontend/tests/components/`:
  - Test `LoginForm.test.tsx` (validation feedback, submission handling).
  - Test `DoctorsList.test.tsx` (rendering doctor cards and debounced search triggers).

### 3. Lighthouse CI in GitHub Actions
- Create `.github/workflows/lighthouse.yml`:
  - Run Lighthouse CI action against homepage and consultation page on PRs to `main`.
  - Enforce minimum thresholds: Performance >= 85, Accessibility >= 90, Best Practices >= 90, SEO >= 90.

### 4. Dependency Vulnerability Audit
- Run `pnpm audit` across monorepo and resolve any critical or high severity advisories.

---

## Verification

```bash
pnpm --filter backend-ph-healthcare test
pnpm --filter frontend-ph-healthcare test
pnpm audit
```
- [ ] Backend and frontend test suites pass with zero failures.
- [ ] `pnpm audit` reports zero high/critical vulnerabilities.
- [ ] GitHub Actions workflow file syntax is valid.

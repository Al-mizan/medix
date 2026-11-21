# [TICK-033] Critic Harness Infrastructure & Deterministic Test Seeder

- **Status**: Completed
- **Spec Reference**: [critic_agents_quality_gate_spec.md](../specs/critic_agents_quality_gate_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: None (can start immediately)
- **Blocks**: TICK-034, TICK-035

---

## What to build

Establish the core Critic Harness infrastructure and database isolation mechanism. This includes creating a dedicated test seeder/reset script that prepares clean test accounts (Admin, Doctor, Patient) and initial schedule slots, as well as the browser automation engine capable of running in headless mode with Desktop (1440×900) and Mobile (390×844) viewport configurations. The harness must intercept and record browser `console.error` logs and network failures (`status >= 400`), while saving state screenshots to `docs/critic-reports/screenshots/`.

---

## Acceptance Criteria

- [x] `scripts/seed-critic.ts` resets and provisions deterministic test credentials and base entities (Admin, Doctor, Patient, Specialty, DoctorSchedule) in the database without failing unique constraints.
- [x] Browser harness launches headless Chromium with configurable desktop (`1440x900`) and mobile (`390x844`, mobile touch emulation) viewports.
- [x] Browser listener reliably intercepts and stores all `console.error` logs and unhandled promise rejections.
- [x] Network listener logs all failed HTTP responses (`status >= 400`) during test execution.
- [x] Screenshot utility captures and stores labeled high-resolution images in `docs/critic-reports/screenshots/`.

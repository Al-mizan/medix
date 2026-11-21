# [TICK-034] Admin Critic Agent Workflow & Management Audit

- **Status**: Completed
- **Spec Reference**: [critic_agents_quality_gate_spec.md](../specs/critic_agents_quality_gate_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-033
- **Blocks**: TICK-036

---

## What to build

Implement the Admin Critic Agent runner. The agent loads administrative credentials from the environment, performs real authentication against the login endpoint, and navigates across all administrative management routes (Doctors, Admins, Schedules, Doctor Schedules, Specialties, Appointments, Patients, Prescriptions, Payments, Reviews). It executes the complete creation flow for new doctors and administrators, tests interactive table filtering and modals, and captures full-resolution screenshots across both desktop and mobile viewports.

---

## Acceptance Criteria

- [x] Admin agent successfully authenticates using `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` or test admin credentials.
- [x] Agent traverses all 11 administrative management views without 404 or unhandled runtime crashes.
- [x] Doctor creation workflow is executed end-to-end (filling required inputs, selecting specialties, submitting form, verifying created record).
- [x] Admin creation workflow is executed end-to-end (filling inputs, submitting form, verifying created record).
- [x] Desktop and mobile screenshots are captured for all admin dashboards, forms, and dialog states.
- [x] Zero unhandled errors during navigation.

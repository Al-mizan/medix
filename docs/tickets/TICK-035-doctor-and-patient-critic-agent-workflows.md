# [TICK-035] Doctor & Patient Critic Agent End-to-End Workflows

- **Status**: Completed
- **Spec Reference**: [critic_agents_quality_gate_spec.md](../specs/critic_agents_quality_gate_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-033
- **Blocks**: TICK-036

---

## What to build

Implement the Doctor and Patient Critic Agent runners. The Doctor Critic Agent authenticates with doctor credentials, manages schedule slots, reviews appointments, authors a digital prescription, and checks patient reviews across desktop and mobile. The Patient Critic Agent browses doctor profiles, selects and books an appointment slot, reviews longitudinal health data, inspects prescriptions, and verifies invoices and payment status indicators. Both capture screenshots and record interaction metrics.

---

## Acceptance Criteria

- [x] Doctor agent authenticates and executes schedule creation, appointment inspection, and prescription authoring.
- [x] Patient agent browses doctor listings with search/filters and completes an appointment booking workflow.
- [x] Patient agent audits EHR health records, prescription lists, and payment history.
- [x] Both agents capture screenshots of all dashboards, modals, forms, and states across Desktop and Mobile viewports.
- [x] Console logs and network responses are captured and associated with each persona run.

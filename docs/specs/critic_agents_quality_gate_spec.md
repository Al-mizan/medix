# Spec: Multi-Agent Critic Quality Gate for Automated Visual, UX, and Functional Verification

## Problem Statement

As Medix scales features across its multi-role digital healthcare platform, frontend changes frequently introduce visual inconsistencies, subtle responsive layout regressions on mobile screens, edge-state rendering flaws (empty tables, missing loading skeletons), and uncaught client-side console or API errors that evade unit tests. Relying purely on DOM assertion tests verifies that elements exist in the tree but completely misses UI craft degradation, UX friction, and layout breakages. Conversely, manual design audits before every build or release are slow, subjective, and resource-intensive.

## Solution

Implement an automated multi-agent post-build quality gate driven by three autonomous, role-specific Critic Agents (Admin, Doctor, Patient). Operating through a deterministic cross-viewport browser harness, each agent logs in using configured credentials, executes real interactive workflows, inspects every state and page across desktop (1440×900) and mobile (390×844) viewports, traps console and network telemetry, and captures high-resolution screenshots. The captured states are evaluated against the Medix design system tokens and usability heuristics, scoring each persona across four weighted pillars (Visual Craft, UX Ergonomics, Responsiveness, Functional Robustness) from 0 to 10. Code only passes if all three agents score ≥ 8.5/10 with zero console and zero network errors. If any agent fails the score gate, a machine-readable ranked issue report is emitted for the Builder Agent to resolve automatically.

## User Stories

1. As an Admin, I want the Admin Critic Agent to log into the administrative portal with credentials loaded securely from the environment, so that administrative sessions are authentic and authenticated.
2. As an Admin, I want the Admin Critic Agent to navigate through all management pages (Doctors, Admins, Schedules, Doctor Schedules, Specialties, Appointments, Patients, Prescriptions, Payments, Reviews), so that every operational screen is audited for visual and functional consistency.
3. As an Admin, I want the Admin Critic Agent to execute the doctor creation workflow, so that doctor provisioning forms and validation states are verified end-to-end.
4. As an Admin, I want the Admin Critic Agent to execute the admin creation workflow, so that administrative role delegation is verified end-to-end.
5. As an Admin, I want the Admin Critic Agent to test modal dialogs, slide-over panels, and data table filtering, so that interactive administrative operations function smoothly without layout shifts.
6. As a Doctor, I want the Doctor Critic Agent to log in using doctor credentials, so that clinical practitioner workflows can be verified in a realistic environment.
7. As a Doctor, I want the Doctor Critic Agent to review assigned appointments and inspect patient consultation cards, so that patient queues render legibly across both desktop and mobile screens.
8. As a Doctor, I want the Doctor Critic Agent to author and issue a digital prescription for an appointment, so that prescription creation forms, medication inputs, and submission confirmations are verified.
9. As a Doctor, I want the Doctor Critic Agent to manage and configure personal schedule slots, so that slot creation and deletion controls remain responsive and intuitive.
10. As a Doctor, I want the Doctor Critic Agent to inspect patient reviews and ratings, so that feedback lists and rating metrics display accurately.
11. As a Patient, I want the Patient Critic Agent to browse vetted doctors on the public consultation page, so that doctor search filters, specialty tags, and consultation fee badges are verified.
12. As a Patient, I want the Patient Critic Agent to book an available consultation slot with a doctor, so that the end-to-end appointment scheduling journey is validated without friction.
13. As a Patient, I want the Patient Critic Agent to access personal health records and diagnostic reports, so that longitudinal EHR documents and upload widgets render cleanly.
14. As a Patient, I want the Patient Critic Agent to view issued prescriptions and consultation histories, so that clinical instructions are clearly readable on mobile devices.
15. As a Patient, I want the Patient Critic Agent to inspect payment invoices and payment status indicators, so that financial receipts display correct currency formatting (BDT) without calculation errors.
16. As a Design Director, I want every Critic Agent to evaluate page states against the official design system tokens (colors, typography clamp, border radius, spacing rhythm), so that arbitrary styling and generic AI aesthetics are prevented.
17. As a QA Lead, I want the Critic Harness to monitor and trap browser console errors, warnings, and unhandled promise rejections, so that client-side JavaScript crashes immediately fail the evaluation.
18. As a QA Lead, I want the Critic Harness to intercept and log all network calls, so that any unexpected 4xx or 5xx HTTP response triggers an instant functional failure.
19. As a Developer, I want to execute the entire critic verification suite via a unified command (`pnpm critic:run` or `pnpm build:verify`), so that I can trigger the verification pipeline locally or in CI without slowing down fast compiler iterations.
20. As a Builder Agent, I want failed evaluations to generate a structured JSON issue report (`docs/critic-reports/latest.json`) ranked by priority (P0/P1/P2) with reproduction steps and screenshot links, so that I can immediately ingest and fix regressions in code.

## Implementation Decisions

1. **Critic Harness Engine**:
   - The harness utilizes a deterministic browser automation engine (Playwright) to orchestrate authentication, role routing, form inputs, modal dialog interactions, and state progression.
   - Dual viewport configurations are strictly enforced: Desktop (`1440 × 900`) and Mobile (`390 × 844`).
   - The harness listens to browser `page.on('console')` and `page.on('response')` events, categorizing any `console.error` or HTTP `status >= 400` as a telemetry violation.

2. **Database State & Seeding Isolation**:
   - Prior to running the critic suite, an automated seed runner initializes database state with clean, predictable seed records for Admins, Doctors, Patients, Specialties, and DoctorSchedules.
   - A teardown/reset routine ensures that mutable creations (new doctors, appointments, prescriptions) do not cause subsequent test runs to fail due to primary key collisions or slot exhaustion.

3. **Multi-Role Orchestration**:
   - Three independent role runners execute the distinct journeys:
     - `AdminAgentRunner`: Authenticates via admin credentials, audits all 11 admin management views, executes doctor and admin creation.
     - `DoctorAgentRunner`: Authenticates via doctor credentials, audits schedule configuration, appointment queues, prescription authoring, and review feeds.
     - `PatientAgentRunner`: Explores public doctor catalog, books a consultation slot, audits health data management, prescription history, and invoice records.

4. **Multi-Pillar Scoring Architecture**:
   - The evaluation engine scores each persona from 0.0 to 10.0 using a weighted composite model:
     - Visual Craft & Design Tokens: 25% (max 2.5 points)
     - UX Ergonomics & Interaction States: 25% (max 2.5 points)
     - Responsiveness & Cross-Viewport Parity: 25% (max 2.5 points)
     - Functional Robustness & Flow Integrity: 25% (max 2.5 points)
   - Circuit Breakers: Any console error, network 5xx, or unhandled flow breakage instantly zeroes Functional Robustness, capping the maximum attainable score at 7.5 and failing the run.

5. **Reporting & Feedback Artifacts**:
   - Every screenshot is saved to `docs/critic-reports/screenshots/<agent>-<viewport>-<route>-<state>.png`.
   - The evaluation produces `docs/critic-reports/latest.json` (machine-readable schema containing scores, pillar breakdowns, console/network error lists, and ranked issues) and `docs/critic-reports/latest.md` (human-readable executive summary).

## Testing Decisions

- The Critic Harness itself is tested via end-to-end execution against local test servers (backend on port 5000, frontend on port 3000).
- Test execution requires:
  - Database connectivity to PostgreSQL test instance.
  - Redis connection for auth/session handling.
  - Active frontend and backend development or standalone servers.
- Prior art in the monorepo: existing backend integration suites (`backend/tests/integration/`) and frontend component tests (`frontend/src/app/__tests__/`).

## Out of Scope

- Live real-money Stripe charges (mock/test Stripe tokens and webhook payloads only).
- Live WebRTC peer-to-peer audio/video streaming negotiation (interface presence and call controls are verified; active peer video streaming over external STUN/TURN servers is out of scope).
- External production deployment operations during test runs.

## Further Notes

- In accordance with ADR 0003, all three agents must independently achieve ≥ 8.5/10 with zero console and zero network errors for a pass.
- System memory and historical logs will be maintained in `docs/wiki/`.

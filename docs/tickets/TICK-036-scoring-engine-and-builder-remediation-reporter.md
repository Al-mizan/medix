# [TICK-036] 4-Pillar Scoring Engine & Builder Remediation Reporter

- **Status**: Completed
- **Spec Reference**: [critic_agents_quality_gate_spec.md](../specs/critic_agents_quality_gate_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-034, TICK-035
- **Blocks**: None

---

## What to build

Implement the composite 4-Pillar scoring engine and the Builder Agent remediation reporter. The engine calculates individual and aggregate scores (0–10) across Visual Craft (25%), UX Ergonomics (25%), Responsiveness (25%), and Functional Robustness (25%), enforcing the circuit breaker rule (any console error or network 4xx/5xx zeroes Functional Robustness and fails the run). It emits machine-readable `docs/critic-reports/latest.json` and human-readable `docs/critic-reports/latest.md` with ranked P0/P1/P2 issues, screenshot references, and actionable remediation steps. Add `pnpm critic:run` to root `package.json`.

---

## Acceptance Criteria

- [x] Scoring engine calculates scores for Admin, Doctor, and Patient across the 4 pillars.
- [x] Circuit breaker rule triggers when `console.error` > 0 or network failure > 0, setting Functional Robustness to 0 and failing the score gate (< 8.5).
- [x] Evaluation generates `docs/critic-reports/latest.json` with structured schema (scores, issues, screenshots, telemetry).
- [x] Evaluation generates `docs/critic-reports/latest.md` with executive summary and ranked issues list.
- [x] Root `package.json` includes `critic:run` and `build:verify` script commands.
- [x] End-to-end execution passes or produces clear actionable issue list for the builder.

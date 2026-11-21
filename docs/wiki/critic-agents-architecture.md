# Critic Agents Architecture

On 2026-11-19, at commit `c7e8316`, the team agreed on the multi-agent post-build critic evaluation architecture ([ADR 0003](../../docs/adr/0003-multi-agent-critic-quality-gate.md)).

## Context

Medix requires rigorous visual, UX, and functional verification across three user personas (Admin, Doctor, Patient) on Desktop (1440×900) and Mobile (390×844) viewports.

## Key Decisions

1. **Harness + Multimodal Critic Agents**: A Playwright runner executes end-to-end user journeys, records console errors, captures network failures, and stores screenshots in `docs/critic-reports/screenshots/`. Multimodal Critic Agents evaluate these visual artifacts and DOM states against [DESIGN.md](../../DESIGN.md) tokens and Impeccable heuristics.
2. **Deterministic Seed & State Reset**: Prior to each critic pass, a dedicated seed runner (`pnpm db:seed:critic`) resets mutable appointment slots and provisions disposable credentials from `.env` to prevent database pollution or collision.
3. **Execution Command**: The suite is triggered via `pnpm critic:run` or `pnpm build:verify` rather than attaching directly to incremental `pnpm build`.
4. **Pass Gate**: Every agent must score ≥ 8.5/10 with zero console errors and zero network failures.
5. **Remediation Report**: Failed evaluations output machine-readable `docs/critic-reports/latest.json` and `docs/critic-reports/latest.md` for the Builder Agent.

## Implementation Progress

- **2026-11-19**: TICK-033 completed. Native CDP Browser harness (`scripts/critic-harness/cdp-browser.ts`), high-level orchestrator (`scripts/critic-harness/harness.ts`), and deterministic test database seeder (`scripts/seed-critic.ts` and `backend/src/app/utils/seed-critic.ts`) built and verified with zero extra npm dependencies. Desktop (`1440x900`) and mobile (`390x844`) viewport emulation, console error trapping, network error logging, and screenshot capture all operational.
- **2026-11-19**: TICK-034, TICK-035, and TICK-036 completed. Full multi-agent evaluation suite (`pnpm critic:run`) executed across Admin, Doctor, and Patient personas. Fixed Next.js image parsing regression for Lucide specialty icons and corrected patient route paths. The platform passed with a composite score of **9.43 / 10.0** (Admin: 9.3, Doctor: 9.4, Patient: 9.6) with zero broken flows, zero console errors, zero network errors, and 35 screenshots captured in `docs/critic-reports/screenshots/`. Verified in [docs/critic-reports/latest.md](../../docs/critic-reports/latest.md).

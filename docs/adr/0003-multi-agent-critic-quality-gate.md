# ADR 0003: Multi-Agent Critic Quality Gate for End-to-End Visual & UX Verification

- **Status**: Accepted
- **Date**: 2026-11-19

## Context & Decision

To prevent UI degradation, accessibility issues, broken user flows, and silent runtime console/network errors from escaping into production, we introduce an automated post-build quality gate enforced by three autonomous Critic Agents (Admin, Doctor, Patient). We decided to pair a deterministic browser automation harness (handling authentication, multi-viewport navigation, console/network telemetry trapping, and high-resolution screenshot generation) with specialized LLM visual/UX evaluation agents scoring each persona across four weighted pillars (Visual Design, UX Ergonomics, Responsiveness, Functional Robustness) against a non-negotiable pass threshold of ≥ 8.5/10 and zero errors.

## Considered Options

1. **Pure Manual QA**: High human overhead, non-deterministic, and slow turnaround for rapid agentic iteration cycles.
2. **Standard Assertion-Only E2E (e.g., standard headless Playwright checks only)**: Validates functional presence of DOM elements and click flows, but is blind to visual dissonance, improper spacing/typography clamp, unpolished hierarchy, and aesthetic quality.
3. **Pure Interactive LLM Agent driving browser live turn-by-turn**: Extremely high token consumption, slow execution across multi-page role workflows, prone to navigational drift, and difficult to reproduce deterministically.
4. **Hybrid Orchestrated Harness + Multimodal Critic Agents (Selected)**: Deterministic execution of end-to-end workflows and state capture across desktop and mobile viewports, coupled with multimodal LLM visual inspection evaluating against `DESIGN.md` tokens and `impeccable` craft principles.

## Consequences

- Monorepo tooling gains a formal critic execution harness and report generator in `docs/critic-reports/`.
- Builds must pass all three agent evaluations (≥ 8.5/10) with zero console/network errors before promotion or merge.
- When an evaluation fails, a machine-readable ranked issue report is emitted for the Builder Agent to resolve automatically.

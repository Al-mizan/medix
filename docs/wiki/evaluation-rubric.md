# Critic Evaluation Rubric

On 2026-11-19, at commit `c7e8316`, the scoring rubric for Medix Critic Agents was standardized to evaluate visual craft, UX ergonomics, responsiveness, and functional reliability.

## Scoring Pillars

1. **Visual Craft & Tokens (25% - max 2.5 pts)**
   - Strict adherence to `DESIGN.md` design tokens (Clarity Teal `#0B7285`, Vital Emerald `#178A5E`, Terracotta `#C4431D`).
   - Clean typographic scale with fluid clamps, proper font hierarchy (`Geist`), card elevation, and absence of generic AI aesthetic patterns.
2. **UX Ergonomics & Interaction (25% - max 2.5 pts)**
   - Clear task hierarchy, minimal cognitive load, responsive feedback on interactions.
   - Skeletons on loading, informative empty states, and inline form validation with non-cryptic error messaging.
3. **Responsiveness & Cross-Viewport (25% - max 2.5 pts)**
   - Desktop (1440×900) and Mobile (390×844) viewport parity.
   - Touch targets ≥ 44×44px on mobile, responsive side navigation/drawers, and zero horizontal scrolling bugs.
4. **Functional Robustness (25% - max 2.5 pts)**
   - Smooth completion of role-specific workflows (Admin: create doctor/admin, manage tables; Doctor: appointments, prescriptions, schedules; Patient: browse, book, view records).
   - Zero broken interactive links or modal traps.

## Circuit Breakers (Automatic Failure)

- Any browser `console.error` or unhandled promise rejection immediately drops Pillar 4 to 0, capping the total score to ≤ 7.5.
- Any network request resulting in unexpected 4xx (except legitimate validation feedback) or 5xx server errors immediately drops Pillar 4 to 0.
- Overall score < 8.5 triggers an automated issue report for the Builder Agent.

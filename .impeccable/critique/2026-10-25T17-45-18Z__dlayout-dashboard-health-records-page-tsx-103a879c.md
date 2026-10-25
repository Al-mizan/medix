---
target: frontend/src/app/(dashboardLayout)/dashboard/health-records/page.tsx
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/mnt/workspace/Projects/hobby/digital-healthcare/frontend/src/app/(dashboardLayout)/dashboard/health-records/page.tsx"
target_fingerprint: "sha256:fbe723ec51585864ebc4e915be4e64947e22dd9030e04ae600ca3da5a9d0404f"
target_path: /mnt/workspace/Projects/hobby/digital-healthcare/frontend/src/app/(dashboardLayout)/dashboard/health-records/page.tsx
timestamp: 2026-10-25T17-45-18Z
slug: dlayout-dashboard-health-records-page-tsx-103a879c
closed: true
---
# Health Records & Clinical Profile Design Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Lacks upload progress indicator for files up to 10MB; no profile completeness gauge; no "last saved" timestamp. |
| 2 | Match System / Real World | 2 | Height and weight are freeform strings with no unit toggle or BMI; "Pregnant" toggle visible for male patients. |
| 3 | User Control and Freedom | 3 | Good back navigation and delete dialog, but lacks "Discard Changes" and has no unsaved-changes protection. |
| 4 | Consistency and Standards | 2 | Violates Semantic Separation Rule by using Terracotta (`bg-accent`) for save/upload; hardcoded Tailwind classes leak past tokens. |
| 5 | Error Prevention | 2 | DOB is capped to today and delete has confirmation, but height/weight accept arbitrary strings. |
| 6 | Recognition Rather Than Recall | 3 | Blood group dropdown writes full names, but form errors fail to show inline on failed fields. |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; no drag-and-drop dropzone; single-file upload only with no batch capability. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean rectilinear cards and disciplined borders, but upload dashed sub-card creates visual clutter inside card. |
| 9 | Error Recovery | 1 | Critical failure: Form validation errors are NOT rendered inline on input fields, leaving inputs unmarked and unfocused. |
| 10 | Help and Documentation | 2 | Basic subtitle exists, but no contextual guidance explaining why sensitive mental health data is collected. |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment**: The health records interface sits between a generic shadcn/ui CRUD admin form and a clinical healthcare system. While the palette uses Clarity Teal and Vital Emerald for section headers, the primary action buttons ("Save Health Profile" and "Upload Document") mistakenly use Terracotta (`bg-accent`), which violates Medix DESIGN.md (Terracotta is reserved for high-intent conversion actions like booking). Furthermore, several components leak raw Tailwind colors like `bg-emerald-500/10` and `bg-[#FCEBEB]` instead of design system tokens, and numeric vitals lack the Tabular Data Mandate (`font-mono` / `tabular-nums`).

**Deterministic scan**: Scanned 9 target files (`page.tsx`, `HealthRecordsClient.tsx`, `_action.ts`, `HealthRecordsForm.tsx`, `MedicalReportsSection.tsx`, and 4 demographic/biometric/condition/lifestyle components) with `impeccable detect`. 0 regex violations detected (`[]`).

**Visual overlays**: Direct in-browser mutation skipped because `/dashboard/health-records` is server-gated by JWT session cookies and redirects unauthenticated headless browser requests to `/login`.

## Overall Impression
The interface has a clean rectilinear card foundation and thoughtful safe input handlers, but suffers from high cognitive load (two competing forms on one scrolling pane), disconnected error recovery (errors appear in an alert at the top rather than inline on inputs), and violation of Medix semantic button color tokens.

## What is Working
1. **Disciplined Card Architecture**: Clean rectilinear geometry (`rounded-xl`, `border-border`, `shadow-xs`) with consistent header badging and balanced interior spacing.
2. **Defensive Deletion Safeguards**: Accessible `AlertDialog` for report deletion with explicit confirmation copy preventing accidental clinical data loss.
3. **Defensive Date Clamping**: Date of birth is clamped to today (`max={today}`) and date strings are safely sanitized.

## Priority Issues
- **[P1] Disconnected Form Validation & Lack of Inline Error Anchoring**: Errors from form validation are only displayed in a top alert and toast; inputs never get red borders, `aria-invalid`, or inline error captions.
- **[P1] Violation of Semantic Color Rules & Token Leakage**: Save and Upload buttons use high-intent Terracotta (`bg-accent`) instead of operational Clarity Teal (`bg-primary`); raw hexes and palette classes leak past tokens.
- **[P2] Clinically Shallow Binary Toggles & Impossible States**: Allergies/conditions lack subfields for specifics, and "Pregnant" toggle is editable even if gender is MALE.
- **[P2] Fragmented Dual-Submit Architecture & Primitive Upload**: Two separate forms on one scroll view compete for attention; report upload has no drag-and-drop dropzone or progress bar.
- **[P3] Freeform Biometric Inputs & Missing Tabular Figures**: Height and weight are freeform strings with no unit toggle or BMI calculator, and numbers lack `font-mono` / `tabular-nums`.

## Persona Red Flags
- **Alex (Power User)**: No keyboard shortcuts (Cmd+S); no batch multi-file upload; cannot edit report titles in-place.
- **Jordan (First-Timer)**: Confused whether uploading a report also saves the health profile form; uncertain how to format height/weight.
- **Sam (Accessibility)**: Screen reader does not announce which fields failed validation because fields lack `aria-invalid` and inline error links.
- **Riley (Stress Tester)**: Can select Gender: MALE and toggle Pregnant: true; can lose unsaved form edits on back navigation without warning.

## Minor Observations
- Missing calculated age beside Date of Birth.
- Uploaded report cards lack file size and MIME type indicators.
- "Back to Dashboard" text is optically small (`text-xs`).

## Questions to Consider
- What if the surface featured an executive summary card with vital indicators and a dedicated tabbed/segmented layout between Clinical Profile and Medical Reports?
- What if allergens allowed typing specific medical allergies (e.g. Penicillin) with severity?

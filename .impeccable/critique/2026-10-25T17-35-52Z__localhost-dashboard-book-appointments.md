---
target: "http://localhost:3000/dashboard/book-appointments"
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "url:http://localhost:3000/dashboard/book-appointments"
timestamp: 2026-10-25T17-35-52Z
slug: localhost-dashboard-book-appointments
closed: true
---
Method: dual-agent (A: f24566b7-60ab-44e1-90fa-e79c86a8c9ac · B: 218dff37-b765-48ff-8dfb-48461af2bda3)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Mutation disables buttons, but conceals external Stripe redirect and hides the 30-minute auto-cancellation window |
| 2 | Match System / Real World | 2 | Relies on engineering checkout jargon ("Stripe payment supported") rather than clinical telemedicine context |
| 3 | User Control and Freedom | 1 | Navigating back from Stripe locks the slot with an unrecoverable "Slot unavailable" error |
| 4 | Consistency and Standards | 1 | Violates DESIGN.md: ad-hoc cyan/blue gradient, non-standard rounded-2xl, missing tabular figures and Terracotta CTA |
| 5 | Error Prevention | 1 | No warning that "Pay Later" releases the slot after 30 minutes; direct sidebar link lands on destructive error |
| 6 | Recognition Rather Than Recall | 2 | User must recall consultation medium (video vs clinic), preparation guidelines, and patient identity |
| 7 | Flexibility and Efficiency | 2 | No inline slot switcher or alternative schedule preview if selected time is suboptimal |
| 8 | Aesthetic and Minimalist Design | 2 | Top pastel gradient banner collapses text contrast in dark mode; redundant timestamp card repetition |
| 9 | Error Recovery | 1 | Harsh destructive alerts with no self-service recovery paths or slot rescheduling |
| 10 | Help and Documentation | 1 | Zero guidance on telemedicine hardware prerequisites, cancellation policies, or BDT pricing breakdown |
| **Total** | | **15/40** | **Poor (Critical Overhaul Required)** |

#### Design Specificity Verdict

**LLM assessment**: The booking confirmation screen currently functions as a generic e-commerce checkout box rather than Medix's "Precision Clinic". It lacks telemedicine context (WebRTC encrypted video, 30-min duration, BMDC doctor credentials, patient identity) and abandons core design system tokens—using an uncalibrated pastel gradient that turns illegible in dark mode, misusing Vital Emerald badges for billing, and omitting Terracotta on the high-intent transaction button.

**Deterministic scan**: Source scan on JSX files was clean (`[]`). Headless browser scan of `http://localhost:3000/dashboard/book-appointments` encountered HTTP 307 redirect to `/login` because the dashboard route requires authentication. Code-level audit identified 8 critical token and semantic violations against `DESIGN.md`.

**Visual overlays**: Overlay injection was redirected to `/login` due to authentication middleware. Code-level inspection verified across AST and styling rules.

#### Overall Impression
The appointment booking confirmation functions mechanically, but suffers from clinical anonymity, brand design token deviations, an accessibility contrast failure in dark mode, and an urgent usability trap where "Pay Later" silently cancels the patient's appointment after 30 minutes without clear warning.

#### What's Working
1. **Responsive Two-Column Layout**: Clean spatial split between clinical doctor/schedule data on the left and financial commitment on the right (`lg:grid-cols-[1.2fr_0.8fr]`).
2. **Defensive Async Mutation States**: Both booking buttons disable simultaneously during mutation with clear pending copy, preventing duplicate submissions.
3. **Safe Date Formatting**: Robust fallback handling in `formatDateTime` preventing client crashes on invalid dates.

#### Priority Issues

- **[P0] Dark Mode Contrast Collapse on Hero Banner**: `bg-linear-to-r from-cyan-50 via-white to-blue-50` produces near-zero contrast (~1.05:1) in dark mode when text becomes white.
  - *Fix*: Remove the ad-hoc gradient and apply system card tokens `bg-card border border-border text-card-foreground`.
  - *Suggested command*: `/impeccable polish`
- **[P0] The 30-Minute Silent Cancellation Ambush ("Pay Later" Trap)**: The copy promises "Pay later keeps the booking in your appointments list", but backend cron cancels unpaid appointments after 30 minutes, releasing the slot without user awareness.
  - *Fix*: Add an explicit 30-minute reservation notice and visual warning banner explaining the hold window.
  - *Suggested command*: `/impeccable polish`
- **[P1] Dashboard Navigation Dead-End**: Clicking "Book Appointment" in patient sidebar without query parameters triggers an aggressive destructive red alert.
  - *Fix*: Route sidebar to `/consultation`, and update `page.tsx` empty state to provide a warm clinical directory redirect instead of a destructive error.
  - *Suggested command*: `/impeccable polish`
- **[P1] Stripe Back-Button Lockout Trap**: Returning from Stripe after starting checkout shows "Slot is no longer available" because `isBooked` was set to true.
  - *Fix*: Allow resuming payment if the slot is held by the current patient with `paymentStatus: UNPAID`.
  - *Suggested command*: `/impeccable polish`
- **[P2] Medix Design System Non-Compliance & Tabular Mandate**: Primary CTA is Teal instead of Terracotta Accent; prices and timestamps lack `font-mono tabular-nums` and BDT denomination; corner radii use non-standard `rounded-2xl` instead of `rounded-xl`.
  - *Fix*: Re-align all buttons, typography, badges, and radii strictly with `DESIGN.md`.
  - *Suggested command*: `/impeccable polish`

#### Persona Red Flags
- **Alex (Power User)**: Forced to calculate duration manually from start/end times; lacks keyboard submission shortcuts.
- **Jordan (First-Timer)**: Intimidated by "Stripe payment supported"; selects "Pay Later" assuming permanent reservation and loses slot after 30 minutes.
- **Sam (Accessibility-Dependent)**: Fails WCAG AA in dark mode; `role="alert"` placed on static informational callout interrupts screen reader; missing heading hierarchy (`CardTitle` renders as `div`).
- **Riley (Stress Tester)**: Back-button navigation from checkout traps user in a false "slot taken" error.
- **Casey (Distracted Mobile)**: Interrupted while booking; returns after 35 minutes to find slot silently deleted.

#### Minor Observations
1. Redundant full date display in both "Starts" and "Ends" cards; can be unified into a clean single schedule block with duration badge.
2. Raw `"N/A"` displays when optional doctor profile fields are empty.
3. "Back to Doctor Details" ghost button lacks adequate prominence.

#### Questions to Consider
1. How should the 30-minute payment countdown be communicated to maximize reassurance while preventing slot squatting?
2. Should empty query navigation on `/dashboard/book-appointments` seamlessly render the consultation doctor browser inline?

---
name: Medix Design System
description: Clinical precision, architectural restraint, and dependable telemedicine care
colors:
  primary: "#0B7285"
  primary-hover: "#095E70"
  secondary: "#178A5E"
  secondary-hover: "#0F6E4A"
  accent: "#C4431D"
  accent-hover: "#A83614"
  ai: "#5B4FCF"
  ai-hover: "#4A3FB8"
  background: "#F7F8FA"
  surface: "#FFFFFF"
  border: "#E3E6EB"
  text-primary: "#101828"
  text-secondary: "#5B6472"
  text-muted: "#5B6472"
  muted: "#F0F2F5"
  warning: "#E3A130"
  danger: "#D8464B"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.02em"
  caption:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
  micro:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.1
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "16px 32px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Medix

## Overview

**Creative North Star: "The Precision Clinic"**

Medix embodies the atmosphere of a modern, world-class clinic: architectural clarity, quiet clinical authority, and calm reassurance. Visual elements are governed by strict spatial discipline, crisp typography, and restrained surfaces that instill immediate trust in patients managing sensitive healthcare decisions.

The design avoids both sterile, bureaucratic medical software aesthetics and overly playful, frivolous consumer consumer-tech tropes. Every surface communicates clarity of status, transparent pricing in BDT, and immediate access to clinical triage.

**Key Characteristics:**
- **Architectural Grid Restraint**: Rigorous alignment, generous breathing room, and structured columnar layouts.
- **Calibrated Semantic Palette**: Distinct chromatic lanes for clinical navigation (Clarity Teal), active status/health (Vital Emerald), decisive bookings (Terracotta), and clinical AI (Assist Violet).
- **Layered Surface Truth**: Flat by default with razor-thin hairline borders; elevation is structural, appearing only on floating overlays, sheets, and modal dialogs.
- **Dignified Data Presentation**: Clear tabular structures, explicit appointment lifecycle badges, and high-contrast clinical reports.

## Colors

The Medix palette pairs serene clinical clarity with decisive action accents, balanced by neutral slate paper tones.

### Primary
- **Clarity Teal** (`#0B7285` / dark: `#159AB2`): The foundational anchor for navigation, clinical branding, primary actions, and focused rings. Used on interactive buttons, active tab indicators, and primary icons.

### Secondary
- **Vital Emerald** (`#178A5E` / dark: `#1FAD77`): Signals health vitality, confirmed appointments, available schedules, and successful diagnostic records. Never used for destructive states.

### Tertiary (Accent & AI)
- **Terracotta Accent** (`#D9542E` / dark: `#E26845`): Reserved strictly for high-intent conversion actions, such as instant consultation booking and payment authorizations.
- **Assist Violet** (`#5B4FCF` / dark: `#7B70E0`): Dedicated exclusively to Medix AI clinical assistant, RAG-grounded responses, and intelligent suggestions.

### Neutral
- **Deep Slate Foreground** (`#101828` / dark: `#F7F8FA`): High-legibility text neutral for primary headings and data values.
- **Muted Slate** (`#5B6472` / dark: `#8A93A3`): Secondary descriptive text, metadata labels, and helper notes.
- **Clinical Paper Background** (`#F7F8FA` / dark: `#0D131A`): Soft, glare-free foundational canvas.
- **Pure Surface Card** (`#FFFFFF` / dark: `#141C24`): Crisp elevated card and panel background.
- **Hairline Border** (`#E3E6EB` / dark: `#242E3B`): Hairline boundary defining structural hierarchy.

### Named Rules
**The Semantic Separation Rule.** Each chromatic hue holds exclusive ownership over its domain: Teal owns navigation/branding, Emerald owns health/availability, Terracotta owns transactional booking/checkout, and Violet owns clinical AI. They never substitute for one another.

**The Tint Pair Doctrine.** Every status badge or contextual pill must pair its solid semantic foreground with its designated 10% tint background (e.g. `var(--tint-secondary-bg)` with `var(--tint-secondary-text)`). Badges never use raw opacity overlays that muddy text contrast.

## Typography

**Display & Body Font:** Geist Sans (`--font-geist-sans`, fallback: `system-ui, -apple-system, sans-serif`)  
**Monospace / Numerical Font:** Geist Mono (`--font-geist-mono`, fallback: `ui-monospace, monospace`)

**Character:** Modern, neutral, neo-grotesque precision. Highly legible tabular figures in Geist Mono ensure instant comprehension of financial fees, appointment slots, and patient vital signs.

### Hierarchy
- **Display** (800 weight, `clamp(2.25rem, 5vw, 3.75rem)`, line-height 1.08, letter-spacing -0.02em): Public landing hero headlines.
- **Headline** (700 weight, `clamp(1.75rem, 3vw, 2.25rem)`, line-height 1.2, letter-spacing -0.015em): Major section headers, portal view titles.
- **Title** (600 weight, 1.25rem / 20px, line-height 1.3): Card headers, doctor specialty headers, dialog titles.
- **Body** (400 weight, 0.9375rem / 15px, line-height 1.6, max-width 68ch): Clinical consultation notes, article copy, patient instructions.
- **Label** (600 weight, 0.75rem / 12px, letter-spacing 0.02em, uppercase or title-case): Table headers, status pills, doctor schedule slots.

### Named Rules
**The Tabular Data Mandate.** All financial prices (BDT), clinical timestamps, and health metrics (blood pressure, pulse, test units) must render with tabular figures (`font-mono` or `tabular-nums`) to prevent optical jitter and visual misalignment in dense schedules.

## Layout

Medix utilizes a 12-column responsive layout grid anchored to a maximum container width of `1280px` (`max-w-7xl`).

- **Spacing Rhythm**: Scaled on an 8px baseline rhythm (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Dashboard Grid**: Two-column layout with a fixed/collapsible 260px administrative/clinician sidebar and a fluid, auto-flowing workspace pane.
- **Density**: Moderate-high density in clinical and doctor portals (Operate mode) to minimize scrolling during consultation; spacious, airy density on the public homepage (Persuade mode).

## Elevation & Depth

Medix employs a **Layered & Restrained** elevation model. Depth is established through subtle background-to-surface contrast and razor-thin hairline borders (`border-border`), rather than heavy drop shadows.

Surfaces rest flat on the canvas. Shadows appear strictly as interactive feedback (hovering clickable doctor cards) or to establish z-index prominence for floating sheets, dropdowns, and modals.

### Shadow Vocabulary
- **Resting Surface**: `box-shadow: none` (flat with `border border-border`).
- **Hover Micro-Lift**: `box-shadow: 0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.04)` on interactive cards.
- **Floating Overlays**: `box-shadow: 0 10px 15px -3px rgba(16, 24, 40, 0.08), 0 4px 6px -4px rgba(16, 24, 40, 0.03)` on popovers, dropdowns, and dialogs.

### Named Rules
**The Flat-By-Default Rule.** Content cards, data tables, and input fields never carry default box shadows. Structural boundaries are achieved exclusively via background separation and hairline border strokes.

## Shapes

- **Form Language**: Disciplined, soft-rectilinear geometry.
- **Corner Radii**:
  - `rounded-md` (`8px`): Form inputs, standard buttons, dropdown menus, table headers.
  - `rounded-xl` (`14px`): Content cards, clinical summary containers, dialogue modals.
  - `rounded-full` (`9999px`): Status pills, specialty filter chips, avatar badges.
- **Borders**: Continuous 1px solid stroke (`border-border`). Never use dashed or thick decorative borders on primary content.

## Components

### Buttons
- **Shape**: Rounded rectangle (`rounded-md`, 8px).
- **Primary**: Background Clarity Teal (`#0B7285`), text white (`#FFFFFF`), hover darkened (`#095E70`), 3px focus ring on focus-visible.
- **Secondary**: Vital Emerald (`#178A5E`), text white, for confirmation and health actions.
- **Accent**: Terracotta (`#D9542E`), prominent 16px/32px padding, for booking consultations.
- **Outline / Ghost**: Hairline border with subtle background tint on hover.

### Chips & Badges
- **Shape**: Pill (`rounded-full`, 9999px).
- **Style**: Semantic foreground paired with matching tint background (e.g., `text-tint-secondary-text bg-tint-secondary-bg`).
- **Live State**: Pulsing 8px emerald dot indicator for active/available clinicians.

### Cards / Containers
- **Corner Style**: Rounded `14px` (`rounded-xl`).
- **Background**: Surface white (`#FFFFFF`) / dark obsidian (`#141C24`).
- **Border**: 1px solid `var(--color-border)`.
- **Padding**: 24px (`p-6`) standard interior padding.

### Inputs / Form Fields
- **Style**: Hairline border `border-input`, subtle background, `rounded-md`.
- **Focus**: `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50`.
- **Invalid**: High-visibility danger ring `aria-invalid:ring-destructive/20`.

### Navigation
- Public header with sticky backdrop-blur, brand mark, clean text links, and high-visibility portal action.
- Dashboard sidebar with role-aware groupings (Patient, Doctor, Admin), collapsible states, and active route teal pill markers.

## Do's and Don'ts

### Do:
- **Do** format all consultation fees with currency denomination (e.g., `৳ 1,200 BDT`) and tabular figures.
- **Do** use explicit state pills (`SCHEDULED`, `INPROGRESS`, `COMPLETED`, `CANCELED`) with consistent semantic colors across all screens.
- **Do** maintain a strict 4.5:1 text-to-background contrast ratio for all clinical data and form labels.
- **Do** reserve Assist Violet exclusively for features touching the Medix AI clinical assistant.

### Don't:
- **Don't** use bounce or elastic easing for loading spinners, drawers, or dialogs; use smooth exponential ease-out curves.
- **Don't** apply thick colored side-tab borders on content cards (e.g. `border-l-4`).
- **Don't** use saturated red for non-destructive actions; red is strictly reserved for failed payments, cancellations, and clinical allergies.
- **Don't** fabricate artificial testimonials or false medical guarantees.

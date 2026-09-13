# Medix — Frontend Color Palette

> A calm, trustworthy base (teal + emerald) with one warm accent for CTAs and a
> dedicated violet reserved for the AI assistant — so patients can tell at a
> glance what's clinical vs. AI-generated. Designed to avoid the generic
> "hospital blue/green" look while staying minimal and accessible.

---

## Core palette

| Role | Name | Hex | Hover / pressed | Usage |
|---|---|---|---|---|
| Primary | Clarity teal | `#0B7285` | `#095E70` | Buttons, links, active nav, primary brand color |
| Secondary | Vital emerald | `#178A5E` | `#0F6E4A` | Paid, completed, verified-doctor states |
| Accent | Terracotta | `#D9542E` | `#B8431F` | "Book appointment," payment CTAs, key actions |
| AI | Assist violet | `#5B4FCF` | `#4A3FB8` | RAG assistant chat, AI-generated content, "Ask Medix AI" |

## Status colors

Maps directly to the appointment / payment state machine (`FR-APPT-07`, `FR-PAY-01`).

| Status | Hex | Used for |
|---|---|---|
| Success | `#178A5E` (reuses Vital emerald) | `PAID`, `COMPLETED` |
| Info | `#0B7285` (reuses Clarity teal) | `SCHEDULED` |
| Warning | `#E3A130` | `UNPAID`, `INPROGRESS`, pending |
| Danger | `#D8464B` | `CANCELED`, `FAILED`, `BLOCKED` |

## Tint pairs

Light background + matching dark text for badges, chips, and soft surfaces — never pair a tint with plain black or gray text.

| Family | Tint background | Tint text |
|---|---|---|
| Primary (teal) | `#E1F3F6` | `#075463` |
| Secondary (emerald) | `#E3F7EE` | `#0F5C3E` |
| Accent (terracotta) | `#FBEAE3` | `#8A3016` |
| AI (violet) | `#ECEAFB` | `#3E3595` |
| Warning (amber) | `#FBF0DC` | `#7A4A09` |
| Danger (red) | `#FCEBEB` | `#7A2323` |

## Neutrals

| Token | Hex | Usage |
|---|---|---|
| Background | `#F7F8FA` | App/page background (warm off-white, not stark clinical white) |
| Surface | `#FFFFFF` | Cards, modals, inputs |
| Border | `#E3E6EB` | Dividers, card outlines, input borders |
| Text primary | `#101828` | Headings, body text |
| Text secondary | `#5B6472` | Supporting text, metadata |
| Text muted | `#8A93A3` | Placeholders, timestamps, hints |

---

## Rationale

- **Teal as primary** — sits between blue's trust and green's health association in a single hue, so one color does both jobs instead of the generic dual blue-and-green look most telehealth apps default to.
- **Emerald kept distinct from teal** — so "paid / completed / verified" reads at a glance without relying on primary-vs-accent contrast alone.
- **One warm accent (terracotta), used sparingly** — reserved for the highest-intent action only (booking, payment) so it never competes with itself. This is the "friendly, not clinical" move without going as loud as a full yellow-led rebrand.
- **Violet reserved exclusively for AI** — purple has become the de facto signal color for AI features across products; giving the RAG assistant its own hue is functional wayfinding, not decoration, in a product where clinical accuracy matters.
- **Warm-neutral background** instead of stark white — softens the "sterile hospital" feeling while staying minimal.

## Portal differentiation (optional)

| Portal | Emphasis |
|---|---|
| Patient app | Teal + terracotta — approachable, booking-forward |
| Doctor console | Teal + neutral only, drop terracotta — clinical, less playful |
| Admin panel | Mostly grayscale, color reserved for status badges only — data-dense, sober |

---
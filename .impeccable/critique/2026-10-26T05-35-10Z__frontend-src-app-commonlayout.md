---
target: Home page, mobile sidebar drawer, and consultation search & filters
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 4
target_identity: "file:/mnt/workspace/Projects/hobby/digital-healthcare/frontend/src/app/(commonLayout)"
timestamp: 2026-10-26T05-35-10Z
slug: frontend-src-app-commonlayout
closed: true
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3 | Good skeletons and search spinner, but consultation toolbar lacks a live result count and sort is hidden |
| 2 | Match System / Real World | 2 | Search placeholder asks for doctor "email", fee range lacks ৳ BDT symbol, fabricated HIPAA/ISO claims |
| 3 | User Control and Freedom | 2 | Mobile Sheet drawer lacks vertical scrolling, trapping users on short screens; Sticky CTA self-loops on `/consultation` |
| 4 | Consistency and Standards | 2 | Single-select applies immediately while MultiSelect and Range require "Apply"; box shadows violate flat-by-default rule |
| 5 | Error Prevention | 2 | Range filter allows Min > Max without warning; backend sort query syntax mismatch (`sort=-averageRating`) breaks rating order |
| 6 | Recognition Rather Than Recall | 2 | 20+ specialties listed in a cramped 208px box with no search bar; mobile nav links lack active location indicators |
| 7 | Flexibility and Efficiency | 2 | No keyboard accelerators (e.g. `/` to focus search); sorting requires opening an off-canvas select menu |
| 8 | Aesthetic and Minimalist Design | 3 | Clean architectural grid, but `HeroPreviewCard` non-functional media buttons and duplicate mockups add visual noise |
| 9 | Help Users Recognize & Recover from Errors | 3 | Polished empty state with search reset button, but inverted fee range queries silently return 0 results with no guidance |
| 10 | Help and Documentation | 3 | 24/7 Hotline telephone links across header, drawer, and footer, but missing `SheetDescription` for screen readers |
| **Total** | | **24/40** | **Acceptable (Significant improvements needed before release)** |

#### Design Specificity Verdict

**LLM assessment**: Medix establishes a compelling "Precision Clinic" aesthetic anchored in genuine telemedicine workflows—including real-time patient vitals HUDs, BMDC-verified doctor identities, explicit ৳ BDT pricing, and emergency triage advisories. However, this clinical authority is compromised by three distinct failure modes: (1) unverified compliance claims (HIPAA, ISO 27001) that directly violate `PRODUCT.md`; (2) desktop and mobile interaction traps (non-scrollable mobile drawer on short screens, interactive-looking decoy media buttons in the hero); and (3) administrative data leaks (prompting patients to search doctors by their internal account "email").

**Deterministic scan**: Telemetry across desktop and mobile viewports identified 18 warnings and 14 advisories. Key mechanical findings:
- Low-contrast tint pairing in `WhyChooseSection.tsx:110` (`text-secondary` on `bg-tint-secondary-bg` yields 3.9:1, failing WCAG AA 4.5:1).
- Heading hierarchy skips in `HeroPreviewCard.tsx:83` (`<h3>` directly follows `<h1>` without intermediate `<h2>`).
- Sub-44px touch targets on mobile menu triggers (`size-10` = 40px), drawer close buttons (`~20px`), and search clear buttons (`24px`).
- Widespread use of resting box shadows (`shadow-2xs`, `shadow-xs`, `shadow-sm`) violating `DESIGN.md:181-183` ("Flat-By-Default Rule").
- Query contract mismatch: `page.tsx` and `TopDoctorsSection.tsx` pass `sort=-averageRating` which the backend rejects, displaying doctors in arbitrary order instead of by rating.

**Visual overlays**: Audited in live Next.js environment (`http://localhost:3000` and `/consultation`).

#### Overall Impression
The visual craftsmanship and typography are dignified, restrained, and unmistakably clinical. However, critical gaps in mobile ergonomics (non-scrolling drawer, iOS safe area collisions), compliance integrity (fabricated HIPAA badges), and consultation filter usability (unsearchable 20-item specialty list, inverted range handling) undermine user trust and task completion.

#### What's Working
1. **Clinical Telemedicine Grounding**: The hero preview card with real-time vitals HUD (BPM 72, BP 120/80) and BMDC verification shields anchors the experience in authentic healthcare.
2. **Defensive Async States & Skeletons**: High-fidelity skeletons in `SpecialtiesSection` and `TopDoctorsSection` prevent layout shift during TanStack Query resolution.
3. **Emergency Duty of Care**: The emergency triage banner in `LandingFooter` ("If experiencing acute chest pain... call 999/911") provides essential clinical governance.

#### Priority Issues

- **[P0] Mobile Sheet Drawer Vertical Clipping on Short Viewports**: `SheetContent` in `Navbar.tsx` uses `h-full flex flex-col justify-between` without `overflow-y-auto`. On screens $\le 700\text{px}$ or landscape mode, action buttons ("Sign In", "Book Appointment") and hotline info are permanently cut off.
  - *Fix*: Wrap drawer content in a flex-1 `overflow-y-auto` scroll container and add iOS safe-area bottom padding.
  - *Suggested command*: `/impeccable adapt`
- **[P0] Backend Sort Query Serialization Defect in Top Doctors**: `page.tsx:63` and `TopDoctorsSection.tsx:15` pass `sort=-averageRating`, which `QueryBuilder.ts` fails to parse, falling back to insertion order instead of sorting top-rated doctors.
  - *Fix*: Change query string to `sortBy=averageRating&sortOrder=desc&limit=6`.
  - *Suggested command*: `/impeccable polish`
- **[P1] Fabricated Compliance Badges Violating PRODUCT.md**: `StatsSection.tsx:121, 125`, `LandingFooter.tsx:97, 114`, and `CookieConsentBanner.tsx:110` display "HIPAA & 256-Bit" and "ISO 27001", directly violating `PRODUCT.md:62`.
  - *Fix*: Replace fabricated badges with verifiable clinical security standards: "BMDC Code of Conduct", "256-Bit TLS Encryption", and "Strict Patient Confidentiality".
  - *Suggested command*: `/impeccable clarify`
- **[P1] Sticky Mobile CTA iOS Safe-Area Collision & Consultation Redundancy**: `StickyMobileCTA.tsx` lacks `env(safe-area-inset-bottom)` and collides with the iOS home indicator. On `/consultation`, it displays a redundant link ("Browse All Specialists") that loops to itself.
  - *Fix*: Add `pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]`, increase layout bottom padding, and hide or adapt the button on `/consultation`.
  - *Suggested command*: `/impeccable adapt`
- **[P1] Consultation Search Placeholder Internal Database Leak**: `DoctorsListToolbar.tsx:51` search placeholder reads `"Search doctor by name, qualification, email..."`. Exposing doctor email confuses patients.
  - *Fix*: Change placeholder to `"Search by doctor name, specialty, or hospital..."`.
  - *Suggested command*: `/impeccable clarify`
- **[P1] Unvalidated Fee Range & Unsearchable 20+ Specialty MultiSelect**: `RangeFilterControl.tsx` allows Min > Max without validation and lacks `৳ BDT` labels. `MultiSelectFilterControl.tsx` forces manual scrolling across 20+ specialties without an inline search filter.
  - *Fix*: Enforce Min $\le$ Max constraint with `৳ BDT` prefix; add sticky filter search bar inside the MultiSelect popover.
  - *Suggested command*: `/impeccable clarify`

#### Persona Red Flags
- **Casey (Distracted Mobile User)**: On an iPhone, the bottom Sticky CTA directly overlaps the iOS home swipe bar. Opening the mobile drawer in landscape view cuts off the booking buttons.
- **Jordan (Confused First-Timer)**: Wondering why the search box asks for a doctor's personal email, and confused by fee range inputs that display raw numbers without currency symbols.
- **Sam (Accessibility-Dependent User)**: Screen reader warns about missing `SheetDescription` in `Navbar.tsx`; touch targets for mobile menu trigger (40px) and search clear button (24px) fail the 44px floor.
- **Alex (Impatient Power User)**: Forced to click "Apply" on MultiSelect and Range filters while SingleSelect applies instantly; no keyboard shortcut (`/`) to focus doctor search.
- **Riley (Stress Tester)**: Entering `Min: 5000` and `Max: 500` produces zero results with no warning or automatic correction.

#### Minor Observations
- `SpecialtiesSection.tsx:133-137` passes `specialty=${specialty.id}` which is discarded by `consultation/page.tsx` parameter whitelist.
- Multiple elements violate `DESIGN.md:181-183` ("Flat-By-Default Rule") with resting shadows (`shadow-2xs`, `shadow-xs`, `shadow-sm`).
- `DoctorConsultationCard.tsx:48-50` exposes doctor's private account email on the public card.

#### Questions to Consider
- Should `HeroPreviewCard` media buttons trigger simulated video-room state changes or be styled as clean diagnostic telemetry pills?
- Should the mobile Sticky CTA on `/consultation` transform into a quick "Filter Specialists" drawer trigger?
- Should doctor fees have predefined quick-filter ranges (e.g., "Under ৳ 500", "৳ 500 - ৳ 1,500", "৳ 1,500+")?

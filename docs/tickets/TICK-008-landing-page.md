# [TICK-008] Marketing Landing Page & Color System Foundation

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: None
- **Blocks**: None

---

## Objective

Replace the current Hello World stub at `/` with a full marketing landing page. Apply the Medix color palette from `docs/frontend_color_palate.md` as CSS custom properties. The page must fetch live data from the backend API (specialties, top-rated doctors) via TanStack Query SSR prefetching.

---

## Detailed Tasks

### 1. Color System CSS Variables
- Define CSS custom properties in `frontend/src/app/globals.css` (or Tailwind config) mapping the full palette from `docs/frontend_color_palate.md`:
  - `--color-primary: #0B7285` (Clarity Teal)
  - `--color-primary-hover: #095E70`
  - `--color-secondary: #178A5E` (Vital Emerald)
  - `--color-accent: #D9542E` (Terracotta)
  - `--color-accent-hover: #B8431F`
  - `--color-ai: #5B4FCF` (Assist Violet)
  - Status colors, tint pairs, and neutrals as defined in the palette doc
- Ensure shadcn/ui theme tokens reference these custom properties.

### 2. Landing Page Sections
Build the following sections in `frontend/src/app/(commonLayout)/page.tsx` and co-located components under `frontend/src/components/modules/Landing/`:

1. **Hero Section**: Full-width hero with headline, subtitle, Terracotta CTA button ("Book an Appointment") linking to `/consultation`, and a secondary CTA linking to `/login`. Background uses warm neutral `#F7F8FA`.
2. **Specialties Section**: Grid of specialty cards fetched from `GET /api/v1/specialties` via TanStack Query SSR prefetch. Each card shows specialty icon, title, and a link to `/consultation?specialty={id}`.
3. **Top-Rated Doctors Section**: Carousel or grid of top-rated doctors fetched from `GET /api/v1/doctors?sort=-averageRating&limit=6`. Shows name, designation, specialty badges, average rating, and Terracotta "Book Now" CTA.
4. **Platform Stats Section**: Animated counters for total doctors, patients served, specialties, and appointments completed. Data from `GET /api/v1/stats` or hardcoded initial values.
5. **Why Choose Medix Section**: Feature cards (Verified Doctors, Secure Payments, AI Assistant, Digital Prescriptions) with Lucide icons.
6. **Footer**: Links to key pages, copyright, and social placeholders.

### 3. Services & Server Actions
- Add/reuse `getAllSpecialties()` and `getDoctors(query)` service calls.
- Use `QueryClient.prefetchQuery()` in the server component, hydrate with `<HydrationBoundary>`.

### 4. Responsive Design
- Mobile-first responsive layout. Hero stacks vertically on mobile. Doctor grid collapses to 1–2 columns. Specialties grid to 2 columns.

---

## Verification

```bash
pnpm build
```
- Landing page renders at `http://localhost:3000/` with all sections visible.
- Specialties load from the backend API.
- Top-rated doctors load from the backend API.
- CTA buttons navigate correctly.
- Color palette is applied (Teal primary, Terracotta CTAs, warm neutral background).
- Page is responsive on mobile viewport.

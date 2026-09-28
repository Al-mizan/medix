# [TICK-027] Client Bundle Optimization, Preconnects & Dynamic Imports

- **Status**: Ready
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-020
- **Blocks**: TICK-030

---

## Objective

Reduce initial JavaScript bundle size, isolate non-critical dependencies to asynchronous chunks via `next/dynamic`, and optimize resource loading using browser preconnect hints.

---

## Detailed Tasks

### 1. Dynamic Imports for Heavy Modules
- In dashboard view modules (`frontend/src/app/(dashboardLayout)`):
  - Dynamically import `recharts` components with skeleton loading fallbacks (`ssr: false`).
- In consultation session (`frontend/src/app/(commonLayout)/consultation/session/[videoCallingId]/page.tsx`):
  - Dynamically import WebRTC / `socket.io-client` components so video calling code does not load on marketing or directory pages.

### 2. Browser Preconnects & Image Priority
- In `frontend/src/app/layout.tsx`:
  - Add `<link rel="preconnect" href="https://res.cloudinary.com" />`.
- In `frontend/src/components/modules/Landing/HeroSection.tsx`:
  - Ensure the primary LCP hero image has `priority={true}` and explicit width/height to eliminate Cumulative Layout Shift (CLS).

---

## Verification

```bash
pnpm --filter frontend build
```
- [ ] Build output verifies `recharts` is split into a separate async chunk.
- [ ] Initial JS shared bundle size decreases.
- [ ] No layout shift on homepage hero image load.

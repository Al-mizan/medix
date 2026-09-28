# [TICK-028] Dynamic Doctor Sitemap Generation & Canonical URLs

- **Status**: Ready
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: None
- **Blocks**: TICK-029

---

## Objective

Ensure all verified doctor profiles are discoverable by search engines by dynamically generating sitemap entries, and eliminate duplicate content indexing by applying canonical tags across all public routes.

---

## Detailed Tasks

### 1. Dynamic Route Expansion in Sitemap
- In `frontend/src/app/sitemap.ts`:
  - Fetch list of verified active doctors (`GET /api/v1/doctors?limit=200&fields=id,updatedAt`).
  - Append route objects for each doctor profile:
    ```typescript
    {
      url: `${siteUrl}/consultation/doctor/${doctor.id}`,
      lastModified: new Date(doctor.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }
    ```

### 2. Canonical Tag Enforcement
- Add `alternates: { canonical: "..." }` in `metadata` across all public pages:
  - Homepage (`/`)
  - Consultation (`/consultation`)
  - Auth routes (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`)
  - Informational routes (`/privacy`, `/terms`, `/thank-you`, `/diagnostics`, `/health-plans`, `/medicine`, `/ngos`)
- In `frontend/src/app/(commonLayout)/consultation/doctor/[id]/page.tsx`, generate canonical URL in `generateMetadata`:
  ```typescript
  alternates: { canonical: `/consultation/doctor/${id}` }
  ```

---

## Verification

```bash
curl http://localhost:3000/sitemap.xml
curl -I http://localhost:3000/consultation
```
- [ ] `sitemap.xml` contains entries for doctor profile pages.
- [ ] HTML output of public pages contains `<link rel="canonical" href="...">`.

# [TICK-029] Schema.org Structured Data (JSON-LD), Favicons & llms.txt

- **Status**: Ready
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-028
- **Blocks**: TICK-031

---

## Objective

Elevate SEO rich snippets with Schema.org JSON-LD structured data, provide a comprehensive favicon package including Apple Touch Icons, publish `llms.txt` for AI crawlers, and verify document heading hierarchy and image alt tags.

---

## Detailed Tasks

### 1. JSON-LD Structured Data Component
- Create `frontend/src/components/shared/JsonLd.tsx`:
  ```tsx
  export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    );
  }
  ```
- Embed `MedicalOrganization` on homepage (`/`).
- Embed `MedicalClinic` + `ItemList` on `/consultation`.
- Embed `Physician` on `/consultation/doctor/[id]` (name, medicalSpecialty, address, rating).

### 2. Favicon & Apple Touch Icon Package
- Provide raster PNG icons in `frontend/public/`:
  - `apple-touch-icon.png` (180x180)
  - `favicon-32x32.png`
  - `favicon-16x16.png`
- Update `manifest.json` and `icons` configuration in `frontend/src/app/layout.tsx`.

### 3. AI Crawler Documentation
- Create `frontend/public/llms.txt` describing Medix architecture, clinical domains, API endpoints, and navigation layout for AI indexing.

### 4. Heading Hierarchy & Alt Text Audit
- Audit public pages to ensure exactly one `<h1>` per page with sequential descending headers (`<h2>` -> `<h3>`).
- Verify all `Image` components provide descriptive, non-empty `alt` attributes.

---

## Verification

- [ ] Google Rich Results Test approves JSON-LD schema on homepage and doctor profiles.
- [ ] `/llms.txt` is accessible via HTTP 200.
- [ ] Safari and iOS mobile render the Apple Touch Icon correctly.
- [ ] No multiple H1 violations across public routes.

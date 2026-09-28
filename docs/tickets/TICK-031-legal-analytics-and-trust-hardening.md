# [TICK-031] Cookie Consent Hardening, Legal Review & Trust Signals

- **Status**: Ready
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-029, TICK-030
- **Blocks**: TICK-032

---

## Objective

Harden GDPR/CCPA compliance by ensuring cookie consent actively guards third-party analytics loading, review privacy policy and terms content for healthcare compliance, and embed verifiable contact and trust indicators in the footer.

---

## Detailed Tasks

### 1. Cookie Consent & Analytics Guard
- In `frontend/src/components/shared/CookieConsentBanner.tsx` and `GoogleAnalytics.tsx`:
  - Ensure Google Analytics scripts are completely prevented from executing until user explicitly clicks "Accept".
  - Store consent decision in a persistent cookie with a 1-year expiry (`SameSite=Lax`).
  - Provide a "Reject / Essential Only" option that disables tracking cookies.

### 2. Legal Policy Review & Equal Text Alignment
- In `frontend/src/app/(commonLayout)/privacy/page.tsx` and `terms/page.tsx`:
  - Ensure comprehensive clauses covering HIPAA alignment, Stripe payment processing, Cloudinary diagnostic storage, and user rights.
  - Apply clean typographic line justification and max-width containers (`max-w-4xl mx-auto`).

### 3. Trust Signals & Contact Disclosures
- In `frontend/src/components/modules/Landing/LandingFooter.tsx`:
  - Display verifiable clinical contact email (`support@medix.health`), operational headquarters, and compliance badges (Encrypted Health Data, Verified Doctors, Stripe Verified).

---

## Verification

- [ ] Inspecting Network tab shows zero requests to `google-analytics.com` or `googletagmanager.com` until "Accept" is clicked.
- [ ] Consent choice persists after page refresh.
- [ ] Privacy and Terms pages render professional, aligned legal text.

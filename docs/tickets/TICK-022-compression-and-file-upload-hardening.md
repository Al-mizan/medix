# [TICK-022] API Payload Compression & File Upload Validation Hardening

- **Status**: Done
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-020
- **Blocks**: TICK-032

---

## Objective

Reduce backend egress bandwidth by enabling gzip/brotli response compression in Express and harden Multer upload handlers against invalid MIME types and oversized files.

---

## Detailed Tasks

### 1. Response Compression
- Install `compression` and `@types/compression` in backend workspace.
- In `backend/src/app.ts`, apply compression middleware:
  - Configure threshold (e.g. payloads > 1024 bytes).
  - Ensure raw Stripe webhook payloads bypass compression handlers.

### 2. Multer Upload Validation Hardening
- In `backend/src/app/config/multer.config.ts`:
  - Enforce `limits: { fileSize: 25 * 1024 * 1024 }` (25MB max matching Nginx limit).
  - Implement strict `fileFilter`:
    - Images: `image/jpeg`, `image/png`, `image/webp`.
    - Documents: `application/pdf`.
    - Deny executable extensions (`.exe`, `.sh`, `.bat`, `.js`).

---

## Verification

```bash
# Verify gzip compression header
curl -H "Accept-Encoding: gzip" -I http://localhost:5000/api/v1/doctors
```
- [x] Response includes `Content-Encoding: gzip`.
- [x] Attempting to upload an unsupported format or file > 25MB returns HTTP 400 Bad Request with a clear validation error.


# ADR 0002: Deploying to Render Free Tier via Docker

## Status
Accepted

## Context
Originally, the project considered deployment to a self-managed Hostinger VPS with Nginx reverse proxying and manual SSH-based deployment pipelines. However, running on Render's Free Tier using Docker containers eliminates server maintenance overhead, simplifies CI/CD, provides automated SSL certificates, and achieves a 100% free hosting architecture.

## Decision
1. **Container Hosting**: Deploy both `backend` and `frontend` as Docker Web Services on Render's Free Tier.
   - Use multi-stage Docker builds:
     - `backend/Dockerfile.prod`: Node 22 Alpine, compiling TypeScript and bundling EJS templates.
     - `frontend/Dockerfile.prod`: Next.js standalone container output with `NEXT_PUBLIC_API_BASE_URL` injected at build time.
2. **Database Strategy**: Leverage the already-configured **Prisma Postgres** free tier, which natively supports PostgreSQL 16 and the `pgvector` extension required for Medix's RAG functionality.
3. **Cache Strategy**: Utilize **Upstash Redis** (already configured), offering a permanent free tier with TLS (`rediss://`) compatibility.
4. **Service Infrastructure-as-Code**: Provide a `render.yaml` Blueprint file for reproducible, declarative service provisioning.

## Consequences
- **Positive**:
  - Zero financial cost for hosting compute, database, and Redis.
  - No VPS patch management, SSH key management, or Nginx manual configuration required.
  - Render handles automated Git push-to-deploy and TLS certificates for custom and onrender.com subdomains.
- **Tradeoffs / Mitigations**:
  - **Cold Starts**: Render free tier web services spin down after 15 minutes of inactivity. First requests after idle take ~50 seconds to warm up. (Can be mitigated with an external scheduled ping like Cron-job.org).
  - **Free Instance Hours**: 750 hours/month shared. Idling prevents consuming excess hours.
  - **Build Arg Bake**: In Next.js, public environment variables (`NEXT_PUBLIC_*`) must be present at build time; Render build arguments must be configured.

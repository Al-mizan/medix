#!/usr/bin/env bash
set -euo pipefail

REPO="Al-mizan/medix"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Publishing Epic and Tickets to GitHub repo: $REPO..."

# 1. Create Epic issue
EPIC_FILE="$BASE_DIR/docs/specs/optimization_and_production_hardening_spec.md"
EPIC_TITLE="[EPIC] Medix Optimization & Production Hardening Specification"

echo "Creating Epic Issue..."
EPIC_URL=$(gh issue create --repo "$REPO" --title "$EPIC_TITLE" --body-file "$EPIC_FILE" --label "enhancement")
echo "Created Epic: $EPIC_URL"

# 2. Tickets list
TICKETS=(
  "TICK-020-prefactor-security-headers-cors.md"
  "TICK-021-redis-rate-limiter.md"
  "TICK-022-compression-and-file-upload-hardening.md"
  "TICK-023-database-query-optimization-explain-analyze.md"
  "TICK-024-redis-caching-layer-and-invalidation.md"
  "TICK-025-universal-pagination-standardization.md"
  "TICK-026-doctor-search-and-debouncing.md"
  "TICK-027-client-bundle-optimization-and-dynamic-imports.md"
  "TICK-028-dynamic-sitemap-and-canonical-urls.md"
  "TICK-029-structured-data-favicons-llms-txt.md"
  "TICK-030-skeleton-screens-and-inline-form-validation.md"
  "TICK-031-legal-analytics-and-trust-hardening.md"
  "TICK-032-automated-testing-lighthouse-ci.md"
)

for TICKET_FILENAME in "${TICKETS[@]}"; do
  TICKET_PATH="$BASE_DIR/docs/tickets/$TICKET_FILENAME"
  if [[ ! -f "$TICKET_PATH" ]]; then
    echo "Warning: $TICKET_PATH not found, skipping."
    continue
  fi

  # Extract title from the first header line: # [TICK-XXX] Title
  FIRST_LINE=$(head -n 1 "$TICKET_PATH")
  TITLE="${FIRST_LINE#\# }"

  echo "Creating ticket: $TITLE..."
  URL=$(gh issue create --repo "$REPO" --title "$TITLE" --body-file "$TICKET_PATH" --label "enhancement,ready-for-agent")
  echo "Created: $URL"
done

echo "All tickets successfully published to GitHub Issues!"

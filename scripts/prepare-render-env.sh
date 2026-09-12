#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Medix Render Deployment Environment Variable Helper
# ==============================================================================

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_ENV="$REPO_ROOT/backend/.env"

echo "============================================================"
echo "        Medix Render Deployment Wizard (Backend Env)       "
echo "============================================================"
echo ""

if [ ! -f "$BACKEND_ENV" ]; then
    echo "❌ backend/.env not found at $BACKEND_ENV"
    exit 1
fi

echo "📋 Reading existing secrets from backend/.env..."
echo ""

get_env() {
    local key="$1"
    grep "^${key}=" "$BACKEND_ENV" | cut -d '=' -f2- | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' || echo ""
}

DATABASE_URL=$(get_env "DATABASE_URL")
REDIS_URL=$(get_env "REDIS_URL")
BETTER_AUTH_SECRET=$(get_env "BETTER_AUTH_SECRET")
ACCESS_TOKEN_SECRET=$(get_env "ACCESS_TOKEN_SECRET")
REFRESH_TOKEN_SECRET=$(get_env "REFRESH_TOKEN_SECRET")
EMAIL_SENDER_SMTP_HOST=$(get_env "EMAIL_SENDER_SMTP_HOST")
EMAIL_SENDER_SMTP_PORT=$(get_env "EMAIL_SENDER_SMTP_PORT")
EMAIL_SENDER_SMTP_USER=$(get_env "EMAIL_SENDER_SMTP_USER")
EMAIL_SENDER_SMTP_PASS=$(get_env "EMAIL_SENDER_SMTP_PASS")
EMAIL_SENDER_SMTP_FROM=$(get_env "EMAIL_SENDER_SMTP_FROM")
GOOGLE_CLIENT_ID=$(get_env "GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET=$(get_env "GOOGLE_CLIENT_SECRET")
CLOUDINARY_CLOUD_NAME=$(get_env "CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY=$(get_env "CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET=$(get_env "CLOUDINARY_API_SECRET")
STRIPE_SECRET_KEY=$(get_env "STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET=$(get_env "STRIPE_WEBHOOK_SECRET")
SUPER_ADMIN_EMAIL=$(get_env "SUPER_ADMIN_EMAIL")
SUPER_ADMIN_PASSWORD=$(get_env "SUPER_ADMIN_PASSWORD")

FRONTEND_URL="https://medix-frontend.onrender.com"
BETTER_AUTH_URL="https://medix-backend.onrender.com"
GOOGLE_CALLBACK_URL="https://medix-backend.onrender.com/api/v1/auth/google/callback"

mkdir -p "$REPO_ROOT/scratch"
OUTPUT_FILE="$REPO_ROOT/scratch/render_backend_env_ready.txt"

cat <<ENVEOF > "$OUTPUT_FILE"
PORT=5000
NODE_ENV=production
FRONTEND_URL=$FRONTEND_URL
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
BETTER_AUTH_URL=$BETTER_AUTH_URL
ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=15m
BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=1d
EMAIL_SENDER_SMTP_HOST=$EMAIL_SENDER_SMTP_HOST
EMAIL_SENDER_SMTP_PORT=$EMAIL_SENDER_SMTP_PORT
EMAIL_SENDER_SMTP_USER=$EMAIL_SENDER_SMTP_USER
EMAIL_SENDER_SMTP_PASS=$EMAIL_SENDER_SMTP_PASS
EMAIL_SENDER_SMTP_FROM=$EMAIL_SENDER_SMTP_FROM
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=$GOOGLE_CALLBACK_URL
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
SUPER_ADMIN_EMAIL=$SUPER_ADMIN_EMAIL
SUPER_ADMIN_PASSWORD=$SUPER_ADMIN_PASSWORD
ENVEOF

chmod 600 "$OUTPUT_FILE"

echo "✅ Generated Render environment configuration file:"
echo "   -> $OUTPUT_FILE"
echo ""
echo "============================================================"
echo "                NEXT STEPS IN RENDER DASHBOARD              "
echo "============================================================"
echo "1. Go to: https://dashboard.render.com"
echo "2. Click on the 'medix-backend' service."
echo "3. In the left menu, click 'Environment'."
echo "4. Click 'Add from .env' (or 'Bulk Edit')."
echo "5. Copy all content from $OUTPUT_FILE and paste into Render."
echo "6. Click 'Save Changes'."
echo ""
echo "Render will automatically redeploy and your backend will boot up cleanly!"
echo "============================================================"

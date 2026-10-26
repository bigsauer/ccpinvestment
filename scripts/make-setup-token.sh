#!/usr/bin/env bash
# Creates a random one-time setup code, stores it in Vercel (production) as ADMIN_SETUP_TOKEN,
# redeploys, and prints the code ONCE on your screen. Run it yourself in Terminal from the project folder:
#
#   bash scripts/make-setup-token.sh
#
# Then open https://www.ccpinvestmentclub.com/admin/setup and enter the code with your name, email and a password.
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v vercel >/dev/null 2>&1; then
  echo "The Vercel CLI is not installed or not on your PATH." >&2
  exit 1
fi

TOKEN="$(openssl rand -base64 36 | tr -dc 'A-Za-z0-9' | head -c 28)"

# Replace any earlier code, then store the new one without it appearing in the command line.
vercel env rm ADMIN_SETUP_TOKEN production --yes >/dev/null 2>&1 || true
printf '%s' "$TOKEN" | vercel env add ADMIN_SETUP_TOKEN production >/dev/null

echo "Stored in Vercel. Redeploying so the site picks it up (about a minute)..."
vercel deploy --prod --yes >/dev/null

echo
echo "Your setup code (shown once, write it down):"
echo
echo "    $TOKEN"
echo
echo "Next: open https://www.ccpinvestmentclub.com/admin/setup and enter it."
echo "Afterwards you can remove it with:  vercel env rm ADMIN_SETUP_TOKEN production --yes"

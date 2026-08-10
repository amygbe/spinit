#!/bin/bash
# Deploy to both names so the old URL never drifts behind the new one.
# spinit.…workers.dev is canonical; churn.…workers.dev is the legacy mirror.
set -euo pipefail
cd "$(dirname "$0")"
npx wrangler deploy
npx wrangler deploy --name churn

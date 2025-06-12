#!/bin/bash
# Deploy pre-built code to App Engine

set -e

cd "$( dirname "${BASH_SOURCE[0]}" )/.."

echo "🚀 Deploying pre-built code to App Engine"

# Just deploy what we have
cd backend
gcloud app deploy app.yaml \
  --project=cs144-webapps-ryanrosario-sp25 \
  --quiet \
  --promote

echo "✅ Deployed to: https://cs144-webapps-ryanrosario-sp25.appspot.com"
#!/bin/bash
# Deploy using Google Cloud Build (no local building)

set -e

echo "🚀 Deploying NutriBruin using Cloud Build"
echo "========================================"
echo "This builds everything on Google's servers"
echo ""

# Make sure we're in the project root
cd "$( dirname "${BASH_SOURCE[0]}" )/.."

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" >/dev/null 2>&1; then
    echo "❌ Not logged in. Please run: gcloud auth login"
    exit 1
fi

# Set project
gcloud config set project cs144-webapps-ryanrosario-sp25

# Submit to Cloud Build
echo "📤 Submitting to Cloud Build..."
echo "This may take 5-10 minutes..."
echo ""

if gcloud builds submit --config=cloudbuild.yaml; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Your app is live at: https://cs144-webapps-ryanrosario-sp25.appspot.com"
    echo ""
    echo "📊 View build logs at:"
    echo "https://console.cloud.google.com/cloud-build/builds?project=cs144-webapps-ryanrosario-sp25"
else
    echo ""
    echo "❌ Deployment failed. Check the logs above."
    exit 1
fi
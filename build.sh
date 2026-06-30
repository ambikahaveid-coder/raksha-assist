#!/bin/bash
set -euo pipefail

echo "=== Starting Raksha Assist Build ==="

echo "=== Step 1: Building Frontend ==="
cd frontend
npm ci --include=dev
npm run build
echo "Frontend build complete"

echo "=== Step 2: Building Backend ==="
cd ../backend
npm ci --include=dev
npm run build
echo "Backend build complete"

echo "=== Step 3: Copying Frontend to Backend ==="
rm -rf dist/public
mkdir -p dist/public
cp -r ../frontend/dist/. dist/public/
echo "Frontend files copied to backend/dist/public"

if [ -d migrations ]; then
  echo "=== Step 4: Copying Migrations ==="
  rm -rf dist/migrations
  mkdir -p dist/migrations
  cp -r migrations/. dist/migrations/
  echo "Migrations copied to backend/dist/migrations"
else
  echo "=== Step 4: No migrations directory present, skipping ==="
fi

echo "=== Build Complete ==="
ls -la dist/public/index.html

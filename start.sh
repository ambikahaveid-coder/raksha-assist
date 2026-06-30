#!/bin/bash
set -e

# Use script-relative paths so this works on any server (DO, Replit, etc.)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

cd "$BACKEND_DIR"

if [ ! -f "dist/bootstrap.js" ]; then
  echo "[start] dist/bootstrap.js not found — running build..."
  cd "$SCRIPT_DIR"
  bash build.sh
  cd "$BACKEND_DIR"
fi

if [ ! -d "node_modules" ]; then
  echo "[start] Installing backend dependencies..."
  npm install --production
fi

echo "[start] Starting production server from $BACKEND_DIR"
export NODE_ENV=production
export BOOTSTRAPPED=true
exec node dist/bootstrap.js

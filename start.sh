#!/usr/bin/env sh
set -eu

docker compose up --build -d

echo "Notes app is starting."
echo "Backend:  http://localhost:8080"
echo "Frontend: run 'cd frontend && npm run dev' locally (not Docker)."

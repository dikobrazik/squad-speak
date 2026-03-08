# !/bin/bash
set -euo pipefail;

cd /home/actions/squad-speak;

echo $ENV_DOCKER | tr ' ' '\n' > /home/actions/squad-speak/.env;
echo $ENV_FRONTEND | tr ' ' '\n' > /home/actions/squad-speak/frontend.env;
echo $ENV_BACKEND | tr ' ' '\n' > /home/actions/squad-speak/backend.env;

echo $GITHUB_TOKEN | docker login -u $GITHUB_USER --password-stdin ghcr.io;

docker compose -f docker-compose.yaml pull;
docker compose -f docker-compose.yaml up -d --force-recreate --remove-orphans;

rm -rf ./frontend && mkdir -p ./frontend/.next;

echo "📦 Extracting artifacts...";

docker cp squad-speak-frontend:/usr/app/public/ ./frontend;
docker cp squad-speak-frontend:/usr/app/.next/static/ ./frontend/.next;

echo "✅ Artifacts extracted to ./frontend";

docker compose restart;

docker system prune -f;
#!/bin/sh
set -e

echo "→ Attente de la base et synchronisation du schéma (prisma db push)..."
npx prisma db push --skip-generate

if [ "$SEED_ON_START" = "true" ]; then
  echo "→ Seed initial (utilisateurs + contenu)..."
  node dist-seed/seed.js || echo "⚠ seed ignoré (déjà présent ou erreur non bloquante)"
fi

echo "→ Démarrage de l'API MA2E..."
exec node dist/index.js

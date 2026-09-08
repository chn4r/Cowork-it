#!/usr/bin/env bash
set -e
npm run check
git status --short
echo
echo "Tests validés."
echo "Si le dépôt GitHub est connecté à Vercel/Netlify, un push sur main déclenchera le déploiement."

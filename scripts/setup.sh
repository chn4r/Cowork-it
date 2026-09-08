#!/usr/bin/env bash
set -e
echo "Cowork it — installation automatisée"
command -v node >/dev/null || { echo "Node.js 20+ requis"; exit 1; }
npm install
npx playwright install chromium
echo
echo "✓ Installation terminée"
echo "Lancer : npm run check"
echo "Développement : npm run dev"

#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
command -v git >/dev/null || { echo "Git requis"; exit 1; }
command -v node >/dev/null || { echo "Node.js 20+ requis"; exit 1; }

npm install
npx playwright install chromium

if [ ! -d .git ]; then
  git init
  git branch -M main
fi

echo
echo "Installation locale terminée."
echo "Il reste une seule configuration manuelle si aucun origin n'existe :"
echo 'git remote add origin https://github.com/VOTRE-COMPTE/cowork-it.git'
echo
echo "Puis double-cliquez PUBLIER_COWORK_IT.* ou lancez npm run publish-ui"

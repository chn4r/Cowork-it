# Cowork it — schéma d'automatisation optimisé

## Usage quotidien
1. Modifier Cowork it.
2. `npm run check`
3. `git add . && git commit -m "..." && git push`
4. Ne rien faire d'autre : GitHub teste et l'hébergeur déploie.

## Une seule configuration initiale
- GitHub : dépôt + branche main protégée.
- Vercel/Netlify : import du dépôt GitHub.
- Supabase : projet + migrations.
- Domaine : configuré dans l'hébergeur.
- Secrets : uniquement dans les variables d'environnement.

## Automatique après chaque push
- contrôle statique
- tests Playwright desktop
- tests Playwright mobile
- rapport de test
- preview de Pull Request
- déploiement de production si la branche main est validée

## À ajouter avant ouverture publique
- tests authentification avec un projet Supabase de staging
- tests multi-utilisateurs
- tests de sécurité RLS
- sauvegardes
- Sentry ou équivalent
- analytics respectueux du RGPD

# Bouton PUBLIER — Cowork it 3.3

## But
Après la configuration initiale, vous ne manipulez plus Git à chaque mise à jour.

### Utilisation Windows
Double-cliquez `PUBLIER_COWORK_IT.bat`.

### macOS
Double-cliquez `PUBLIER_COWORK_IT.command`.

### Linux
Lancez `./PUBLIER_COWORK_IT.sh`.

Une page locale s'ouvre avec :
- état du dépôt ;
- message de version ;
- **Tester sans publier** ;
- **Publier maintenant** ;
- journal détaillé.

## Ce que fait Publier maintenant
1. `npm run check`
2. si un test échoue : arrêt immédiat ;
3. `git add .`
4. `git commit`
5. `git push`
6. GitHub déclenche ensuite Vercel/Netlify si connecté.

## Sécurité
Le serveur écoute uniquement `127.0.0.1`.
Aucun mot de passe GitHub n'est demandé ou enregistré.
L'authentification reste celle de Git/GitHub déjà configurée sur l'ordinateur.

## Première configuration, une seule fois
1. Installer Node.js et Git.
2. `./scripts/first-setup.sh` (ou `npm install` sous Windows).
3. Créer un dépôt GitHub Cowork it.
4. Ajouter son URL comme `origin`.
5. Relier ce dépôt à Vercel/Netlify.
6. Ensuite : utiliser seulement le bouton Publier.

## Important
Le bouton ne contourne jamais les tests.
Il n'écrase pas la production directement : il pousse le code vers GitHub, qui reste la source de vérité.

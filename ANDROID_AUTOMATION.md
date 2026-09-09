# Cowork it — mises à jour automatiques

## Déjà automatisé
- Toute modification poussée sur `main` est testée par la CI puis publiée automatiquement sur GitHub Pages.
- Comme l'application Android est une TWA, les changements du site sont visibles dans l'application installée sans nouvelle publication Google Play.
- Quand `package.json` ou `android/**` change, GitHub Actions construit automatiquement un nouvel Android App Bundle (`.aab`).
- Si les secrets Google Play sont configurés, ce bundle est automatiquement envoyé sur la piste **Internal testing** de Google Play.

## Réglage unique à faire dans GitHub
Ouvrir : https://github.com/chn4r/Cowork-it/settings/secrets/actions

Ajouter ces 5 secrets :
1. `ANDROID_KEYSTORE_BASE64` — contenu base64 de la clé d'upload Android.
2. `ANDROID_KEYSTORE_PASSWORD` — mot de passe du keystore.
3. `ANDROID_KEY_ALIAS` — alias de la clé.
4. `ANDROID_KEY_PASSWORD` — mot de passe de la clé.
5. `PLAY_SERVICE_ACCOUNT_JSON` — JSON complet du compte de service Google Play Console.

Ne jamais mettre ces valeurs directement dans le dépôt.

## Fonctionnement ensuite
1. Modifier Cowork it.
2. GitHub teste automatiquement.
3. GitHub Pages publie automatiquement la nouvelle version web.
4. Pour une nouvelle version Android, modifier la version dans `package.json` (ex. `3.6.0` -> `3.6.1`).
5. GitHub construit le `.aab` et l'envoie automatiquement sur Google Play Internal testing.
6. Après validation sur la piste interne, la promotion vers Production reste volontairement contrôlée depuis Play Console pour éviter une publication publique accidentelle.

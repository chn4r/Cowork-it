# Cowork it 3.1 — Production-ready starter

Cette archive contient une PWA fonctionnelle en mode local et une couche de synchronisation prête pour Supabase ou une API REST.

## Lancer localement
Ne pas ouvrir uniquement `index.html` en `file://` si vous voulez tester le service worker. Depuis ce dossier :

```bash
python -m http.server 8080
```
Puis ouvrir `http://localhost:8080`.

## Activer Supabase
1. Créer un projet Supabase.
2. Ouvrir SQL Editor et exécuter `supabase_schema.sql`.
3. Dans Cowork it > Paramètres réseau : choisir `Supabase / réseau`.
4. Coller l’URL du projet et la clé **anon publique** (jamais `service_role`).
5. Tester la connexion, puis Synchroniser.

Le schéma fourni autorise temporairement des écritures anonymes pour un prototype réseau contrôlé. **Avant une publication publique**, intégrer l’authentification puis exécuter `supabase_production_policies.sql`.

## Déploiement
Le dossier peut être déposé tel quel sur Vercel, Netlify ou Cloudflare Pages. `vercel.json` et `netlify.toml` ajoutent des en-têtes de sécurité de base.

## Ce qui fonctionne sans backend
Explorer, filtres, favoris, fiches, publication locale, personnes, messages, persistance, export JSON, carte lorsque la connexion permet de charger Leaflet/OSM, PWA/offline shell.

## Ce qui devient réseau avec Supabase
Snapshots de lieux, favoris et fils de discussion via PostgREST. Pour une production complète, ajouter ensuite Supabase Auth, Realtime pour messages/disponibilité, Storage pour photos, modération et notifications push.

## Sécurité
- Ne jamais exposer de clé `service_role` dans le navigateur.
- Une adresse privée précise ne doit pas être publique par défaut.
- Ajouter authentification et politiques RLS par utilisateur avant lancement public.
- Prévoir suppression/export de compte, consentement géolocalisation, modération et conservation limitée des données.

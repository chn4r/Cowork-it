# Cowork it 3.1 — Rapport d’audit et de tests

## Résultat
- Tests fonctionnels navigateur simulé : **16/16 réussis**.
- Erreurs JavaScript navigateur : **0**.
- Contrôle syntaxique : **7/7 validations réussies**.

## Parcours testés
- ✅ Explorer charge — True
- ✅ Navigation map — map
- ✅ Navigation publish — publish
- ✅ Navigation people — people
- ✅ Navigation messages — messages
- ✅ Navigation explore — explore
- ✅ Filtre Artisans — 12->7
- ✅ Favoris — ♡>♥
- ✅ Fiche lieu
- ✅ Publication
- ✅ Rencontre vers messages
- ✅ Envoi message
- ✅ Paramètres réseau
- ✅ Persistance locale — localStorage OK
- ✅ Carte repli hors ligne — fallback sans Leaflet OK
- ✅ Navigation mobile

## Vérifications statiques
- ✅ app.js
- ✅ network.js
- ✅ sw.js
- ✅ leaflet-loader.js
- ✅ manifest.webmanifest
- ✅ supabase_schema.sql
- ✅ production_policies.sql

## Architecture livrée
- PWA : manifeste, icônes, service worker, shell hors ligne, raccourcis.
- Frontend : Explorer, Carte, Publier, Rencontres, Messages.
- Données locales : `localStorage` + export JSON.
- Synchronisation : file d’attente locale et adaptateur Supabase/API REST.
- Supabase : schéma PostgreSQL/PostGIS, tables lieux/favoris/fils, politiques RLS de prototype et politiques de durcissement avant lancement public.
- Authentification : fonctions Supabase email/mot de passe prêtes à être activées lorsque l’URL et la clé anon sont renseignées.
- Carte : Leaflet/OpenStreetMap chargé de façon non bloquante avec repli hors ligne.
- Déploiement : fichiers Vercel et Netlify.

## Limites de vérification
Le navigateur de l’environnement de test bloque les navigations HTTP locales par politique administrateur. Les interactions ont donc été exécutées dans Chromium avec l’application injectée directement dans la page, ce qui teste le DOM, le JavaScript et les parcours utilisateurs. Le service worker, les tuiles OpenStreetMap et un vrai projet Supabase ne peuvent pas être testés de bout en bout ici sans origine HTTP autorisée et sans identifiants Supabase. Le code correspondant a été validé syntaxiquement et conçu avec un repli explicite.

## Avant ouverture publique
1. Créer le projet Supabase et exécuter `supabase_schema.sql`.
2. Renseigner l’URL et la clé anon dans l’application.
3. Tester sur deux appareils réels.
4. Ajouter/valider Supabase Auth puis exécuter `supabase_production_policies.sql` pour supprimer les écritures anonymes de démonstration.
5. Ajouter modération, signalement, politique de confidentialité, suppression/export de compte et règles de visibilité de l’adresse des particuliers.
6. Héberger en HTTPS et tester installation PWA, géolocalisation, carte et notifications sur Android/iOS.

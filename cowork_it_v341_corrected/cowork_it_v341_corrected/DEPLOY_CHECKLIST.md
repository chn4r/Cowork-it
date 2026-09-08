# Checklist de mise en ligne Cowork it

## Démo privée
- [ ] Déployer le dossier sur Vercel/Netlify/Cloudflare Pages.
- [ ] Vérifier HTTPS.
- [ ] Tester les 5 onglets sur Android et iPhone.
- [ ] Vérifier carte, géolocalisation et installation PWA.

## Réseau Supabase
- [ ] Créer un projet Supabase.
- [ ] Exécuter `supabase_schema.sql`.
- [ ] Copier Project URL + clé anon publique dans Paramètres réseau.
- [ ] Tester la connexion.
- [ ] Publier un lieu sur appareil A et vérifier sur appareil B.
- [ ] Tester favoris et conversations.

## Avant public
- [ ] Activer confirmation email / stratégie d’authentification.
- [ ] Associer chaque lieu et conversation à `auth.uid()`.
- [ ] Exécuter `supabase_production_policies.sql`.
- [ ] Supprimer toute écriture anonyme.
- [ ] Masquer les adresses privées précises par défaut.
- [ ] Ajouter signalement/blocage/modération.
- [ ] Ajouter CGU et politique de confidentialité RGPD.
- [ ] Ajouter suppression/export du compte.
- [ ] Tester charge, rate limiting, spam et abus.
- [ ] Sauvegardes PostgreSQL et stockage images.

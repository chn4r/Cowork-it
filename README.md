# Cowork it 3.2 — Automation First

Cette version réduit le workflow à trois commandes.

## Première installation
```bash
./scripts/setup.sh
```

## Développement local
```bash
npm run dev
```

## Vérifier avant publication
```bash
npm run check
```

Ensuite : commit + push sur `main`.

GitHub Actions exécute automatiquement les contrôles et Playwright.
Vercel/Netlify peut être connecté au dépôt pour publier uniquement une branche validée.

## Supabase
1. Créer un projet Supabase.
2. Installer la CLI Supabase.
3. `supabase link`
4. `supabase db push`
5. Copier `.env.example` vers les variables d'environnement de l'hébergeur.

## Workflow simplifié
Code → GitHub → tests automatiques → déploiement → Supabase.

## Règle recommandée
Ne jamais modifier directement la production. Toute évolution passe par Git, les tests et une preview.

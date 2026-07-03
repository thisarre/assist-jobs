# Polish UI — Analyzer « Analyser une offre depuis une URL »

- **Date de création** : 2026-07-03
- **Statut** : backlog design (non planifié)
- **Feature concernée** : scrape d'une URL d'offre → analyse IA
  - Spec : `docs/superpowers/specs/2026-07-03-scrape-offre-url-design.md`
  - Plan : `docs/superpowers/plans/2026-07-03-scrape-offre-url.md`
  - Composant : `freelance-os/src/features/ai/components/analyzer-panel.tsx`

## Contexte

L'UI actuelle de l'analyzer (onglet **URL / Texte**, aperçu éditable, création d'opportunité) est **fonctionnelle et volontairement minimale** — conforme au principe produit « workflow utile d'abord, polish ensuite ». Elle n'est **pas** l'UI finale. Ce document liste les pistes pour une passe de design moderne, à mener sur une branche dédiée (ex. `feat/analyzer-ui-polish`) avec un vrai cadrage design en amont.

## Pistes de polish (backlog)

### 1. Sélecteur URL / Texte
- Remplacer les `<button>` faits main par le composant **`Tabs` de shadcn/ui** (cohérence design system, accessibilité native `role="tablist"` / `aria-selected`).
- Actuellement : toggle custom avec `aria-pressed` — correct mais non idiomatique.

### 2. Feedback pendant le scrape
- Pendant « Récupération… », afficher un **skeleton / spinner** dans la zone d'aperçu plutôt qu'un simple label de bouton.
- Optionnel : indicateur de progression (scraping → analyse) puisque le flow est en 2 temps.

### 3. Affichage de la source scrapée
- Styliser la ligne « Source : … » en **lien cliquable tronqué + favicon du domaine**, plutôt qu'en texte brut.
- Le composant `firecrawl` renvoie déjà l'URL résolue (post-redirection) via `sourceUrl`.

### 4. Titre de la page récupérée
- Firecrawl renvoie déjà `title` (dans `ScrapedPage` / le retour de l'action `scrapeUrl`) mais il **n'est pas affiché**.
- L'exploiter comme **en-tête d'aperçu** (« Offre : <title> ») — ce qui justifierait ce champ aujourd'hui inutilisé (noté par la revue de code).

### 5. Messages d'erreur différenciés
- Distinguer visuellement les cas : **login requis** vs **page introuvable (404)** vs **timeout**.
- La brique `firecrawl.ts` distingue déjà le HTTP >= 400 dans le message — exposer ça plus finement côté UI.
- Ajouter une **micro-CTA** « coller le texte à la main » qui bascule directement sur l'onglet Texte.

## Direction design souhaitée (« design moderne »)

Aligner sur les principes produit déjà définis (cf. `CLAUDE.md`) :

- **Références** : Linear, Raycast, Attio, Folk CRM, Notion, Cron Calendar.
- **Ton** : premium, minimal, calme, focalisé, professionnel.
- **Dark mode first**, desktop first.
- Hiérarchie claire, fort spacing, typographie lisible.
- **À éviter** : dégradés « AI-looking » génériques, dashboards bruyants, complexité décorative.
- Chaque écran doit aider l'utilisateur à **agir vite**.

### Recommandations techniques pour la passe polish
- S'appuyer au maximum sur **shadcn/ui** (Tabs, Skeleton, Tooltip, Badge) et les **design tokens** existants (`border-border`, `bg-muted`, `text-muted-foreground`, `text-destructive`) — pas de couleurs ad-hoc.
- Passer par le skill `frontend-ui-polisher` (et `accessibility-reviewer`) au moment de l'implémentation.
- Ne rien changer au contrat des server actions / à la logique de données — c'est une passe **purement présentation**.

## Hors scope de cette passe
- Toute évolution fonctionnelle (veille multi-sites, crawl, monitoring) → reste V2, cf. la note de scope Firecrawl.

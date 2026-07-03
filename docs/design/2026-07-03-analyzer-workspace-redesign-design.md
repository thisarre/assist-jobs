# Spec design — Analyzer « Workspace » (redesign moderne)

- **Date** : 2026-07-03
- **Statut** : design validé, prêt pour plan d'implémentation
- **Branche** : `feat/analyzer-ui-polish`
- **Direction retenue** : C · Workspace (deux volets, esprit Attio/Linear)
- **Backlog associé** : `docs/design/analyzer-url-ui-polish.md`

## Contexte

L'UI actuelle de l'analyzer (`src/features/ai/components/analyzer-panel.tsx`) est fonctionnelle mais générique : flux vertical simple, toggle fait main, aucun aperçu riche, pas d'états de chargement soignés. Le produit vise un ressenti **premium, minimal, calme, dark-first** (références : Linear, Raycast, Attio, Folk, Notion, Cron).

Ce spec est le **premier sous-projet** d'un design system global (décomposé en 5 couches : fondations, primitives, app shell, surfaces data, panneaux IA). Décision produit : commencer par l'**analyzer** comme vitrine, puis **extraire les tokens réutilisables** pour généraliser ensuite aux autres panneaux IA (résumé d'entreprise, outreach).

## Objectif

Refondre visuellement le panneau analyzer en un **workspace à deux volets** — la source à gauche pilote, l'analyse à droite réagit — sans modifier la logique métier ni le contrat des server actions. Poser au passage un socle de tokens réutilisables.

## Périmètre

**Dans le périmètre :**
- Refonte de `analyzer-panel.tsx` (présentation uniquement).
- Ajout des primitives manquantes : `Tabs`, `Skeleton` (via shadcn/ui).
- Nouveaux sous-composants de présentation (aperçu source, jauge de score, chips méta).
- Extraction de tokens (couleurs sémantiques, radius, typo) en variables réutilisables.

**Hors périmètre (explicite) :**
- Aucune modification des server actions (`scrapeUrl`, `analyzeText`, `createOpportunityFromAnalysis`) ni du modèle de données.
- Les autres panneaux IA (résumé, outreach) — couche suivante.
- Les couches 2-4 du design system (primitives globales, app shell, surfaces data).

## Design retenu

### Layout général
- **Deux volets côte à côte** en desktop (grille : gauche ~1fr, droite ~1.05fr, gap confortable).
- **Responsive** : sous un breakpoint (`lg`), les volets **s'empilent** verticalement (source au-dessus, analyse en dessous).
- Chaque volet est une carte à en-tête discret (label uppercase + méta), bordure `border`, fond légèrement distinct.

### Volet gauche — « Source » (pilote)
- En-tête : label `SOURCE` + **toggle URL / Texte** (composant `Tabs`, accessible).
- **Mode URL** : champ `Input type="url"` + bouton **« Récupérer »**. Au succès :
  - une **carte d'aperçu** apparaît : favicon du domaine + **titre** de la page (déjà renvoyé par `scrapeUrl`) + **lien source tronqué** (URL résolue).
  - le **contenu récupéré** s'affiche dans une zone **éditable** (le `Textarea` existant, restylé), sous la carte d'aperçu.
- **Mode Texte** : directement la zone éditable.
- Bouton **« Analyser → »** en bas du volet (désactivé si vide/busy).
- Sur échec de scrape : message d'erreur clair dans le volet + repli manuel (bascule Texte), comportement actuel conservé.

### Volet droit — « Analyse » (réagit), 3 états
1. **Vide** (avant analyse) : placeholder calme, centré (« L'analyse apparaîtra ici »), éventuellement une ligne d'aide.
2. **En cours** : **skeleton** animé reproduisant la structure du résultat (jauge + chips + lignes).
3. **Résultat** :
   - **Score en jauge circulaire** (0-100) + libellé qualitatif (« Fort match ») + phrase d'explication courte.
   - **Chips méta** : 📍 lieu · 💶 TJM · 🏠 politique remote.
   - **Atouts / Réserves** en deux colonnes.
   - Actions : **« Créer l'opportunité »** (primaire) · **« Recommencer »** (secondaire, reset complet de l'état comme aujourd'hui).
   - **Tous les champs restent éditables** (société, rôle, lieu, TJM, technologies, score) — parité fonctionnelle avec l'existant.

### Motion
- Transitions douces à l'apparition de l'aperçu et du résultat (opacité + léger translate).
- Skeletons pendant scrape et analyse.
- Respect de **`prefers-reduced-motion`** (désactive les animations non essentielles).

### Tokens à extraire (socle réutilisable)
- Couleurs sémantiques : surfaces (`panel`, `panel-accent`), bordures, texte (`fg`, `muted`), accent (`accent` pour le volet analyse), sémantiques score (`success`, `warning`).
- Radius (cartes 12px, éléments internes 8px), échelle typo (labels uppercase, titres, corps), densité/spacing.
- Réutiliser les tokens Tailwind/shadcn existants (`border`, `muted`, `destructive`, etc.) et n'ajouter que le strict nécessaire — pas de couleurs ad-hoc en dur.

## Décomposition en composants (isolation)
- `AnalyzerPanel` (orchestrateur, état + branchement server actions — inchangé côté logique).
- `SourcePane` : toggle, entrée URL/texte, aperçu, bouton Analyser.
- `SourcePreviewCard` : favicon + titre + lien source.
- `AnalysisPane` : rend l'un des 3 états.
- `ScoreGauge` : jauge circulaire (prop `value: number`).
- `AnalysisResult` : champs éditables + chips + atouts/réserves + actions (extrait de l'actuel).
- `AnalysisSkeleton` / `AnalysisEmpty` : états.

Chaque sous-composant a une responsabilité unique et une interface claire (props typées), testable/visualisable isolément.

## Contraintes & accessibilité
- **Dark-first**, desktop-first, cohérent avec l'app shell existant.
- `Tabs` accessible (rôles ARIA natifs shadcn), focus states visibles partout, navigation clavier.
- Jauge de score : fournir le score en texte (pas uniquement la couleur) pour l'accessibilité.
- Contrastes suffisants (WCAG AA sur le texte).
- Aucune régression du flux : URL → aperçu → analyse → création ; repli manuel sur échec.

## Vérification (à l'implémentation)
- **Visuel E2E** : les 3 états du volet droit (vide / skeleton / résultat) s'affichent correctement ; le flux complet URL → Récupérer → Analyser → Créer fonctionne.
- **Responsive** : empilement correct sous `lg`.
- **Parité fonctionnelle** : tous les champs restent éditables ; « Recommencer » réinitialise tout ; échec de scrape → message + repli Texte.
- **A11y** : navigation clavier des Tabs, focus visibles, score lisible sans la couleur, `prefers-reduced-motion` respecté.
- **Non-régression** : `tsc`, `vitest`, `next build` verts ; aucune modification des server actions.

## Hors scope / suite
- Généralisation des tokens aux autres panneaux IA (résumé, outreach) = sous-projet suivant.
- Couches design system 2-4 = specs séparés ultérieurs.

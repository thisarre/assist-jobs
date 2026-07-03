# Freelance OS

Copilote IA pour freelances : analyser des offres, scorer le match, générer de l'outreach, suivre un pipeline d'opportunités. Next.js 16 + React 19 + Supabase (Postgres) local via Docker + Drizzle ORM.

---

## Prérequis

| Outil | Version | Notes |
|---|---|---|
| **Node.js** | 20 LTS ou ≥ 22.12 | ⚠️ éviter 22.8 (bug ESM `require` de jsdom si un jour tests DOM) |
| **pnpm** | ≥ 9 | gestionnaire de paquets du projet (lockfile `pnpm-lock.yaml`) |
| **Docker Desktop** | à jour, démarré | requis pour la base Supabase locale |

La **CLI Supabase** est déjà une dépendance du projet — pas d'installation globale, on l'appelle via `pnpm supabase …`.

---

## Démarrage rapide

```bash
git clone https://github.com/thisarre/assist-jobs.git
cd assist-jobs/freelance-os

# 1. Dépendances
pnpm install

# 2. Variables d'environnement (voir section dédiée)
cp .env.example .env.local
#   -> remplir les vraies valeurs (clés API notamment)

# 3. Base de données locale (Docker) — voir section dédiée
pnpm supabase start
pnpm exec drizzle-kit push      # crée les tables depuis le schéma Drizzle
pnpm db:seed                    # (optionnel) données de démo

# 4. Lancer l'app
pnpm dev                        # http://localhost:3000
```

Inscription : sur `/login`, bouton **Sign up** avec n'importe quel email + mot de passe (≥ 6 car.). La confirmation email est désactivée en local → connexion immédiate. La ligne applicative `users` est créée automatiquement au premier accès au dashboard.

---

## Variables d'environnement (`.env.local`)

`.env.local` est **gitignoré** (il contient des secrets) — il **ne voyage pas avec le repo**, à recréer sur chaque machine à partir de `.env.example`.

| Variable | Rôle | Où la trouver |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | API Supabase locale | `http://127.0.0.1:54321` (fixe) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé publique (client) | sortie de `pnpm supabase start` / `pnpm supabase status` — **clé démo standard, identique sur toutes les installs locales** |
| `SUPABASE_SERVICE_ROLE_KEY` | clé service (server) | idem ci-dessus |
| `DATABASE_URL` | connexion Postgres directe (Drizzle) | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (fixe) |
| `ANTHROPIC_API_KEY` | features IA (analyse, outreach, résumé) | console.anthropic.com → **clé API `sk-ant-api...` + crédits** (≠ abonnement claude.ai) |
| `FIRECRAWL_API_KEY` | analyse d'offre **depuis une URL** (scrape) | app.firecrawl.dev — optionnelle si tu n'utilises que le collage de texte |

Les clés anon/service local étant les **clés démo standard Supabase**, tu peux réutiliser telles quelles les valeurs déjà présentes dans un `.env.local` existant (elles sont identiques d'une machine à l'autre).

---

## Base de données locale (Docker / Supabase)

Le projet utilise **Supabase en local via Docker** (pas de cloud). La CLI Supabase orchestre les conteneurs Docker ; la config est dans `supabase/config.toml` (`project_id = "freelance-os"`, Postgres 17).

### Démarrer la stack
```bash
# Docker Desktop doit tourner
pnpm supabase start
```
Au premier lancement, ça télécharge les images puis démarre les conteneurs (`supabase_db_freelance-os`, `_studio_`, `_auth_`, `_kong_`, `_inbucket_`…). La commande affiche à la fin les **URLs et les clés** (anon / service_role) — à reporter dans `.env.local`.

### Ports exposés

| Service | Port | URL |
|---|---|---|
| API (PostgREST/GoTrue via Kong) | 54321 | http://127.0.0.1:54321 |
| **Postgres** | **54322** | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio (UI base de données) | 54323 | http://127.0.0.1:54323 |
| Inbucket (emails de test) | 54324 | http://127.0.0.1:54324 |

### Appliquer le schéma

Le schéma est **piloté par Drizzle** (`src/db/schema/`). Après `supabase start` :
```bash
pnpm exec drizzle-kit push
```
Ça crée/synchronise toutes les tables (`users`, `companies`, `contacts`, `opportunities`, `interactions`, `ai_generations`, `tags`) dans la base locale.
> Si `drizzle-kit` ne trouve pas `DATABASE_URL`, préfixe la commande :
> `DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' pnpm exec drizzle-kit push`

Les fichiers de migration versionnés sont dans `supabase/migrations/` ; `pnpm supabase db reset` rejoue tout depuis zéro (⚠️ efface les données).

### Données de démo (optionnel)
```bash
pnpm db:seed
```
Crée un utilisateur de test + companies / contacts / opportunités d'exemple.
> Note : le seed insère un `users` avec un id aléatoire **non lié à l'auth Supabase** — ces données de démo n'apparaîtront donc pas sous un compte créé via `/login`. Utile surtout pour inspecter la base dans Studio.

### Cycle de vie
```bash
pnpm supabase status     # URLs + clés de la stack en cours
pnpm supabase stop       # arrête les conteneurs (données conservées)
pnpm supabase db reset   # réinitialise la base + rejoue les migrations
```

---

## Commandes utiles

| Commande | Effet |
|---|---|
| `pnpm dev` | serveur de dev (http://localhost:3000) |
| `pnpm build` | build de production |
| `pnpm start` | serveur de production (après build) |
| `pnpm lint` | ESLint |
| `pnpm test` | tests Vitest (env node) |
| `pnpm test:watch` | tests en watch |
| `pnpm exec drizzle-kit generate` | génère une migration après modif du schéma |
| `pnpm exec drizzle-kit push` | applique le schéma à la base locale |
| `pnpm db:seed` | données de démo |

---

## Pièges connus (déjà gérés, mais bon à savoir)

1. **pnpm workspace ancêtre** — un `pnpm-workspace.yaml` existe plus haut dans l'arborescence (`~/Documents/Dev/`). `freelance-os/pnpm-workspace.yaml` (`packages: []`) fait de ce dossier sa propre racine → toujours lancer `pnpm install` **dans `freelance-os`**.
2. **Turbopack root / 404 en dev** — sans réglage, `next dev` choisit le workspace ancêtre comme racine et **toutes les routes 404**. Corrigé dans `next.config.ts` (`turbopack.root: import.meta.dirname`) — ne pas retirer.
3. **Node / Vitest** — les tests tournent en `environment: "node"` (pas de jsdom) pour éviter un bug ESM sous Node 22.8. Ajouter `// @vitest-environment jsdom` par fichier si un test de composant en a besoin.
4. **Appels IA derrière un proxy TLS d'entreprise** — si les appels HTTPS sortants échouent avec `self-signed certificate in certificate chain`, configure `NODE_EXTRA_CA_CERTS` avec le certificat de ton entreprise (ou, en dev local uniquement, lance avec `NODE_TLS_REJECT_UNAUTHORIZED=0`).
5. **IA = API Anthropic, pas l'abonnement** — les features IA appellent l'**API** (`sk-ant-api...`, facturée aux crédits). Un abonnement claude.ai / Claude Code ne les alimente pas ; il faut des crédits API.

---

## Structure (aperçu)

```
freelance-os/
├── src/
│   ├── app/                    # App Router (route groups (auth), (dashboard))
│   ├── features/               # slices par domaine (ai, opportunities, companies…)
│   │   └── ai/                 # analyzer, prompts, provider Anthropic, schémas Zod
│   ├── db/                     # client Drizzle + schéma
│   ├── lib/                    # auth, ownership (scoping user_id), firecrawl…
│   └── components/ui/          # primitives shadcn/ui
├── supabase/                   # config.toml + migrations/
├── docs/design/                # specs & plans design (analyzer workspace, etc.)
└── next.config.ts
```

Détails produit et conventions : voir `CLAUDE.md` / `AGENTS.md`.

# Analyzer Workspace Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre le panneau analyzer en un workspace à deux volets (Source | Analyse) premium dark-first, sans toucher à la logique métier ni aux server actions.

**Architecture:** `AnalyzerPanel` reste l'orchestrateur (état + branchement des server actions existantes) mais délègue la présentation à des sous-composants isolés sous `src/features/ai/components/analyzer/`. Le layout passe d'un flux « input OU résultat » à **deux volets affichés simultanément** : le volet gauche (Source) pilote, le volet droit (Analyse) réagit selon un état `phase`. Aucune modification de `scrapeUrl`/`analyzeText`/`createOpportunityFromAnalysis`.

**Tech Stack:** Next.js 16 / React 19, TypeScript, Tailwind v4 (cssVariables, tokens sémantiques), shadcn/ui (Radix), lucide-react, vitest (env node). Package manager **pnpm**.

---

## Notes pré-implémentation
- **pnpm** obligatoire (lockfile `pnpm-lock.yaml`). Jamais npm/yarn.
- **Périmètre présentation uniquement** : ne modifier AUCUNE server action ni le schéma `analysisSchema`. La parité fonctionnelle (champs éditables, repli manuel, reset) doit être conservée.
- **Tokens** : réutiliser les tokens sémantiques Tailwind/shadcn existants (`bg-card`, `bg-muted`, `border`, `text-muted-foreground`, `bg-primary`, `text-destructive`). Pour les teintes de score, on utilise la palette Tailwind (`emerald`/`amber`/`red`) comme « strict nécessaire » ; leur formalisation en tokens dédiés est reportée au sous-projet « fondations ».
- **Next.js 16 non-standard** (`AGENTS.md`) : en cas de doute sur une API framework, consulter `node_modules/next/dist/docs/`. Ici tout est composant client + Tailwind, pas d'API framework nouvelle.
- Spec de référence : `docs/design/2026-07-03-analyzer-workspace-redesign-design.md`.

## File Structure

| Fichier | Rôle | Action |
|---|---|---|
| `src/components/ui/tabs.tsx` | Primitive Tabs (Radix) | Créer (shadcn CLI) |
| `src/components/ui/skeleton.tsx` | Primitive Skeleton | Créer (shadcn CLI) |
| `src/features/ai/components/analyzer/score.ts` | Helpers purs `scoreTone`/`scoreLabel` | Créer |
| `__tests__/ai/score.test.ts` | Tests unitaires du helper | Créer |
| `src/features/ai/components/analyzer/score-gauge.tsx` | Jauge circulaire de score | Créer |
| `src/features/ai/components/analyzer/source-preview-card.tsx` | Carte aperçu (icône + titre + lien) | Créer |
| `src/features/ai/components/analyzer/analysis-empty.tsx` | État vide du volet droit | Créer |
| `src/features/ai/components/analyzer/analysis-skeleton.tsx` | État chargement du volet droit | Créer |
| `src/features/ai/components/analyzer/analysis-result.tsx` | Résultat éditable + chips + atouts/réserves | Créer |
| `src/features/ai/components/analyzer/analysis-pane.tsx` | Volet droit (switch des 3 états) | Créer |
| `src/features/ai/components/analyzer/source-pane.tsx` | Volet gauche (toggle, entrée, aperçu, Analyser) | Créer |
| `src/features/ai/components/analyzer-panel.tsx` | Orchestrateur (état + layout 2 volets) | Réécrire |

Rappel type (inchangé) — `Analysis` (`src/features/ai/schemas/analysis.ts`) : `companyName, role, technologies[], seniority, location, remotePolicy, estimatedDailyRate|null, matchScore(0-100), strengths[], concerns[], recommendedAction, explanation`.

---

## Task 1 : Primitives Tabs/Skeleton + helper de score (TDD)

**Files:**
- Create: `src/components/ui/tabs.tsx`, `src/components/ui/skeleton.tsx` (via CLI)
- Create: `src/features/ai/components/analyzer/score.ts`
- Test: `__tests__/ai/score.test.ts`

- [ ] **Step 1 : Ajouter les primitives shadcn**

Run: `pnpm dlx shadcn@latest add tabs skeleton`
Expected : crée `src/components/ui/tabs.tsx` et `src/components/ui/skeleton.tsx`. Si la CLI pose une question, accepter les défauts. Si elle échoue (réseau/offline), créer les fichiers manuellement depuis https://ui.shadcn.com (composants `tabs` et `skeleton`, style Radix + `cn`).

- [ ] **Step 2 : Vérifier que les primitives compilent**

Run: `pnpm exec tsc --noEmit`
Expected : 0 erreur.

- [ ] **Step 3 : Écrire le test du helper de score (échoue d'abord)**

Créer `__tests__/ai/score.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { scoreTone, scoreLabel } from "@/features/ai/components/analyzer/score";

describe("scoreTone", () => {
  it("classe par seuils 80/60/40", () => {
    expect(scoreTone(87)).toBe("strong");
    expect(scoreTone(80)).toBe("strong");
    expect(scoreTone(79)).toBe("good");
    expect(scoreTone(60)).toBe("good");
    expect(scoreTone(59)).toBe("moderate");
    expect(scoreTone(40)).toBe("moderate");
    expect(scoreTone(39)).toBe("weak");
    expect(scoreTone(0)).toBe("weak");
  });
});

describe("scoreLabel", () => {
  it("mappe la tonalité vers un libellé FR", () => {
    expect(scoreLabel(90)).toBe("Fort match");
    expect(scoreLabel(70)).toBe("Bon match");
    expect(scoreLabel(50)).toBe("Match moyen");
    expect(scoreLabel(10)).toBe("Match faible");
  });
});
```

- [ ] **Step 4 : Lancer le test — il doit échouer**

Run: `pnpm exec vitest run __tests__/ai/score.test.ts`
Expected : FAIL (`Cannot find module '.../analyzer/score'`).

- [ ] **Step 5 : Écrire le helper**

Créer `src/features/ai/components/analyzer/score.ts` :
```ts
export type ScoreTone = "strong" | "good" | "moderate" | "weak";

/** Bucketise un score 0-100 en tonalité qualitative (seuils 80/60/40). */
export function scoreTone(value: number): ScoreTone {
  if (value >= 80) return "strong";
  if (value >= 60) return "good";
  if (value >= 40) return "moderate";
  return "weak";
}

/** Libellé FR affiché à côté de la jauge. */
export function scoreLabel(value: number): string {
  switch (scoreTone(value)) {
    case "strong":
      return "Fort match";
    case "good":
      return "Bon match";
    case "moderate":
      return "Match moyen";
    case "weak":
      return "Match faible";
  }
}
```

- [ ] **Step 6 : Lancer le test — il doit passer**

Run: `pnpm exec vitest run __tests__/ai/score.test.ts`
Expected : PASS (2 suites).

- [ ] **Step 7 : Commit**

```bash
git add src/components/ui/tabs.tsx src/components/ui/skeleton.tsx src/features/ai/components/analyzer/score.ts __tests__/ai/score.test.ts
git commit -m "feat(ui): add tabs+skeleton primitives and score helpers"
```

---

## Task 2 : Feuilles de présentation — ScoreGauge & SourcePreviewCard

**Files:**
- Create: `src/features/ai/components/analyzer/score-gauge.tsx`
- Create: `src/features/ai/components/analyzer/source-preview-card.tsx`

- [ ] **Step 1 : Écrire `score-gauge.tsx`**

Jauge SVG (crisp, theming via `currentColor`, accessible). Créer le fichier :
```tsx
import { cn } from "@/lib/utils";
import { scoreTone, scoreLabel, type ScoreTone } from "./score";

const TONE_COLOR: Record<ScoreTone, string> = {
  strong: "text-emerald-500",
  good: "text-emerald-500",
  moderate: "text-amber-500",
  weak: "text-red-500",
};

export function ScoreGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const tone = scoreTone(clamped);
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const dash = (clamped / 100) * circumference;

  return (
    <div
      role="img"
      aria-label={`Score ${clamped} sur 100 — ${scoreLabel(clamped)}`}
      className={cn("relative size-13 shrink-0", TONE_COLOR[tone])}
    >
      <svg viewBox="0 0 48 48" className="size-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="4" className="stroke-muted" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-500 motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
        {clamped}
      </span>
    </div>
  );
}
```
Note : `size-13` = 3.25rem (Tailwind v4 accepte les valeurs numériques d'échelle). Si l'utilitaire n'existe pas, remplacer par `h-13 w-13` ou `size-[3.25rem]`.

- [ ] **Step 2 : Écrire `source-preview-card.tsx`**

Carte aperçu de la page scrapée (icône générique + titre + host tronqué, lien cliquable). Pas de favicon externe (évite la config `next/image` et les soucis offline) — icône lucide `Globe`. Créer :
```tsx
import { Globe } from "lucide-react";

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function SourcePreviewCard({
  title,
  sourceUrl,
}: {
  title: string | null;
  sourceUrl: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Globe className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {title ?? "Offre récupérée"}
        </p>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-muted-foreground hover:text-foreground"
        >
          {hostOf(sourceUrl)}
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Vérifier la compilation**

Run: `pnpm exec tsc --noEmit`
Expected : 0 erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/features/ai/components/analyzer/score-gauge.tsx src/features/ai/components/analyzer/source-preview-card.tsx
git commit -m "feat(ui): add ScoreGauge and SourcePreviewCard"
```

---

## Task 3 : Volet Analyse — états empty / skeleton / result + pane

**Files:**
- Create: `analysis-empty.tsx`, `analysis-skeleton.tsx`, `analysis-result.tsx`, `analysis-pane.tsx` (sous `src/features/ai/components/analyzer/`)

- [ ] **Step 1 : `analysis-empty.tsx`**
```tsx
import { Sparkles } from "lucide-react";

export function AnalysisEmpty() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center">
      <Sparkles className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">L&apos;analyse apparaîtra ici</p>
      <p className="text-xs text-muted-foreground">
        Récupère une offre (ou colle du texte), puis lance l&apos;analyse.
      </p>
    </div>
  );
}
```

- [ ] **Step 2 : `analysis-skeleton.tsx`**
```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-13 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-40" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : `analysis-result.tsx`** (résultat éditable — parité avec l'existant + jauge + chips)
```tsx
import type { Analysis } from "@/features/ai/schemas/analysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Wallet, Home } from "lucide-react";
import { ScoreGauge } from "./score-gauge";
import { scoreLabel } from "./score";

type Props = {
  analysis: Analysis;
  update: <K extends keyof Analysis>(key: K, value: Analysis[K]) => void;
  onCreate: () => void;
  onReset: () => void;
  creating: boolean;
  error: string | null;
};

export function AnalysisResult({ analysis, update, onCreate, onReset, creating, error }: Props) {
  return (
    <div className="space-y-5">
      {/* score summary */}
      <div className="flex items-center gap-3">
        <ScoreGauge value={analysis.matchScore} />
        <div>
          <p className="text-sm font-semibold text-foreground">{scoreLabel(analysis.matchScore)}</p>
          <p className="text-xs text-muted-foreground">{analysis.explanation}</p>
        </div>
      </div>

      {/* meta chips */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1">
          <MapPin className="size-3" />
          {analysis.location || "—"}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Wallet className="size-3" />
          {analysis.estimatedDailyRate != null ? `${analysis.estimatedDailyRate} €/j` : "—"}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Home className="size-3" />
          {analysis.remotePolicy || "—"}
        </Badge>
      </div>

      {/* editable fields (parité fonctionnelle) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="a-company">Société</Label>
          <Input id="a-company" value={analysis.companyName} onChange={(e) => update("companyName", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="a-role">Rôle</Label>
          <Input id="a-role" value={analysis.role} onChange={(e) => update("role", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="a-location">Lieu</Label>
          <Input id="a-location" value={analysis.location} onChange={(e) => update("location", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="a-rate">TJM estimé (€)</Label>
          <Input
            id="a-rate"
            type="number"
            min={0}
            value={analysis.estimatedDailyRate ?? ""}
            onChange={(e) => update("estimatedDailyRate", e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="a-tech">Technologies (séparées par des virgules)</Label>
        <Input
          id="a-tech"
          value={analysis.technologies.join(", ")}
          onChange={(e) =>
            update("technologies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
          }
        />
      </div>

      {/* strengths / concerns */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-500">Atouts</p>
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
            {analysis.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-500">Réserves</p>
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
            {analysis.concerns.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={onCreate} disabled={creating} className="flex-1">
          {creating ? "Création…" : "Créer l'opportunité"}
        </Button>
        <Button variant="outline" onClick={onReset} disabled={creating}>
          Recommencer
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : `analysis-pane.tsx`** (volet droit, en-tête + switch)
```tsx
import type { Analysis } from "@/features/ai/schemas/analysis";
import { AnalysisEmpty } from "./analysis-empty";
import { AnalysisSkeleton } from "./analysis-skeleton";
import { AnalysisResult } from "./analysis-result";

type Props = {
  analyzing: boolean;
  analysis: Analysis | null;
  update: <K extends keyof Analysis>(key: K, value: Analysis[K]) => void;
  onCreate: () => void;
  onReset: () => void;
  creating: boolean;
  error: string | null;
};

export function AnalysisPane({ analyzing, analysis, update, onCreate, onReset, creating, error }: Props) {
  return (
    <section aria-label="Analyse" className="rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-primary">Analyse</span>
      </header>
      <div className="p-4">
        {analysis ? (
          <AnalysisResult
            analysis={analysis}
            update={update}
            onCreate={onCreate}
            onReset={onReset}
            creating={creating}
            error={error}
          />
        ) : analyzing ? (
          <AnalysisSkeleton />
        ) : (
          <AnalysisEmpty />
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5 : Vérifier la compilation**

Run: `pnpm exec tsc --noEmit`
Expected : 0 erreur.

- [ ] **Step 6 : Commit**
```bash
git add src/features/ai/components/analyzer/analysis-empty.tsx src/features/ai/components/analyzer/analysis-skeleton.tsx src/features/ai/components/analyzer/analysis-result.tsx src/features/ai/components/analyzer/analysis-pane.tsx
git commit -m "feat(ui): add analysis pane with empty/skeleton/result states"
```

---

## Task 4 : Volet Source (toggle Tabs, entrée URL/texte, aperçu, Analyser)

**Files:**
- Create: `src/features/ai/components/analyzer/source-pane.tsx`

- [ ] **Step 1 : Écrire `source-pane.tsx`**
```tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SourcePreviewCard } from "./source-preview-card";

type Props = {
  mode: "url" | "text";
  onModeChange: (mode: "url" | "text") => void;
  url: string;
  onUrlChange: (v: string) => void;
  text: string;
  onTextChange: (v: string) => void;
  sourceUrl: string | null;
  scrapedTitle: string | null;
  scraping: boolean;
  analyzing: boolean;
  disabled: boolean;
  error: string | null;
  onScrape: () => void;
  onAnalyze: () => void;
};

export function SourcePane({
  mode, onModeChange, url, onUrlChange, text, onTextChange,
  sourceUrl, scrapedTitle, scraping, analyzing, disabled, error, onScrape, onAnalyze,
}: Props) {
  return (
    <section aria-label="Source" className="rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Source</span>
        <Tabs value={mode} onValueChange={(v) => onModeChange(v as "url" | "text")}>
          <TabsList>
            <TabsTrigger value="text" disabled={disabled}>Texte</TabsTrigger>
            <TabsTrigger value="url" disabled={disabled}>URL</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="space-y-3 p-4">
        {mode === "url" ? (
          <div className="space-y-2">
            <Label htmlFor="analyze-url">Colle l&apos;URL d&apos;une offre</Label>
            <Input
              id="analyze-url"
              type="url"
              placeholder="https://www.free-work.com/…"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={onScrape} disabled={disabled || url.trim().length === 0}>
              {scraping ? "Récupération…" : "Récupérer"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sourceUrl && <SourcePreviewCard title={scrapedTitle} sourceUrl={sourceUrl} />}
            <Label htmlFor="analyze-text">Contenu de l&apos;offre</Label>
            <Textarea
              id="analyze-text"
              className="min-h-48"
              placeholder="Colle le texte de l'offre ici…"
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end">
              <Button onClick={onAnalyze} disabled={disabled || text.trim().length === 0}>
                {analyzing ? "Analyse…" : "Analyser →"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation**

Run: `pnpm exec tsc --noEmit`
Expected : 0 erreur (le composant n'est pas encore monté — c'est attendu jusqu'à la Task 5).

- [ ] **Step 3 : Commit**
```bash
git add src/features/ai/components/analyzer/source-pane.tsx
git commit -m "feat(ui): add SourcePane with tabs toggle and preview"
```

---

## Task 5 : Orchestrateur — layout 2 volets + état `phase`

**Files:**
- Modify (réécriture complète) : `src/features/ai/components/analyzer-panel.tsx`

- [ ] **Step 1 : Réécrire `analyzer-panel.tsx`**

Remplacer TOUT le contenu du fichier par :
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  analyzeText,
  createOpportunityFromAnalysis,
  scrapeUrl,
} from "@/features/ai/actions/analyze-actions";
import type { Analysis } from "@/features/ai/schemas/analysis";
import { SourcePane } from "./analyzer/source-pane";
import { AnalysisPane } from "./analyzer/analysis-pane";

type Phase = "idle" | "scraping" | "analyzing" | "creating";

export function AnalyzerPanel() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"url" | "text">("text");
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [scrapedTitle, setScrapedTitle] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const busy = phase !== "idle";

  async function onScrape() {
    setPhase("scraping");
    setError(null);
    const result = await scrapeUrl({ url });
    if ("error" in result) {
      setError(result.error);
      setPhase("idle");
      return;
    }
    setText(result.markdown);
    setSourceUrl(result.sourceUrl);
    setScrapedTitle(result.title);
    setMode("text"); // bascule vers l'aperçu éditable
    setPhase("idle");
  }

  async function onAnalyze() {
    setPhase("analyzing");
    setError(null);
    const result = await analyzeText({ text });
    if ("error" in result) {
      setError(result.error);
      setPhase("idle");
      return;
    }
    setAnalysis(result.analysis);
    setGenerationId(result.generationId);
    setPhase("idle");
  }

  async function onCreate() {
    if (!analysis || !generationId) return;
    setPhase("creating");
    setError(null);
    const result = await createOpportunityFromAnalysis(generationId, analysis, sourceUrl);
    if ("error" in result) {
      setError(result.error);
      setPhase("idle");
      return;
    }
    router.push(`/opportunities/${result.opportunityId}`);
    router.refresh();
  }

  function onReset() {
    setText("");
    setUrl("");
    setMode("text");
    setSourceUrl(null);
    setScrapedTitle(null);
    setAnalysis(null);
    setGenerationId(null);
    setError(null);
    setPhase("idle");
  }

  function onModeChange(next: "url" | "text") {
    setError(null);
    setMode(next);
  }

  function update<K extends keyof Analysis>(key: K, value: Analysis[K]) {
    setAnalysis((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SourcePane
        mode={mode}
        onModeChange={onModeChange}
        url={url}
        onUrlChange={setUrl}
        text={text}
        onTextChange={setText}
        sourceUrl={sourceUrl}
        scrapedTitle={scrapedTitle}
        scraping={phase === "scraping"}
        analyzing={phase === "analyzing"}
        disabled={busy}
        error={mode === "url" || !analysis ? error : null}
        onScrape={onScrape}
        onAnalyze={onAnalyze}
      />
      <AnalysisPane
        analyzing={phase === "analyzing"}
        analysis={analysis}
        update={update}
        onCreate={onCreate}
        onReset={onReset}
        creating={phase === "creating"}
        error={analysis ? error : null}
      />
    </div>
  );
}
```
Note sur l'affichage des erreurs : une erreur de scrape/analyse s'affiche dans le volet Source ; une erreur de création s'affiche dans le volet Analyse (à côté du bouton « Créer »). D'où le partitionnement `error` passé à chaque volet.

- [ ] **Step 2 : Vérifier types + tests**

Run: `pnpm exec tsc --noEmit && pnpm exec vitest run`
Expected : 0 erreur TS ; tous les tests verts (dont `__tests__/ai/score.test.ts`).

- [ ] **Step 3 : Build**

Run: `pnpm exec next build`
Expected : build OK, route `/analyze` compilée. (Next 16 — en cas d'erreur framework, consulter `node_modules/next/dist/docs/`.)

- [ ] **Step 4 : Commit**
```bash
git add src/features/ai/components/analyzer-panel.tsx
git commit -m "feat(ui): rewire analyzer as two-pane workspace"
```

---

## Task 6 : Vérification end-to-end + polish a11y

**Files:** aucun (validation ; correctifs ciblés si besoin)

- [ ] **Step 1 : Lancer l'app**

Run: `pnpm dev` (stack Supabase locale up, `.env.local` avec `FIRECRAWL_API_KEY` + `ANTHROPIC_API_KEY`). S'inscrire via `/login` (confirmation email désactivée en local), aller sur `/analyze`.

- [ ] **Step 2 : Parcours nominal (URL)**

Onglet URL → coller une offre Free-Work → « Récupérer » → l'onglet bascule sur Texte, la **carte d'aperçu** (titre + host) et le contenu éditable s'affichent dans le volet gauche ; le volet droit montre l'**état vide**. Cliquer « Analyser → » → le volet droit passe en **skeleton** puis affiche la **jauge de score + chips + atouts/réserves**. Éditer un champ, cliquer « Créer l'opportunité » → redirection vers `/opportunities/{id}`.
Expected : chaque état s'affiche comme prévu, deux volets côte à côte.

- [ ] **Step 3 : Responsive**

Réduire la fenêtre sous le breakpoint `lg` → les deux volets s'**empilent** verticalement (Source au-dessus, Analyse en dessous).

- [ ] **Step 4 : Repli & reset**

Mode URL → URL invalide/login-only → « Récupérer » → message d'erreur dans le volet Source, pas de crash ; basculer « Texte » (l'erreur se vide) → coller à la main → Analyser fonctionne. Après un résultat, « Recommencer » vide tout (texte, url, aperçu, analyse).

- [ ] **Step 5 : A11y**

Vérifier : navigation clavier des onglets (Tabs Radix), focus visibles sur inputs/boutons, la jauge annonce le score via `aria-label` (pas seulement la couleur), animations réduites si `prefers-reduced-motion` (macOS : Réduire les animations).

- [ ] **Step 6 : Non-régression**

Run: `pnpm exec tsc --noEmit && pnpm exec vitest run && pnpm lint`
Expected : 0 erreur TS, tests verts, lint sans nouvelle erreur. Confirmer via `git diff main -- src/features/ai/actions/` qu'**aucune server action n'a été modifiée**.

- [ ] **Step 7 : Commit final (si correctifs)**
```bash
git add -A
git commit -m "chore: a11y and visual polish for analyzer workspace"
```

---

## Couverture du spec (self-review)

- Layout 2 volets, responsive empilé sous `lg` : **Task 5** (`grid gap-4 lg:grid-cols-2`) ✅
- Volet gauche (toggle Tabs, URL/Texte, carte aperçu favicon+titre+source, contenu éditable, « Analyser → ») : **Task 2 (preview) + Task 4** ✅
- Volet droit 3 états (vide / skeleton / résultat jauge+chips+atouts/réserves), champs éditables conservés : **Task 3** ✅
- Jauge de score + libellé qualitatif : **Task 1 (helpers) + Task 2 (gauge)** ✅
- Motion + `prefers-reduced-motion` : gauge `motion-reduce:transition-none` (Task 2), vérifié Task 6 ✅
- Tokens réutilisés (sémantiques shadcn) + palette score comme strict nécessaire : tout au long ✅
- Décomposition en composants isolés (`SourcePane`, `AnalysisPane`, `ScoreGauge`, `SourcePreviewCard`, états) : **Tasks 2-4** ✅
- Aucune modif server actions / données : garanti (aucune tâche ne touche `actions/` ni `schemas/analysis.ts`), vérifié Task 6 Step 6 ✅
- A11y (Tabs, focus, score lisible, reduced-motion) : **Task 6 Step 5** ✅

**Hors scope (volontaire)** : généralisation des tokens aux autres panneaux IA, couches design system 2-4, favicon réel externe.

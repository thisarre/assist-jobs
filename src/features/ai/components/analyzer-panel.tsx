"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  analyzeText,
  createOpportunityFromAnalysis,
  scrapeUrl,
} from "@/features/ai/actions/analyze-actions";
import type { Analysis } from "@/features/ai/schemas/analysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AnalyzerPanel() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"url" | "text">("text");
  const [url, setUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  async function onAnalyze() {
    setBusy(true);
    setError(null);
    const result = await analyzeText({ text });
    if ("error" in result) {
      setError(result.error);
      setBusy(false);
      return;
    }
    setAnalysis(result.analysis);
    setGenerationId(result.generationId);
    setBusy(false);
  }

  async function onScrape() {
    setBusy(true);
    setError(null);
    const result = await scrapeUrl({ url });
    if ("error" in result) {
      setError(result.error);
      setBusy(false);
      return;
    }
    setText(result.markdown);
    setSourceUrl(result.sourceUrl);
    setMode("text"); // switch to the editable preview (existing textarea)
    setBusy(false);
  }

  async function onCreate() {
    if (!analysis || !generationId) return;
    setBusy(true);
    setError(null);
    const result = await createOpportunityFromAnalysis(generationId, analysis, sourceUrl);
    if ("error" in result) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.push(`/opportunities/${result.opportunityId}`);
    router.refresh();
  }

  function update<K extends keyof Analysis>(key: K, value: Analysis[K]) {
    setAnalysis((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  if (!analysis) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex rounded-md border border-border p-0.5 text-sm">
          <button
            type="button"
            aria-pressed={mode === "text"}
            disabled={busy}
            onClick={() => {
              setError(null);
              setMode("text");
            }}
            className={`rounded px-3 py-1 ${mode === "text" ? "bg-muted font-medium" : "text-muted-foreground"}`}
          >
            Texte
          </button>
          <button
            type="button"
            aria-pressed={mode === "url"}
            disabled={busy}
            onClick={() => {
              setError(null);
              setMode("url");
            }}
            className={`rounded px-3 py-1 ${mode === "url" ? "bg-muted font-medium" : "text-muted-foreground"}`}
          >
            URL
          </button>
        </div>

        {mode === "url" ? (
          <div className="space-y-2">
            <Label htmlFor="analyze-url">Colle l&apos;URL d&apos;une offre</Label>
            <Input
              id="analyze-url"
              type="url"
              placeholder="https://www.free-work.com/…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={onScrape} disabled={busy || url.trim().length === 0}>
              {busy ? "Récupération…" : "Récupérer"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="analyze-text">Paste a job description or recruiter message</Label>
            <Textarea
              id="analyze-text"
              className="min-h-40"
              placeholder="Paste the text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {sourceUrl && (
              <p className="text-xs text-muted-foreground">Source : {sourceUrl}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={onAnalyze} disabled={busy || text.trim().length === 0}>
              {busy ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-md border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Match score</span>
          <span className="text-lg font-bold">{analysis.matchScore}/100</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{analysis.explanation}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="a-company">Company</Label>
          <Input
            id="a-company"
            value={analysis.companyName}
            onChange={(e) => update("companyName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-role">Role</Label>
          <Input
            id="a-role"
            value={analysis.role}
            onChange={(e) => update("role", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="a-location">Location</Label>
          <Input
            id="a-location"
            value={analysis.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-rate">Estimated daily rate (EUR)</Label>
          <Input
            id="a-rate"
            type="number"
            min={0}
            value={analysis.estimatedDailyRate ?? ""}
            onChange={(e) =>
              update(
                "estimatedDailyRate",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="a-tech">Technologies (comma-separated)</Label>
        <Input
          id="a-tech"
          value={analysis.technologies.join(", ")}
          onChange={(e) =>
            update(
              "technologies",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium">Strengths</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {analysis.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">Concerns</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {analysis.concerns.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={onCreate} disabled={busy}>
          {busy ? "Creating..." : "Create opportunity"}
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => {
            setAnalysis(null);
            setGenerationId(null);
            setSourceUrl(null);
            setText("");
            setUrl("");
            setError(null);
            setMode("text");
          }}
        >
          Start over
        </Button>
      </div>
    </div>
  );
}

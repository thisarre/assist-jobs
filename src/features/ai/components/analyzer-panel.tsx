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
  const [errorPane, setErrorPane] = useState<"source" | "analysis" | null>(null);

  const busy = phase !== "idle";

  async function onScrape() {
    setPhase("scraping");
    setError(null);
    setErrorPane(null);
    const result = await scrapeUrl({ url });
    if ("error" in result) {
      setError(result.error);
      setErrorPane("source");
      setPhase("idle");
      return;
    }
    setText(result.markdown);
    setSourceUrl(result.sourceUrl);
    setScrapedTitle(result.title);
    setMode("text");
    setPhase("idle");
  }

  async function onAnalyze() {
    setPhase("analyzing");
    setError(null);
    setErrorPane(null);
    const result = await analyzeText({ text });
    if ("error" in result) {
      setError(result.error);
      setErrorPane("source");
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
    setErrorPane(null);
    const result = await createOpportunityFromAnalysis(generationId, analysis, sourceUrl);
    if ("error" in result) {
      setError(result.error);
      setErrorPane("analysis");
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
    setErrorPane(null);
    setPhase("idle");
  }

  function onModeChange(next: "url" | "text") {
    setError(null);
    setErrorPane(null);
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
        error={errorPane === "source" ? error : null}
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
        busy={busy}
        error={errorPane === "analysis" ? error : null}
      />
    </div>
  );
}

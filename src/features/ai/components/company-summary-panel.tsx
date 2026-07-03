"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  summarizeCompany,
  applyCompanySummary,
} from "@/features/ai/actions/summarize-actions";
import type { CompanySummary } from "@/features/ai/schemas/summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CompanySummaryPanel({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<CompanySummary | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function onSummarize() {
    setBusy(true);
    setError(null);
    setApplied(false);
    const res = await summarizeCompany({ companyId, text });
    if ("error" in res) {
      setError(res.error);
      setBusy(false);
      return;
    }
    setSummary(res.summary);
    setGenerationId(res.generationId);
    setBusy(false);
  }

  async function onApply() {
    if (!summary || !generationId) return;
    setBusy(true);
    setError(null);
    const res = await applyCompanySummary(generationId, companyId, summary);
    if ("error" in res) {
      setError(res.error);
      setBusy(false);
      return;
    }
    setApplied(true);
    setBusy(false);
    router.refresh();
  }

  function update<K extends keyof CompanySummary>(key: K, value: CompanySummary[K]) {
    setSummary((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  if (!summary) {
    return (
      <div className="space-y-3">
        <Label htmlFor="summary-text">Paste the company&apos;s about page or notes</Label>
        <Textarea
          id="summary-text"
          className="min-h-32"
          placeholder="Paste text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button size="sm" onClick={onSummarize} disabled={busy || text.trim().length === 0}>
          {busy ? "Summarizing..." : "Summarize"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Relevance</span>
        <span className="text-lg font-bold">{summary.relevanceScore}/100</span>
      </div>
      <p className="text-sm text-muted-foreground">{summary.summary}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="summary-industry">Industry</Label>
          <Input
            id="summary-industry"
            value={summary.industry}
            onChange={(e) => update("industry", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="summary-size">Size estimate</Label>
          <Input id="summary-size" value={summary.sizeEstimate} readOnly />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="summary-hiring">Hiring signals (comma-separated)</Label>
        <Input
          id="summary-hiring"
          value={summary.hiringSignals.join(", ")}
          onChange={(e) =>
            update(
              "hiringSignals",
              e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
            )
          }
        />
      </div>

      {summary.techSignals.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tech signals:</span> {summary.techSignals.join(", ")}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onApply} disabled={busy || applied}>
          {applied ? "Applied" : busy ? "Applying..." : "Apply to company"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => {
            setSummary(null);
            setGenerationId(null);
            setApplied(false);
          }}
        >
          Start over
        </Button>
      </div>
    </div>
  );
}

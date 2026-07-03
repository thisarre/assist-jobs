"use client";

import { useState } from "react";
import { generateOutreach } from "@/features/ai/actions/outreach-actions";
import type { Outreach } from "@/features/ai/schemas/outreach";
import { MESSAGE_TYPES, LANGUAGES } from "@/lib/constants";
import { humanize } from "@/lib/opportunity-style";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MessageType, Language } from "@/types";

interface OutreachPanelProps {
  opportunityId: string;
  defaultLanguage: string;
}

export function OutreachPanel({ opportunityId, defaultLanguage }: OutreachPanelProps) {
  const initialLanguage: Language =
    (LANGUAGES as readonly string[]).includes(defaultLanguage)
      ? (defaultLanguage as Language)
      : "fr";

  const [messageType, setMessageType] = useState<MessageType>(MESSAGE_TYPES[0]);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [result, setResult] = useState<Outreach | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectClass =
    "h-9 rounded-md border border-input bg-background px-2 text-sm";

  async function onGenerate() {
    setBusy(true);
    setError(null);
    setCopied(false);
    const res = await generateOutreach({ opportunityId, messageType, language });
    if ("error" in res) {
      setError(res.error);
      setBusy(false);
      return;
    }
    setResult(res.outreach);
    setBusy(false);
  }

  async function onCopy() {
    if (!result) return;
    const text = (result.subject ? `${result.subject}\n\n` : "") + result.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="msg-type">Message type</Label>
          <select
            id="msg-type"
            className={selectClass}
            value={messageType}
            onChange={(e) => setMessageType(e.target.value as MessageType)}
          >
            {MESSAGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {humanize(t)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="msg-lang">Language</Label>
          <select
            id="msg-lang"
            className={selectClass}
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" onClick={onGenerate} disabled={busy}>
          {busy ? "Generating..." : result ? "Regenerate" : "Generate"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className="space-y-3 rounded-md border border-border p-4">
          {result.subject !== null && (
            <div className="space-y-1">
              <Label htmlFor="msg-subject">Subject</Label>
              <Input
                id="msg-subject"
                value={result.subject}
                onChange={(e) =>
                  setResult((prev) => (prev ? { ...prev, subject: e.target.value } : prev))
                }
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="msg-body">Message</Label>
            <Textarea
              id="msg-body"
              className="min-h-40"
              value={result.body}
              onChange={(e) =>
                setResult((prev) => (prev ? { ...prev, body: e.target.value } : prev))
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Tone:</span> {result.toneCheck} ·{" "}
            <span className="font-medium">Notes:</span> {result.personalizationNotes}
          </p>
          <Button size="sm" variant="outline" onClick={onCopy}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </Button>
        </div>
      )}
    </div>
  );
}

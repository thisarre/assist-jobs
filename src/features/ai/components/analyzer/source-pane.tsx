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
              disabled={disabled}
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
              disabled={disabled}
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

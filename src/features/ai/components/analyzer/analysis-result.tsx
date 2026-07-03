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
      <div className="flex items-center gap-3">
        <ScoreGauge value={analysis.matchScore} />
        <div>
          <p className="text-sm font-semibold text-foreground">{scoreLabel(analysis.matchScore)}</p>
          <p className="text-xs text-muted-foreground">{analysis.explanation}</p>
        </div>
      </div>

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

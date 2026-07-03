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

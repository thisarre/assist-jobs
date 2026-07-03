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

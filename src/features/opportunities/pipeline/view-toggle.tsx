import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildPipelineHref } from "@/features/opportunities/pipeline/params";
import type { PipelineParams } from "@/features/opportunities/pipeline/types";

export function ViewToggle({ params }: { params: PipelineParams }) {
  const base = "rounded-md px-3 py-1 text-sm transition-colors";
  return (
    <div className="inline-flex gap-1 rounded-md border border-border p-1">
      <Link
        href={buildPipelineHref(params, { view: "table" })}
        className={cn(
          base,
          params.view === "table"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Table
      </Link>
      <Link
        href={buildPipelineHref(params, { view: "kanban" })}
        className={cn(
          base,
          params.view === "kanban"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Kanban
      </Link>
    </div>
  );
}

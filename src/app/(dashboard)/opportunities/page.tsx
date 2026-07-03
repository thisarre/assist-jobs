import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { parsePipelineParams } from "@/features/opportunities/pipeline/params";
import { loadPipelineOpportunities } from "@/features/opportunities/pipeline/queries";
import { OpportunityTable } from "@/features/opportunities/pipeline/opportunity-table";
import { FilterBar } from "@/features/opportunities/pipeline/filter-bar";
import { ViewToggle } from "@/features/opportunities/pipeline/view-toggle";
import { KanbanBoard } from "@/features/opportunities/pipeline/kanban-board";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = parsePipelineParams(sp);
  const user = await getCurrentUser();

  // Kanban groups by status column, so it ignores table filters/sort.
  const rows = user
    ? await loadPipelineOpportunities(
        user.id,
        params.view === "kanban"
          ? { ...params, q: "", status: "", priority: "", sort: "createdAt", dir: "desc" }
          : params
      )
    : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
        <div className="flex items-center gap-3">
          <ViewToggle params={params} />
          <Button asChild size="sm">
            <Link href="/opportunities/new">New opportunity</Link>
          </Button>
        </div>
      </div>

      {params.view === "kanban" ? (
        <div className="mt-6">
          <KanbanBoard items={rows} />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <FilterBar params={params} />
          <OpportunityTable rows={rows} params={params} />
        </div>
      )}
    </div>
  );
}

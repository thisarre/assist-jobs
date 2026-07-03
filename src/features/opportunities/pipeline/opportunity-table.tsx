import Link from "next/link";
import { buildPipelineHref } from "@/features/opportunities/pipeline/params";
import type {
  PipelineParams,
  PipelineRow,
  SortCol,
} from "@/features/opportunities/pipeline/types";
import { humanize, priorityClasses } from "@/lib/opportunity-style";
import { toDateInputValue } from "@/lib/forms";
import { StatusSelect } from "@/features/opportunities/pipeline/status-select";

function SortLink({
  col,
  label,
  params,
}: {
  col: SortCol;
  label: string;
  params: PipelineParams;
}) {
  const active = params.sort === col;
  const nextDir = active && params.dir === "asc" ? "desc" : "asc";
  const indicator = active ? (params.dir === "asc" ? " ▲" : " ▼") : "";
  return (
    <Link
      href={buildPipelineHref(params, { sort: col, dir: nextDir })}
      className="hover:underline"
    >
      {label}
      {indicator}
    </Link>
  );
}

export function OpportunityTable({
  rows,
  params,
}: {
  rows: PipelineRow[];
  params: PipelineParams;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-border p-10 text-center text-sm text-muted-foreground">
        No opportunities match.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium"><SortLink col="title" label="Title" params={params} /></th>
            <th className="px-4 py-2 font-medium"><SortLink col="company" label="Company" params={params} /></th>
            <th className="px-4 py-2 font-medium"><SortLink col="status" label="Status" params={params} /></th>
            <th className="px-4 py-2 font-medium"><SortLink col="priority" label="Priority" params={params} /></th>
            <th className="px-4 py-2 font-medium"><SortLink col="probability" label="Prob." params={params} /></th>
            <th className="px-4 py-2 font-medium"><SortLink col="dailyRate" label="Rate" params={params} /></th>
            <th className="px-4 py-2 font-medium"><SortLink col="nextFollowupAt" label="Follow-up" params={params} /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <Link href={`/opportunities/${row.id}`} className="font-medium hover:underline">
                  {row.title}
                </Link>
              </td>
              <td className="px-4 py-3">{row.companyName ?? "—"}</td>
              <td className="px-4 py-3"><StatusSelect id={row.id} status={row.status} /></td>
              <td className="px-4 py-3">
                <span className={`rounded px-1.5 py-0.5 text-xs ${priorityClasses(row.priority)}`}>
                  {humanize(row.priority)}
                </span>
              </td>
              <td className="px-4 py-3">{row.probability != null ? `${row.probability}%` : "—"}</td>
              <td className="px-4 py-3">{row.dailyRate ? `€${row.dailyRate}` : "—"}</td>
              <td className="px-4 py-3">{toDateInputValue(row.nextFollowupAt) || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

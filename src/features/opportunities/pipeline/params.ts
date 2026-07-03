import { OPPORTUNITY_STATUSES, OPPORTUNITY_PRIORITIES } from "@/lib/constants";
import type { PipelineParams, SortCol, SortDir } from "./types";
import { SORTABLE_COLS } from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function parsePipelineParams(sp: SearchParams): PipelineParams {
  const view = first(sp.view) === "kanban" ? "kanban" : "table";
  const q = first(sp.q).trim();

  const statusRaw = first(sp.status);
  const status = (OPPORTUNITY_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as PipelineParams["status"])
    : "";

  const priorityRaw = first(sp.priority);
  const priority = (OPPORTUNITY_PRIORITIES as readonly string[]).includes(priorityRaw)
    ? (priorityRaw as PipelineParams["priority"])
    : "";

  const sortRaw = first(sp.sort);
  const sort: SortCol = (SORTABLE_COLS as readonly string[]).includes(sortRaw)
    ? (sortRaw as SortCol)
    : "createdAt";

  const dir: SortDir = first(sp.dir) === "asc" ? "asc" : "desc";

  return { view, q, status, priority, sort, dir };
}

/** Build a clean /opportunities URL, omitting default values. */
export function buildPipelineHref(
  current: PipelineParams,
  overrides: Partial<PipelineParams>
): string {
  const m = { ...current, ...overrides };
  const sp = new URLSearchParams();
  if (m.view !== "table") sp.set("view", m.view);
  if (m.q) sp.set("q", m.q);
  if (m.status) sp.set("status", m.status);
  if (m.priority) sp.set("priority", m.priority);
  if (m.sort !== "createdAt") sp.set("sort", m.sort);
  if (m.dir !== "desc") sp.set("dir", m.dir);
  const qs = sp.toString();
  return qs ? `/opportunities?${qs}` : "/opportunities";
}

import type { OpportunityStatus, OpportunityPriority } from "@/types";

export type SortCol =
  | "title"
  | "company"
  | "status"
  | "priority"
  | "probability"
  | "dailyRate"
  | "nextFollowupAt"
  | "createdAt";

export type SortDir = "asc" | "desc";

export const SORTABLE_COLS: readonly SortCol[] = [
  "title",
  "company",
  "status",
  "priority",
  "probability",
  "dailyRate",
  "nextFollowupAt",
  "createdAt",
];

export interface PipelineParams {
  view: "table" | "kanban";
  q: string;
  status: OpportunityStatus | "";
  priority: OpportunityPriority | "";
  sort: SortCol;
  dir: SortDir;
}

export interface PipelineRow {
  id: string;
  title: string;
  companyName: string | null;
  status: string;
  priority: string;
  probability: number | null;
  dailyRate: number | null;
  nextFollowupAt: Date | null;
}

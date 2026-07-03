export type ActionKind =
  | "followup_opportunity"
  | "followup_contact"
  | "to_contact"
  | "no_reply"
  | "warm_contact";

export type DashboardAction = {
  kind: ActionKind;
  entity: "opportunity" | "contact";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  dueAt: Date | null;
  priority: number;
};

export type OppActionRow = {
  id: string;
  title: string;
  status: string;
  nextFollowupAt: Date | null;
  lastInteractionAt: Date | null;
};

export type ContactActionRow = {
  id: string;
  firstName: string;
  lastName: string;
  relationshipStrength: string;
  nextFollowupAt: Date | null;
  lastInteractionAt: Date | null;
};

export type PipelineOppRow = { status: string; dailyRate: number | null };

export type StatusCount = { status: string; count: number };

export type PipelineSummary = {
  statusCounts: StatusCount[]; // active statuses with count > 0, in canonical order
  activeCount: number;
  wonCount: number;
  avgDailyRate: number | null;
};

export type WeeklyActivity = { interactions: number; opportunities: number };

export type DashboardData = {
  actions: DashboardAction[];
  truncatedCount: number;
  pipeline: PipelineSummary;
  weekly: WeeklyActivity;
  isEmpty: boolean;
};

import {
  ACTIVE_STATUSES,
  ACTION_LIST_CAP,
  CONTACTED_NO_REPLY_DAYS,
  WARM_IDLE_DAYS,
  NURTURE_STRENGTHS,
} from "./constants";
import type {
  DashboardAction,
  OppActionRow,
  ContactActionRow,
  PipelineOppRow,
  PipelineSummary,
  StatusCount,
} from "./types";

const ACTIVE_SET = new Set<string>(ACTIVE_STATUSES);
const NURTURE_SET = new Set<string>(NURTURE_STRENGTHS);
const DAY_MS = 86_400_000;

export function isActiveStatus(status: string): boolean {
  return ACTIVE_SET.has(status);
}

/** Whole days from `earlier` to `later` (floored; non-negative when later >= earlier). */
export function daysBetween(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / DAY_MS);
}

function followupSubtitle(dueAt: Date, now: Date): string {
  const overdue = daysBetween(now, dueAt);
  if (overdue <= 0) return "Follow-up due today";
  return `Follow-up overdue by ${overdue} day${overdue > 1 ? "s" : ""}`;
}

function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function buildActions(
  opps: OppActionRow[],
  contacts: ContactActionRow[],
  now: Date
): DashboardAction[] {
  const byKey = new Map<string, DashboardAction>();
  const add = (a: DashboardAction) => {
    const key = `${a.entity}:${a.id}`;
    const existing = byKey.get(key);
    if (!existing || a.priority < existing.priority) byKey.set(key, a);
  };
  const nowMs = now.getTime();

  for (const o of opps) {
    // Rule 1: opportunity follow-up due.
    if (o.nextFollowupAt && o.nextFollowupAt.getTime() <= nowMs) {
      add({
        kind: "followup_opportunity",
        entity: "opportunity",
        id: o.id,
        title: o.title,
        subtitle: followupSubtitle(o.nextFollowupAt, now),
        href: `/opportunities/${o.id}`,
        dueAt: o.nextFollowupAt,
        priority: 0,
      });
    }
    // Rule 3: to_contact with no pending future follow-up.
    if (
      o.status === "to_contact" &&
      (!o.nextFollowupAt || o.nextFollowupAt.getTime() <= nowMs)
    ) {
      add({
        kind: "to_contact",
        entity: "opportunity",
        id: o.id,
        title: o.title,
        subtitle: "Ready to reach out",
        href: `/opportunities/${o.id}`,
        dueAt: o.nextFollowupAt,
        priority: 1,
      });
    }
    // Rule 4: contacted, no reply for N days, no follow-up scheduled.
    if (
      o.status === "contacted" &&
      !o.nextFollowupAt &&
      o.lastInteractionAt &&
      daysBetween(now, o.lastInteractionAt) >= CONTACTED_NO_REPLY_DAYS
    ) {
      add({
        kind: "no_reply",
        entity: "opportunity",
        id: o.id,
        title: o.title,
        subtitle: `No reply for ${daysBetween(now, o.lastInteractionAt)} days`,
        href: `/opportunities/${o.id}`,
        dueAt: o.lastInteractionAt,
        priority: 2,
      });
    }
  }

  for (const c of contacts) {
    const name = fullName(c.firstName, c.lastName);
    // Rule 2: contact follow-up due.
    if (c.nextFollowupAt && c.nextFollowupAt.getTime() <= nowMs) {
      add({
        kind: "followup_contact",
        entity: "contact",
        id: c.id,
        title: name,
        subtitle: followupSubtitle(c.nextFollowupAt, now),
        href: `/contacts/${c.id}`,
        dueAt: c.nextFollowupAt,
        priority: 0,
      });
    }
    // Rule 5: nurture-strength contact gone quiet, no follow-up scheduled.
    if (
      NURTURE_SET.has(c.relationshipStrength) &&
      !c.nextFollowupAt &&
      (!c.lastInteractionAt || daysBetween(now, c.lastInteractionAt) >= WARM_IDLE_DAYS)
    ) {
      add({
        kind: "warm_contact",
        entity: "contact",
        id: c.id,
        title: name,
        subtitle: c.lastInteractionAt
          ? `No contact for ${daysBetween(now, c.lastInteractionAt)} days`
          : "No interaction yet — reconnect",
        href: `/contacts/${c.id}`,
        dueAt: c.lastInteractionAt,
        priority: 3,
      });
    }
  }

  return sortActions([...byKey.values()]);
}

export function sortActions(actions: DashboardAction[]): DashboardAction[] {
  return [...actions].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const at = a.dueAt ? a.dueAt.getTime() : Infinity;
    const bt = b.dueAt ? b.dueAt.getTime() : Infinity;
    if (at !== bt) return at - bt;
    return a.title.localeCompare(b.title, "en");
  });
}

export function capActions(
  actions: DashboardAction[],
  cap: number = ACTION_LIST_CAP
): { visible: DashboardAction[]; truncatedCount: number } {
  if (actions.length <= cap) return { visible: actions, truncatedCount: 0 };
  return { visible: actions.slice(0, cap), truncatedCount: actions.length - cap };
}

export function summarizePipeline(rows: PipelineOppRow[]): PipelineSummary {
  const counts = new Map<string, number>();
  let activeCount = 0;
  let wonCount = 0;
  let rateSum = 0;
  let rateN = 0;

  for (const r of rows) {
    counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
    if (r.status === "won") wonCount += 1;
    if (isActiveStatus(r.status)) {
      activeCount += 1;
      if (r.dailyRate != null) {
        rateSum += r.dailyRate;
        rateN += 1;
      }
    }
  }

  const statusCounts: StatusCount[] = ACTIVE_STATUSES.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  })).filter((s) => s.count > 0);

  return {
    statusCounts,
    activeCount,
    wonCount,
    avgDailyRate: rateN > 0 ? Math.round(rateSum / rateN) : null,
  };
}

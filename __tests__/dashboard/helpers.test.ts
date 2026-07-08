import { describe, it, expect } from "vitest";
import {
  isActiveStatus,
  daysBetween,
  buildActions,
  sortActions,
  capActions,
  summarizePipeline,
} from "@/features/dashboard/helpers";
import type {
  OppActionRow,
  ContactActionRow,
  DashboardAction,
} from "@/features/dashboard/types";

const NOW = new Date("2026-07-03T12:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);
const inDays = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

function opp(over: Partial<OppActionRow>): OppActionRow {
  return {
    id: over.id ?? "o1",
    title: over.title ?? "Opp",
    status: over.status ?? "detected",
    nextFollowupAt: over.nextFollowupAt ?? null,
    lastInteractionAt: over.lastInteractionAt ?? null,
  };
}
function contact(over: Partial<ContactActionRow>): ContactActionRow {
  return {
    id: over.id ?? "c1",
    firstName: over.firstName ?? "Ada",
    lastName: over.lastName ?? "Lovelace",
    relationshipStrength: over.relationshipStrength ?? "unknown",
    nextFollowupAt: over.nextFollowupAt ?? null,
    lastInteractionAt: over.lastInteractionAt ?? null,
  };
}

describe("isActiveStatus", () => {
  it("treats non-terminal statuses as active", () => {
    expect(isActiveStatus("detected")).toBe(true);
    expect(isActiveStatus("proposal_sent")).toBe(true);
  });
  it("treats terminal statuses as inactive", () => {
    expect(isActiveStatus("won")).toBe(false);
    expect(isActiveStatus("lost")).toBe(false);
    expect(isActiveStatus("archived")).toBe(false);
  });
});

describe("daysBetween", () => {
  it("floors whole days between two dates", () => {
    expect(daysBetween(NOW, daysAgo(7))).toBe(7);
    expect(daysBetween(NOW, daysAgo(0))).toBe(0);
  });
});

describe("buildActions", () => {
  it("surfaces a due opportunity follow-up at priority 0", () => {
    const actions = buildActions([opp({ nextFollowupAt: daysAgo(1) })], [], NOW);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      kind: "followup_opportunity",
      priority: 0,
      href: "/opportunities/o1",
    });
    expect(actions[0].subtitle).toBe("Follow-up overdue by 1 day");
  });

  it("ignores a future opportunity follow-up", () => {
    const actions = buildActions([opp({ nextFollowupAt: inDays(2) })], [], NOW);
    expect(actions).toHaveLength(0);
  });

  it("surfaces a to_contact opportunity at priority 1", () => {
    const actions = buildActions([opp({ status: "to_contact" })], [], NOW);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({ kind: "to_contact", priority: 1 });
    expect(actions[0].subtitle).toBe("Ready to reach out");
  });

  it("surfaces a contacted opportunity with no reply past the threshold", () => {
    const actions = buildActions(
      [opp({ status: "contacted", lastInteractionAt: daysAgo(8) })],
      [],
      NOW
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({ kind: "no_reply", priority: 2 });
    expect(actions[0].subtitle).toBe("No reply for 8 days");
  });

  it("does not surface a contacted opportunity still within the threshold", () => {
    const actions = buildActions(
      [opp({ status: "contacted", lastInteractionAt: daysAgo(3) })],
      [],
      NOW
    );
    expect(actions).toHaveLength(0);
  });

  it("surfaces a due contact follow-up at priority 0", () => {
    const actions = buildActions([], [contact({ nextFollowupAt: daysAgo(1) })], NOW);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      kind: "followup_contact",
      priority: 0,
      href: "/contacts/c1",
      title: "Ada Lovelace",
    });
  });

  it("surfaces a strong contact gone quiet past the idle threshold", () => {
    const actions = buildActions(
      [],
      [contact({ relationshipStrength: "strong", lastInteractionAt: daysAgo(20) })],
      NOW
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({ kind: "warm_contact", priority: 3 });
    expect(actions[0].subtitle).toBe("No contact for 20 days");
  });

  it("surfaces a strong contact never contacted", () => {
    const actions = buildActions(
      [],
      [contact({ relationshipStrength: "medium", lastInteractionAt: null })],
      NOW
    );
    expect(actions).toHaveLength(1);
    expect(actions[0].subtitle).toBe("No interaction yet — reconnect");
  });

  it("does not nurture weak/unknown contacts", () => {
    const actions = buildActions(
      [],
      [contact({ relationshipStrength: "weak", lastInteractionAt: daysAgo(90) })],
      NOW
    );
    expect(actions).toHaveLength(0);
  });

  it("dedups an entity matching two rules, keeping the most urgent", () => {
    const actions = buildActions(
      [opp({ status: "to_contact", nextFollowupAt: daysAgo(1) })],
      [],
      NOW
    );
    expect(actions).toHaveLength(1);
    expect(actions[0].priority).toBe(0);
    expect(actions[0].kind).toBe("followup_opportunity");
  });

  it("surfaces a follow-up due exactly now as 'due today'", () => {
    const actions = buildActions([opp({ nextFollowupAt: NOW })], [], NOW);
    expect(actions).toHaveLength(1);
    expect(actions[0].subtitle).toBe("Follow-up due today");
  });

  it("surfaces no_reply exactly at the threshold (7 days)", () => {
    const actions = buildActions(
      [opp({ status: "contacted", lastInteractionAt: daysAgo(7) })],
      [],
      NOW
    );
    expect(actions).toHaveLength(1);
    expect(actions[0].kind).toBe("no_reply");
  });

  it("does not surface no_reply one day under the threshold (6 days)", () => {
    const actions = buildActions(
      [opp({ status: "contacted", lastInteractionAt: daysAgo(6) })],
      [],
      NOW
    );
    expect(actions).toHaveLength(0);
  });

  it("surfaces warm_contact exactly at the idle threshold (14 days)", () => {
    const actions = buildActions(
      [],
      [contact({ relationshipStrength: "strong", lastInteractionAt: daysAgo(14) })],
      NOW
    );
    expect(actions).toHaveLength(1);
    expect(actions[0].kind).toBe("warm_contact");
  });

  it("does not surface a follow-up for a terminal-status opportunity", () => {
    const actions = buildActions(
      [opp({ status: "won", nextFollowupAt: daysAgo(5) })],
      [],
      NOW
    );
    expect(actions).toHaveLength(0);
  });
});

describe("sortActions", () => {
  it("orders by priority, then dueAt (nulls last), then title", () => {
    const mk = (o: Partial<DashboardAction>): DashboardAction => ({
      kind: "to_contact",
      entity: "opportunity",
      id: o.id ?? "x",
      title: o.title ?? "T",
      subtitle: "",
      href: "",
      dueAt: o.dueAt ?? null,
      priority: o.priority ?? 0,
    });
    const sorted = sortActions([
      mk({ id: "d", priority: 1, title: "Zeta" }),
      mk({ id: "a", priority: 0, dueAt: daysAgo(1) }),
      mk({ id: "b", priority: 0, dueAt: null, title: "Alpha" }),
      mk({ id: "c", priority: 0, dueAt: daysAgo(3) }),
    ]);
    expect(sorted.map((s) => s.id)).toEqual(["c", "a", "b", "d"]);
  });
});

describe("capActions", () => {
  it("returns all when under the cap", () => {
    const a = Array.from({ length: 3 }, (_, i) => ({ id: String(i) })) as DashboardAction[];
    const { visible, truncatedCount } = capActions(a, 12);
    expect(visible).toHaveLength(3);
    expect(truncatedCount).toBe(0);
  });
  it("caps and reports the remainder", () => {
    const a = Array.from({ length: 15 }, (_, i) => ({ id: String(i) })) as DashboardAction[];
    const { visible, truncatedCount } = capActions(a, 12);
    expect(visible).toHaveLength(12);
    expect(truncatedCount).toBe(3);
  });
  it("returns all when exactly at the cap", () => {
    const a = Array.from({ length: 12 }, (_, i) => ({ id: String(i) })) as DashboardAction[];
    const { visible, truncatedCount } = capActions(a, 12);
    expect(visible).toHaveLength(12);
    expect(truncatedCount).toBe(0);
  });
});

describe("summarizePipeline", () => {
  it("counts active statuses, won, and averages non-null rates", () => {
    const s = summarizePipeline([
      { status: "detected", dailyRate: 500 },
      { status: "contacted", dailyRate: 700 },
      { status: "contacted", dailyRate: null },
      { status: "won", dailyRate: 900 },
      { status: "lost", dailyRate: 100 },
    ]);
    expect(s.activeCount).toBe(3);
    expect(s.wonCount).toBe(1);
    expect(s.avgDailyRate).toBe(600);
    expect(s.statusCounts).toEqual([
      { status: "detected", count: 1 },
      { status: "contacted", count: 2 },
    ]);
  });
  it("returns null avg when no active rates present", () => {
    const s = summarizePipeline([{ status: "won", dailyRate: 900 }]);
    expect(s.activeCount).toBe(0);
    expect(s.avgDailyRate).toBeNull();
  });
});

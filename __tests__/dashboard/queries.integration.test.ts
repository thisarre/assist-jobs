import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, opportunities, contacts, interactions } from "@/db/schema";
import { loadDashboard } from "@/features/dashboard/queries";

const HAS_DB = !!process.env.DATABASE_URL;
const NOW = new Date("2026-07-03T12:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

const USER_A = "aaaaaaaa-0000-4000-8000-000000000001";
const USER_B = "bbbbbbbb-0000-4000-8000-000000000002";

async function cleanup() {
  for (const uid of [USER_A, USER_B]) {
    await db.delete(interactions).where(eq(interactions.userId, uid));
    await db.delete(opportunities).where(eq(opportunities.userId, uid));
    await db.delete(contacts).where(eq(contacts.userId, uid));
    await db.delete(users).where(eq(users.id, uid));
  }
}

describe.skipIf(!HAS_DB)("loadDashboard (DB round-trip)", () => {
  beforeAll(async () => {
    await cleanup();
    await db.insert(users).values([
      { id: USER_A, email: "a@test.dev", fullName: "A" },
      { id: USER_B, email: "b@test.dev", fullName: "B" },
    ]);

    await db.insert(opportunities).values([
      { userId: USER_A, title: "Followup due", status: "contacted", nextFollowupAt: daysAgo(1) },
      { userId: USER_A, title: "To contact", status: "to_contact" },
      { userId: USER_A, title: "No reply", status: "contacted", lastInteractionAt: daysAgo(8) },
      { userId: USER_A, title: "Recent reply", status: "contacted", lastInteractionAt: daysAgo(3) },
      { userId: USER_A, title: "Won deal", status: "won", dailyRate: 800 },
      { userId: USER_A, title: "Rated", status: "detected", dailyRate: 600 },
    ]);
    await db.insert(contacts).values([
      { userId: USER_A, firstName: "Due", lastName: "Followup", nextFollowupAt: daysAgo(1) },
      { userId: USER_A, firstName: "Warm", lastName: "Lead", relationshipStrength: "strong", lastInteractionAt: daysAgo(20) },
      { userId: USER_A, firstName: "Weak", lastName: "Tie", relationshipStrength: "weak", lastInteractionAt: daysAgo(90) },
    ]);
    await db.insert(interactions).values([
      { userId: USER_A, type: "note", direction: "outbound", content: "recent", createdAt: daysAgo(2) },
      { userId: USER_A, type: "note", direction: "outbound", content: "old", createdAt: daysAgo(30) },
    ]);

    await db.insert(opportunities).values([
      { userId: USER_B, title: "Other user opp", status: "to_contact" },
    ]);
  });

  afterAll(cleanup);

  it("returns exactly the expected actions for user A", async () => {
    const data = await loadDashboard(USER_A, NOW);
    const titles = data.actions.map((a) => a.title).sort();
    expect(titles).toEqual(
      ["Due Followup", "Followup due", "No reply", "To contact", "Warm Lead"].sort()
    );
    expect(titles).not.toContain("Other user opp");
    expect(titles).not.toContain("Recent reply");
    expect(titles).not.toContain("Weak Tie");
  });

  it("summarizes the pipeline (active + won + avg rate)", async () => {
    const data = await loadDashboard(USER_A, NOW);
    expect(data.pipeline.wonCount).toBe(1);
    expect(data.pipeline.activeCount).toBe(5);
    expect(data.pipeline.avgDailyRate).toBe(600);
  });

  it("counts weekly interactions within the last 7 days", async () => {
    const data = await loadDashboard(USER_A, NOW);
    expect(data.weekly.interactions).toBe(1);
  });

  it("reports isEmpty for a user with no data", async () => {
    const data = await loadDashboard("cccccccc-0000-4000-8000-000000000003", NOW);
    expect(data.isEmpty).toBe(true);
    expect(data.actions).toHaveLength(0);
  });
});

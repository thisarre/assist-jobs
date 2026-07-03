import {
  and,
  count,
  eq,
  gte,
  inArray,
  isNotNull,
  notInArray,
  or,
} from "drizzle-orm";
import { db } from "@/db/client";
import { opportunities, contacts, interactions } from "@/db/schema";
import {
  ACTION_LIST_CAP,
  NURTURE_STRENGTHS,
  TERMINAL_STATUSES,
} from "./constants";
import { buildActions, capActions, summarizePipeline } from "./helpers";
import type {
  DashboardData,
  OppActionRow,
  ContactActionRow,
  PipelineOppRow,
  WeeklyActivity,
} from "./types";

const WEEK_MS = 7 * 86_400_000;

/** Active (non-terminal) opportunities — candidates for action rules 1/3/4. */
async function getActionOpportunityRows(userId: string): Promise<OppActionRow[]> {
  return db
    .select({
      id: opportunities.id,
      title: opportunities.title,
      status: opportunities.status,
      nextFollowupAt: opportunities.nextFollowupAt,
      lastInteractionAt: opportunities.lastInteractionAt,
    })
    .from(opportunities)
    .where(
      and(
        eq(opportunities.userId, userId),
        notInArray(opportunities.status, [...TERMINAL_STATUSES])
      )
    );
}

/** Contacts that could match action rules 2 or 5. */
async function getActionContactRows(userId: string): Promise<ContactActionRow[]> {
  return db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      relationshipStrength: contacts.relationshipStrength,
      nextFollowupAt: contacts.nextFollowupAt,
      lastInteractionAt: contacts.lastInteractionAt,
    })
    .from(contacts)
    .where(
      and(
        eq(contacts.userId, userId),
        or(
          isNotNull(contacts.nextFollowupAt),
          inArray(contacts.relationshipStrength, [...NURTURE_STRENGTHS])
        )
      )
    );
}

/** All opportunities' status + rate, for the pipeline summary. */
async function getPipelineRows(userId: string): Promise<PipelineOppRow[]> {
  return db
    .select({ status: opportunities.status, dailyRate: opportunities.dailyRate })
    .from(opportunities)
    .where(eq(opportunities.userId, userId));
}

async function getWeeklyActivity(userId: string, now: Date): Promise<WeeklyActivity> {
  const since = new Date(now.getTime() - WEEK_MS);
  const [i] = await db
    .select({ n: count() })
    .from(interactions)
    .where(and(eq(interactions.userId, userId), gte(interactions.createdAt, since)));
  const [o] = await db
    .select({ n: count() })
    .from(opportunities)
    .where(and(eq(opportunities.userId, userId), gte(opportunities.createdAt, since)));
  return { interactions: i?.n ?? 0, opportunities: o?.n ?? 0 };
}

async function getContactCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(contacts)
    .where(eq(contacts.userId, userId));
  return row?.n ?? 0;
}

/**
 * Load everything the dashboard needs for a user. `now` is captured once by the
 * caller so every rule comparison shares one instant.
 */
export async function loadDashboard(userId: string, now: Date): Promise<DashboardData> {
  const [oppActionRows, contactActionRows, pipelineRows, weekly, contactTotal] =
    await Promise.all([
      getActionOpportunityRows(userId),
      getActionContactRows(userId),
      getPipelineRows(userId),
      getWeeklyActivity(userId, now),
      getContactCount(userId),
    ]);

  const allActions = buildActions(oppActionRows, contactActionRows, now);
  const { visible, truncatedCount } = capActions(allActions, ACTION_LIST_CAP);

  return {
    actions: visible,
    truncatedCount,
    pipeline: summarizePipeline(pipelineRows),
    weekly,
    isEmpty: pipelineRows.length === 0 && contactTotal === 0,
  };
}

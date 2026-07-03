import { and, asc, desc, eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { opportunities, companies } from "@/db/schema";
import type { PipelineParams, PipelineRow } from "./types";

/** Load a user's opportunities with optional filter/search + sort applied. */
export async function loadPipelineOpportunities(
  userId: string,
  params: PipelineParams
): Promise<PipelineRow[]> {
  const conditions: SQL[] = [eq(opportunities.userId, userId)];
  if (params.status) conditions.push(eq(opportunities.status, params.status));
  if (params.priority) conditions.push(eq(opportunities.priority, params.priority));
  if (params.q) conditions.push(ilike(opportunities.title, `%${params.q}%`));

  const sortColumn = {
    title: opportunities.title,
    company: companies.name,
    status: opportunities.status,
    priority: opportunities.priority,
    probability: opportunities.probability,
    dailyRate: opportunities.dailyRate,
    nextFollowupAt: opportunities.nextFollowupAt,
    createdAt: opportunities.createdAt,
  }[params.sort];

  const orderBy = params.dir === "asc" ? asc(sortColumn) : desc(sortColumn);

  return db
    .select({
      id: opportunities.id,
      title: opportunities.title,
      companyName: companies.name,
      status: opportunities.status,
      priority: opportunities.priority,
      probability: opportunities.probability,
      dailyRate: opportunities.dailyRate,
      nextFollowupAt: opportunities.nextFollowupAt,
    })
    .from(opportunities)
    .leftJoin(
      companies,
      and(eq(opportunities.companyId, companies.id), eq(companies.userId, userId))
    )
    .where(and(...conditions))
    .orderBy(orderBy);
}

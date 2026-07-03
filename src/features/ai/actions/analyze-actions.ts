"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { users, companies, opportunities, aiGenerations } from "@/db/schema";
import { emptyToNull } from "@/lib/forms";
import { REMOTE_POLICIES } from "@/lib/constants";
import { generateStructured, AiError } from "@/features/ai/provider";
import { analysisSchema, type Analysis } from "@/features/ai/schemas/analysis";
import { buildAnalyzePrompt, ANALYZE_PROMPT_KEY } from "@/features/ai/prompts/analyze";
import { scrapeUrl as firecrawlScrape, FirecrawlError } from "@/lib/firecrawl";
import { scrapeInputSchema } from "@/features/ai/schemas/scrape";

type AnalyzeResult =
  | { success: true; generationId: string; analysis: Analysis }
  | { error: string };

type CreateResult = { success: true; opportunityId: string } | { error: string };

type ScrapeResult =
  | { success: true; markdown: string; title: string | null; sourceUrl: string }
  | { error: string };

const inputSchema = z.object({ text: z.string().trim().min(1, "Paste some text first") });

/** Map a free-text remote policy to a valid enum value, or null. */
function matchRemotePolicy(value: string): string | null {
  const v = value.trim().toLowerCase();
  return (REMOTE_POLICIES as readonly string[]).includes(v) ? v : null;
}

export async function analyzeText(input: unknown): Promise<AnalyzeResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: "Paste some text first" };

  const [row] = await db
    .select({ profile: users.profile })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const profile = row?.profile ?? null;

  const { system, user: userPrompt } = buildAnalyzePrompt(profile, parsed.data.text);

  try {
    const { data, model, tokensUsed } = await generateStructured({
      schema: analysisSchema,
      system,
      user: userPrompt,
      maxTokens: 2048,
    });

    const [gen] = await db
      .insert(aiGenerations)
      .values({
        userId: user.id,
        type: "analysis",
        inputText: parsed.data.text,
        promptKey: ANALYZE_PROMPT_KEY,
        output: data,
        model,
        tokensUsed,
        status: "generated",
      })
      .returning({ id: aiGenerations.id });

    return { success: true, generationId: gen.id, analysis: data };
  } catch (e) {
    return { error: e instanceof AiError ? e.message : "Analysis failed" };
  }
}

export async function createOpportunityFromAnalysis(
  generationId: string,
  edited: unknown,
  sourceUrl?: string | null
): Promise<CreateResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = analysisSchema.safeParse(edited);
  if (!parsed.success) return { error: "Invalid analysis data" };
  const a = parsed.data;

  // daily_rate / probability are integer columns — round the AI's numbers.
  const dailyRate = a.estimatedDailyRate == null ? 0 : Math.round(a.estimatedDailyRate);
  const trimmedSourceUrl = sourceUrl?.trim() || null;

  try {
    // Find-or-create the company by name (user-scoped).
    let companyId: string | null = null;
    const name = a.companyName.trim();
    if (name) {
      const [existing] = await db
        .select({ id: companies.id })
        .from(companies)
        .where(and(eq(companies.userId, user.id), eq(companies.name, name)))
        .limit(1);
      if (existing) {
        companyId = existing.id;
      } else {
        const [co] = await db
          .insert(companies)
          .values({
            userId: user.id,
            name,
            location: emptyToNull(a.location),
            technologies: a.technologies,
            relationshipStatus: "cold",
          })
          .returning({ id: companies.id });
        companyId = co.id;
      }
    }

    const [op] = await db
      .insert(opportunities)
      .values({
        userId: user.id,
        sourceUrl: trimmedSourceUrl,
        // "website" is a valid OPPORTUNITY_SOURCES value (src/lib/constants.ts)
        source: trimmedSourceUrl ? "website" : null,
        companyId,
        title: a.role.trim() || "Untitled opportunity",
        status: "detected",
        priority: "medium",
        probability: Math.round(a.matchScore),
        dailyRate,
        location: emptyToNull(a.location),
        remotePolicy: matchRemotePolicy(a.remotePolicy),
        technologies: a.technologies,
        description: a.explanation,
        notes: `AI match ${a.matchScore}/100.\nStrengths: ${a.strengths.join("; ")}.\nConcerns: ${a.concerns.join("; ")}.\nRecommended: ${a.recommendedAction}`,
        language: "fr",
      })
      .returning({ id: opportunities.id });

    // Mark the generation accepted and link it (ownership-scoped).
    await db
      .update(aiGenerations)
      .set({
        status: "accepted",
        opportunityId: op.id,
        companyId,
        updatedAt: new Date(),
      })
      .where(and(eq(aiGenerations.id, generationId), eq(aiGenerations.userId, user.id)));

    revalidatePath("/opportunities");
    return { success: true, opportunityId: op.id };
  } catch {
    return { error: "Could not create the opportunity. Please try again." };
  }
}

export async function scrapeUrl(input: unknown): Promise<ScrapeResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = scrapeInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid URL" };
  }

  try {
    const page = await firecrawlScrape(parsed.data.url);
    return {
      success: true,
      markdown: page.markdown,
      title: page.title,
      sourceUrl: page.sourceUrl,
    };
  } catch (e) {
    return {
      error: e instanceof FirecrawlError ? e.message : "Could not read that page.",
    };
  }
}

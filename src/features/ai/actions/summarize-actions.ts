"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { users, companies, aiGenerations } from "@/db/schema";
import { emptyToNull } from "@/lib/forms";
import { generateStructured, AiError } from "@/features/ai/provider";
import { summarySchema, type CompanySummary } from "@/features/ai/schemas/summary";
import { buildSummarizePrompt, SUMMARIZE_PROMPT_KEY } from "@/features/ai/prompts/summarize";

type SummarizeResult =
  | { success: true; generationId: string; summary: CompanySummary }
  | { error: string };

type ApplyResult = { success: true } | { error: string };

const inputSchema = z.object({
  // A UUID guard prevents a malformed id from crashing the pre-LLM query;
  // the length cap keeps a huge paste from blowing up cost/latency.
  companyId: z.string().uuid(),
  text: z.string().trim().min(1, "Paste some text first").max(20000),
});

export async function summarizeCompany(input: unknown): Promise<SummarizeResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: "Paste some text first" };
  const { companyId, text } = parsed.data;

  const [company] = await db
    .select({ name: companies.name })
    .from(companies)
    .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)))
    .limit(1);
  if (!company) return { error: "Company not found" };

  const [profileRow] = await db
    .select({ profile: users.profile })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const { system, user: userPrompt } = buildSummarizePrompt(
    profileRow?.profile ?? null,
    company.name,
    text
  );

  try {
    const { data, model, tokensUsed } = await generateStructured({
      schema: summarySchema,
      system,
      user: userPrompt,
      maxTokens: 1024,
    });

    const [gen] = await db
      .insert(aiGenerations)
      .values({
        userId: user.id,
        type: "summary",
        companyId,
        inputText: text,
        promptKey: SUMMARIZE_PROMPT_KEY,
        output: data,
        model,
        tokensUsed,
        status: "generated",
      })
      .returning({ id: aiGenerations.id });

    return { success: true, generationId: gen.id, summary: data };
  } catch (e) {
    return { error: e instanceof AiError ? e.message : "Summary failed" };
  }
}

export async function applyCompanySummary(
  generationId: string,
  companyId: string,
  edited: unknown
): Promise<ApplyResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = summarySchema.safeParse(edited);
  if (!parsed.success) return { error: "Invalid summary data" };
  const s = parsed.data;

  try {
    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)))
      .limit(1);
    if (!company) return { error: "Company not found" };

    await db
      .update(companies)
      .set({
        industry: emptyToNull(s.industry),
        hiringSignals: s.hiringSignals.length ? s.hiringSignals.join(", ") : null,
        updatedAt: new Date(),
      })
      .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)));

    await db
      .update(aiGenerations)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(and(eq(aiGenerations.id, generationId), eq(aiGenerations.userId, user.id)));

    revalidatePath(`/companies/${companyId}`);
    return { success: true };
  } catch {
    return { error: "Could not apply the summary. Please try again." };
  }
}

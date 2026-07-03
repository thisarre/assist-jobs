"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { users, opportunities, companies, contacts, aiGenerations } from "@/db/schema";
import { MESSAGE_TYPES, LANGUAGES } from "@/lib/constants";
import { generateStructured, AiError } from "@/features/ai/provider";
import { outreachSchema, type Outreach } from "@/features/ai/schemas/outreach";
import { buildOutreachPrompt, OUTREACH_PROMPT_KEY } from "@/features/ai/prompts/outreach";

type Result =
  | { success: true; generationId: string; outreach: Outreach }
  | { error: string };

const inputSchema = z.object({
  opportunityId: z.string().min(1),
  messageType: z.enum(MESSAGE_TYPES),
  language: z.enum(LANGUAGES),
});

export async function generateOutreach(input: unknown): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid request" };
  const { opportunityId, messageType, language } = parsed.data;

  const [opp] = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, opportunityId), eq(opportunities.userId, user.id)))
    .limit(1);
  if (!opp) return { error: "Opportunity not found" };

  const [company] = opp.companyId
    ? await db
        .select({ name: companies.name })
        .from(companies)
        .where(and(eq(companies.id, opp.companyId), eq(companies.userId, user.id)))
        .limit(1)
    : [];
  const [contact] = opp.contactId
    ? await db
        .select({ firstName: contacts.firstName, lastName: contacts.lastName })
        .from(contacts)
        .where(and(eq(contacts.id, opp.contactId), eq(contacts.userId, user.id)))
        .limit(1)
    : [];
  const [profileRow] = await db
    .select({ profile: users.profile })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const { system, user: userPrompt } = buildOutreachPrompt({
    profile: profileRow?.profile ?? null,
    context: {
      opportunityTitle: opp.title,
      companyName: company?.name ?? null,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
      technologies: opp.technologies ?? [],
      dailyRate: opp.dailyRate,
      description: opp.description,
    },
    messageType,
    language,
  });

  try {
    const { data, model, tokensUsed } = await generateStructured({
      schema: outreachSchema,
      system,
      user: userPrompt,
      maxTokens: 1024,
    });

    const [gen] = await db
      .insert(aiGenerations)
      .values({
        userId: user.id,
        type: "outreach",
        opportunityId: opp.id,
        companyId: opp.companyId,
        contactId: opp.contactId,
        inputText: `${messageType} (${language})`,
        promptKey: OUTREACH_PROMPT_KEY,
        output: data,
        model,
        tokensUsed,
        status: "generated",
      })
      .returning({ id: aiGenerations.id });

    return { success: true, generationId: gen.id, outreach: data };
  } catch (e) {
    return { error: e instanceof AiError ? e.message : "Generation failed" };
  }
}

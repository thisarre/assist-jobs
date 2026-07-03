import type { UserProfile } from "@/db/schema";

export const SUMMARIZE_PROMPT_KEY = "summarize.v1";

export function buildSummarizePrompt(
  profile: UserProfile | null,
  companyName: string,
  text: string
): { system: string; user: string } {
  const role = profile?.role?.trim() || "freelance professional";
  const clients = profile?.targetClients?.trim() || "unspecified";

  const system =
    `Summarize this company for a freelance ${role} evaluating a potential partnership ` +
    `(they target: ${clients}). From the provided text, extract the industry, a size estimate, ` +
    `tech signals, and hiring signals, and give a relevance score from 0 to 100 for this ` +
    `freelancer. Be concise and factual; use an empty string or empty list when a field is not ` +
    `present in the text.`;

  const user = `Company: ${companyName}\n\nText:\n${text}`;

  return { system, user };
}

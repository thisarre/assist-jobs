import type { UserProfile } from "@/db/schema";

export const ANALYZE_PROMPT_KEY = "analyze.v1";

/** Build the system + user prompts for the Analyzer, personalized to the freelancer. */
export function buildAnalyzePrompt(
  profile: UserProfile | null,
  text: string
): { system: string; user: string } {
  const role = profile?.role?.trim() || "freelance professional";
  const skills = profile?.skills?.length ? profile.skills.join(", ") : "various skills";
  const rate = profile?.targetDailyRate
    ? `${profile.targetDailyRate}€/day`
    : "unspecified";
  const clients = profile?.targetClients?.trim() || "unspecified";

  const system =
    `You are an assistant for a freelance ${role} specialized in ${skills}. ` +
    `Their target daily rate is ${rate} and they target these clients: ${clients}. ` +
    `Extract structured opportunity data from the text the user provides and evaluate ` +
    `how well it matches this freelancer's profile with a match score from 0 to 100. ` +
    `Be concise and factual. If a field is not present in the text, infer conservatively ` +
    `or use an empty string; use null for the estimated daily rate when it is unknown.`;

  const user = `Analyze this text and extract the opportunity:\n\n${text}`;

  return { system, user };
}

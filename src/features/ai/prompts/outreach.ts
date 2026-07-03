import type { UserProfile } from "@/db/schema";

export const OUTREACH_PROMPT_KEY = "outreach.v1";

export interface OutreachContext {
  opportunityTitle: string;
  companyName: string | null;
  contactName: string | null;
  technologies: string[];
  dailyRate: number | null;
  description: string | null;
}

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  linkedin_connection: "LinkedIn connection request",
  linkedin_followup: "LinkedIn follow-up message",
  cold_email: "cold email",
  recruiter_reply: "reply to a recruiter",
  polite_decline: "polite decline",
  interview_prep: "interview preparation notes",
  questions_to_ask: "questions to ask the client",
  short_pitch: "short pitch",
};

export function buildOutreachPrompt(params: {
  profile: UserProfile | null;
  context: OutreachContext;
  messageType: string;
  language: string;
}): { system: string; user: string } {
  const { profile, context, messageType, language } = params;
  const label = MESSAGE_TYPE_LABELS[messageType] ?? messageType;
  const role = profile?.role?.trim() || "freelance professional";
  const skills = profile?.skills?.length ? profile.skills.join(", ") : "various skills";
  const langName = language === "fr" ? "French" : "English";

  const system =
    `You are helping a freelance ${role} specialized in ${skills} write a ${label} in ${langName}. ` +
    `Tone: professional, direct, human — not salesy, not generic. Use the freelancer's real ` +
    `experience. Include a subject line only for email message types; otherwise set subject to null. ` +
    `Return the message body, a one-line tone check, and short personalization notes.`;

  const lines = [
    `Message type: ${label}`,
    `Opportunity: ${context.opportunityTitle}`,
    context.companyName ? `Company: ${context.companyName}` : null,
    context.contactName ? `Contact: ${context.contactName}` : null,
    context.technologies.length ? `Technologies: ${context.technologies.join(", ")}` : null,
    context.dailyRate ? `Target daily rate: ${context.dailyRate}€` : null,
    context.description ? `Details: ${context.description}` : null,
  ].filter(Boolean);

  const user = `Write the message using this context:\n\n${lines.join("\n")}`;
  return { system, user };
}

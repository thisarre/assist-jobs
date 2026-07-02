export const OPPORTUNITY_STATUSES = [
  "detected",
  "to_contact",
  "contacted",
  "replied",
  "interview",
  "proposal_sent",
  "won",
  "lost",
  "archived",
] as const;

export const OPPORTUNITY_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const REMOTE_POLICIES = [
  "onsite",
  "hybrid",
  "remote",
  "flexible",
] as const;

export const RELATIONSHIP_STATUSES = [
  "cold",
  "warm",
  "hot",
  "client",
  "past_client",
] as const;

export const RELATIONSHIP_STRENGTHS = [
  "unknown",
  "weak",
  "medium",
  "strong",
] as const;

export const COMPANY_SIZES = [
  "startup",
  "scaleup",
  "enterprise",
  "agency",
  "esn",
] as const;

export const INTERACTION_TYPES = [
  "note",
  "email",
  "linkedin",
  "call",
  "meeting",
  "other",
] as const;

export const INTERACTION_DIRECTIONS = ["inbound", "outbound"] as const;

export const OPPORTUNITY_SOURCES = [
  "linkedin",
  "malt",
  "referral",
  "direct",
  "website",
  "other",
] as const;

export const AI_GENERATION_TYPES = [
  "analysis",
  "outreach",
  "summary",
  "match_score",
] as const;

export const AI_GENERATION_STATUSES = [
  "generated",
  "accepted",
  "rejected",
  "edited",
] as const;

export const LANGUAGES = ["fr", "en"] as const;

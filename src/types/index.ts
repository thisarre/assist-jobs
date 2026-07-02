import type {
  OPPORTUNITY_STATUSES,
  OPPORTUNITY_PRIORITIES,
  REMOTE_POLICIES,
  RELATIONSHIP_STATUSES,
  RELATIONSHIP_STRENGTHS,
  COMPANY_SIZES,
  INTERACTION_TYPES,
  INTERACTION_DIRECTIONS,
  OPPORTUNITY_SOURCES,
  AI_GENERATION_TYPES,
  AI_GENERATION_STATUSES,
  LANGUAGES,
  ENTITY_TYPES,
} from "@/lib/constants";

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];
export type OpportunityPriority = (typeof OPPORTUNITY_PRIORITIES)[number];
export type RemotePolicy = (typeof REMOTE_POLICIES)[number];
export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];
export type RelationshipStrength = (typeof RELATIONSHIP_STRENGTHS)[number];
export type CompanySize = (typeof COMPANY_SIZES)[number];
export type InteractionType = (typeof INTERACTION_TYPES)[number];
export type InteractionDirection = (typeof INTERACTION_DIRECTIONS)[number];
export type OpportunitySource = (typeof OPPORTUNITY_SOURCES)[number];
export type AiGenerationType = (typeof AI_GENERATION_TYPES)[number];
export type AiGenerationStatus = (typeof AI_GENERATION_STATUSES)[number];
export type Language = (typeof LANGUAGES)[number];
export type EntityType = (typeof ENTITY_TYPES)[number];

// src/features/dashboard/constants.ts
import { OPPORTUNITY_STATUSES } from "@/lib/constants";

/** Days since last interaction after which a "contacted" opp with no reply is surfaced. */
export const CONTACTED_NO_REPLY_DAYS = 7;
/** Days of silence after which a medium/strong contact is surfaced to re-warm. */
export const WARM_IDLE_DAYS = 14;
/** Max actions rendered in the action list; extras are counted, not dropped silently. */
export const ACTION_LIST_CAP = 12;
/** Statuses that count as an in-flight opportunity (not terminal). */
export const ACTIVE_STATUSES = OPPORTUNITY_STATUSES.filter(
  (s) => s !== "won" && s !== "lost" && s !== "archived"
);
/** Terminal statuses excluded from action queries. */
export const TERMINAL_STATUSES = ["won", "lost", "archived"] as const;
/** Relationship strengths worth proactively nurturing. */
export const NURTURE_STRENGTHS = ["medium", "strong"] as const;

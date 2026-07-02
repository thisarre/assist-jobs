// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
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
} from "@/lib/constants";

describe("constants", () => {
  it("OPPORTUNITY_STATUSES contains all required statuses", () => {
    expect(OPPORTUNITY_STATUSES).toContain("detected");
    expect(OPPORTUNITY_STATUSES).toContain("to_contact");
    expect(OPPORTUNITY_STATUSES).toContain("contacted");
    expect(OPPORTUNITY_STATUSES).toContain("replied");
    expect(OPPORTUNITY_STATUSES).toContain("interview");
    expect(OPPORTUNITY_STATUSES).toContain("proposal_sent");
    expect(OPPORTUNITY_STATUSES).toContain("won");
    expect(OPPORTUNITY_STATUSES).toContain("lost");
    expect(OPPORTUNITY_STATUSES).toContain("archived");
    expect(OPPORTUNITY_STATUSES).toHaveLength(9);
  });

  it("OPPORTUNITY_PRIORITIES contains all levels", () => {
    expect(OPPORTUNITY_PRIORITIES).toEqual(["low", "medium", "high", "critical"]);
  });

  it("REMOTE_POLICIES contains all options", () => {
    expect(REMOTE_POLICIES).toEqual(["onsite", "hybrid", "remote", "flexible"]);
  });

  it("RELATIONSHIP_STATUSES contains all stages", () => {
    expect(RELATIONSHIP_STATUSES).toEqual([
      "cold",
      "warm",
      "hot",
      "client",
      "past_client",
    ]);
  });

  it("RELATIONSHIP_STRENGTHS contains all levels", () => {
    expect(RELATIONSHIP_STRENGTHS).toEqual([
      "unknown",
      "weak",
      "medium",
      "strong",
    ]);
  });

  it("COMPANY_SIZES contains all options", () => {
    expect(COMPANY_SIZES).toEqual([
      "startup",
      "scaleup",
      "enterprise",
      "agency",
      "esn",
    ]);
  });

  it("INTERACTION_TYPES contains all types", () => {
    expect(INTERACTION_TYPES).toEqual([
      "note",
      "email",
      "linkedin",
      "call",
      "meeting",
      "other",
    ]);
  });

  it("INTERACTION_DIRECTIONS contains both directions", () => {
    expect(INTERACTION_DIRECTIONS).toEqual(["inbound", "outbound"]);
  });

  it("OPPORTUNITY_SOURCES contains all sources", () => {
    expect(OPPORTUNITY_SOURCES).toEqual([
      "linkedin",
      "malt",
      "referral",
      "direct",
      "website",
      "other",
    ]);
  });

  it("AI_GENERATION_TYPES contains all types", () => {
    expect(AI_GENERATION_TYPES).toEqual([
      "analysis",
      "outreach",
      "summary",
      "match_score",
    ]);
  });

  it("AI_GENERATION_STATUSES contains all statuses", () => {
    expect(AI_GENERATION_STATUSES).toEqual([
      "generated",
      "accepted",
      "rejected",
      "edited",
    ]);
  });
});

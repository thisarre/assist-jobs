import { describe, it, expect } from "vitest";
import { summarySchema } from "@/features/ai/schemas/summary";

const valid = {
  summary: "A fintech scale-up building a payments platform.",
  industry: "Fintech",
  sizeEstimate: "50-200 employees",
  techSignals: ["React", "Node.js"],
  hiringSignals: ["Hiring senior engineers"],
  relevanceScore: 78,
};

describe("summarySchema", () => {
  it("validates a full summary", () => {
    expect(summarySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a relevance score above 100", () => {
    expect(summarySchema.safeParse({ ...valid, relevanceScore: 120 }).success).toBe(false);
  });

  it("rejects a negative relevance score", () => {
    expect(summarySchema.safeParse({ ...valid, relevanceScore: -1 }).success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const { industry, ...withoutIndustry } = valid;
    expect(summarySchema.safeParse(withoutIndustry).success).toBe(false);
  });

  it("rejects non-array signals", () => {
    expect(summarySchema.safeParse({ ...valid, techSignals: "React" }).success).toBe(false);
  });
});

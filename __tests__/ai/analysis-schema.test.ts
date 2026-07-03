import { describe, it, expect } from "vitest";
import { analysisSchema } from "@/features/ai/schemas/analysis";

const valid = {
  companyName: "TechCorp",
  role: "Senior React Developer",
  technologies: ["React", "TypeScript"],
  seniority: "senior",
  location: "Paris, France",
  remotePolicy: "hybrid",
  estimatedDailyRate: 650,
  matchScore: 82,
  strengths: ["Strong React match"],
  concerns: ["Onsite 2 days/week"],
  recommendedAction: "Apply and mention fintech experience",
  explanation: "Good fit overall.",
};

describe("analysisSchema", () => {
  it("validates a full analysis", () => {
    expect(analysisSchema.safeParse(valid).success).toBe(true);
  });

  it("allows a null estimated rate", () => {
    expect(analysisSchema.safeParse({ ...valid, estimatedDailyRate: null }).success).toBe(true);
  });

  it("rejects a match score above 100", () => {
    expect(analysisSchema.safeParse({ ...valid, matchScore: 120 }).success).toBe(false);
  });

  it("rejects a negative match score", () => {
    expect(analysisSchema.safeParse({ ...valid, matchScore: -1 }).success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const { role, ...withoutRole } = valid;
    expect(analysisSchema.safeParse(withoutRole).success).toBe(false);
  });

  it("rejects a non-array technologies field", () => {
    expect(analysisSchema.safeParse({ ...valid, technologies: "React" }).success).toBe(false);
  });
});

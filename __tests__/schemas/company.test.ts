import { describe, it, expect } from "vitest";
import { companySchema } from "@/features/companies/schemas/company";

describe("companySchema", () => {
  it("validates a full valid company", () => {
    const result = companySchema.safeParse({
      name: "TechCorp",
      website: "https://techcorp.example.com",
      linkedinUrl: "https://linkedin.com/company/techcorp",
      industry: "Fintech",
      size: "scaleup",
      location: "Paris, France",
      technologies: ["React", "TypeScript"],
      hiringSignals: "Hiring React devs",
      notes: "Met the CTO",
      relationshipStatus: "warm",
      score: 75,
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for a minimal company (name only)", () => {
    const result = companySchema.safeParse({ name: "Acme" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.website).toBe("");
      expect(result.data.size).toBe("");
      expect(result.data.technologies).toEqual([]);
      expect(result.data.relationshipStatus).toBe("cold");
      expect(result.data.score).toBe(0);
    }
  });

  it("rejects an empty name", () => {
    expect(companySchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects an invalid size enum", () => {
    expect(
      companySchema.safeParse({ name: "Acme", size: "huge" }).success
    ).toBe(false);
  });

  it("accepts an empty-string size (means unset)", () => {
    const result = companySchema.safeParse({ name: "Acme", size: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid relationship status", () => {
    expect(
      companySchema.safeParse({ name: "Acme", relationshipStatus: "frozen" })
        .success
    ).toBe(false);
  });

  it("rejects a score above 100", () => {
    expect(
      companySchema.safeParse({ name: "Acme", score: 120 }).success
    ).toBe(false);
  });

  it("rejects a negative score", () => {
    expect(
      companySchema.safeParse({ name: "Acme", score: -5 }).success
    ).toBe(false);
  });
});

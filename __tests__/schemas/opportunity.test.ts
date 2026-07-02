import { describe, it, expect } from "vitest";
import { opportunitySchema } from "@/features/opportunities/schemas/opportunity";

describe("opportunitySchema", () => {
  it("validates a full valid opportunity", () => {
    const result = opportunitySchema.safeParse({
      title: "Senior React Developer",
      companyId: "11111111-1111-4111-8111-111111111111",
      contactId: "22222222-2222-4222-8222-222222222222",
      source: "linkedin",
      status: "contacted",
      priority: "high",
      remotePolicy: "hybrid",
      probability: 60,
      dailyRate: 650,
      location: "Paris",
      technologies: ["React", "TypeScript"],
      description: "6-month mission",
      notes: "warm intro",
      language: "fr",
      nextAction: "call Marie",
      nextFollowupAt: "2026-03-15",
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for a minimal opportunity (title only)", () => {
    const result = opportunitySchema.safeParse({ title: "Some mission" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe("");
      expect(result.data.contactId).toBe("");
      expect(result.data.source).toBe("");
      expect(result.data.status).toBe("detected");
      expect(result.data.priority).toBe("medium");
      expect(result.data.remotePolicy).toBe("");
      expect(result.data.probability).toBe(0);
      expect(result.data.dailyRate).toBe(0);
      expect(result.data.technologies).toEqual([]);
      expect(result.data.language).toBe("fr");
    }
  });

  it("rejects an empty title", () => {
    expect(opportunitySchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects an invalid status", () => {
    expect(opportunitySchema.safeParse({ title: "X", status: "pending" }).success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    expect(opportunitySchema.safeParse({ title: "X", priority: "urgent" }).success).toBe(false);
  });

  it("accepts empty-string source and remotePolicy (unset)", () => {
    const result = opportunitySchema.safeParse({ title: "X", source: "", remotePolicy: "" });
    expect(result.success).toBe(true);
  });

  it("rejects probability over 100", () => {
    expect(opportunitySchema.safeParse({ title: "X", probability: 150 }).success).toBe(false);
  });

  it("rejects a negative daily rate", () => {
    expect(opportunitySchema.safeParse({ title: "X", dailyRate: -10 }).success).toBe(false);
  });
});

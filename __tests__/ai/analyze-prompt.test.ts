import { describe, it, expect } from "vitest";
import { buildAnalyzePrompt, ANALYZE_PROMPT_KEY } from "@/features/ai/prompts/analyze";

const profile = {
  bio: "",
  role: "Senior Front-End Engineer",
  skills: ["React", "TypeScript"],
  preferredStack: [],
  targetDailyRate: 650,
  preferredRemote: "remote",
  preferredLocation: "Paris",
  targetClients: "fintech scale-ups",
  yearsExperience: 8,
  languages: ["fr", "en"],
};

describe("buildAnalyzePrompt", () => {
  it("puts the profile context in the system prompt", () => {
    const { system } = buildAnalyzePrompt(profile, "some job text");
    expect(system).toContain("Senior Front-End Engineer");
    expect(system).toContain("React");
    expect(system).toContain("650");
    expect(system).toContain("fintech scale-ups");
  });

  it("puts the pasted text in the user prompt", () => {
    const { user } = buildAnalyzePrompt(profile, "Hiring a React dev in Lyon");
    expect(user).toContain("Hiring a React dev in Lyon");
  });

  it("works with a null profile", () => {
    const { system, user } = buildAnalyzePrompt(null, "text");
    expect(typeof system).toBe("string");
    expect(system.length).toBeGreaterThan(0);
    expect(user).toContain("text");
  });

  it("exposes a stable prompt key", () => {
    expect(ANALYZE_PROMPT_KEY).toBe("analyze.v1");
  });
});

import { describe, it, expect } from "vitest";
import { buildSummarizePrompt, SUMMARIZE_PROMPT_KEY } from "@/features/ai/prompts/summarize";

const profile = {
  bio: "",
  role: "Senior Front-End Engineer",
  skills: ["React"],
  preferredStack: [],
  targetDailyRate: 650,
  preferredRemote: "remote",
  preferredLocation: "Paris",
  targetClients: "fintech",
  yearsExperience: 8,
  languages: ["fr"],
};

describe("buildSummarizePrompt", () => {
  it("mentions the freelancer role and relevance scoring in the system prompt", () => {
    const { system } = buildSummarizePrompt(profile, "TechCorp", "about text");
    expect(system).toContain("Senior Front-End Engineer");
    expect(system.toLowerCase()).toContain("relevance");
  });

  it("puts the company name and pasted text in the user prompt", () => {
    const { user } = buildSummarizePrompt(profile, "TechCorp", "We build payment rails");
    expect(user).toContain("TechCorp");
    expect(user).toContain("We build payment rails");
  });

  it("works with a null profile", () => {
    const { system, user } = buildSummarizePrompt(null, "Acme", "text");
    expect(system.length).toBeGreaterThan(0);
    expect(user).toContain("Acme");
  });

  it("exposes a stable prompt key", () => {
    expect(SUMMARIZE_PROMPT_KEY).toBe("summarize.v1");
  });
});

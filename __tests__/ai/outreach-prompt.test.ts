import { describe, it, expect } from "vitest";
import { buildOutreachPrompt, OUTREACH_PROMPT_KEY } from "@/features/ai/prompts/outreach";

const profile = {
  bio: "",
  role: "Senior Front-End Engineer",
  skills: ["React", "TypeScript"],
  preferredStack: [],
  targetDailyRate: 650,
  preferredRemote: "remote",
  preferredLocation: "Paris",
  targetClients: "fintech",
  yearsExperience: 8,
  languages: ["fr", "en"],
};

const context = {
  opportunityTitle: "Senior React Developer",
  companyName: "TechCorp",
  contactName: "Marie Dupont",
  technologies: ["React", "Next.js"],
  dailyRate: 650,
  description: "6-month mission",
};

describe("buildOutreachPrompt", () => {
  it("includes the role, message type, and language in the system prompt", () => {
    const { system } = buildOutreachPrompt({ profile, context, messageType: "cold_email", language: "en" });
    expect(system).toContain("Senior Front-End Engineer");
    expect(system).toContain("cold email");
    expect(system).toContain("English");
  });

  it("maps language fr to French", () => {
    const { system } = buildOutreachPrompt({ profile, context, messageType: "linkedin_connection", language: "fr" });
    expect(system).toContain("French");
  });

  it("includes the opportunity context in the user prompt", () => {
    const { user } = buildOutreachPrompt({ profile, context, messageType: "cold_email", language: "en" });
    expect(user).toContain("Senior React Developer");
    expect(user).toContain("TechCorp");
    expect(user).toContain("Marie Dupont");
  });

  it("works with a null profile and missing company/contact", () => {
    const { system, user } = buildOutreachPrompt({
      profile: null,
      context: { opportunityTitle: "X", companyName: null, contactName: null, technologies: [], dailyRate: null, description: null },
      messageType: "short_pitch",
      language: "fr",
    });
    expect(system.length).toBeGreaterThan(0);
    expect(user).toContain("X");
  });

  it("exposes a stable prompt key", () => {
    expect(OUTREACH_PROMPT_KEY).toBe("outreach.v1");
  });
});

// @vitest-environment node
import { describe, it, expect } from "vitest";
import { profileSchema } from "@/features/settings/schemas/profile";

describe("profileSchema", () => {
  it("validates a complete valid profile", () => {
    const validProfile = {
      bio: "Senior Front-End Engineer specializing in React and TypeScript",
      role: "Senior Front-End Engineer",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      preferredStack: ["React", "Node.js"],
      targetDailyRate: 650,
      preferredRemote: "remote",
      preferredLocation: "Paris, France",
      targetClients: "Startups and scale-ups in fintech",
      yearsExperience: 8,
      languages: ["fr", "en"],
    };

    const result = profileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("allows partial profile with only required fields", () => {
    const minimalProfile = {
      role: "Developer",
      skills: ["JavaScript"],
    };

    const result = profileSchema.safeParse(minimalProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bio).toBe("");
      expect(result.data.targetDailyRate).toBe(0);
      expect(result.data.languages).toEqual(["fr"]);
    }
  });

  it("rejects negative daily rate", () => {
    const profile = {
      role: "Developer",
      skills: ["JavaScript"],
      targetDailyRate: -100,
    };

    const result = profileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it("rejects empty role", () => {
    const profile = {
      role: "",
      skills: ["JavaScript"],
    };

    const result = profileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it("rejects empty skills array", () => {
    const profile = {
      role: "Developer",
      skills: [],
    };

    const result = profileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it("rejects invalid remote policy", () => {
    const profile = {
      role: "Developer",
      skills: ["JavaScript"],
      preferredRemote: "invalid",
    };

    const result = profileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it("rejects negative years of experience", () => {
    const profile = {
      role: "Developer",
      skills: ["JavaScript"],
      yearsExperience: -1,
    };

    const result = profileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });

  it("rejects invalid language codes", () => {
    const profile = {
      role: "Developer",
      skills: ["JavaScript"],
      languages: ["xx"],
    };

    const result = profileSchema.safeParse(profile);
    expect(result.success).toBe(false);
  });
});

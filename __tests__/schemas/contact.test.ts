import { describe, it, expect } from "vitest";
import { contactSchema } from "@/features/contacts/schemas/contact";

describe("contactSchema", () => {
  it("validates a full valid contact", () => {
    const result = contactSchema.safeParse({
      firstName: "Marie",
      lastName: "Dupont",
      companyId: "11111111-1111-4111-8111-111111111111",
      role: "CTO",
      linkedinUrl: "https://linkedin.com/in/marie",
      email: "marie@example.com",
      phone: "+33123456789",
      language: "fr",
      relationshipStrength: "medium",
      notes: "Met at a meetup",
      nextFollowupAt: "2026-03-15",
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for a minimal contact (first + last name)", () => {
    const result = contactSchema.safeParse({ firstName: "Jo", lastName: "Ng" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe("");
      expect(result.data.role).toBe("");
      expect(result.data.language).toBe("fr");
      expect(result.data.relationshipStrength).toBe("unknown");
      expect(result.data.nextFollowupAt).toBe("");
    }
  });

  it("rejects an empty first name", () => {
    expect(contactSchema.safeParse({ firstName: "", lastName: "Ng" }).success).toBe(false);
  });

  it("rejects an empty last name", () => {
    expect(contactSchema.safeParse({ firstName: "Jo", lastName: "" }).success).toBe(false);
  });

  it("rejects an invalid language", () => {
    expect(
      contactSchema.safeParse({ firstName: "Jo", lastName: "Ng", language: "de" }).success
    ).toBe(false);
  });

  it("rejects an invalid relationship strength", () => {
    expect(
      contactSchema.safeParse({
        firstName: "Jo",
        lastName: "Ng",
        relationshipStrength: "besties",
      }).success
    ).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { outreachSchema } from "@/features/ai/schemas/outreach";

const valid = {
  subject: "Freelance React support",
  body: "Hi Marie, ...",
  toneCheck: "Professional and direct.",
  personalizationNotes: "Referenced the fintech dashboard.",
};

describe("outreachSchema", () => {
  it("validates a full outreach message", () => {
    expect(outreachSchema.safeParse(valid).success).toBe(true);
  });

  it("allows a null subject (non-email messages)", () => {
    expect(outreachSchema.safeParse({ ...valid, subject: null }).success).toBe(true);
  });

  it("rejects a missing body", () => {
    const { body, ...withoutBody } = valid;
    expect(outreachSchema.safeParse(withoutBody).success).toBe(false);
  });

  it("rejects a non-string body", () => {
    expect(outreachSchema.safeParse({ ...valid, body: 42 }).success).toBe(false);
  });
});

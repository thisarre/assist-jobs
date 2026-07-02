import { describe, it, expect } from "vitest";
import { tagSchema } from "@/features/tags/schemas/tag";

describe("tagSchema", () => {
  it("validates a tag name", () => {
    expect(tagSchema.safeParse({ name: "urgent" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(tagSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects a name over 40 chars", () => {
    expect(tagSchema.safeParse({ name: "x".repeat(41) }).success).toBe(false);
  });

  it("trims whitespace around the name", () => {
    const result = tagSchema.safeParse({ name: "  react  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("react");
  });
});

import { describe, it, expect } from "vitest";
import { interactionSchema } from "@/features/interactions/schemas/interaction";

describe("interactionSchema", () => {
  it("validates a full interaction", () => {
    const result = interactionSchema.safeParse({
      type: "linkedin",
      direction: "outbound",
      content: "Sent a connection request",
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for type and direction", () => {
    const result = interactionSchema.safeParse({ content: "Quick note" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("note");
      expect(result.data.direction).toBe("outbound");
    }
  });

  it("rejects empty content", () => {
    expect(interactionSchema.safeParse({ content: "" }).success).toBe(false);
  });

  it("rejects an invalid type", () => {
    expect(
      interactionSchema.safeParse({ type: "carrier-pigeon", content: "hi" }).success
    ).toBe(false);
  });

  it("rejects an invalid direction", () => {
    expect(
      interactionSchema.safeParse({ direction: "sideways", content: "hi" }).success
    ).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { opportunityStatusSchema } from "@/features/opportunities/schemas/status";

describe("opportunityStatusSchema", () => {
  it("accepts every valid status", () => {
    for (const s of ["detected", "won", "lost", "archived", "proposal_sent"]) {
      expect(opportunityStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it("rejects an unknown status", () => {
    expect(opportunityStatusSchema.safeParse("pending").success).toBe(false);
    expect(opportunityStatusSchema.safeParse("").success).toBe(false);
  });
});

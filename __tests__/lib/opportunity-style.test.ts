import { describe, it, expect } from "vitest";
import { humanize, KANBAN_STATUSES } from "@/lib/opportunity-style";

describe("humanize", () => {
  it("capitalizes and de-underscores", () => {
    expect(humanize("to_contact")).toBe("To contact");
    expect(humanize("proposal_sent")).toBe("Proposal sent");
    expect(humanize("won")).toBe("Won");
  });
});

describe("KANBAN_STATUSES", () => {
  it("is the statuses minus archived (8 columns)", () => {
    expect(KANBAN_STATUSES).toHaveLength(8);
    expect(KANBAN_STATUSES).not.toContain("archived");
    expect(KANBAN_STATUSES[0]).toBe("detected");
    expect(KANBAN_STATUSES).toContain("won");
    expect(KANBAN_STATUSES).toContain("lost");
  });
});

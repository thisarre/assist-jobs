import { describe, it, expect } from "vitest";
import { entityDetailPath } from "@/lib/entities";

describe("entityDetailPath", () => {
  it("maps company to /companies/:id", () => {
    expect(entityDetailPath("company", "abc")).toBe("/companies/abc");
  });
  it("maps contact to /contacts/:id", () => {
    expect(entityDetailPath("contact", "abc")).toBe("/contacts/abc");
  });
  it("maps opportunity to /opportunities/:id", () => {
    expect(entityDetailPath("opportunity", "abc")).toBe("/opportunities/abc");
  });
});

import { describe, it, expect } from "vitest";
import { emptyToNull, parseDateInput, toDateInputValue } from "@/lib/forms";

describe("emptyToNull", () => {
  it("maps empty/whitespace to null and trims otherwise", () => {
    expect(emptyToNull("")).toBeNull();
    expect(emptyToNull("   ")).toBeNull();
    expect(emptyToNull(null)).toBeNull();
    expect(emptyToNull(undefined)).toBeNull();
    expect(emptyToNull("  hi  ")).toBe("hi");
  });
});

describe("parseDateInput", () => {
  it("maps empty string to null", () => {
    expect(parseDateInput("")).toBeNull();
  });

  it("parses a yyyy-mm-dd string to a Date", () => {
    const d = parseDateInput("2026-03-15");
    expect(d).toBeInstanceOf(Date);
    expect(d?.getUTCFullYear()).toBe(2026);
    expect(d?.getUTCMonth()).toBe(2); // March = 2
    expect(d?.getUTCDate()).toBe(15);
  });
});

describe("toDateInputValue", () => {
  it("maps null to empty string", () => {
    expect(toDateInputValue(null)).toBe("");
  });

  it("formats a Date as yyyy-mm-dd", () => {
    expect(toDateInputValue(new Date("2026-03-15T10:30:00.000Z"))).toBe("2026-03-15");
  });
});

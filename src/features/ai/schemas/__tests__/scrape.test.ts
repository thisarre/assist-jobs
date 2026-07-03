import { describe, it, expect } from "vitest";
import { scrapeInputSchema } from "../scrape";

describe("scrapeInputSchema", () => {
  it("accepte une URL http(s) valide", () => {
    const r = scrapeInputSchema.safeParse({ url: "https://www.free-work.com/fr/offre/123" });
    expect(r.success).toBe(true);
  });

  it("rejette une chaîne qui n'est pas une URL", () => {
    const r = scrapeInputSchema.safeParse({ url: "pas une url" });
    expect(r.success).toBe(false);
  });

  it("rejette une URL vide", () => {
    const r = scrapeInputSchema.safeParse({ url: "" });
    expect(r.success).toBe(false);
  });

  it("rejette un schéma non http(s) (ftp)", () => {
    const r = scrapeInputSchema.safeParse({ url: "ftp://example.com" });
    expect(r.success).toBe(false);
  });

  it("accepte une URL https entourée d'espaces (trim)", () => {
    const r = scrapeInputSchema.safeParse({ url: "  https://www.free-work.com/x  " });
    expect(r.success).toBe(true);
  });
});

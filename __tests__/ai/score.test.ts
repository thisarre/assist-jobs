import { describe, it, expect } from "vitest";
import { scoreTone, scoreLabel } from "@/features/ai/components/analyzer/score";

describe("scoreTone", () => {
  it("classe par seuils 80/60/40", () => {
    expect(scoreTone(87)).toBe("strong");
    expect(scoreTone(80)).toBe("strong");
    expect(scoreTone(79)).toBe("good");
    expect(scoreTone(60)).toBe("good");
    expect(scoreTone(59)).toBe("moderate");
    expect(scoreTone(40)).toBe("moderate");
    expect(scoreTone(39)).toBe("weak");
    expect(scoreTone(0)).toBe("weak");
  });
});

describe("scoreLabel", () => {
  it("mappe la tonalité vers un libellé FR", () => {
    expect(scoreLabel(90)).toBe("Fort match");
    expect(scoreLabel(70)).toBe("Bon match");
    expect(scoreLabel(50)).toBe("Match moyen");
    expect(scoreLabel(10)).toBe("Match faible");
  });
});

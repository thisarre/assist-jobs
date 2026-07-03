export type ScoreTone = "strong" | "good" | "moderate" | "weak";

/** Bucketise un score 0-100 en tonalité qualitative (seuils 80/60/40). */
export function scoreTone(value: number): ScoreTone {
  if (value >= 80) return "strong";
  if (value >= 60) return "good";
  if (value >= 40) return "moderate";
  return "weak";
}

/** Libellé FR affiché à côté de la jauge. */
export function scoreLabel(value: number): string {
  switch (scoreTone(value)) {
    case "strong":
      return "Fort match";
    case "good":
      return "Bon match";
    case "moderate":
      return "Match moyen";
    case "weak":
      return "Match faible";
  }
}

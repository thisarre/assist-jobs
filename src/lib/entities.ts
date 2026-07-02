import type { EntityType } from "@/types";

const BASE_PATH: Record<EntityType, string> = {
  company: "companies",
  contact: "contacts",
  opportunity: "opportunities",
};

/** The dashboard detail route for an entity, e.g. entityDetailPath("company", id). */
export function entityDetailPath(entityType: EntityType, id: string): string {
  return `/${BASE_PATH[entityType]}/${id}`;
}

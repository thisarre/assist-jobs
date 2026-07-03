import { OPPORTUNITY_STATUSES } from "@/lib/constants";

/** Statuses shown as Kanban columns (archived is the hidden bucket). */
export const KANBAN_STATUSES = OPPORTUNITY_STATUSES.filter((s) => s !== "archived");

/** "to_contact" -> "To contact". */
export function humanize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

/** Tailwind classes for a priority pill. */
export function priorityClasses(priority: string): string {
  switch (priority) {
    case "critical":
      return "bg-destructive/15 text-destructive";
    case "high":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
    case "medium":
      return "bg-primary/15 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

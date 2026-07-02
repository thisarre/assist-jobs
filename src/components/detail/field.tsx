import type { ReactNode } from "react";

/** A labelled read-only field for entity detail pages. Renders "—" when empty. */
export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value || "—"}</dd>
    </div>
  );
}

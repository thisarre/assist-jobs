"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOpportunityStatus } from "@/features/opportunities/actions/status-actions";
import { OPPORTUNITY_STATUSES } from "@/lib/constants";
import { humanize } from "@/lib/opportunity-style";

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Controlled value so a rejected update rolls the select back (matches the Kanban).
  const [value, setValue] = useState(status);
  const [failed, setFailed] = useState(false);

  return (
    <select
      className={`rounded border bg-background px-2 py-1 text-xs ${
        failed ? "border-destructive" : "border-input"
      }`}
      value={value}
      disabled={pending}
      title={failed ? "Update failed — try again" : undefined}
      onChange={(e) => {
        const next = e.target.value;
        const prev = value;
        setValue(next);
        setFailed(false);
        startTransition(async () => {
          const result = await updateOpportunityStatus(id, next);
          if ("error" in result) {
            setValue(prev);
            setFailed(true);
            return;
          }
          router.refresh();
        });
      }}
    >
      {OPPORTUNITY_STATUSES.map((s) => (
        <option key={s} value={s}>
          {humanize(s)}
        </option>
      ))}
    </select>
  );
}

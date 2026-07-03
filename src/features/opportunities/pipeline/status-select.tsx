"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOpportunityStatus } from "@/features/opportunities/actions/status-actions";
import { OPPORTUNITY_STATUSES } from "@/lib/constants";
import { humanize } from "@/lib/opportunity-style";

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="rounded border border-input bg-background px-2 py-1 text-xs"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value;
        startTransition(async () => {
          await updateOpportunityStatus(id, value);
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

"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { OPPORTUNITY_STATUSES, OPPORTUNITY_PRIORITIES } from "@/lib/constants";
import { humanize } from "@/lib/opportunity-style";
import { buildPipelineHref } from "@/features/opportunities/pipeline/params";
import type { PipelineParams } from "@/features/opportunities/pipeline/types";

export function FilterBar({ params }: { params: PipelineParams }) {
  const router = useRouter();
  const selectClass =
    "h-9 rounded-md border border-input bg-background px-2 text-sm";

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const q = (new FormData(e.currentTarget).get("q") as string) ?? "";
        router.push(buildPipelineHref(params, { q: q.trim() }));
      }}
    >
      <Input
        name="q"
        defaultValue={params.q}
        placeholder="Search title..."
        className="h-9 w-56"
      />
      <select
        aria-label="Filter by status"
        className={selectClass}
        defaultValue={params.status}
        onChange={(e) =>
          router.push(
            buildPipelineHref(params, {
              status: e.target.value as PipelineParams["status"],
            })
          )
        }
      >
        <option value="">All statuses</option>
        {OPPORTUNITY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {humanize(s)}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by priority"
        className={selectClass}
        defaultValue={params.priority}
        onChange={(e) =>
          router.push(
            buildPipelineHref(params, {
              priority: e.target.value as PipelineParams["priority"],
            })
          )
        }
      >
        <option value="">All priorities</option>
        {OPPORTUNITY_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {humanize(p)}
          </option>
        ))}
      </select>
    </form>
  );
}

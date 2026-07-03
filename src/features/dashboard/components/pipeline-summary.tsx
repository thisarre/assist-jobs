import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { humanize } from "@/lib/opportunity-style";
import type { PipelineSummary } from "@/features/dashboard/types";

export function PipelineSummaryCard({ pipeline }: { pipeline: PipelineSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pipeline.activeCount === 0 ? (
          <p className="text-sm text-muted-foreground">No active opportunities.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {pipeline.statusCounts.map((s) => (
                <Link
                  key={s.status}
                  href={`/opportunities?status=${s.status}`}
                  className="rounded-md border border-border px-2.5 py-1 text-sm transition-colors hover:bg-accent"
                >
                  {humanize(s.status)}{" "}
                  <span className="font-semibold">{s.count}</span>
                </Link>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {pipeline.activeCount} active{" "}
              {pipeline.activeCount > 1 ? "opportunities" : "opportunity"}
              {pipeline.avgDailyRate != null && (
                <> · avg rate {pipeline.avgDailyRate} €</>
              )}
            </p>
          </>
        )}
        {pipeline.wonCount > 0 && (
          <p className="text-sm text-emerald-500">
            ✓ {pipeline.wonCount} won
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { DashboardAction } from "@/features/dashboard/types";

const KIND_LABEL: Record<DashboardAction["kind"], string> = {
  followup_opportunity: "Follow-up",
  followup_contact: "Follow-up",
  to_contact: "To contact",
  no_reply: "No reply",
  warm_contact: "Network",
};

export function ActionList({
  actions,
  truncatedCount,
}: {
  actions: DashboardAction[];
  truncatedCount: number;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">Today</h2>
      {actions.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          Nothing urgent today. You&apos;re all caught up.
        </Card>
      ) : (
        <div className="space-y-2">
          {actions.map((a) => (
            <Link
              key={`${a.entity}:${a.id}:${a.kind}`}
              href={a.href}
              className="block"
            >
              <Card className="flex items-center justify-between p-4 transition-colors hover:bg-accent">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {a.subtitle}
                  </p>
                </div>
                <span className="ml-4 shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {KIND_LABEL[a.kind]}
                </span>
              </Card>
            </Link>
          ))}
          {truncatedCount > 0 && (
            <p className="pl-1 text-sm text-muted-foreground">
              and {truncatedCount} more…
            </p>
          )}
        </div>
      )}
    </section>
  );
}

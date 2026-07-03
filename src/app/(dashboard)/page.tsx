import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loadDashboard } from "@/features/dashboard/queries";
import { ActionList } from "@/features/dashboard/components/action-list";
import { PipelineSummaryCard } from "@/features/dashboard/components/pipeline-summary";
import { WeeklyActivityCard } from "@/features/dashboard/components/weekly-activity";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login"); // defensive: layout also guards, but never render a blank pane

  const data = await loadDashboard(user.id, new Date());

  if (data.isEmpty) {
    return <DashboardEmpty />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what to focus on to move toward your next mission.
        </p>
      </div>

      <ActionList actions={data.actions} truncatedCount={data.truncatedCount} />

      <div className="grid gap-6 md:grid-cols-2">
        <PipelineSummaryCard pipeline={data.pipeline} />
        <WeeklyActivityCard weekly={data.weekly} />
      </div>
    </div>
  );
}

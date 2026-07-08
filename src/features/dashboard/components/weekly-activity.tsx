import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { WeeklyActivity } from "@/features/dashboard/types";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function WeeklyActivityCard({ weekly }: { weekly: WeeklyActivity }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">This week</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Stat value={weekly.interactions} label="Interactions" />
        <Stat value={weekly.opportunities} label="New opportunities" />
      </CardContent>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold">Couldn&apos;t load the dashboard</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong. Please try again in a moment.
      </p>
      <Button className="mt-4" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
}

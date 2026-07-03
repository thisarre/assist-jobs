"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // On a Server Component data-fetch error, reset() only clears local error
  // state and re-renders the same failed tree; unstable_retry() re-issues the
  // server render (Next.js 16.2+). Prefer it, fall back to reset if unavailable.
  const retry = unstable_retry ?? reset;

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold">Couldn&apos;t load the dashboard</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong. Please try again in a moment.
      </p>
      <Button className="mt-4" onClick={() => retry()}>
        Retry
      </Button>
    </div>
  );
}

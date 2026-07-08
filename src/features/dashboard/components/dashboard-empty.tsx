import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardEmpty() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold tracking-tight">Welcome to Freelance OS</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Start by adding a company or analyzing a job post. Your dashboard will then
        tell you what to do each day.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/companies/new">Add a company</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/analyze">Analyze a job post</Link>
        </Button>
      </div>
    </div>
  );
}

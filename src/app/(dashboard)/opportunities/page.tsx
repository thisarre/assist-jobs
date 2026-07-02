import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { opportunities, companies } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { SimpleTable, type SimpleColumn } from "@/components/data-table/simple-table";

type OpportunityRow = {
  id: string;
  title: string;
  companyName: string | null;
  status: string;
  priority: string;
  dailyRate: number | null;
};

export default async function OpportunitiesPage() {
  const user = await getCurrentUser();

  const rows: OpportunityRow[] = user
    ? await db
        .select({
          id: opportunities.id,
          title: opportunities.title,
          companyName: companies.name,
          status: opportunities.status,
          priority: opportunities.priority,
          dailyRate: opportunities.dailyRate,
        })
        .from(opportunities)
        .leftJoin(companies, eq(opportunities.companyId, companies.id))
        .where(eq(opportunities.userId, user.id))
        .orderBy(desc(opportunities.createdAt))
    : [];

  const columns: SimpleColumn<OpportunityRow>[] = [
    {
      header: "Title",
      cell: (row) => (
        <Link href={`/opportunities/${row.id}`} className="font-medium hover:underline">
          {row.title}
        </Link>
      ),
    },
    { header: "Company", cell: (row) => row.companyName ?? "—" },
    { header: "Status", cell: (row) => row.status },
    { header: "Priority", cell: (row) => row.priority },
    { header: "Rate", cell: (row) => (row.dailyRate ? `€${row.dailyRate}` : "—") },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
        <Button asChild size="sm">
          <Link href="/opportunities/new">New opportunity</Link>
        </Button>
      </div>
      <div className="mt-6">
        <SimpleTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          emptyState={
            <div className="space-y-3">
              <p>No opportunities yet.</p>
              <Button asChild size="sm">
                <Link href="/opportunities/new">Add your first opportunity</Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}

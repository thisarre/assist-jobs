import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { companies } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { SimpleTable, type SimpleColumn } from "@/components/data-table/simple-table";

type CompanyRow = {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  relationshipStatus: string;
  score: number | null;
};

export default async function CompaniesPage() {
  const user = await getCurrentUser();

  const rows: CompanyRow[] = user
    ? await db
        .select({
          id: companies.id,
          name: companies.name,
          industry: companies.industry,
          size: companies.size,
          relationshipStatus: companies.relationshipStatus,
          score: companies.score,
        })
        .from(companies)
        .where(eq(companies.userId, user.id))
        .orderBy(desc(companies.createdAt))
    : [];

  const columns: SimpleColumn<CompanyRow>[] = [
    {
      header: "Name",
      cell: (row) => (
        <Link href={`/companies/${row.id}`} className="font-medium hover:underline">
          {row.name}
        </Link>
      ),
    },
    { header: "Industry", cell: (row) => row.industry ?? "—" },
    { header: "Size", cell: (row) => row.size ?? "—" },
    { header: "Relationship", cell: (row) => row.relationshipStatus },
    { header: "Score", cell: (row) => (row.score ? String(row.score) : "—") },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <Button asChild size="sm">
          <Link href="/companies/new">New company</Link>
        </Button>
      </div>
      <div className="mt-6">
        <SimpleTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          emptyState={
            <div className="space-y-3">
              <p>No companies yet.</p>
              <Button asChild size="sm">
                <Link href="/companies/new">Add your first company</Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}

import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { contacts, companies } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { SimpleTable, type SimpleColumn } from "@/components/data-table/simple-table";

type ContactRow = {
  id: string;
  firstName: string;
  lastName: string;
  role: string | null;
  companyName: string | null;
  relationshipStrength: string;
};

export default async function ContactsPage() {
  const user = await getCurrentUser();

  const rows: ContactRow[] = user
    ? await db
        .select({
          id: contacts.id,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
          role: contacts.role,
          companyName: companies.name,
          relationshipStrength: contacts.relationshipStrength,
        })
        .from(contacts)
        .leftJoin(companies, eq(contacts.companyId, companies.id))
        .where(eq(contacts.userId, user.id))
        .orderBy(desc(contacts.createdAt))
    : [];

  const columns: SimpleColumn<ContactRow>[] = [
    {
      header: "Name",
      cell: (row) => (
        <Link href={`/contacts/${row.id}`} className="font-medium hover:underline">
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    { header: "Role", cell: (row) => row.role ?? "—" },
    { header: "Company", cell: (row) => row.companyName ?? "—" },
    { header: "Relationship", cell: (row) => row.relationshipStrength },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <Button asChild size="sm">
          <Link href="/contacts/new">New contact</Link>
        </Button>
      </div>
      <div className="mt-6">
        <SimpleTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          emptyState={
            <div className="space-y-3">
              <p>No contacts yet.</p>
              <Button asChild size="sm">
                <Link href="/contacts/new">Add your first contact</Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}

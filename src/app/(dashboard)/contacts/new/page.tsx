import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { companies } from "@/db/schema";
import { ContactForm } from "@/features/contacts/components/contact-form";

export default async function NewContactPage() {
  const user = await getCurrentUser();
  const companyOptions = user
    ? await db
        .select({ id: companies.id, name: companies.name })
        .from(companies)
        .where(eq(companies.userId, user.id))
        .orderBy(asc(companies.name))
    : [];

  return (
    <div>
      <Link href="/contacts" className="text-sm text-muted-foreground hover:underline">
        ← Contacts
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">New contact</h1>
      <div className="mt-8">
        <ContactForm companyOptions={companyOptions} />
      </div>
    </div>
  );
}

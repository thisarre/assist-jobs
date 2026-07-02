import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { opportunities, companies, contacts } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/delete-button";
import { deleteOpportunity } from "@/features/opportunities/actions/opportunity-actions";
import { toDateInputValue } from "@/lib/forms";
import { Field } from "@/components/detail/field";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.userId, user.id)))
    .limit(1);

  if (!opportunity) notFound();

  const [company] = opportunity.companyId
    ? await db
        .select({ id: companies.id, name: companies.name })
        .from(companies)
        .where(and(eq(companies.id, opportunity.companyId), eq(companies.userId, user.id)))
        .limit(1)
    : [];

  const [contact] = opportunity.contactId
    ? await db
        .select({ id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName })
        .from(contacts)
        .where(and(eq(contacts.id, opportunity.contactId), eq(contacts.userId, user.id)))
        .limit(1)
    : [];

  return (
    <div>
      <Link href="/opportunities" className="text-sm text-muted-foreground hover:underline">
        ← Opportunities
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{opportunity.title}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/opportunities/${opportunity.id}/edit`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deleteOpportunity}
            id={opportunity.id}
            redirectTo="/opportunities"
            description="This permanently deletes the opportunity."
          />
        </div>
      </div>

      <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-6">
        <Field label="Status" value={opportunity.status} />
        <Field label="Priority" value={opportunity.priority} />
        <Field
          label="Company"
          value={
            company ? (
              <Link href={`/companies/${company.id}`} className="text-primary hover:underline">
                {company.name}
              </Link>
            ) : (
              ""
            )
          }
        />
        <Field
          label="Contact"
          value={
            contact ? (
              <Link href={`/contacts/${contact.id}`} className="text-primary hover:underline">
                {contact.firstName} {contact.lastName}
              </Link>
            ) : (
              ""
            )
          }
        />
        <Field label="Source" value={opportunity.source} />
        <Field label="Remote policy" value={opportunity.remotePolicy} />
        <Field
          label="Probability"
          value={opportunity.probability ? `${opportunity.probability}%` : ""}
        />
        <Field label="Daily rate" value={opportunity.dailyRate ? `€${opportunity.dailyRate}` : ""} />
        <Field label="Location" value={opportunity.location} />
        <Field label="Language" value={opportunity.language} />
        <Field label="Next action" value={opportunity.nextAction} />
        <Field label="Next follow-up" value={toDateInputValue(opportunity.nextFollowupAt)} />
        <Field
          label="Technologies"
          value={opportunity.technologies?.length ? opportunity.technologies.join(", ") : ""}
        />
        <Field label="Description" value={opportunity.description} />
        <Field label="Notes" value={opportunity.notes} />
      </dl>
    </div>
  );
}

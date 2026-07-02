import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { contacts, companies, opportunities } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/delete-button";
import { deleteContact } from "@/features/contacts/actions/contact-actions";
import { toDateInputValue } from "@/lib/forms";
import { Field } from "@/components/detail/field";
import { TagManager } from "@/features/tags/components/tag-manager";
import { InteractionForm } from "@/features/interactions/components/interaction-form";
import { InteractionTimeline } from "@/features/interactions/components/interaction-timeline";
import { loadAssignedTags } from "@/features/tags/queries";
import { loadInteractions } from "@/features/interactions/queries";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.userId, user.id)))
    .limit(1);

  if (!contact) notFound();

  const [company] = contact.companyId
    ? await db
        .select({ id: companies.id, name: companies.name })
        .from(companies)
        .where(and(eq(companies.id, contact.companyId), eq(companies.userId, user.id)))
        .limit(1)
    : [];

  const relatedOpportunities = await db
    .select({ id: opportunities.id, title: opportunities.title, status: opportunities.status })
    .from(opportunities)
    .where(and(eq(opportunities.contactId, contact.id), eq(opportunities.userId, user.id)))
    .orderBy(desc(opportunities.createdAt));

  const assignedTags = await loadAssignedTags(user.id, "contact", contact.id);
  const timeline = await loadInteractions(user.id, "contact", contact.id);

  return (
    <div>
      <Link href="/contacts" className="text-sm text-muted-foreground hover:underline">
        ← Contacts
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {contact.firstName} {contact.lastName}
        </h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/contacts/${contact.id}/edit`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deleteContact}
            id={contact.id}
            redirectTo="/contacts"
            description="This permanently deletes the contact."
          />
        </div>
      </div>

      <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-6">
        <Field label="Role" value={contact.role} />
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
        <Field label="Email" value={contact.email} />
        <Field label="Phone" value={contact.phone} />
        <Field
          label="LinkedIn"
          value={
            contact.linkedinUrl ? (
              <a
                href={contact.linkedinUrl}
                className="text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {contact.linkedinUrl}
              </a>
            ) : (
              ""
            )
          }
        />
        <Field label="Language" value={contact.language} />
        <Field label="Relationship" value={contact.relationshipStrength} />
        <Field label="Next follow-up" value={toDateInputValue(contact.nextFollowupAt)} />
        <Field label="Notes" value={contact.notes} />
      </dl>

      <div className="mt-10 max-w-2xl">
        <h2 className="text-sm font-semibold">Opportunities</h2>
        {relatedOpportunities.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No linked opportunities.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {relatedOpportunities.map((o) => (
              <li key={o.id} className="text-sm">
                <Link href={`/opportunities/${o.id}`} className="text-primary hover:underline">
                  {o.title}
                </Link>{" "}
                <span className="text-muted-foreground">· {o.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="mt-10 max-w-2xl space-y-8">
        <div>
          <h2 className="text-sm font-semibold">Tags</h2>
          <div className="mt-3">
            <TagManager entityType="contact" entityId={contact.id} assignedTags={assignedTags} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Interactions</h2>
          <div className="mt-3">
            <InteractionForm entityType="contact" entityId={contact.id} />
          </div>
          <div className="mt-4">
            <InteractionTimeline items={timeline} />
          </div>
        </div>
      </section>
    </div>
  );
}

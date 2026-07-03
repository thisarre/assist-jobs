import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { companies, contacts, opportunities } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/delete-button";
import { deleteCompany } from "@/features/companies/actions/company-actions";
import { Field } from "@/components/detail/field";
import { TagManager } from "@/features/tags/components/tag-manager";
import { InteractionForm } from "@/features/interactions/components/interaction-form";
import { InteractionTimeline } from "@/features/interactions/components/interaction-timeline";
import { loadAssignedTags } from "@/features/tags/queries";
import { loadInteractions } from "@/features/interactions/queries";
import { CompanySummaryPanel } from "@/features/ai/components/company-summary-panel";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const [company] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, id), eq(companies.userId, user.id)))
    .limit(1);

  if (!company) notFound();

  const relatedContacts = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      role: contacts.role,
    })
    .from(contacts)
    .where(and(eq(contacts.companyId, company.id), eq(contacts.userId, user.id)))
    .orderBy(desc(contacts.createdAt));

  const relatedOpportunities = await db
    .select({
      id: opportunities.id,
      title: opportunities.title,
      status: opportunities.status,
    })
    .from(opportunities)
    .where(and(eq(opportunities.companyId, company.id), eq(opportunities.userId, user.id)))
    .orderBy(desc(opportunities.createdAt));

  const assignedTags = await loadAssignedTags(user.id, "company", company.id);
  const timeline = await loadInteractions(user.id, "company", company.id);

  return (
    <div>
      <Link
        href="/companies"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Companies
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/companies/${company.id}/edit`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deleteCompany}
            id={company.id}
            redirectTo="/companies"
            description="This permanently deletes the company."
          />
        </div>
      </div>

      <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-6">
        <Field label="Industry" value={company.industry} />
        <Field label="Size" value={company.size} />
        <Field label="Location" value={company.location} />
        <Field label="Relationship" value={company.relationshipStatus} />
        <Field label="Score" value={company.score ? String(company.score) : ""} />
        <Field
          label="Website"
          value={
            company.website ? (
              <a href={company.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                {company.website}
              </a>
            ) : (
              ""
            )
          }
        />
        <Field
          label="Technologies"
          value={company.technologies?.length ? company.technologies.join(", ") : ""}
        />
        <Field label="Hiring signals" value={company.hiringSignals} />
        <Field label="Notes" value={company.notes} />
      </dl>

      <div className="mt-10 grid max-w-2xl gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold">Contacts</h2>
          {relatedContacts.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No contacts yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {relatedContacts.map((c) => (
                <li key={c.id} className="text-sm">
                  <Link href={`/contacts/${c.id}`} className="text-primary hover:underline">
                    {c.firstName} {c.lastName}
                  </Link>
                  {c.role ? <span className="text-muted-foreground"> · {c.role}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold">Opportunities</h2>
          {relatedOpportunities.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No opportunities yet.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {relatedOpportunities.map((o) => (
                <li key={o.id} className="text-sm">
                  <Link href={`/opportunities/${o.id}`} className="text-primary hover:underline">
                    {o.title}
                  </Link>
                  <span className="text-muted-foreground"> · {o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="mt-10 max-w-2xl space-y-8">
        <div>
          <h2 className="text-sm font-semibold">Tags</h2>
          <div className="mt-3">
            <TagManager entityType="company" entityId={company.id} assignedTags={assignedTags} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Interactions</h2>
          <div className="mt-3">
            <InteractionForm entityType="company" entityId={company.id} />
          </div>
          <div className="mt-4">
            <InteractionTimeline items={timeline} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold">AI Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste the company&apos;s about page or notes to extract a summary, signals, and a
            relevance score — then apply the industry and hiring signals to this company.
          </p>
          <div className="mt-3">
            <CompanySummaryPanel companyId={company.id} />
          </div>
        </div>
      </section>
    </div>
  );
}

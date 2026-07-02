import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { companies } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/delete-button";
import { deleteCompany } from "@/features/companies/actions/company-actions";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value || "—"}</dd>
    </div>
  );
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const [company] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, id), eq(companies.userId, user.id)))
    .limit(1);

  if (!company) notFound();

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
    </div>
  );
}

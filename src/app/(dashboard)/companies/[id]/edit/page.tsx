import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { companies } from "@/db/schema";
import { CompanyForm } from "@/features/companies/components/company-form";
import type { CompanyFormData } from "@/features/companies/schemas/company";
import { COMPANY_SIZES } from "@/lib/constants";

export default async function EditCompanyPage({
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

  // Map the DB row (nullable columns) to the form's non-null shape.
  const sizeValue =
    company.size && (COMPANY_SIZES as readonly string[]).includes(company.size)
      ? (company.size as CompanyFormData["size"])
      : "";

  const initialData: CompanyFormData = {
    name: company.name,
    website: company.website ?? "",
    linkedinUrl: company.linkedinUrl ?? "",
    industry: company.industry ?? "",
    size: sizeValue,
    location: company.location ?? "",
    technologies: company.technologies ?? [],
    hiringSignals: company.hiringSignals ?? "",
    notes: company.notes ?? "",
    relationshipStatus:
      company.relationshipStatus as CompanyFormData["relationshipStatus"],
    score: company.score ?? 0,
  };

  return (
    <div>
      <Link
        href={`/companies/${company.id}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {company.name}
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit company</h1>
      <div className="mt-8">
        <CompanyForm companyId={company.id} initialData={initialData} />
      </div>
    </div>
  );
}

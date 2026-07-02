import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { opportunities } from "@/db/schema";
import { OpportunityForm } from "@/features/opportunities/components/opportunity-form";
import { loadOpportunityFormOptions } from "@/features/opportunities/actions/options";
import type { OpportunityFormData } from "@/features/opportunities/schemas/opportunity";
import { toDateInputValue } from "@/lib/forms";
import {
  OPPORTUNITY_STATUSES,
  OPPORTUNITY_PRIORITIES,
  OPPORTUNITY_SOURCES,
  REMOTE_POLICIES,
  LANGUAGES,
} from "@/lib/constants";

function inOr<T extends string>(
  values: readonly string[],
  value: string,
  fallback: T
): T {
  return values.includes(value) ? (value as T) : fallback;
}

export default async function EditOpportunityPage({
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

  const { companyOptions, contactOptions } = await loadOpportunityFormOptions(user.id);

  const sourceValue =
    opportunity.source &&
    (OPPORTUNITY_SOURCES as readonly string[]).includes(opportunity.source)
      ? (opportunity.source as OpportunityFormData["source"])
      : "";
  const remoteValue =
    opportunity.remotePolicy &&
    (REMOTE_POLICIES as readonly string[]).includes(opportunity.remotePolicy)
      ? (opportunity.remotePolicy as OpportunityFormData["remotePolicy"])
      : "";

  const initialData: OpportunityFormData = {
    title: opportunity.title,
    companyId: opportunity.companyId ?? "",
    contactId: opportunity.contactId ?? "",
    source: sourceValue,
    remotePolicy: remoteValue,
    status: inOr<OpportunityFormData["status"]>(
      OPPORTUNITY_STATUSES,
      opportunity.status,
      "detected"
    ),
    priority: inOr<OpportunityFormData["priority"]>(
      OPPORTUNITY_PRIORITIES,
      opportunity.priority,
      "medium"
    ),
    probability: opportunity.probability ?? 0,
    dailyRate: opportunity.dailyRate ?? 0,
    location: opportunity.location ?? "",
    technologies: opportunity.technologies ?? [],
    description: opportunity.description ?? "",
    notes: opportunity.notes ?? "",
    language: inOr<OpportunityFormData["language"]>(LANGUAGES, opportunity.language, "fr"),
    nextAction: opportunity.nextAction ?? "",
    nextFollowupAt: toDateInputValue(opportunity.nextFollowupAt),
  };

  return (
    <div>
      <Link
        href={`/opportunities/${opportunity.id}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {opportunity.title}
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit opportunity</h1>
      <div className="mt-8">
        <OpportunityForm
          opportunityId={opportunity.id}
          initialData={initialData}
          companyOptions={companyOptions}
          contactOptions={contactOptions}
        />
      </div>
    </div>
  );
}

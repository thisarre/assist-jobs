import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { OpportunityForm } from "@/features/opportunities/components/opportunity-form";
import { loadOpportunityFormOptions } from "@/features/opportunities/actions/options";

export default async function NewOpportunityPage() {
  const user = await getCurrentUser();
  const { companyOptions, contactOptions } = user
    ? await loadOpportunityFormOptions(user.id)
    : { companyOptions: [], contactOptions: [] };

  return (
    <div>
      <Link href="/opportunities" className="text-sm text-muted-foreground hover:underline">
        ← Opportunities
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">New opportunity</h1>
      <div className="mt-8">
        <OpportunityForm companyOptions={companyOptions} contactOptions={contactOptions} />
      </div>
    </div>
  );
}

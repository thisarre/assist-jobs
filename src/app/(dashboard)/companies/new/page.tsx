import Link from "next/link";
import { CompanyForm } from "@/features/companies/components/company-form";

export default function NewCompanyPage() {
  return (
    <div>
      <Link
        href="/companies"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Companies
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">New company</h1>
      <div className="mt-8">
        <CompanyForm />
      </div>
    </div>
  );
}

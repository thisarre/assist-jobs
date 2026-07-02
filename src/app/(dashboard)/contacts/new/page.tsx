import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ContactForm } from "@/features/contacts/components/contact-form";
import { loadContactFormOptions } from "@/features/contacts/actions/options";

export default async function NewContactPage() {
  const user = await getCurrentUser();
  const { companyOptions } = user
    ? await loadContactFormOptions(user.id)
    : { companyOptions: [] };

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

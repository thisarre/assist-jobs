import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { contacts } from "@/db/schema";
import { ContactForm } from "@/features/contacts/components/contact-form";
import { loadContactFormOptions } from "@/features/contacts/actions/options";
import type { ContactFormData } from "@/features/contacts/schemas/contact";
import { toDateInputValue } from "@/lib/forms";
import { RELATIONSHIP_STRENGTHS, LANGUAGES } from "@/lib/constants";

export default async function EditContactPage({
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

  const { companyOptions } = await loadContactFormOptions(user.id);

  const languageValue = (LANGUAGES as readonly string[]).includes(contact.language)
    ? (contact.language as ContactFormData["language"])
    : "fr";
  const strengthValue = (RELATIONSHIP_STRENGTHS as readonly string[]).includes(
    contact.relationshipStrength
  )
    ? (contact.relationshipStrength as ContactFormData["relationshipStrength"])
    : "unknown";

  const initialData: ContactFormData = {
    firstName: contact.firstName,
    lastName: contact.lastName,
    companyId: contact.companyId ?? "",
    role: contact.role ?? "",
    linkedinUrl: contact.linkedinUrl ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    language: languageValue,
    relationshipStrength: strengthValue,
    notes: contact.notes ?? "",
    nextFollowupAt: toDateInputValue(contact.nextFollowupAt),
  };

  return (
    <div>
      <Link href={`/contacts/${contact.id}`} className="text-sm text-muted-foreground hover:underline">
        ← {contact.firstName} {contact.lastName}
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit contact</h1>
      <div className="mt-8">
        <ContactForm contactId={contact.id} initialData={initialData} companyOptions={companyOptions} />
      </div>
    </div>
  );
}

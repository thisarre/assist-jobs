"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  type ContactFormData,
  type ContactFormValues,
} from "@/features/contacts/schemas/contact";
import {
  createContact,
  updateContact,
} from "@/features/contacts/actions/contact-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RELATIONSHIP_STRENGTHS, LANGUAGES } from "@/lib/constants";

// See Plan 1A: work around the Zod 4.4 / @hookform/resolvers type skew.
const buildResolver = zodResolver as unknown as (
  schema: typeof contactSchema
) => Resolver<ContactFormValues, unknown, ContactFormData>;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface ContactFormProps {
  contactId?: string;
  initialData?: ContactFormData;
  companyOptions: { id: string; name: string }[];
}

export function ContactForm({ contactId, initialData, companyOptions }: ContactFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues, unknown, ContactFormData>({
    resolver: buildResolver(contactSchema),
    defaultValues: initialData ?? {
      firstName: "",
      lastName: "",
      companyId: "",
      role: "",
      linkedinUrl: "",
      email: "",
      phone: "",
      language: "fr",
      relationshipStrength: "unknown",
      notes: "",
      nextFollowupAt: "",
    },
  });

  async function onSubmit(data: ContactFormData) {
    setSaving(true);
    setError(null);

    const result = contactId
      ? await updateContact(contactId, data)
      : await createContact(data);

    if ("error" in result) {
      setError(typeof result.error === "string" ? result.error : "Validation error");
      setSaving(false);
      return;
    }

    router.push(`/contacts/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name *</Label>
          <Input id="firstName" placeholder="Marie" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name *</Label>
          <Input id="lastName" placeholder="Dupont" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyId">Company</Label>
          <select
            id="companyId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register("companyId")}
          >
            <option value="">—</option>
            {companyOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input id="role" placeholder="CTO" {...register("role")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="marie@example.com" {...register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+33..." {...register("phone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
        <Input id="linkedinUrl" placeholder="https://linkedin.com/in/..." {...register("linkedinUrl")} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register("language")}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="relationshipStrength">Relationship</Label>
          <select
            id="relationshipStrength"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register("relationshipStrength")}
          >
            {RELATIONSHIP_STRENGTHS.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextFollowupAt">Next follow-up</Label>
          <Input id="nextFollowupAt" type="date" {...register("nextFollowupAt")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Anything worth remembering" {...register("notes")} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : contactId ? "Save changes" : "Create contact"}
        </Button>
        <Button type="button" variant="outline" disabled={saving} onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

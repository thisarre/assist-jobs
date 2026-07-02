"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companySchema,
  type CompanyFormData,
  type CompanyFormValues,
} from "@/features/companies/schemas/company";
import {
  createCompany,
  updateCompany,
} from "@/features/companies/actions/company-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_SIZES, RELATIONSHIP_STATUSES } from "@/lib/constants";

// See Sprint 0 profile-form: work around the Zod 4.4 / @hookform/resolvers type skew.
const buildResolver = zodResolver as unknown as (
  schema: typeof companySchema
) => Resolver<CompanyFormValues, unknown, CompanyFormData>;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface CompanyFormProps {
  /** Present when editing; omitted for create. */
  companyId?: string;
  initialData?: CompanyFormData;
}

export function CompanyForm({ companyId, initialData }: CompanyFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormValues, unknown, CompanyFormData>({
    resolver: buildResolver(companySchema),
    defaultValues: initialData ?? {
      name: "",
      website: "",
      linkedinUrl: "",
      industry: "",
      size: "",
      location: "",
      technologies: [],
      hiringSignals: "",
      notes: "",
      relationshipStatus: "cold",
      score: 0,
    },
  });

  async function onSubmit(data: CompanyFormData) {
    setSaving(true);
    setError(null);

    const result = companyId
      ? await updateCompany(companyId, data)
      : await createCompany(data);

    if ("error" in result) {
      setError(
        typeof result.error === "string" ? result.error : "Validation error"
      );
      setSaving(false);
      return;
    }

    router.push(`/companies/${result.id}`);
    router.refresh();
  }

  const commaSplit = (v: string | string[]) =>
    typeof v === "string"
      ? v.split(",").map((s) => s.trim()).filter(Boolean)
      : v;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" placeholder="TechCorp" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" placeholder="https://..." {...register("website")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input id="linkedinUrl" placeholder="https://linkedin.com/company/..." {...register("linkedinUrl")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" placeholder="Fintech" {...register("industry")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="Paris, France" {...register("location")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <select
            id="size"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register("size")}
          >
            <option value="">—</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="relationshipStatus">Relationship</Label>
          <select
            id="relationshipStatus"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register("relationshipStatus")}
          >
            {RELATIONSHIP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s.replace("_", " "))}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="score">Score (0-100)</Label>
          <Input
            id="score"
            type="number"
            min={0}
            max={100}
            {...register("score", {
              // Clearing the field yields "" → treat as 0 (unset) instead of NaN.
              setValueAs: (v) => {
                const n = typeof v === "number" ? v : Number(v);
                return v === "" || v === null || Number.isNaN(n) ? 0 : n;
              },
            })}
          />
          {errors.score && (
            <p className="text-sm text-destructive">{errors.score.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="technologies">Technologies (comma-separated)</Label>
          <Input
            id="technologies"
            placeholder="React, TypeScript, Node.js"
            {...register("technologies", { setValueAs: commaSplit })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hiringSignals">Hiring signals</Label>
        <Textarea id="hiringSignals" placeholder="Actively hiring React devs" {...register("hiringSignals")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Anything worth remembering" {...register("notes")} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : companyId ? "Save changes" : "Create company"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

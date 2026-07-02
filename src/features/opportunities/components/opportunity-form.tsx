"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  opportunitySchema,
  type OpportunityFormData,
  type OpportunityFormValues,
} from "@/features/opportunities/schemas/opportunity";
import {
  createOpportunity,
  updateOpportunity,
} from "@/features/opportunities/actions/opportunity-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  OPPORTUNITY_STATUSES,
  OPPORTUNITY_PRIORITIES,
  OPPORTUNITY_SOURCES,
  REMOTE_POLICIES,
  LANGUAGES,
} from "@/lib/constants";

// See Plan 1A: work around the Zod 4.4 / @hookform/resolvers type skew.
const buildResolver = zodResolver as unknown as (
  schema: typeof opportunitySchema
) => Resolver<OpportunityFormValues, unknown, OpportunityFormData>;

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

interface OpportunityFormProps {
  opportunityId?: string;
  initialData?: OpportunityFormData;
  companyOptions: { id: string; name: string }[];
  contactOptions: { id: string; label: string }[];
}

export function OpportunityForm({
  opportunityId,
  initialData,
  companyOptions,
  contactOptions,
}: OpportunityFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpportunityFormValues, unknown, OpportunityFormData>({
    resolver: buildResolver(opportunitySchema),
    defaultValues: initialData ?? {
      title: "",
      companyId: "",
      contactId: "",
      source: "",
      remotePolicy: "",
      status: "detected",
      priority: "medium",
      probability: 0,
      dailyRate: 0,
      location: "",
      technologies: [],
      description: "",
      notes: "",
      language: "fr",
      nextAction: "",
      nextFollowupAt: "",
    },
  });

  async function onSubmit(data: OpportunityFormData) {
    setSaving(true);
    setError(null);

    const result = opportunityId
      ? await updateOpportunity(opportunityId, data)
      : await createOpportunity(data);

    if ("error" in result) {
      setError(typeof result.error === "string" ? result.error : "Validation error");
      setSaving(false);
      return;
    }

    router.push(`/opportunities/${result.id}`);
    router.refresh();
  }

  const commaSplit = (v: string | string[]) =>
    typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v;

  const numberOrZero = (v: unknown) => {
    const n = typeof v === "number" ? v : Number(v);
    return v === "" || v === null || Number.isNaN(n) ? 0 : n;
  };

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" placeholder="Senior React Developer" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyId">Company</Label>
          <select id="companyId" className={selectClass} {...register("companyId")}>
            <option value="">—</option>
            {companyOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactId">Contact</Label>
          <select id="contactId" className={selectClass} {...register("contactId")}>
            <option value="">—</option>
            {contactOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" className={selectClass} {...register("status")}>
            {OPPORTUNITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select id="priority" className={selectClass} {...register("priority")}>
            {OPPORTUNITY_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {label(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <select id="source" className={selectClass} {...register("source")}>
            <option value="">—</option>
            {OPPORTUNITY_SOURCES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="remotePolicy">Remote policy</Label>
          <select id="remotePolicy" className={selectClass} {...register("remotePolicy")}>
            <option value="">—</option>
            {REMOTE_POLICIES.map((r) => (
              <option key={r} value={r}>
                {label(r)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="probability">Probability (0-100)</Label>
          <Input
            id="probability"
            type="number"
            min={0}
            max={100}
            {...register("probability", { setValueAs: numberOrZero })}
          />
          {errors.probability && (
            <p className="text-sm text-destructive">{errors.probability.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dailyRate">Daily rate (EUR)</Label>
          <Input
            id="dailyRate"
            type="number"
            min={0}
            {...register("dailyRate", { setValueAs: numberOrZero })}
          />
          {errors.dailyRate && (
            <p className="text-sm text-destructive">{errors.dailyRate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select id="language" className={selectClass} {...register("language")}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="Paris, France" {...register("location")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextFollowupAt">Next follow-up</Label>
          <Input id="nextFollowupAt" type="date" {...register("nextFollowupAt")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technologies">Technologies (comma-separated)</Label>
        <Input
          id="technologies"
          placeholder="React, TypeScript, Next.js"
          {...register("technologies", { setValueAs: commaSplit })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextAction">Next action</Label>
        <Input id="nextAction" placeholder="Call Marie to schedule" {...register("nextAction")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Mission summary" {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Anything worth remembering" {...register("notes")} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : opportunityId ? "Save changes" : "Create opportunity"}
        </Button>
        <Button type="button" variant="outline" disabled={saving} onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

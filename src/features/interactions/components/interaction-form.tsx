"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  interactionSchema,
  type InteractionFormData,
  type InteractionFormValues,
} from "@/features/interactions/schemas/interaction";
import { addInteraction } from "@/features/interactions/actions/interaction-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INTERACTION_TYPES, INTERACTION_DIRECTIONS } from "@/lib/constants";
import type { EntityType } from "@/types";

// See Plan 1A: work around the Zod 4.4 / @hookform/resolvers type skew.
const buildResolver = zodResolver as unknown as (
  schema: typeof interactionSchema
) => Resolver<InteractionFormValues, unknown, InteractionFormData>;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface InteractionFormProps {
  entityType: EntityType;
  entityId: string;
}

export function InteractionForm({ entityType, entityId }: InteractionFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InteractionFormValues, unknown, InteractionFormData>({
    resolver: buildResolver(interactionSchema),
    defaultValues: { type: "note", direction: "outbound", content: "" },
  });

  async function onSubmit(data: InteractionFormData) {
    setSaving(true);
    setError(null);
    const result = await addInteraction(entityType, entityId, data);
    if ("error" in result) {
      setError(typeof result.error === "string" ? result.error : "Validation error");
      setSaving(false);
      return;
    }
    reset({ type: "note", direction: "outbound", content: "" });
    setSaving(false);
    router.refresh();
  }

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="interaction-type">Type</Label>
          <select id="interaction-type" className={selectClass} {...register("type")}>
            {INTERACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {titleCase(t)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="interaction-direction">Direction</Label>
          <select id="interaction-direction" className={selectClass} {...register("direction")}>
            {INTERACTION_DIRECTIONS.map((d) => (
              <option key={d} value={d}>
                {titleCase(d)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="interaction-content">Content</Label>
        <Textarea
          id="interaction-content"
          placeholder="What happened?"
          {...register("content")}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? "Adding..." : "Add interaction"}
      </Button>
    </form>
  );
}

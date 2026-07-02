"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileFormData,
  type ProfileFormValues,
} from "@/features/settings/schemas/profile";
import { updateProfile } from "@/features/settings/actions/update-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REMOTE_POLICIES } from "@/lib/constants";

interface ProfileFormProps {
  initialData: ProfileFormData | null;
}

// zodResolver is runtime-correct with Zod 4.4.3 (defaults + validation verified),
// but @hookform/resolvers@5.4.0 ships a type-brand that doesn't structurally match
// Zod 4.4's $ZodType, so the overloads don't resolve. Cast zodResolver to the exact
// signature we need and call it with the real schema until the upstream types align.
const buildResolver = zodResolver as unknown as (
  schema: typeof profileSchema
) => Resolver<ProfileFormValues, unknown, ProfileFormData>;

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues, unknown, ProfileFormData>({
    resolver: buildResolver(profileSchema),
    defaultValues: initialData ?? {
      bio: "",
      role: "",
      skills: [],
      preferredStack: [],
      targetDailyRate: 0,
      preferredRemote: "remote",
      preferredLocation: "",
      targetClients: "",
      yearsExperience: 0,
      languages: ["fr"],
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setSaving(true);
    setMessage(null);

    const result = await updateProfile(data);

    if ("error" in result) {
      setMessage(typeof result.error === "string" ? result.error : "Validation error");
    } else {
      setMessage("Profile saved");
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Input id="role" placeholder="Senior Front-End Engineer" {...register("role")} />
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Input
          id="bio"
          placeholder="Short professional bio"
          {...register("bio")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills * (comma-separated)</Label>
        <Input
          id="skills"
          placeholder="React, Next.js, TypeScript"
          {...register("skills", {
            setValueAs: (v: string | string[]) =>
              typeof v === "string"
                ? v.split(",").map((s) => s.trim()).filter(Boolean)
                : v,
          })}
        />
        {errors.skills && (
          <p className="text-sm text-destructive">{errors.skills.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredStack">Preferred Stack (comma-separated)</Label>
        <Input
          id="preferredStack"
          placeholder="React, Node.js"
          {...register("preferredStack", {
            setValueAs: (v: string | string[]) =>
              typeof v === "string"
                ? v.split(",").map((s) => s.trim()).filter(Boolean)
                : v,
          })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetDailyRate">Target Daily Rate (EUR)</Label>
          <Input
            id="targetDailyRate"
            type="number"
            min={0}
            {...register("targetDailyRate", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsExperience">Years of Experience</Label>
          <Input
            id="yearsExperience"
            type="number"
            min={0}
            {...register("yearsExperience", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredRemote">Remote Policy</Label>
        <select
          id="preferredRemote"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register("preferredRemote")}
        >
          {REMOTE_POLICIES.map((policy) => (
            <option key={policy} value={policy}>
              {policy.charAt(0).toUpperCase() + policy.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredLocation">Preferred Location</Label>
        <Input
          id="preferredLocation"
          placeholder="Paris, France"
          {...register("preferredLocation")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetClients">Target Clients</Label>
        <Input
          id="targetClients"
          placeholder="Startups and scale-ups in fintech"
          {...register("targetClients")}
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message === "Profile saved" ? "text-green-500" : "text-destructive"
          }`}
        >
          {message}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}

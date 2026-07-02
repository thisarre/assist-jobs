"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createAndAssignTag,
  unassignTag,
} from "@/features/tags/actions/tag-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EntityType } from "@/types";

export interface AssignedTag {
  id: string;
  name: string;
}

interface TagManagerProps {
  entityType: EntityType;
  entityId: string;
  assignedTags: AssignedTag[];
}

export function TagManager({ entityType, entityId, assignedTags }: TagManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const result = await createAndAssignTag(trimmed, entityType, entityId);
      if ("error" in result) {
        setError(typeof result.error === "string" ? result.error : "Could not add tag");
        return;
      }
      setName("");
      router.refresh();
    });
  }

  function handleRemove(tagId: string) {
    setError(null);
    startTransition(async () => {
      const result = await unassignTag(tagId, entityType, entityId);
      if ("error" in result) {
        setError(typeof result.error === "string" ? result.error : "Could not remove tag");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {assignedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {assignedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1.5">
              {tag.name}
              <button
                type="button"
                aria-label={`Remove ${tag.name}`}
                className="text-muted-foreground hover:text-foreground"
                disabled={pending}
                onClick={() => handleRemove(tag.id)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
      <form onSubmit={handleAdd} className="flex max-w-sm gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a tag"
          disabled={pending}
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          Add
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

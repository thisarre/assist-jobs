"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { updateOpportunityStatus } from "@/features/opportunities/actions/status-actions";
import { KANBAN_STATUSES, humanize, priorityClasses } from "@/lib/opportunity-style";
import type { PipelineRow } from "@/features/opportunities/pipeline/types";

function Card({ row }: { row: PipelineRow }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: row.id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-md border border-border bg-background p-3 text-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <Link
        href={`/opportunities/${row.id}`}
        className="font-medium hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {row.title}
      </Link>
      <div className="mt-1 text-xs text-muted-foreground">{row.companyName ?? "—"}</div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className={`rounded px-1.5 py-0.5 ${priorityClasses(row.priority)}`}>
          {humanize(row.priority)}
        </span>
        {row.dailyRate ? <span>€{row.dailyRate}</span> : null}
        {row.probability != null ? (
          <span className="text-muted-foreground">{row.probability}%</span>
        ) : null}
      </div>
    </div>
  );
}

function Column({ status, rows }: { status: string; rows: PipelineRow[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-md border border-border p-2 ${
        isOver ? "bg-muted/60" : "bg-muted/20"
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1 text-xs font-medium">
        <span>{humanize(status)}</span>
        <span className="text-muted-foreground">{rows.length}</span>
      </div>
      <div className="flex min-h-8 flex-col gap-2">
        {rows.map((row) => (
          <Card key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ items }: { items: PipelineRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<PipelineRow[]>(items);
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  async function onDragEnd(event: DragEndEvent) {
    const overId = event.over?.id;
    if (!overId) return;
    const id = String(event.active.id);
    const newStatus = String(overId);
    const row = rows.find((r) => r.id === id);
    if (!row || row.status === newStatus) return;

    const previous = rows;
    setRows(rows.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    setError(null);

    const result = await updateOpportunityStatus(id, newStatus);
    if ("error" in result) {
      setRows(previous);
      setError(typeof result.error === "string" ? result.error : "Could not move card");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              rows={rows.filter((r) => r.status === status)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

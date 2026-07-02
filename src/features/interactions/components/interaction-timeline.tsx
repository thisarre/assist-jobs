export interface TimelineItem {
  id: string;
  type: string;
  direction: string;
  content: string;
  createdAt: Date;
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function InteractionTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No interactions yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-md border border-border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{titleCase(item.type)}</span>
            <span>· {titleCase(item.direction)}</span>
            <span>· {item.createdAt.toISOString().slice(0, 10)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm">{item.content}</p>
        </li>
      ))}
    </ul>
  );
}

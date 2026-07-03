import { cn } from "@/lib/utils";
import { scoreTone, scoreLabel, type ScoreTone } from "./score";

const TONE_COLOR: Record<ScoreTone, string> = {
  strong: "text-emerald-500",
  good: "text-emerald-500",
  moderate: "text-amber-500",
  weak: "text-red-500",
};

export function ScoreGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const tone = scoreTone(clamped);
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const dash = (clamped / 100) * circumference;

  return (
    <div
      role="img"
      aria-label={`Score ${clamped} sur 100 — ${scoreLabel(clamped)}`}
      className={cn("relative size-13 shrink-0", TONE_COLOR[tone])}
    >
      <svg viewBox="0 0 48 48" className="size-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="4" className="stroke-muted" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-500 motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
        {clamped}
      </span>
    </div>
  );
}

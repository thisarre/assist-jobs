import type { Analysis } from "@/features/ai/schemas/analysis";
import { AnalysisEmpty } from "./analysis-empty";
import { AnalysisSkeleton } from "./analysis-skeleton";
import { AnalysisResult } from "./analysis-result";

type Props = {
  analyzing: boolean;
  analysis: Analysis | null;
  update: <K extends keyof Analysis>(key: K, value: Analysis[K]) => void;
  onCreate: () => void;
  onReset: () => void;
  creating: boolean;
  busy: boolean;
  error: string | null;
};

export function AnalysisPane({ analyzing, analysis, update, onCreate, onReset, creating, busy, error }: Props) {
  return (
    <section aria-label="Analyse" className="rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-primary">Analyse</span>
      </header>
      <div className="p-4">
        {analyzing ? (
          <AnalysisSkeleton />
        ) : analysis ? (
          <AnalysisResult
            analysis={analysis}
            update={update}
            onCreate={onCreate}
            onReset={onReset}
            creating={creating}
            busy={busy}
            error={error}
          />
        ) : (
          <AnalysisEmpty />
        )}
      </div>
    </section>
  );
}

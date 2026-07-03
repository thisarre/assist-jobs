import { AnalyzerPanel } from "@/features/ai/components/analyzer-panel";

export default function AnalyzePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">AI Analyzer</h1>
      <p className="mt-2 text-muted-foreground">
        Paste a job description or recruiter message. The AI extracts a scored opportunity you
        can review, edit, and create in one click.
      </p>
      <div className="mt-8">
        <AnalyzerPanel />
      </div>
    </div>
  );
}

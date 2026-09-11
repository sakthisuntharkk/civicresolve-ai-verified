import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import * as api from "@/services/api";
import { issueQuery } from "@/lib/queries";
import { BeforeAfterComparison } from "@/components/civic/BeforeAfterComparison";
import { ConfidenceGauge } from "@/components/civic/ConfidenceGauge";
import { AIInsightCard } from "@/components/civic/AIInsightCard";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { ArrowLeft, Check, Columns2, Loader2, ShieldCheck, SlidersHorizontal, UserCheck, X } from "lucide-react";

export const Route = createFileRoute("/_app/verification/$issueId")({
  head: ({ params }) => ({
    meta: [
      { title: `AI Verification ${params.issueId} — CivicAI` },
      { name: "description", content: "Side-by-side before/after analysis with explainable confidence scoring." },
      { property: "og:title", content: `AI Verification ${params.issueId} — CivicAI` },
      { property: "og:description", content: "Side-by-side before/after analysis with explainable confidence scoring." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    const issue = await context.queryClient.ensureQueryData(issueQuery(params.issueId));
    if (!issue) throw notFound();
  },
  component: VerificationScreen,
});

function VerificationScreen() {
  const { issueId } = Route.useParams();
  const { data: issue } = useSuspenseQuery(issueQuery(issueId));
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"slider" | "side-by-side">("side-by-side");
  if (!issue) return null;

  const run = async () => {
    setRunning(true);
    await api.runVerification(issue.id);
    await qc.invalidateQueries({ queryKey: ["issues"] });
    await qc.invalidateQueries({ queryKey: ["summary"] });
    setRunning(false);
    toast.success("Verification complete", { description: "Handed off to the citizen for final confirmation." });
  };

  if (!issue.resolution) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-dashed p-12 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-3 text-2xl font-medium">Nothing to verify yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">{issue.id} has no resolution submission. The crew needs to upload an after-photo first.</p>
        <div className="mt-5 flex justify-center gap-2"><Button asChild variant="outline"><Link to="/issues/$issueId" params={{ issueId: issue.id }}>View issue</Link></Button><Button asChild><Link to="/authority/resolve/$issueId" params={{ issueId: issue.id }}>Submit resolution</Link></Button></div>
      </div>
    );
  }

  const v = issue.verification;

  return (
    <div className="space-y-6">
      <Link to="/issues/$issueId" params={{ issueId: issue.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {issue.id}</Link>
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ai"><ShieldCheck className="h-3.5 w-3.5" /> AI resolution verification</p>
          <h1 className="mt-1 text-3xl font-medium tracking-tight md:text-4xl">{issue.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Resolution submitted by {issue.resolution.submittedBy} · {issue.resolution.team} · {formatDate(issue.resolution.submittedAt)}</p>
        </div>
        <div className="flex items-center gap-2"><StatusBadge status={issue.status} size="md" /><div className="flex rounded-lg border bg-card p-0.5"><button onClick={() => setMode("side-by-side")} className={cn("rounded-md p-1.5", mode === "side-by-side" ? "bg-secondary" : "text-muted-foreground")} aria-label="Side by side"><Columns2 className="h-4 w-4" /></button><button onClick={() => setMode("slider")} className={cn("rounded-md p-1.5", mode === "slider" ? "bg-secondary" : "text-muted-foreground")} aria-label="Slider"><SlidersHorizontal className="h-4 w-4" /></button></div></div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <BeforeAfterComparison before={issue.beforePhoto} after={issue.resolution.afterPhoto} mode={mode} scanning={running} />
          <div className="rounded-xl border bg-card p-4 text-sm shadow-card"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Crew completion notes</p><p className="mt-1">{issue.resolution.notes}</p></div>
        </div>

        <aside className="space-y-4">
          {!v ? (
            <div className="rounded-2xl border border-ai/30 bg-ai-soft/50 p-6 text-center">
              <ConfidenceGauge value={running ? 0 : 0} label="Not yet run" />
              <h2 className="mt-3 text-xl font-medium">{running ? "Analysing before vs after…" : "Ready to verify"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{running ? "Checking location match, issue absence and evidence integrity." : "The issue stays open until this passes and the citizen confirms."}</p>
              <Button onClick={run} disabled={running} className="mt-4 w-full bg-ai text-ai-foreground hover:bg-ai/90">{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} {running ? "Running checks" : "Run AI verification"}</Button>
              {running && <ul className="mt-4 space-y-2 text-left text-xs text-muted-foreground"><li className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin text-ai" /> Aligning scene features…</li><li className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin text-ai" /> Detecting reported condition…</li><li className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin text-ai" /> Validating evidence metadata…</li></ul>}
            </div>
          ) : (
            <>
              <div className="rounded-2xl border bg-card p-6 text-center shadow-card">
                <ConfidenceGauge value={v.confidence} label="Confidence" />
                <h2 className={cn("mt-3 text-2xl font-medium", v.verdict === "probably_resolved" ? "text-success" : v.verdict === "uncertain" ? "text-warning-foreground" : "text-destructive")}>{api.verdictLabel(v.verdict)}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Analysed {formatDate(v.analyzedAt)}</p>
              </div>
              <div className="rounded-2xl border bg-card p-5 shadow-card">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Automated checks</p>
                <ul className="mt-3 space-y-4">
                  {v.checks.map((c) => (
                    <li key={c.id}>
                      <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold"><span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full", c.passed ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground")}>{c.passed ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}</span>{c.label}</span><span className="text-sm font-bold tabular">{c.score}</span></div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", c.passed ? "bg-success" : "bg-destructive")} style={{ width: `${c.score}%` }} /></div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <AIInsightCard eyebrow="Explainable reasoning" title="How the score was reached"><ol className="list-decimal space-y-1.5 pl-4">{v.reasoning.map((r, i) => <li key={i}>{r}</li>)}</ol></AIInsightCard>
              {issue.status === "awaiting_citizen" && <div className="flex items-center gap-3 rounded-xl border border-warning/50 bg-warning/12 p-4 text-sm"><UserCheck className="h-5 w-5 shrink-0 text-warning-foreground" /><div><p className="font-bold">Not closed yet — waiting for the citizen.</p><p className="text-xs text-muted-foreground">{issue.reporterName} gets the final word.</p></div><Button asChild size="sm" className="ml-auto shrink-0"><Link to="/issues/$issueId" params={{ issueId: issue.id }}>Open</Link></Button></div>}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

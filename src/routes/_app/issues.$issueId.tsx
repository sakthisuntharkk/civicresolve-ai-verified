import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import * as api from "@/services/api";
import { WARDS } from "@/services/mockData";
import { issueQuery } from "@/lib/queries";
import { PriorityBadge } from "@/components/civic/PriorityBadge";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { CategoryIcon } from "@/components/civic/CategoryIcon";
import { IssueTimeline } from "@/components/civic/IssueTimeline";
import { AIInsightCard } from "@/components/civic/AIInsightCard";
import { BeforeAfterComparison } from "@/components/civic/BeforeAfterComparison";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_LABEL, RISK_LABEL, compact, formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, Building2, Check, Clock, Copy, Loader2, MapPin, RotateCcw, ShieldCheck, ThumbsDown, ThumbsUp, Users, Wrench } from "lucide-react";

export const Route = createFileRoute("/_app/issues/$issueId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.issueId} — Issue details — CivicAI` },
      { name: "description", content: "Full timeline, AI assessment, related reports and verification status for this civic issue." },
      { property: "og:title", content: `${params.issueId} — CivicAI` },
      { property: "og:description", content: "Full timeline, AI assessment and verification status for this civic issue." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    const issue = await context.queryClient.ensureQueryData(issueQuery(params.issueId));
    if (!issue) throw notFound();
  },
  component: IssueDetails,
});

function IssueDetails() {
  const { issueId } = Route.useParams();
  const { data: issue } = useSuspenseQuery(issueQuery(issueId));
  const qc = useQueryClient();
  const [reopening, setReopening] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  if (!issue) return null;
  const ward = WARDS.find((w) => w.id === issue.location.wardId);

  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["issues"] }), qc.invalidateQueries({ queryKey: ["summary"] })]);

  const confirm = async (confirmed: boolean) => {
    setBusy(true);
    await api.confirmResolution(issue.id, { confirmed, reason: confirmed ? undefined : reason });
    await refresh();
    setBusy(false);
    setReopening(false);
    confirmed
      ? toast.success("Marked as resolved", { description: "Thanks — closed with your confirmation." })
      : toast.warning("Issue reopened", { description: "Sent back to the crew with your reason." });
  };

  const combinedPeople = issue.assessment.peopleAffected;

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>

      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{issue.id}</span>
            <StatusBadge status={issue.status} size="md" />
            <PriorityBadge priority={issue.priority} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><CategoryIcon category={issue.category} /> {CATEGORY_LABEL[issue.category]}</span>
          </div>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">{issue.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {issue.location.address} · {ward?.name} ({ward?.id})</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Reported {timeAgo(issue.reportedAt)} by {issue.reporterName}</span>
            <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {issue.department}{issue.assignedTeam && ` → ${issue.assignedTeam}`}</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {issue.verification && <Button asChild variant="outline"><Link to="/verification/$issueId" params={{ issueId: issue.id }}><ShieldCheck className="h-4 w-4" /> View AI verification</Link></Button>}
          {issue.status === "resolution_submitted" && <Button asChild className="bg-ai text-ai-foreground hover:bg-ai/90"><Link to="/verification/$issueId" params={{ issueId: issue.id }}><ShieldCheck className="h-4 w-4" /> Run AI verification</Link></Button>}
          {["assigned", "in_progress", "reopened"].includes(issue.status) && <Button asChild variant="outline"><Link to="/authority/resolve/$issueId" params={{ issueId: issue.id }}><Wrench className="h-4 w-4" /> Submit resolution</Link></Button>}
        </div>
      </header>

      <div className="flex items-center gap-3"><Progress value={issue.progress} className="h-2 flex-1 bg-muted" /><span className="text-xs font-semibold tabular text-muted-foreground">{issue.progress}% to verified resolution</span></div>

      {/* Citizen confirmation loop */}
      {issue.status === "awaiting_citizen" && issue.verification && issue.resolution && (
        <section className="rounded-2xl border-2 border-warning/60 bg-warning/8 p-5 md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-warning-foreground">Your confirmation needed</p>
              <h2 className="mt-1 text-2xl font-medium">The crew says it's fixed. AI agrees at {issue.verification.confidence}%. Do you?</h2>
              <p className="mt-2 text-sm text-muted-foreground">{issue.resolution.team} submitted this {timeAgo(issue.resolution.submittedAt)}: “{issue.resolution.notes}”</p>
              {!reopening ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => confirm(true)} disabled={busy} className="bg-success text-success-foreground hover:bg-success/90">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />} Yes, it's fixed</Button>
                  <Button variant="outline" onClick={() => setReopening(true)} disabled={busy} className="bg-background"><ThumbsDown className="h-4 w-4" /> No, reopen issue</Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What's still wrong? e.g. The bin was emptied but the bags on the footpath are still there." className="bg-background" />
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => confirm(false)} disabled={busy || reason.trim().length < 5}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Reopen with this reason</Button>
                    <Button variant="ghost" onClick={() => setReopening(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full md:w-80"><BeforeAfterComparison before={issue.beforePhoto} after={issue.resolution.afterPhoto} /></div>
          </div>
        </section>
      )}

      {issue.status === "resolved" && issue.citizenConfirmation?.confirmed && (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/8 p-4"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-success text-success-foreground"><Check className="h-5 w-5" strokeWidth={3} /></span><div><p className="font-bold text-success">Citizen Confirmed</p><p className="text-xs text-muted-foreground">Verified by AI and confirmed by {issue.reporterName} on {formatDate(issue.citizenConfirmation.at)}</p></div></div>
      )}
      {issue.status === "reopened" && issue.citizenConfirmation && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-4"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground"><RotateCcw className="h-5 w-5" /></span><div><p className="font-bold text-destructive">Reopened by citizen</p><p className="text-xs text-muted-foreground">“{issue.citizenConfirmation.reason}” — {formatDate(issue.citizenConfirmation.at)}</p></div></div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <figure className="overflow-hidden rounded-2xl border bg-card shadow-card">
            <img src={issue.beforePhoto} alt={`Citizen photo of ${issue.title}`} className="aspect-[16/9] w-full object-cover" width={1024} height={768} />
            <figcaption className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground"><span>Original citizen photo · {formatDate(issue.reportedAt)}</span><span className="font-mono">{issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}</span></figcaption>
          </figure>

          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="font-sans text-base font-bold">Description</h2>
            <p className="mt-2 text-[15px] leading-relaxed">{issue.description}</p>
            <AIInsightCard className="mt-4" eyebrow="AI summary for crew">{issue.aiSummary}</AIInsightCard>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between"><h2 className="font-sans text-base font-bold">Timeline</h2><span className="text-xs text-muted-foreground">8-step verified resolution flow</span></div>
            <IssueTimeline events={issue.timeline} className="mt-5" />
          </section>

          {issue.relatedReports.length > 0 && (
            <section className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-base font-bold">Related & duplicate reports</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold"><Copy className="h-3 w-3" /> {issue.duplicateCount} merged</span>
              </div>
              <ul className="mt-4 divide-y">
                {issue.relatedReports.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{r.title}</p><p className="text-xs text-muted-foreground">{r.id} · {r.reporterName} · {timeAgo(r.reportedAt)}</p></div>
                    <div className="flex shrink-0 items-center gap-4 text-xs"><span className="text-muted-foreground"><MapPin className="mr-0.5 inline h-3 w-3" />{r.distanceMeters} m</span><span className="font-bold text-ai tabular">{Math.round(r.similarity * 100)}% similar</span></div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-paper p-3 text-center">
                <div><p className="font-display text-2xl font-semibold tabular">{issue.duplicateCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reports</p></div>
                <div><p className="font-display text-2xl font-semibold tabular text-ai">{issue.assessment.clusterMultiplier.toFixed(1)}x</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cluster multiplier</p></div>
                <div><p className="font-display text-2xl font-semibold tabular">{compact(combinedPeople)}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Combined impact</p></div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">AI assessment</p>
            <div className="mt-3 flex items-end gap-3">
              <span className={cn("font-display text-6xl font-semibold leading-none tabular", issue.assessment.priorityScore >= 85 ? "text-priority-critical" : issue.assessment.priorityScore >= 65 ? "text-priority-high" : "text-primary")}>{issue.assessment.priorityScore}</span>
              <div className="pb-1"><p className="text-sm font-bold">Priority score</p><p className="text-xs text-muted-foreground">out of 100 · {Math.round(issue.assessment.confidence * 100)}% confidence</p></div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", issue.assessment.priorityScore >= 85 ? "bg-priority-critical" : issue.assessment.priorityScore >= 65 ? "bg-priority-high" : "bg-primary")} style={{ width: `${issue.assessment.priorityScore}%` }} /></div>
            <dl className="mt-5 grid grid-cols-2 gap-3">
              <Metric icon={Copy} label="Cluster multiplier" value={`${issue.assessment.clusterMultiplier.toFixed(1)}x`} />
              <Metric icon={Users} label="People affected" value={compact(issue.assessment.peopleAffected)} />
              <Metric icon={Clock} label="Duration" value={issue.assessment.durationDays < 1 ? `${Math.round(issue.assessment.durationDays * 24)}h` : `${Math.round(issue.assessment.durationDays)}d`} />
              <Metric icon={ShieldCheck} label="Safety risk" value={RISK_LABEL[issue.assessment.safetyRisk]} />
            </dl>
            <div className="mt-4 rounded-lg bg-paper p-3 text-xs leading-relaxed text-foreground/80"><span className="font-bold">Why this score: </span>{issue.assessment.reasoning}</div>
          </section>

          {issue.verification && (
            <section className="rounded-2xl border border-ai/30 bg-ai-soft/50 p-5">
              <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">AI verification</p><span className="text-xs text-muted-foreground">{timeAgo(issue.verification.analyzedAt)}</span></div>
              <p className="mt-2 font-display text-3xl font-semibold tabular">{issue.verification.confidence}% <span className="text-base font-sans font-bold">{api.verdictLabel(issue.verification.verdict)}</span></p>
              <ul className="mt-3 space-y-1.5 text-sm">{issue.verification.checks.map((c) => <li key={c.id} className="flex items-center justify-between"><span className="flex items-center gap-2">{c.passed ? <Check className="h-3.5 w-3.5 text-success" /> : <RotateCcw className="h-3.5 w-3.5 text-destructive" />}{c.label}</span><span className="text-xs font-bold tabular text-muted-foreground">{c.score}</span></li>)}</ul>
              <Button asChild size="sm" variant="outline" className="mt-4 w-full bg-background"><Link to="/verification/$issueId" params={{ issueId: issue.id }}>Open full analysis</Link></Button>
            </section>
          )}

          <section className="rounded-2xl border bg-card p-5 shadow-card text-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">SLA</p>
            <p className={cn("mt-1 font-semibold", new Date(issue.slaDueAt).getTime() < Date.now() && issue.status !== "resolved" && "text-destructive")}>{issue.status === "resolved" ? "Closed" : new Date(issue.slaDueAt).getTime() < Date.now() ? `Overdue since ${formatDate(issue.slaDueAt)}` : `Due ${formatDate(issue.slaDueAt)}`}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3"><Icon className="h-3.5 w-3.5 text-muted-foreground" /><p className="mt-1.5 font-display text-xl font-semibold tabular">{value}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p></div>
  );
}

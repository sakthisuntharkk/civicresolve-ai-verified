import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { citizenSummaryQuery, myIssuesQuery } from "@/lib/queries";
import { PageHeader } from "@/components/civic/PageHeader";
import { StatCard } from "@/components/civic/StatCard";
import { IssueCard } from "@/components/civic/IssueCard";
import { AIInsightCard } from "@/components/civic/AIInsightCard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — CivicAI" },
      { name: "description", content: "Track your reported civic issues from AI analysis through verified resolution." },
      { property: "og:title", content: "My Dashboard — CivicAI" },
      { property: "og:description", content: "Track your reported civic issues from AI analysis through verified resolution." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(citizenSummaryQuery),
      context.queryClient.ensureQueryData(myIssuesQuery),
    ]);
  },
  component: Dashboard,
});

type Filter = "all" | "inProgress" | "resolved" | "attention";

function Dashboard() {
  const { data: summary } = useSuspenseQuery(citizenSummaryQuery);
  const { data: issues } = useSuspenseQuery(myIssuesQuery);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = issues.filter((i) => {
    if (filter === "all") return true;
    if (filter === "resolved") return i.status === "resolved";
    if (filter === "attention") return i.status === "awaiting_citizen" || i.status === "reopened";
    return ["assigned", "in_progress", "resolution_submitted", "ai_verification"].includes(i.status);
  });

  const attention = issues.filter((i) => i.status === "awaiting_citizen");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Citizen dashboard"
        title={
          <>
            {greeting}, {summary.name}.
          </>
        }
        description="Here's where your reports stand — and which ones need your final word."
        actions={
          <Button asChild>
            <Link to="/report">
              <Plus className="h-4 w-4" /> Report new issue
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="My reports" value={summary.total} icon={FileText} active={filter === "all"} onClick={() => setFilter("all")} hint="All time" />
        <StatCard label="In progress" value={summary.inProgress} icon={Loader2} tone="primary" active={filter === "inProgress"} onClick={() => setFilter("inProgress")} hint="Assigned or being worked on" />
        <StatCard label="Resolved" value={summary.resolved} icon={CheckCircle2} tone="success" active={filter === "resolved"} onClick={() => setFilter("resolved")} hint="Verified and confirmed" />
        <StatCard label="Needs attention" value={summary.needsAttention} icon={AlertTriangle} tone="warning" active={filter === "attention"} onClick={() => setFilter("attention")} hint="Awaiting your confirmation" />
      </div>

      {attention.length > 0 && filter !== "attention" && (
        <AIInsightCard
          tone="warning"
          eyebrow="Your confirmation needed"
          title={`${attention.length} issue${attention.length > 1 ? "s" : ""} passed AI verification and ${attention.length > 1 ? "are" : "is"} waiting for you`}
          footer={
            <div className="flex flex-wrap gap-2">
              {attention.map((i) => (
                <Button key={i.id} asChild size="sm" variant="outline" className="bg-background">
                  <Link to="/issues/$issueId" params={{ issueId: i.id }}>
                    Review {i.id}
                  </Link>
                </Button>
              ))}
            </div>
          }
        >
          The crew says it's fixed and the AI agrees with {attention[0]?.verification?.confidence ?? 0}% confidence. It only closes when you agree too.
        </AIInsightCard>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-lg font-bold">
            {filter === "all" ? "Active reports" : filter === "inProgress" ? "In progress" : filter === "resolved" ? "Resolved" : "Needs attention"}
            <span className="ml-2 text-sm font-medium text-muted-foreground">({filtered.length})</span>
          </h2>
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {(
              [
                ["all", "All"],
                ["inProgress", "Active"],
                ["attention", "Attention"],
                ["resolved", "Resolved"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  filter === k ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">Nothing here yet.</div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {filtered.map((i) => (
              <IssueCard key={i.id} issue={i} className={i.status === "awaiting_citizen" ? "mt-2" : ""} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

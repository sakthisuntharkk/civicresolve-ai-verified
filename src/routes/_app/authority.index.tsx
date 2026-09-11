import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import * as api from "@/services/api";
import { WARDS } from "@/services/mockData";
import { authorityMetricsQuery, issuesQuery } from "@/lib/queries";
import { PageHeader } from "@/components/civic/PageHeader";
import { StatCard } from "@/components/civic/StatCard";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { PriorityBadge } from "@/components/civic/PriorityBadge";
import { CategoryIcon } from "@/components/civic/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CATEGORY_LABEL, ageLabel, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category, Priority } from "@/types";
import { AlertOctagon, AlertTriangle, Clock, Copy, Inbox, Loader2, Play, Search, ShieldCheck, UserPlus, Wrench } from "lucide-react";

export const Route = createFileRoute("/_app/authority/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — CivicAI" },
      { name: "description", content: "Priority queue for civic operations: open, critical, overdue and awaiting verification." },
      { property: "og:title", content: "Operations Dashboard — CivicAI" },
      { property: "og:description", content: "Priority queue for civic operations teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(authorityMetricsQuery), context.queryClient.ensureQueryData(issuesQuery)]);
  },
  component: Operations,
});

type Quick = "all" | "critical" | "inProgress" | "awaiting" | "overdue";

function Operations() {
  const { data: metrics } = useSuspenseQuery(authorityMetricsQuery);
  const { data: issues } = useSuspenseQuery(issuesQuery);
  const qc = useQueryClient();
  const [quick, setQuick] = useState<Quick>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [ward, setWard] = useState("all");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      issues.filter((i) => {
        if (i.status === "resolved" && quick !== "all") return false;
        if (quick === "critical" && i.priority !== "critical") return false;
        if (quick === "inProgress" && !["in_progress", "reopened"].includes(i.status)) return false;
        if (quick === "awaiting" && !["resolution_submitted", "ai_verification", "awaiting_citizen"].includes(i.status)) return false;
        if (quick === "overdue" && !isOverdue(i.slaDueAt, i.status)) return false;
        if (category !== "all" && i.category !== category) return false;
        if (priority !== "all" && i.priority !== priority) return false;
        if (ward !== "all" && i.location.wardId !== ward) return false;
        if (q && !`${i.id} ${i.title} ${i.location.address}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [issues, quick, category, priority, ward, q],
  );

  const act = async (id: string, fn: () => Promise<unknown>, msg: string) => {
    setBusyId(id);
    await fn();
    await qc.invalidateQueries({ queryKey: ["issues"] });
    await qc.invalidateQueries({ queryKey: ["summary"] });
    setBusyId(null);
    toast.success(msg);
  };

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Authority operations" title="Priority queue" description="Ranked by AI priority score. Nothing here closes until it is verified and citizen-confirmed." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Open" value={metrics.open} icon={Inbox} active={quick === "all"} onClick={() => setQuick("all")} />
        <StatCard label="Critical" value={metrics.critical} icon={AlertOctagon} tone="critical" active={quick === "critical"} onClick={() => setQuick("critical")} />
        <StatCard label="In progress" value={metrics.inProgress} icon={Wrench} tone="primary" active={quick === "inProgress"} onClick={() => setQuick("inProgress")} />
        <StatCard label="Awaiting verification" value={metrics.awaitingVerification} icon={ShieldCheck} tone="ai" active={quick === "awaiting"} onClick={() => setQuick("awaiting")} />
        <StatCard label="Overdue" value={metrics.overdue} icon={AlertTriangle} tone="warning" active={quick === "overdue"} onClick={() => setQuick("overdue")} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search id, title, address" className="w-64 pl-8" /></div>
        <Sel value={category} onChange={(v) => setCategory(v as Category | "all")} options={[["all", "All categories"], ...Object.entries(CATEGORY_LABEL)]} />
        <Sel value={priority} onChange={(v) => setPriority(v as Priority | "all")} options={[["all", "All priorities"], ["critical", "Critical"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]]} />
        <Sel value={ward} onChange={setWard} options={[["all", "All wards"], ...WARDS.map((w) => [w.id, `${w.id} ${w.name}`] as [string, string])]} />
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} issues</span>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper hover:bg-paper">
              <TableHead className="w-[34%]">Issue</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Ward</TableHead><TableHead>Age</TableHead><TableHead className="text-center">Dup.</TableHead><TableHead>Assigned team</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((i) => {
              const overdue = isOverdue(i.slaDueAt, i.status);
              const busy = busyId === i.id;
              return (
                <TableRow key={i.id} className={cn(i.priority === "critical" && "bg-priority-critical/[0.03]")}>
                  <TableCell>
                    <Link to="/issues/$issueId" params={{ issueId: i.id }} className="group block">
                      <div className="flex items-center gap-2"><span className="font-mono text-[11px] text-muted-foreground">{i.id}</span><span className={cn("font-display text-sm font-semibold tabular", i.assessment.priorityScore >= 85 ? "text-priority-critical" : i.assessment.priorityScore >= 65 ? "text-priority-high" : "text-primary")}>{i.assessment.priorityScore}</span></div>
                      <p className="line-clamp-1 text-sm font-semibold group-hover:underline">{i.title}</p>
                    </Link>
                  </TableCell>
                  <TableCell><span className="inline-flex items-center gap-1.5 text-sm"><CategoryIcon category={i.category} className="text-muted-foreground" />{CATEGORY_LABEL[i.category]}</span></TableCell>
                  <TableCell><PriorityBadge priority={i.priority} /></TableCell>
                  <TableCell className="text-sm">{i.location.wardId}</TableCell>
                  <TableCell><span className={cn("inline-flex items-center gap-1 text-sm tabular", overdue && "font-bold text-destructive")}>{overdue && <Clock className="h-3 w-3" />}{ageLabel(i.reportedAt)}</span></TableCell>
                  <TableCell className="text-center">{i.duplicateCount > 1 ? <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold"><Copy className="h-3 w-3" />{i.duplicateCount}</span> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-sm">{i.assignedTeam ?? <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                  <TableCell><StatusBadge status={i.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : (
                        <>
                          {["reported", "ai_analyzed"].includes(i.status) && <Button size="sm" variant="outline" onClick={() => act(i.id, () => api.assignIssue(i.id), `${i.id} assigned`)}><UserPlus className="h-3.5 w-3.5" /> Assign</Button>}
                          {i.status === "assigned" && <Button size="sm" variant="outline" onClick={() => act(i.id, () => api.startWork(i.id), `${i.id} work started`)}><Play className="h-3.5 w-3.5" /> Start</Button>}
                          {["in_progress", "reopened"].includes(i.status) && <Button size="sm" asChild><Link to="/authority/resolve/$issueId" params={{ issueId: i.id }}><Wrench className="h-3.5 w-3.5" /> Resolve</Link></Button>}
                          {i.status === "resolution_submitted" && <Button size="sm" asChild className="bg-ai text-ai-foreground hover:bg-ai/90"><Link to="/verification/$issueId" params={{ issueId: i.id }}><ShieldCheck className="h-3.5 w-3.5" /> Verify</Link></Button>}
                          {i.status === "awaiting_citizen" && <Button size="sm" variant="ghost" asChild><Link to="/verification/$issueId" params={{ issueId: i.id }}>View</Link></Button>}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && <TableRow><TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">No issues match these filters.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2.5 text-sm shadow-sm">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

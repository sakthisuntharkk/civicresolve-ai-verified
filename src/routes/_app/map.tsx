import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { issuesQuery } from "@/lib/queries";
import { WARDS } from "@/services/mockData";
import { PageHeader } from "@/components/civic/PageHeader";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { PriorityBadge } from "@/components/civic/PriorityBadge";
import { CategoryIcon } from "@/components/civic/CategoryIcon";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABEL, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category, Issue, Priority } from "@/types";
import { Filter, Layers, X } from "lucide-react";

export const Route = createFileRoute("/_app/map")({
  head: () => ({
    meta: [
      { title: "Civic Issue Map — CivicAI" },
      { name: "description", content: "Ward-level map of open civic issues with priority-coloured pins and clusters." },
      { property: "og:title", content: "Civic Issue Map — CivicAI" },
      { property: "og:description", content: "Ward-level map of open civic issues with priority-coloured pins and clusters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(issuesQuery),
  component: CityMap,
});

const PIN: Record<Priority, string> = { critical: "fill-priority-critical", high: "fill-priority-high", medium: "fill-priority-medium", low: "fill-priority-low" };

function CityMap() {
  const { data: issues } = useSuspenseQuery(issuesQuery);
  const [cats, setCats] = useState<Set<Category>>(new Set(Object.keys(CATEGORY_LABEL) as Category[]));
  const [pris, setPris] = useState<Set<Priority>>(new Set(["critical", "high", "medium", "low"]));
  const [showResolved, setShowResolved] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [activeId, setActiveId] = useState<string | null>("CIV-1042");

  const visible = useMemo(() => issues.filter((i) => cats.has(i.category) && pris.has(i.priority) && (showResolved || i.status !== "resolved")), [issues, cats, pris, showResolved]);
  const active = visible.find((i) => i.id === activeId) ?? null;

  const toggle = <T,>(set: Set<T>, v: T, setter: (s: Set<T>) => void) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); setter(n); };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Civic issue map" title="Where the city hurts." description="Pins are coloured by priority; clusters show merged duplicate reports." actions={<Button variant="outline" onClick={() => setDrawer((d) => !d)}><Filter className="h-4 w-4" /> Filters</Button>} />
      <div className="relative grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="relative overflow-hidden rounded-2xl border bg-paper shadow-card">
          <svg viewBox="0 0 1000 640" className="h-auto w-full">
            <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-border" /></pattern></defs>
            <rect width="1000" height="640" fill="url(#g)" />
            {/* water & parks */}
            <path d="M0 560 Q200 520 420 590 T1000 560 V640 H0 Z" className="fill-info/15" />
            <ellipse cx="660" cy="500" rx="70" ry="38" className="fill-info/25" />
            <rect x="200" y="100" width="90" height="70" rx="10" className="fill-success/15" />
            <rect x="720" y="420" width="100" height="60" rx="10" className="fill-success/15" />
            {/* roads */}
            <g className="stroke-background" strokeWidth="14" fill="none" strokeLinecap="round">
              <path d="M0 200 H1000" /><path d="M0 360 H1000" /><path d="M150 0 V640" /><path d="M470 0 V640" /><path d="M780 0 V640" />
              <path d="M100 40 Q400 250 640 220 T980 420" />
            </g>
            <g className="stroke-border" strokeWidth="1" fill="none">
              <path d="M0 200 H1000" /><path d="M0 360 H1000" /><path d="M150 0 V640" /><path d="M470 0 V640" /><path d="M780 0 V640" />
            </g>
            {/* ward labels */}
            {[[230, 60, "Anna Nagar"], [560, 60, "Perambur"], [560, 300, "T. Nagar"], [360, 400, "Kodambakkam"], [640, 600, "Velachery"], [860, 300, "Adyar"]].map(([x, y, l]) => (
              <text key={String(l)} x={Number(x)} y={Number(y)} className="fill-muted-foreground font-sans text-[13px] font-bold uppercase" style={{ letterSpacing: "0.15em" }}>{l}</text>
            ))}
            {/* pins */}
            {visible.map((i) => {
              const isActive = i.id === activeId;
              const r = i.duplicateCount > 1 ? 12 + Math.min(i.duplicateCount, 8) * 1.6 : 9;
              return (
                <g key={i.id} transform={`translate(${i.location.x} ${i.location.y})`} onClick={() => setActiveId(i.id)} className="cursor-pointer">
                  {i.priority === "critical" && i.status !== "resolved" && <circle r={r + 8} className={cn(PIN[i.priority], "opacity-30")}><animate attributeName="r" values={`${r + 4};${r + 16};${r + 4}`} dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" /></circle>}
                  <circle r={r} className={cn(PIN[i.priority], i.status === "resolved" && "opacity-40", "stroke-background")} strokeWidth={isActive ? 4 : 2.5} />
                  {i.duplicateCount > 1 && <text textAnchor="middle" dy="4" className="fill-background font-sans text-[11px] font-extrabold">{i.duplicateCount}</text>}
                  {isActive && <circle r={r + 6} className="fill-none stroke-foreground" strokeWidth="1.5" strokeDasharray="4 3" />}
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-lg border bg-background/90 p-2 text-[11px] font-semibold backdrop-blur">
            {(["critical", "high", "medium", "low"] as Priority[]).map((p) => <span key={p} className="inline-flex items-center gap-1.5 capitalize"><span className={cn("h-2.5 w-2.5 rounded-full", `bg-priority-${p}`)} />{p}</span>)}
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Layers className="h-3 w-3" /> number = merged reports</span>
          </div>
          {drawer && (
            <div className="absolute right-3 top-3 w-64 space-y-4 rounded-xl border bg-background/95 p-4 shadow-float backdrop-blur">
              <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filters</p><button onClick={() => setDrawer(false)}><X className="h-4 w-4" /></button></div>
              <div><p className="mb-1.5 text-xs font-semibold">Category</p><div className="flex flex-wrap gap-1">{(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => <button key={c} onClick={() => toggle(cats, c, setCats)} className={cn("rounded-md border px-2 py-0.5 text-[11px] font-semibold", cats.has(c) ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}>{CATEGORY_LABEL[c]}</button>)}</div></div>
              <div><p className="mb-1.5 text-xs font-semibold">Priority</p><div className="flex flex-wrap gap-1">{(["critical", "high", "medium", "low"] as Priority[]).map((p) => <button key={p} onClick={() => toggle(pris, p, setPris)} className={cn("rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize", pris.has(p) ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}>{p}</button>)}</div></div>
              <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} /> Show resolved</label>
            </div>
          )}
        </div>
        <aside className="space-y-3">
          {active ? <Preview issue={active} /> : <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Select a pin to preview the issue.</div>}
          <div className="rounded-2xl border bg-card p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Visible issues ({visible.length})</p>
            <ul className="mt-2 max-h-72 divide-y overflow-y-auto">{visible.map((i) => <li key={i.id}><button onClick={() => setActiveId(i.id)} className={cn("flex w-full items-center gap-2 py-2 text-left text-sm", i.id === activeId && "font-bold")}><span className={cn("h-2 w-2 shrink-0 rounded-full", `bg-priority-${i.priority}`)} /><span className="truncate">{i.title}</span></button></li>)}</ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Preview({ issue }: { issue: Issue }) {
  const ward = WARDS.find((w) => w.id === issue.location.wardId);
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <img src={issue.beforePhoto} alt="" className="aspect-[16/9] w-full object-cover" width={1024} height={768} loading="lazy" />
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[11px] text-muted-foreground">{issue.id}</span><PriorityBadge priority={issue.priority} /><StatusBadge status={issue.status} /></div>
        <h3 className="mt-2 font-sans text-base font-bold leading-snug">{issue.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground"><CategoryIcon category={issue.category} className="mr-1 inline h-3 w-3" />{CATEGORY_LABEL[issue.category]} · {ward?.name} · {timeAgo(issue.reportedAt)}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-paper p-2"><p className="font-display text-lg font-semibold tabular">{issue.assessment.priorityScore}</p><p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Score</p></div><div className="rounded-lg bg-paper p-2"><p className="font-display text-lg font-semibold tabular">{issue.duplicateCount}</p><p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Reports</p></div><div className="rounded-lg bg-paper p-2"><p className="font-display text-lg font-semibold tabular">{issue.assessment.clusterMultiplier.toFixed(1)}x</p><p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Cluster</p></div></div>
        <Button asChild className="mt-3 w-full" size="sm"><Link to="/issues/$issueId" params={{ issueId: issue.id }}>Open issue</Link></Button>
      </div>
    </div>
  );
}

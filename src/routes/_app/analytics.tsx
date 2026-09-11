import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyticsQuery } from "@/lib/queries";
import { PageHeader } from "@/components/civic/PageHeader";
import { AIInsightCard } from "@/components/civic/AIInsightCard";
import { ConfidenceGauge } from "@/components/civic/ConfidenceGauge";
import type { ReactNode } from "react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — CivicAI" },
      { name: "description", content: "Category, priority, department, AI verification outcomes and citizen confirmation trends." },
      { property: "og:title", content: "Analytics — CivicAI" },
      { property: "og:description", content: "Civic resolution analytics with AI insight callouts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(analyticsQuery),
  component: Analytics,
});

const C = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const PRI = { critical: "var(--priority-critical)", high: "var(--priority-high)", medium: "var(--priority-medium)", low: "var(--priority-low)" } as const;
const VER = { probably_resolved: "var(--success)", uncertain: "var(--warning)", not_resolved: "var(--destructive)" } as const;
const tip = { contentStyle: { borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 } };

function Analytics() {
  const { data } = useSuspenseQuery(analyticsQuery);
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Analytics" title="Is the city actually getting fixed?" description="Verification outcomes and citizen confirmation are first-class metrics — not just tickets closed." />

      <div className="grid gap-4 md:grid-cols-3">
        {data.insights.map((i) => <AIInsightCard key={i.title} tone={i.tone === "positive" ? "positive" : i.tone === "warning" ? "warning" : "ai"} title={i.title} eyebrow="AI insight">{i.body}</AIInsightCard>)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Issues by category"><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={data.byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>{data.byCategory.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}</Pie><Tooltip {...tip} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></Panel>
        <Panel title="Issues by priority"><ResponsiveContainer width="100%" height={240}><BarChart data={data.byPriority}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} /><Tooltip {...tip} cursor={{ fill: "var(--muted)" }} /><Bar dataKey="value" radius={[6, 6, 0, 0]}>{data.byPriority.map((p) => <Cell key={p.key} fill={PRI[p.key]} />)}</Bar></BarChart></ResponsiveContainer></Panel>
        <Panel title="Citizen confirmation rate" subtitle="Share of 'resolved' claims the reporter agreed with">
          <div className="flex items-center gap-6"><ConfidenceGauge value={data.citizenConfirmationRate} label="Confirmed" size={140} /><ResponsiveContainer width="100%" height={140}><LineChart data={data.citizenConfirmationTrend}><XAxis dataKey="week" hide /><YAxis domain={[60, 90]} hide /><Tooltip {...tip} /><Line type="monotone" dataKey="rate" stroke="var(--success)" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Open vs resolved by department"><ResponsiveContainer width="100%" height={260}><BarChart data={data.byDepartment} layout="vertical" margin={{ left: 10 }}><CartesianGrid horizontal={false} stroke="var(--border)" /><XAxis type="number" tickLine={false} axisLine={false} fontSize={12} /><YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={70} /><Tooltip {...tip} cursor={{ fill: "var(--muted)" }} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="resolved" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} /><Bar dataKey="open" stackId="a" fill="var(--chart-2)" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></Panel>
        <Panel title="AI verification outcomes" subtitle="Of all resolution submissions this quarter"><div className="flex items-center gap-4"><ResponsiveContainer width="55%" height={240}><PieChart><Pie data={data.verificationOutcomes} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>{data.verificationOutcomes.map((v) => <Cell key={v.key} fill={VER[v.key]} />)}</Pie><Tooltip {...tip} /></PieChart></ResponsiveContainer><ul className="flex-1 space-y-3">{data.verificationOutcomes.map((v) => <li key={v.key} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: VER[v.key] }} />{v.name}</span><span className="font-display text-xl font-semibold tabular">{v.value}%</span></li>)}</ul></div></Panel>
      </div>

      <Panel title="Median resolution time by category (days)" subtitle="Last 8 weeks">
        <ResponsiveContainer width="100%" height={280}><LineChart data={data.resolutionTrend}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} /><Tooltip {...tip} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />{(["road", "sanitation", "lighting", "water", "drainage"] as const).map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={C[i]} strokeWidth={2.5} dot={false} />)}</LineChart></ResponsiveContainer>
      </Panel>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card"><h2 className="font-sans text-base font-bold">{title}</h2>{subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}<div className="mt-4">{children}</div></section>
  );
}

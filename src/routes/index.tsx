import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/civic/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  Building2,
  Camera,
  CheckCircle2,
  Copy,
  Eye,
  Gauge,
  Map as MapIcon,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wrench,
} from "lucide-react";
import { PHOTOS } from "@/services/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicAI — From civic complaints to verified solutions" },
      {
        name: "description",
        content:
          "Report civic issues, let AI prioritise and route them, and close the loop only when AI verification and the citizen agree it is actually fixed.",
      },
      { property: "og:title", content: "CivicAI — From civic complaints to verified solutions" },
      {
        property: "og:description",
        content: "Not just closed. Actually resolved. AI-verified civic issue resolution with citizen confirmation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    key: "report",
    label: "Report",
    icon: Camera,
    actor: "Citizen",
    body: "Describe the problem in plain words, drop a pin, attach a photo. Under a minute.",
  },
  {
    key: "analysis",
    label: "AI Analysis",
    icon: Bot,
    actor: "AI",
    body: "Category, severity, safety risk and duplicates detected live as you type.",
  },
  {
    key: "priority",
    label: "Priority",
    icon: Gauge,
    actor: "AI",
    body: "A 0–100 score weighs safety, people affected, duration and how many neighbours agree.",
  },
  {
    key: "department",
    label: "Department",
    icon: Building2,
    actor: "Authority",
    body: "Routed straight to the right crew with a clear SLA, not a generic inbox.",
  },
  {
    key: "resolution",
    label: "Resolution",
    icon: Wrench,
    actor: "Authority",
    body: "Crew submits an after-photo and notes. The issue is not closed yet.",
  },
  {
    key: "verification",
    label: "AI Verification",
    icon: ShieldCheck,
    actor: "AI",
    body: "Before vs after are compared: same place? issue gone? evidence genuine? With a confidence score.",
  },
  {
    key: "confirmation",
    label: "Citizen Confirmation",
    icon: UserCheck,
    actor: "Citizen",
    body: "The person who reported it has the final word. 'Yes, it's fixed' or 'No, reopen'.",
  },
] as const;

const STATS = [
  { value: "84%", label: "citizen-confirmed resolutions" },
  { value: "38%", label: "reports merged as duplicates" },
  { value: "6.2d", label: "median road fix time, down from 9.8d" },
  { value: "1,140", label: "crew hours saved this quarter" },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Live AI triage while you type",
    body: "Category, severity and the responsible department appear as the description is written — no dropdown guessing.",
  },
  {
    icon: Copy,
    title: "Duplicate & cluster detection",
    body: "Seven neighbours reporting the same pothole becomes one issue with a 1.8x priority multiplier, not seven tickets.",
  },
  {
    icon: ShieldCheck,
    title: "Verified, not just marked done",
    body: "Every 'resolved' claim is checked against the original photo with an explainable confidence score.",
  },
  {
    icon: UserCheck,
    title: "Citizen has the final word",
    body: "Reporters confirm or reopen with a reason. Reopen rates feed straight back into department analytics.",
  },
  {
    icon: MapIcon,
    title: "Ward-level issue map",
    body: "Priority-coloured pins and clusters show where the city hurts most, filterable by category and status.",
  },
  {
    icon: Eye,
    title: "Explainable priority",
    body: "Every score shows its working: safety risk, people affected, duration and cluster multiplier.",
  },
];

function Landing() {
  const [active, setActive] = useState(5);
  const step = STEPS[active]!;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <Link to="/authority" className="hover:text-foreground">
              For authorities
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">Citizen dashboard</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/report">
                Report an issue <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-paper [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ai/30 bg-ai-soft px-3 py-1 text-xs font-semibold text-ai">
              <Sparkles className="h-3.5 w-3.5" /> Not just closed. Actually resolved.
            </span>
            <h1 className="mt-6 text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              From civic complaints to <em className="text-primary not-italic underline decoration-ai decoration-[6px] underline-offset-[10px]">verified</em> solutions.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              CivicAI turns a photo and a sentence into a prioritised, routed work order — and only calls it resolved when AI verification and the citizen who reported it both agree.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link to="/report">
                  Report an issue <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/verification/$issueId" params={{ issueId: "CIV-1019" }}>
                  <ShieldCheck className="h-4 w-4" /> See AI verification
                </Link>
              </Button>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl font-semibold tabular text-foreground">{s.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero visual: verification card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-ai/15 via-transparent to-primary/10 blur-2xl" />
            <div className="relative rounded-2xl border bg-card p-4 shadow-float">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ai text-ai-foreground">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">AI verification</p>
                    <p className="text-sm font-bold">CIV-1038 · Overflowing bin, Velachery depot</p>
                  </div>
                </div>
                <span className="rounded-full bg-success/12 px-2.5 py-1 text-xs font-bold text-success">87% · Probably resolved</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <figure className="relative overflow-hidden rounded-lg">
                  <img src={PHOTOS.garbageBefore} alt="Before: overflowing bin" className="aspect-[4/3] w-full object-cover" width={1024} height={768} />
                  <figcaption className="absolute left-2 top-2 rounded bg-ink/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-foreground">Before</figcaption>
                </figure>
                <figure className="relative overflow-hidden rounded-lg">
                  <img src={PHOTOS.garbageAfter} alt="After: cleared pavement" className="aspect-[4/3] w-full object-cover" width={1024} height={768} />
                  <figcaption className="absolute left-2 top-2 rounded bg-success px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success-foreground">After</figcaption>
                </figure>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  ["Location consistency", 96],
                  ["Issue absence", 84],
                  ["Evidence matching", 81],
                ].map(([label, score]) => (
                  <li key={String(label)} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="flex-1">{label}</span>
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full bg-success" style={{ width: `${score}%` }} />
                    </span>
                    <span className="w-8 text-right text-xs font-semibold tabular text-muted-foreground">{score}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-warning/50 bg-warning/12 px-3 py-2">
                <span className="text-xs font-semibold text-warning-foreground">Waiting for citizen confirmation</span>
                <div className="flex gap-1.5">
                  <span className="rounded-md bg-success px-2 py-1 text-[11px] font-bold text-success-foreground">Yes, it's fixed</span>
                  <span className="rounded-md border bg-background px-2 py-1 text-[11px] font-bold">No, reopen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="how" className="border-t bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">How it works</p>
            <h2 className="mt-2 text-4xl font-medium tracking-tight">Seven steps. Two of them are the ones every other system skips.</h2>
            <p className="mt-3 text-muted-foreground">Click any step to see who acts and what happens.</p>
          </div>

          <ol className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === active;
              const highlight = i >= 5;
              return (
                <li key={s.key} className="relative">
                  {i < STEPS.length - 1 && (
                    <span className="absolute left-[calc(50%+22px)] top-6 hidden h-px w-[calc(100%-44px)] bg-border lg:block" />
                  )}
                  <button
                    onClick={() => setActive(i)}
                    className={cn(
                      "flex w-full flex-col items-center rounded-xl border px-2 py-4 text-center transition-all",
                      isActive ? "border-primary bg-card shadow-float" : "border-transparent hover:bg-card/60",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors",
                        isActive
                          ? highlight
                            ? "border-ai bg-ai text-ai-foreground"
                            : "border-primary bg-primary text-primary-foreground"
                          : highlight
                            ? "border-ai/40 bg-ai-soft text-ai"
                            : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step {i + 1}</span>
                    <span className="text-sm font-bold leading-tight">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 rounded-2xl border bg-card p-6 shadow-card md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <span
                className={cn(
                  "inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                  active >= 5 ? "bg-ai text-ai-foreground" : "bg-primary text-primary-foreground",
                )}
              >
                <step.icon className="h-7 w-7" />
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Step {active + 1} · {step.actor}
                </p>
                <h3 className="mt-1 text-2xl font-medium">{step.label}</h3>
                <p className="mt-2 max-w-2xl text-muted-foreground">{step.body}</p>
              </div>
              {active >= 5 && (
                <span className="rounded-full border border-ai/30 bg-ai-soft px-3 py-1 text-xs font-bold text-ai">
                  The CivicAI difference
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Features</p>
            <h2 className="mt-2 text-4xl font-medium tracking-tight">Built for citizens who are tired of "closed" and crews who are tired of noise.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-2xl border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-sans text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-ink-foreground md:px-14">
          <div className="absolute inset-0 grid-paper opacity-30 [mask-image:linear-gradient(to_right,black,transparent)]" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-4xl font-medium tracking-tight">Try the full loop in the demo.</h2>
              <p className="mt-3 text-ink-foreground/70">
                Report a pothole, watch the AI triage it, submit a resolution as the crew, run verification, then confirm it as the citizen.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 bg-ai text-ai-foreground hover:bg-ai/90">
                <Link to="/dashboard">
                  Citizen dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground">
                <Link to="/authority">Authority operations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <Logo className="scale-90" />
          <span>Demo environment · Mock data for Chennai wards</span>
        </div>
      </footer>
    </div>
  );
}

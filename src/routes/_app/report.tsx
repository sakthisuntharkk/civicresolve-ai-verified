import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as api from "@/services/api";
import { WARDS } from "@/services/mockData";
import type { AIAnalysisPreview, DuplicateMatch, Location } from "@/types";
import { PageHeader } from "@/components/civic/PageHeader";
import { AIInsightCard } from "@/components/civic/AIInsightCard";
import { PriorityBadge } from "@/components/civic/PriorityBadge";
import { CategoryIcon } from "@/components/civic/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABEL, RISK_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Camera, Check, Copy, Loader2, MapPin, Sparkles, Upload, X } from "lucide-react";

export const Route = createFileRoute("/_app/report")({
  head: () => ({
    meta: [
      { title: "Report an Issue — CivicAI" },
      { name: "description", content: "Describe a civic problem, add a location and photo, and let AI triage it in real time." },
      { property: "og:title", content: "Report an Issue — CivicAI" },
      { property: "og:description", content: "Describe a civic problem and let AI triage it in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportFlow,
});

const STEPS = ["Describe", "Location", "Evidence", "AI Summary", "Review"];
const SAMPLE =
  "There is a very deep pothole right before the 2nd Avenue traffic signal. It fills with water when it rains and two-wheelers cannot see it. Yesterday a scooter skidded and the rider fell. It has been there for three weeks.";

function ReportFlow() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<AIAnalysisPreview | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [wardId, setWardId] = useState("W-01");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live AI analysis as the user types
  useEffect(() => {
    if (description.trim().length < 25) {
      setAnalysis(null);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    setAnalyzing(true);
    debounce.current = setTimeout(async () => {
      const result = await api.analyzeDescription(description);
      setAnalysis(result);
      setAnalyzing(false);
    }, 500);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [description]);

  useEffect(() => {
    if (step === 3 && analysis && !summary) {
      setSummarizing(true);
      api.generateSummary(description, analysis).then((s) => {
        setSummary(s);
        setSummarizing(false);
      });
    }
    if (step === 4 && analysis && duplicates === null) {
      api.detectDuplicates(analysis.category, wardId).then(setDuplicates);
    }
  }, [step, analysis, description, summary, wardId, duplicates]);

  const canNext = [
    !!analysis && !analyzing,
    address.trim().length > 3 && !!pin,
    true,
    summary.trim().length > 10 && !summarizing,
    true,
  ][step];

  const onPhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!analysis) return;
    setSubmitting(true);
    const ward = WARDS.find((w) => w.id === wardId)!;
    const location: Location = {
      address,
      landmark: landmark || undefined,
      wardId,
      lat: 13.05,
      lng: 80.22,
      x: pin ? Math.round(pin.x * 1000) : 500,
      y: pin ? Math.round(pin.y * 640) : 320,
    };
    const issue = await api.createIssue({ description, location, photo, aiSummary: summary, analysis });
    await qc.invalidateQueries({ queryKey: ["issues"] });
    await qc.invalidateQueries({ queryKey: ["summary"] });
    toast.success(`Report ${issue.id} submitted`, { description: `Routed to ${issue.department} · ${ward.name}` });
    navigate({ to: "/issues/$issueId", params: { issueId: issue.id } });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader eyebrow="Report an issue" title="Tell us what's wrong." description="AI triages as you type — category, severity and the right department, before you even hit submit." />

      <ol className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                i < step ? "bg-primary text-primary-foreground" : i === step ? "border-2 border-primary text-primary" : "border text-muted-foreground",
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("hidden text-xs font-semibold sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
            {i < STEPS.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-primary" : "bg-border")} />}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border bg-card p-6 shadow-card">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="desc" className="text-base font-bold">Describe the problem</Label>
                <p className="mt-1 text-sm text-muted-foreground">Plain language is fine. Mention how long it's been there and who it affects.</p>
              </div>
              <Textarea id="desc" rows={7} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. A streetlight near the school gate has been off for two weeks and the road is completely dark after 7pm…" className="resize-none text-[15px] leading-relaxed" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{description.length} characters {description.length < 25 && "· at least 25 to start analysis"}</span>
                <button className="font-semibold text-primary hover:underline" onClick={() => setDescription(SAMPLE)}>Use sample description</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-sans text-base font-bold">Where is it?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Pick the ward, then tap the map to drop a pin.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {WARDS.map((w) => (
                  <button key={w.id} onClick={() => setWardId(w.id)} className={cn("rounded-lg border p-3 text-left transition-colors", wardId === w.id ? "border-primary bg-primary/5" : "hover:bg-secondary/60")}>
                    <p className="font-mono text-[10px] text-muted-foreground">{w.id} · {w.zone}</p>
                    <p className="text-sm font-bold">{w.name}</p>
                  </button>
                ))}
              </div>
              <div
                className="relative aspect-[16/9] cursor-crosshair overflow-hidden rounded-xl border bg-paper grid-paper"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setPin({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
                }}
              >
                <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full text-border">
                  <path d="M0 120 H640 M0 240 H640 M160 0 V360 M320 0 V360 M480 0 V360" stroke="currentColor" strokeWidth="6" fill="none" />
                  <path d="M40 40 Q320 200 600 320" stroke="currentColor" strokeWidth="10" fill="none" strokeLinecap="round" />
                </svg>
                {pin ? (
                  <span className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}>
                    <MapPin className="h-8 w-8 fill-primary text-primary-foreground drop-shadow" />
                  </span>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-muted-foreground">Tap to drop a pin</span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="addr">Street / address</Label>
                  <Input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="2nd Avenue, near Roundtana signal" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lm">Landmark (optional)</Label>
                  <Input id="lm" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Opposite Tower Park gate" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-sans text-base font-bold">Add a photo</h2>
                <p className="mt-1 text-sm text-muted-foreground">This becomes the "before" photo the AI compares against when the crew says it's fixed.</p>
              </div>
              {photo ? (
                <div className="relative overflow-hidden rounded-xl border">
                  <img src={photo} alt="Evidence" className="aspect-[4/3] w-full object-cover" />
                  <button onClick={() => setPhoto(undefined)} className="absolute right-3 top-3 rounded-full bg-ink/80 p-1.5 text-ink-foreground"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-paper text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary"><Camera className="h-5 w-5 text-primary" /></span>
                  <span className="text-sm font-semibold">Upload or take a photo</span>
                  <span className="text-xs text-muted-foreground">JPG or PNG · you can skip this step</span>
                  <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
                </label>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-sans text-base font-bold">AI summary</h2>
                <p className="mt-1 text-sm text-muted-foreground">This is what the crew sees first. Edit anything that's not right.</p>
              </div>
              {summarizing ? (
                <div className="flex items-center gap-3 rounded-xl border border-ai/30 bg-ai-soft/60 p-6 text-sm text-ai"><Loader2 className="h-4 w-4 animate-spin" /> Generating a crew-ready summary…</div>
              ) : (
                <Textarea rows={5} value={summary} onChange={(e) => setSummary(e.target.value)} className="text-[15px] leading-relaxed" />
              )}
              <p className="text-xs text-muted-foreground">Original: “{description}”</p>
            </div>
          )}

          {step === 4 && analysis && (
            <div className="space-y-5">
              <h2 className="font-sans text-base font-bold">Review & submit</h2>
              {duplicates === null ? (
                <div className="flex items-center gap-3 rounded-xl border border-ai/30 bg-ai-soft/60 p-4 text-sm text-ai"><Loader2 className="h-4 w-4 animate-spin" /> Checking for similar reports nearby…</div>
              ) : duplicates.length > 0 ? (
                <AIInsightCard tone="warning" eyebrow="Possible duplicate" title={`${duplicates.length} similar open report${duplicates.length > 1 ? "s" : ""} in ${WARDS.find((w) => w.id === wardId)?.name}`}>
                  <ul className="space-y-2">
                    {duplicates.map((d) => (
                      <li key={d.issue.id} className="flex items-center justify-between gap-3 rounded-lg bg-background/70 p-2.5 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{d.issue.title}</p>
                          <p className="text-xs text-muted-foreground">{d.issue.id} · {d.distanceMeters} m away · {Math.round(d.similarity * 100)}% similar</p>
                        </div>
                        <Button asChild size="sm" variant="outline" className="shrink-0 bg-background"><Link to="/issues/$issueId" params={{ issueId: d.issue.id }}>View</Link></Button>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs">Submitting anyway will merge your report into the cluster and raise its priority.</p>
                </AIInsightCard>
              ) : (
                <div className="rounded-xl border border-success/30 bg-success/8 p-4 text-sm text-success"><Check className="mr-2 inline h-4 w-4" />No similar open reports nearby — this looks new.</div>
              )}
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Row k="Category" v={CATEGORY_LABEL[analysis.category]} />
                <Row k="Priority" v={<PriorityBadge priority={analysis.priority} />} />
                <Row k="Department" v={analysis.department} />
                <Row k="Ward" v={`${wardId} · ${WARDS.find((w) => w.id === wardId)?.name}`} />
                <Row k="Address" v={address} />
                <Row k="Photo" v={photo ? "Attached" : "None (category placeholder will be used)"} />
              </dl>
              <div className="rounded-lg bg-paper p-3 text-sm">{summary}</div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}><ArrowLeft className="h-4 w-4" /> Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Continue <ArrowRight className="h-4 w-4" /></Button>
            ) : (
              <Button onClick={submit} disabled={submitting || duplicates === null} className="bg-ai text-ai-foreground hover:bg-ai/90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Submit report
              </Button>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ai text-ai-foreground"><Sparkles className="h-3.5 w-3.5" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Live AI analysis</p>
                <p className="text-sm font-bold">{analyzing ? "Analysing…" : analysis ? "Preview ready" : "Waiting for description"}</p>
              </div>
              {analyzing && <Loader2 className="ml-auto h-4 w-4 animate-spin text-ai" />}
            </div>
            {analysis ? (
              <dl className="mt-4 space-y-3">
                <Row k="Category" v={<span className="inline-flex items-center gap-1.5 font-semibold"><CategoryIcon category={analysis.category} /> {CATEGORY_LABEL[analysis.category]} <span className="text-xs font-normal text-muted-foreground">{Math.round(analysis.categoryConfidence * 100)}%</span></span>} />
                <div>
                  <dt className="text-xs text-muted-foreground">Severity</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <div className="flex flex-1 gap-0.5">{Array.from({ length: 10 }).map((_, i) => <span key={i} className={cn("h-2 flex-1 rounded-sm", i < analysis.severity ? (analysis.severity >= 8 ? "bg-priority-critical" : analysis.severity >= 6 ? "bg-priority-high" : "bg-primary") : "bg-muted")} />)}</div>
                    <span className="text-sm font-bold tabular">{analysis.severity}/10</span>
                  </dd>
                </div>
                <Row k="Safety risk" v={<span className={cn("font-bold", analysis.safetyRisk === "critical" && "text-priority-critical", analysis.safetyRisk === "high" && "text-priority-high")}>{RISK_LABEL[analysis.safetyRisk]}</span>} />
                <Row k="Suggested priority" v={<PriorityBadge priority={analysis.priority} />} />
                <Row k="Recommended department" v={<span className="font-semibold">{analysis.department}</span>} />
                <div>
                  <dt className="text-xs text-muted-foreground">Signals detected</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">{analysis.signals.map((s) => <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium">{s}</span>)}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Start typing and the model will classify the issue, estimate severity and suggest routing.</p>
            )}
          </div>
          <div className="rounded-2xl border border-dashed p-4 text-xs text-muted-foreground">
            <Copy className="mr-1.5 inline h-3.5 w-3.5" /> Duplicate detection runs before submission so similar neighbours' reports get merged and prioritised together.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 text-sm">{v}</dd>
    </div>
  );
}

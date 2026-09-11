import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import * as api from "@/services/api";
import { issueQuery } from "@/lib/queries";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { PriorityBadge } from "@/components/civic/PriorityBadge";
import { AIInsightCard } from "@/components/civic/AIInsightCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Loader2, ShieldCheck, Upload, X } from "lucide-react";

export const Route = createFileRoute("/_app/authority/resolve/$issueId")({
  head: ({ params }) => ({
    meta: [
      { title: `Submit Resolution ${params.issueId} — CivicAI` },
      { name: "description", content: "Upload the after-photo and completion notes. The issue moves to AI verification, not closed." },
      { property: "og:title", content: `Submit Resolution ${params.issueId} — CivicAI` },
      { property: "og:description", content: "Upload the after-photo and completion notes for AI verification." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    const issue = await context.queryClient.ensureQueryData(issueQuery(params.issueId));
    if (!issue) throw notFound();
  },
  component: ResolveScreen,
});

function ResolveScreen() {
  const { issueId } = Route.useParams();
  const { data: issue } = useSuspenseQuery(issueQuery(issueId));
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  if (!issue) return null;

  const onPhoto = (file: File | undefined) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setPhoto(String(r.result));
    r.readAsDataURL(file);
  };

  const submit = async () => {
    setBusy(true);
    await api.submitResolution(issue.id, { afterPhoto: photo, notes, submittedBy: name || "Crew lead" });
    await qc.invalidateQueries({ queryKey: ["issues"] });
    await qc.invalidateQueries({ queryKey: ["summary"] });
    toast.success("Resolution submitted", { description: "Status → AI Verification. Not closed until verified and confirmed." });
    navigate({ to: "/verification/$issueId", params: { issueId: issue.id } });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/authority" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Operations</Link>
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Submit resolution</p>
        <h1 className="mt-1 text-3xl font-medium tracking-tight">{issue.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span className="font-mono text-xs">{issue.id}</span><StatusBadge status={issue.status} /><PriorityBadge priority={issue.priority} /><span>{issue.assignedTeam ?? issue.department}</span></div>
      </header>

      <AIInsightCard tone="neutral" eyebrow="What happens next" title="Submitting does not close this issue.">It moves to <strong>AI Verification</strong>, where the after-photo is compared with the citizen's original. If confidence is high enough, the citizen is asked to confirm. Only then is it resolved.</AIInsightCard>

      <div className="grid gap-6 md:grid-cols-2">
        <figure className="overflow-hidden rounded-xl border"><img src={issue.beforePhoto} alt="Before" className="aspect-[4/3] w-full object-cover" width={1024} height={768} /><figcaption className="px-3 py-2 text-xs text-muted-foreground">Before · citizen photo</figcaption></figure>
        {photo ? (
          <figure className="relative overflow-hidden rounded-xl border"><img src={photo} alt="After" className="aspect-[4/3] w-full object-cover" /><button onClick={() => setPhoto(undefined)} className="absolute right-3 top-3 rounded-full bg-ink/80 p-1.5 text-ink-foreground"><X className="h-4 w-4" /></button><figcaption className="px-3 py-2 text-xs text-success">After · ready to submit</figcaption></figure>
        ) : (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-paper text-center transition-colors hover:border-primary/50 hover:bg-primary/5"><Camera className="h-6 w-6 text-primary" /><span className="text-sm font-semibold">Upload after-photo</span><span className="text-xs text-muted-foreground">Same angle as the before photo helps verification. Skip to use a demo photo.</span><input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} /></label>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
        <div className="space-y-1.5"><Label htmlFor="who">Submitted by</Label><Input id="who" value={name} onChange={(e) => setName(e.target.value)} placeholder="R. Kumar (Crew Lead)" /></div>
        <div className="space-y-1.5"><Label htmlFor="notes">Completion notes</Label><Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What was done, materials used, anything the verifier should know…" /></div>
        <div className="flex justify-end gap-2 border-t pt-4"><Button asChild variant="ghost"><Link to="/authority">Cancel</Link></Button><Button onClick={submit} disabled={busy || notes.trim().length < 10}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Submit for AI verification <ShieldCheck className="h-4 w-4" /></Button></div>
      </div>
    </div>
  );
}

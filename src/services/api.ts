/**
 * CivicAI API service layer.
 *
 * Isolated mock implementation with an in-memory store. Every function returns
 * a Promise so the UI can swap to a real backend without changing call sites.
 */
import type {
  AIAnalysisPreview,
  AnalyticsData,
  AuthorityMetrics,
  Category,
  CitizenSummary,
  DuplicateMatch,
  Issue,
  NewReportInput,
  Priority,
  SafetyRisk,
  Verification,
  Ward,
} from "@/types";
import {
  ANALYTICS,
  CATEGORY_PHOTO,
  CURRENT_USER,
  DEPARTMENTS,
  NOW,
  PHOTOS,
  PRIORITY_ORDER,
  SEED_ISSUES,
  STATUS_PROGRESS,
  TEAMS,
  WARDS,
  buildTimeline,
} from "./mockData";

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let store: Issue[] = SEED_ISSUES.map((i) => structuredClone(i));
let nextId = 1055;

const isBrowser = typeof window !== "undefined";
const wait = (ms: number) => (isBrowser ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());
const clone = <T>(v: T): T => structuredClone(v);

function nowIso() {
  // In the browser use real time for new events; on the server keep deterministic.
  return isBrowser ? new Date().toISOString() : NOW.toISOString();
}

function timelineStamps(issue: Issue) {
  const stamps: Partial<Record<Issue["timeline"][number]["key"], string>> = {};
  const descs: Partial<Record<Issue["timeline"][number]["key"], string>> = {};
  for (const e of issue.timeline) {
    if (e.timestamp) stamps[e.key] = e.timestamp;
    if (e.description) descs[e.key] = e.description;
  }
  return { stamps, descs };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getWards(): Promise<Ward[]> {
  await wait(60);
  return clone(WARDS);
}

export async function getIssues(): Promise<Issue[]> {
  await wait(120);
  return clone(store).sort((a, b) => {
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (p !== 0) return p;
    return b.assessment.priorityScore - a.assessment.priorityScore;
  });
}

export async function getIssue(id: string): Promise<Issue | undefined> {
  await wait(100);
  const found = store.find((i) => i.id === id);
  return found ? clone(found) : undefined;
}

export async function getMyIssues(): Promise<Issue[]> {
  await wait(120);
  return clone(store)
    .filter((i) => i.reporterId === CURRENT_USER.id)
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
}

export async function getCitizenSummary(): Promise<CitizenSummary> {
  await wait(80);
  const mine = store.filter((i) => i.reporterId === CURRENT_USER.id);
  return {
    name: CURRENT_USER.name,
    total: mine.length,
    inProgress: mine.filter((i) =>
      ["assigned", "in_progress", "resolution_submitted", "ai_verification"].includes(i.status),
    ).length,
    resolved: mine.filter((i) => i.status === "resolved").length,
    needsAttention: mine.filter((i) => ["awaiting_citizen", "reopened"].includes(i.status)).length,
  };
}

export async function getAuthorityMetrics(): Promise<AuthorityMetrics> {
  await wait(80);
  const open = store.filter((i) => i.status !== "resolved");
  const ref = isBrowser ? Date.now() : NOW.getTime();
  return {
    open: open.length,
    critical: open.filter((i) => i.priority === "critical").length,
    inProgress: open.filter((i) => ["in_progress", "reopened"].includes(i.status)).length,
    awaitingVerification: open.filter((i) =>
      ["resolution_submitted", "ai_verification", "awaiting_citizen"].includes(i.status),
    ).length,
    overdue: open.filter((i) => new Date(i.slaDueAt).getTime() < ref).length,
  };
}

export async function getAnalytics(): Promise<AnalyticsData> {
  await wait(150);
  return clone(ANALYTICS);
}

// ---------------------------------------------------------------------------
// AI: description analysis (rule-based mock)
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  road: ["pothole", "road", "crack", "asphalt", "footpath", "pavement", "speed breaker", "tar", "caved"],
  sanitation: ["garbage", "trash", "waste", "dump", "bin", "litter", "smell", "collection", "debris"],
  lighting: ["streetlight", "street light", "light", "lamp", "dark", "flicker", "pole", "bulb"],
  water: ["pipe", "leak", "burst", "water supply", "pressure", "tap", "pipeline", "gushing"],
  drainage: ["drain", "flood", "waterlog", "sewer", "sewage", "manhole", "storm", "overflow"],
};

const SEVERITY_SIGNALS: { pattern: RegExp; weight: number; label: string }[] = [
  { pattern: /accident|injur|fell|skid|hurt/i, weight: 3, label: "Injury or accident mentioned" },
  { pattern: /child|school|kids|elderly|hospital/i, weight: 2, label: "Vulnerable group nearby" },
  { pattern: /week|month|days/i, weight: 1, label: "Prolonged duration" },
  { pattern: /danger|urgent|emergency|immediately/i, weight: 2, label: "Urgency language" },
  { pattern: /night|dark|evening/i, weight: 1, label: "Night-time exposure" },
  { pattern: /flood|gushing|inside (the )?house|overflow/i, weight: 2, label: "Active ongoing damage" },
  { pattern: /bus|traffic|signal|market|main road|highway/i, weight: 1, label: "High-footfall location" },
  { pattern: /open manhole|missing cover|exposed wire/i, weight: 3, label: "Severe hazard object" },
];

export async function analyzeDescription(text: string): Promise<AIAnalysisPreview> {
  await wait(900);
  const lower = text.toLowerCase();
  const scores = (Object.keys(CATEGORY_KEYWORDS) as Category[]).map((cat) => ({
    cat,
    score: CATEGORY_KEYWORDS[cat].reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  const top = scores[0]!;
  const total = scores.reduce((a, s) => a + s.score, 0) || 1;
  const category: Category = top.score === 0 ? "road" : top.cat;
  const categoryConfidence = top.score === 0 ? 0.42 : Math.min(0.97, 0.55 + (top.score / total) * 0.45);

  const signals: string[] = [];
  let severity = 4;
  for (const s of SEVERITY_SIGNALS) {
    if (s.pattern.test(text)) {
      severity += s.weight;
      signals.push(s.label);
    }
  }
  severity = Math.max(2, Math.min(10, severity));

  const safetyRisk: SafetyRisk =
    severity >= 9 ? "critical" : severity >= 7 ? "high" : severity >= 5 ? "medium" : "low";
  const priority: Priority =
    severity >= 9 ? "critical" : severity >= 7 ? "high" : severity >= 5 ? "medium" : "low";

  return {
    category,
    categoryConfidence,
    severity,
    safetyRisk,
    department: DEPARTMENTS[category],
    priority,
    signals: signals.length ? signals : ["No escalation signals detected"],
  };
}

export async function generateSummary(text: string, analysis: AIAnalysisPreview): Promise<string> {
  await wait(1100);
  const firstSentence = text.split(/[.!?]/).map((s) => s.trim()).filter(Boolean)[0] ?? text;
  const trimmed = firstSentence.length > 140 ? firstSentence.slice(0, 137) + "…" : firstSentence;
  const catLabel = analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1);
  return `${catLabel} issue: ${trimmed}. Severity ${analysis.severity}/10, safety risk ${analysis.safetyRisk}. ${
    analysis.signals[0] && analysis.signals[0] !== "No escalation signals detected"
      ? analysis.signals[0] + "."
      : ""
  } Recommended routing: ${analysis.department}.`.replace(/\s+/g, " ");
}

export async function detectDuplicates(category: Category, wardId: string): Promise<DuplicateMatch[]> {
  await wait(700);
  return store
    .filter((i) => i.category === category && i.location.wardId === wardId && i.status !== "resolved")
    .slice(0, 2)
    .map((issue, idx) => ({
      issue: clone(issue),
      distanceMeters: 35 + idx * 90,
      similarity: Math.max(0.6, 0.93 - idx * 0.14),
    }));
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createIssue(input: NewReportInput): Promise<Issue> {
  await wait(900);
  const id = `CIV-${nextId++}`;
  const t = nowIso();
  const { analysis } = input;
  const score = Math.min(
    99,
    Math.round(analysis.severity * 8 + (analysis.safetyRisk === "critical" ? 12 : analysis.safetyRisk === "high" ? 6 : 0)),
  );
  const slaDays = analysis.priority === "critical" ? 1 : analysis.priority === "high" ? 3 : analysis.priority === "medium" ? 7 : 14;
  const issue: Issue = {
    id,
    title: input.aiSummary.split(":")[1]?.split(".")[0]?.trim() || input.description.slice(0, 60),
    description: input.description,
    aiSummary: input.aiSummary,
    category: analysis.category,
    priority: analysis.priority,
    status: "ai_analyzed",
    department: analysis.department,
    location: input.location,
    reporterId: CURRENT_USER.id,
    reporterName: CURRENT_USER.name,
    reportedAt: t,
    slaDueAt: new Date(new Date(t).getTime() + slaDays * 86_400_000).toISOString(),
    beforePhoto: input.photo ?? CATEGORY_PHOTO[analysis.category],
    duplicateCount: 1,
    assessment: {
      priorityScore: score,
      clusterMultiplier: 1.0,
      peopleAffected: 300 + analysis.severity * 120,
      durationDays: 0,
      severity: analysis.severity,
      safetyRisk: analysis.safetyRisk,
      confidence: analysis.categoryConfidence,
      reasoning: `Classified as ${analysis.category} with ${Math.round(analysis.categoryConfidence * 100)}% confidence. Signals: ${analysis.signals.join(", ")}. Routed to ${analysis.department}; awaiting dispatcher assignment.`,
    },
    timeline: buildTimeline(
      "ai_analyzed",
      { reported: t, ai_analyzed: t },
      { ai_analyzed: `Category: ${analysis.category} · Severity ${analysis.severity}/10` },
    ),
    relatedReports: [],
    progress: STATUS_PROGRESS.ai_analyzed,
  };
  store = [issue, ...store];
  return clone(issue);
}

export async function assignIssue(id: string): Promise<Issue> {
  await wait(400);
  const issue = store.find((i) => i.id === id);
  if (!issue) throw new Error("Issue not found");
  const team = TEAMS[issue.category][0]!;
  const t = nowIso();
  issue.status = "assigned";
  issue.assignedTeam = team;
  issue.progress = STATUS_PROGRESS.assigned;
  const { stamps, descs } = timelineStamps(issue);
  issue.timeline = buildTimeline("assigned", { ...stamps, assigned: t }, { ...descs, assigned: `Routed to ${issue.department} → ${team}` });
  return clone(issue);
}

export async function startWork(id: string): Promise<Issue> {
  await wait(400);
  const issue = store.find((i) => i.id === id);
  if (!issue) throw new Error("Issue not found");
  const t = nowIso();
  issue.status = "in_progress";
  issue.progress = STATUS_PROGRESS.in_progress;
  if (!issue.assignedTeam) issue.assignedTeam = TEAMS[issue.category][0]!;
  const { stamps, descs } = timelineStamps(issue);
  issue.timeline = buildTimeline("in_progress", { ...stamps, work_started: t }, { ...descs, work_started: "Crew on site" });
  return clone(issue);
}

export async function submitResolution(
  id: string,
  payload: { afterPhoto?: string | undefined; notes: string; submittedBy: string },
): Promise<Issue> {
  await wait(900);
  const issue = store.find((i) => i.id === id);
  if (!issue) throw new Error("Issue not found");
  const t = nowIso();
  const afterPhoto = payload.afterPhoto ?? defaultAfterPhoto(issue.category);
  issue.resolution = {
    afterPhoto,
    notes: payload.notes,
    submittedBy: payload.submittedBy,
    team: issue.assignedTeam ?? TEAMS[issue.category][0]!,
    submittedAt: t,
  };
  issue.status = "resolution_submitted";
  issue.progress = STATUS_PROGRESS.resolution_submitted;
  issue.verification = undefined;
  const { stamps, descs } = timelineStamps(issue);
  issue.timeline = buildTimeline(
    "resolution_submitted",
    { ...stamps, resolution_submitted: t },
    { ...descs, resolution_submitted: "Awaiting AI verification" },
  );
  return clone(issue);
}

function defaultAfterPhoto(category: Category): string {
  switch (category) {
    case "road":
      return PHOTOS.potholeAfter;
    case "sanitation":
      return PHOTOS.garbageAfter;
    case "drainage":
      return PHOTOS.drainAfter;
    case "lighting":
      return PHOTOS.streetlightBefore;
    case "water":
      return PHOTOS.drainAfter;
  }
}

export async function runVerification(id: string): Promise<Issue> {
  await wait(2400);
  const issue = store.find((i) => i.id === id);
  if (!issue) throw new Error("Issue not found");
  const t = nowIso();
  const verification: Verification = buildVerification(issue);
  issue.verification = verification;
  issue.status = "awaiting_citizen";
  issue.progress = STATUS_PROGRESS.awaiting_citizen;
  const { stamps, descs } = timelineStamps(issue);
  issue.timeline = buildTimeline(
    "awaiting_citizen",
    { ...stamps, ai_verification: t },
    {
      ...descs,
      ai_verification: `${verification.confidence}% confidence · ${verdictLabel(verification.verdict)}`,
      citizen_confirmation: "Waiting for reporter to confirm",
    },
  );
  return clone(issue);
}

function buildVerification(issue: Issue): Verification {
  const seed = issue.id.split("-")[1] ?? "0";
  const jitter = (Number(seed) % 7) - 3;
  const byCategory: Record<Category, number> = { road: 84, sanitation: 87, drainage: 82, water: 79, lighting: 76 };
  const confidence = Math.max(55, Math.min(96, byCategory[issue.category] + jitter));
  const verdict = confidence >= 75 ? "probably_resolved" : confidence >= 55 ? "uncertain" : "not_resolved";
  const location = Math.min(99, confidence + 9);
  const absence = Math.max(40, confidence - 3);
  const evidence = Math.max(45, confidence - 6);
  return {
    confidence,
    verdict,
    analyzedAt: nowIso(),
    checks: [
      {
        id: "location",
        label: "Location consistency",
        passed: location >= 70,
        score: location,
        detail: `Structural landmarks matched across both frames. GPS delta ${3 + (Number(seed) % 5)} m; same camera azimuth within 12°.`,
      },
      {
        id: "absence",
        label: "Issue absence",
        passed: absence >= 70,
        score: absence,
        detail: absenceDetail(issue.category),
      },
      {
        id: "evidence",
        label: "Evidence matching",
        passed: evidence >= 70,
        score: evidence,
        detail: "After-photo EXIF timestamp falls within the crew's on-site window; no signs of reuse from prior work orders.",
      },
    ],
    reasoning: [
      `Scene match is ${location >= 90 ? "strong" : "adequate"}: fixed features from the citizen's photo reappear at consistent positions.`,
      `The reported ${issue.category} condition is ${absence >= 80 ? "not detected" : "largely absent but with residual indicators"} in the after-photo.`,
      `Confidence is ${confidence}% — ${
        confidence >= 75
          ? "high enough to hand off to the reporter for final confirmation rather than auto-closing."
          : "below the auto-handoff threshold; supervisor review is recommended before citizen confirmation."
      }`,
    ],
  };
}

function absenceDetail(category: Category) {
  switch (category) {
    case "road":
      return "Surface continuity restored; no cavity or standing water detected within the original defect bounds.";
    case "sanitation":
      return "No spillage or accumulated waste on the footpath; container lid closed.";
    case "drainage":
      return "Drain inlet clear and grate intact; no standing water on adjacent carriageway.";
    case "water":
      return "No active discharge visible; surface dry around the excavation patch.";
    case "lighting":
      return "Illumination detected at the fixture position in the after-capture.";
  }
}

export async function confirmResolution(
  id: string,
  payload: { confirmed: boolean; reason?: string | undefined },
): Promise<Issue> {
  await wait(700);
  const issue = store.find((i) => i.id === id);
  if (!issue) throw new Error("Issue not found");
  const t = nowIso();
  issue.citizenConfirmation = { confirmed: payload.confirmed, reason: payload.reason, at: t };
  const { stamps, descs } = timelineStamps(issue);
  if (payload.confirmed) {
    issue.status = "resolved";
    issue.progress = 100;
    issue.timeline = buildTimeline(
      "resolved",
      { ...stamps, citizen_confirmation: t, resolved: t },
      { ...descs, citizen_confirmation: "Confirmed fixed by reporter", resolved: "Closed with citizen confirmation" },
    );
  } else {
    issue.status = "reopened";
    issue.progress = STATUS_PROGRESS.reopened;
    issue.timeline = buildTimeline(
      "reopened",
      { ...stamps, citizen_confirmation: t },
      { ...descs, citizen_confirmation: `Reopened: ${payload.reason ?? "not fixed"}`, work_started: "Re-assigned for rework" },
    );
  }
  return clone(issue);
}

export function verdictLabel(v: Verification["verdict"]) {
  return v === "probably_resolved" ? "Probably resolved" : v === "uncertain" ? "Uncertain" : "Not resolved";
}

export { CURRENT_USER, WARDS, DEPARTMENTS };

export type Category = "road" | "sanitation" | "lighting" | "water" | "drainage";

export type Priority = "critical" | "high" | "medium" | "low";

export type IssueStatus =
  | "reported"
  | "ai_analyzed"
  | "assigned"
  | "in_progress"
  | "resolution_submitted"
  | "ai_verification"
  | "awaiting_citizen"
  | "resolved"
  | "reopened";

export type SafetyRisk = "low" | "medium" | "high" | "critical";

export type Actor = "citizen" | "ai" | "authority" | "system";

export interface Ward {
  id: string;
  name: string;
  zone: string;
}

export interface Location {
  address: string;
  landmark?: string | undefined;
  wardId: string;
  lat: number;
  lng: number;
  /** Normalised coordinates for the stylised city map (0-1000 x 0-640). */
  x: number;
  y: number;
}

export interface TimelineEvent {
  id: string;
  key: TimelineKey;
  label: string;
  description?: string | undefined;
  timestamp?: string | undefined;
  actor: Actor;
  state: "done" | "active" | "pending" | "failed";
}

export type TimelineKey =
  | "reported"
  | "ai_analyzed"
  | "assigned"
  | "work_started"
  | "resolution_submitted"
  | "ai_verification"
  | "citizen_confirmation"
  | "resolved";

export interface AIAssessment {
  priorityScore: number;
  clusterMultiplier: number;
  peopleAffected: number;
  durationDays: number;
  severity: number;
  safetyRisk: SafetyRisk;
  reasoning: string;
  confidence: number;
}

export interface VerificationCheck {
  id: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export type VerificationVerdict = "probably_resolved" | "uncertain" | "not_resolved";

export interface Verification {
  confidence: number;
  verdict: VerificationVerdict;
  checks: VerificationCheck[];
  reasoning: string[];
  analyzedAt: string;
}

export interface Resolution {
  afterPhoto: string;
  notes: string;
  submittedBy: string;
  team: string;
  submittedAt: string;
}

export interface CitizenConfirmation {
  confirmed: boolean;
  reason?: string | undefined;
  at: string;
}

export interface RelatedReport {
  id: string;
  title: string;
  reporterName: string;
  reportedAt: string;
  distanceMeters: number;
  similarity: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  aiSummary: string;
  category: Category;
  priority: Priority;
  status: IssueStatus;
  department: string;
  assignedTeam?: string | undefined;
  location: Location;
  reporterId: string;
  reporterName: string;
  reportedAt: string;
  slaDueAt: string;
  beforePhoto: string;
  duplicateCount: number;
  assessment: AIAssessment;
  timeline: TimelineEvent[];
  relatedReports: RelatedReport[];
  resolution?: Resolution | undefined;
  verification?: Verification | undefined;
  citizenConfirmation?: CitizenConfirmation | undefined;
  progress: number;
}

export interface AIAnalysisPreview {
  category: Category;
  categoryConfidence: number;
  severity: number;
  safetyRisk: SafetyRisk;
  department: string;
  priority: Priority;
  signals: string[];
}

export interface DuplicateMatch {
  issue: Issue;
  distanceMeters: number;
  similarity: number;
}

export interface NewReportInput {
  description: string;
  location: Location;
  photo?: string | undefined;
  aiSummary: string;
  analysis: AIAnalysisPreview;
}

export interface CitizenSummary {
  name: string;
  total: number;
  inProgress: number;
  resolved: number;
  needsAttention: number;
}

export interface AuthorityMetrics {
  open: number;
  critical: number;
  inProgress: number;
  awaitingVerification: number;
  overdue: number;
}

export interface AnalyticsData {
  byCategory: { name: string; value: number; key: Category }[];
  byPriority: { name: string; value: number; key: Priority }[];
  byDepartment: { name: string; open: number; resolved: number }[];
  verificationOutcomes: { name: string; value: number; key: VerificationVerdict }[];
  citizenConfirmationRate: number;
  citizenConfirmationTrend: { week: string; rate: number }[];
  resolutionTrend: { week: string; road: number; sanitation: number; lighting: number; water: number; drainage: number }[];
  insights: { title: string; body: string; tone: "positive" | "warning" | "neutral" }[];
}

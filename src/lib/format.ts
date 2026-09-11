import type { Category, IssueStatus, Priority, SafetyRisk } from "@/types";
import { NOW } from "@/services/mockData";

const refTime = () => (typeof window !== "undefined" ? Date.now() : NOW.getTime());

export function timeAgo(iso: string | undefined): string {
  if (!iso) return "";
  const diff = refTime() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export function ageLabel(iso: string): string {
  const diff = refTime() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function isOverdue(slaDueAt: string, status: IssueStatus) {
  return status !== "resolved" && new Date(slaDueAt).getTime() < refTime();
}

export function formatDate(iso: string | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export const STATUS_LABEL: Record<IssueStatus, string> = {
  reported: "Reported",
  ai_analyzed: "AI Analyzed",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolution_submitted: "Resolution Submitted",
  ai_verification: "AI Verification",
  awaiting_citizen: "Awaiting Your Confirmation",
  resolved: "Resolved",
  reopened: "Reopened",
};

export const STATUS_SHORT: Record<IssueStatus, string> = {
  ...STATUS_LABEL,
  awaiting_citizen: "Awaiting Citizen",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  road: "Road",
  sanitation: "Sanitation",
  lighting: "Lighting",
  water: "Water",
  drainage: "Drainage",
};

export const RISK_LABEL: Record<SafetyRisk, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function compact(n: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

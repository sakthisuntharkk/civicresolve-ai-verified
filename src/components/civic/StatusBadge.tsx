import { cn } from "@/lib/utils";
import { STATUS_SHORT } from "@/lib/format";
import type { IssueStatus } from "@/types";
import { CheckCircle2, RotateCcw, Sparkles, UserCheck } from "lucide-react";

const STYLES: Record<IssueStatus, string> = {
  reported: "bg-muted text-muted-foreground border-border",
  ai_analyzed: "bg-ai-soft text-ai border-ai/20",
  assigned: "bg-info/10 text-info border-info/25",
  in_progress: "bg-primary/10 text-primary border-primary/25",
  resolution_submitted: "bg-warning/20 text-warning-foreground border-warning/40",
  ai_verification: "bg-ai-soft text-ai border-ai/30",
  awaiting_citizen: "bg-warning/25 text-warning-foreground border-warning/50",
  resolved: "bg-success/12 text-success border-success/30",
  reopened: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({
  status,
  className,
  size = "sm",
}: {
  status: IssueStatus;
  className?: string;
  size?: "sm" | "md";
}) {
  const Icon =
    status === "resolved"
      ? CheckCircle2
      : status === "reopened"
        ? RotateCcw
        : status === "awaiting_citizen"
          ? UserCheck
          : status === "ai_verification" || status === "ai_analyzed"
            ? Sparkles
            : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold tracking-tight",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        STYLES[status],
        className,
      )}
    >
      {status === "in_progress" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
      )}
      {Icon && <Icon className="h-3 w-3" />}
      {STATUS_SHORT[status]}
    </span>
  );
}

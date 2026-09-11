import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { Issue } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { CategoryIcon } from "./CategoryIcon";
import { Progress } from "@/components/ui/progress";
import { timeAgo } from "@/lib/format";
import { ArrowUpRight, Copy, MapPin } from "lucide-react";
import { WARDS } from "@/services/mockData";

export function IssueCard({ issue, className }: { issue: Issue; className?: string }) {
  const ward = WARDS.find((w) => w.id === issue.location.wardId);
  const needsAction = issue.status === "awaiting_citizen" || issue.status === "reopened";
  return (
    <Link
      to="/issues/$issueId"
      params={{ issueId: issue.id }}
      className={cn(
        "group relative block rounded-xl border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float",
        needsAction && "border-warning/60",
        className,
      )}
    >
      {needsAction && (
        <span className="absolute -top-2 left-4 rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning-foreground">
          Action needed
        </span>
      )}
      <div className="flex gap-4">
        <img
          src={issue.beforePhoto}
          alt=""
          className="hidden h-20 w-24 shrink-0 rounded-lg object-cover sm:block"
          width={1024}
          height={768}
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <CategoryIcon category={issue.category} className="text-muted-foreground" />
              <span className="font-mono text-[11px] text-muted-foreground">{issue.id}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-[11px] text-muted-foreground">{timeAgo(issue.reportedAt)}</span>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
          <h3 className="mt-1 line-clamp-1 font-sans text-[15px] font-bold leading-snug">{issue.title}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {issue.location.address} · {ward?.name}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
            {issue.duplicateCount > 1 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Copy className="h-3 w-3" /> {issue.duplicateCount} reports
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={issue.progress} className="h-1.5 flex-1 bg-muted" />
            <span className="text-[11px] font-semibold text-muted-foreground tabular">{issue.progress}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

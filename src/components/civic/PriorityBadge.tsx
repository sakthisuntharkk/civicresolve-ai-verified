import { cn } from "@/lib/utils";
import { PRIORITY_LABEL } from "@/lib/format";
import type { Priority } from "@/types";

export const PRIORITY_DOT: Record<Priority, string> = {
  critical: "bg-priority-critical",
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
};

const STYLES: Record<Priority, string> = {
  critical: "bg-priority-critical/10 text-priority-critical border-priority-critical/30",
  high: "bg-priority-high/12 text-priority-high border-priority-high/30",
  medium: "bg-priority-medium/25 text-warning-foreground border-priority-medium/50",
  low: "bg-priority-low/12 text-muted-foreground border-priority-low/30",
};

export function PriorityBadge({
  priority,
  className,
  showDot = true,
}: {
  priority: Priority;
  className?: string;
  showDot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        STYLES[priority],
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[priority])} />}
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

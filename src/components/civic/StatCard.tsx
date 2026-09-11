import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
  active,
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "critical" | "warning" | "success" | "ai";
  className?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const accent = {
    default: "text-muted-foreground",
    primary: "text-primary",
    critical: "text-priority-critical",
    warning: "text-priority-high",
    success: "text-success",
    ai: "text-ai",
  }[tone];
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border bg-card p-4 text-left shadow-card transition-all",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-float",
        active && "ring-2 ring-primary/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        {Icon && <Icon className={cn("h-4 w-4", accent)} />}
      </div>
      <p className={cn("mt-3 font-display text-3xl font-semibold leading-none tabular", tone !== "default" && accent)}>
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </Comp>
  );
}

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AIInsightCard({
  title,
  children,
  className,
  tone = "ai",
  eyebrow = "AI insight",
  footer,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  tone?: "ai" | "positive" | "warning" | "neutral";
  eyebrow?: string;
  footer?: ReactNode;
}) {
  const toneStyles = {
    ai: "border-ai/25 bg-ai-soft/60",
    positive: "border-success/25 bg-success/8",
    warning: "border-warning/50 bg-warning/12",
    neutral: "border-border bg-card",
  }[tone];
  const iconStyles = {
    ai: "bg-ai text-ai-foreground",
    positive: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    neutral: "bg-secondary text-secondary-foreground",
  }[tone];

  return (
    <div className={cn("relative overflow-hidden rounded-xl border p-4", toneStyles, className)}>
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md", iconStyles)}>
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
          {title && <h4 className="mt-0.5 font-sans text-sm font-bold text-foreground">{title}</h4>}
          <div className="mt-1.5 text-sm leading-relaxed text-foreground/85">{children}</div>
          {footer && <div className="mt-3">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

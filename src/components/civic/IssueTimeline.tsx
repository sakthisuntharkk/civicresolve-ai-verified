import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { TimelineEvent } from "@/types";
import { Bot, Building2, Check, User, X, Zap } from "lucide-react";

const ACTOR_ICON = { citizen: User, ai: Bot, authority: Building2, system: Zap } as const;

export function IssueTimeline({
  events,
  orientation = "vertical",
  className,
}: {
  events: TimelineEvent[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}) {
  if (orientation === "horizontal") {
    return (
      <ol className={cn("grid grid-cols-4 gap-2 md:grid-cols-8", className)}>
        {events.map((e, i) => (
          <li key={e.id} className="relative flex flex-col items-center text-center">
            {i < events.length - 1 && (
              <span
                className={cn(
                  "absolute left-1/2 top-3.5 hidden h-px w-full md:block",
                  e.state === "done" ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <Node state={e.state} actor={e.actor} />
            <p className="mt-2 text-[11px] font-semibold leading-tight">{e.label}</p>
            {e.timestamp && <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(e.timestamp)}</p>}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                className={cn(
                  "absolute left-3.5 top-7 h-[calc(100%-0.75rem)] w-px",
                  e.state === "done" ? "bg-primary/60" : "border-l border-dashed border-border",
                )}
              />
            )}
            <Node state={e.state} actor={e.actor} />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    e.state === "pending" && "text-muted-foreground",
                    e.state === "failed" && "text-destructive",
                  )}
                >
                  {e.label}
                  {e.state === "active" && (
                    <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Current
                    </span>
                  )}
                </p>
                {e.timestamp && (
                  <time className="text-xs text-muted-foreground tabular">{formatDate(e.timestamp)}</time>
                )}
              </div>
              {e.description && (
                <p className={cn("mt-0.5 text-xs text-muted-foreground", e.state === "failed" && "text-destructive/80")}>
                  {e.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Node({ state, actor }: { state: TimelineEvent["state"]; actor: TimelineEvent["actor"] }) {
  const Icon = ACTOR_ICON[actor];
  return (
    <span
      className={cn(
        "relative z-10 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
        state === "done" && "border-primary bg-primary text-primary-foreground",
        state === "active" && "border-primary bg-background text-primary",
        state === "pending" && "border-border bg-background text-muted-foreground/50",
        state === "failed" && "border-destructive bg-destructive text-destructive-foreground",
      )}
    >
      {state === "active" && <span className="absolute inset-0 rounded-full bg-primary/40 animate-civic-pulse" />}
      {state === "done" ? (
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      ) : state === "failed" ? (
        <X className="h-3.5 w-3.5" strokeWidth={3} />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
    </span>
  );
}

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ConfidenceGauge({
  value,
  label,
  size = 160,
  className,
}: {
  value: number;
  label?: string;
  size?: number;
  className?: string;
}) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 50);
    return () => clearTimeout(t);
  }, [value]);

  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (animated / 100) * c;
  const tone = value >= 75 ? "text-success" : value >= 55 ? "text-warning" : "text-destructive";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-border" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(tone, "transition-[stroke-dashoffset] duration-1000 ease-out")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold leading-none tabular">{Math.round(animated)}%</span>
        {label && <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

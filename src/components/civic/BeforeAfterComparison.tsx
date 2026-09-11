import { cn } from "@/lib/utils";
import { useCallback, useRef, useState, type PointerEvent } from "react";

export function BeforeAfterComparison({
  before,
  after,
  beforeLabel = "Before · Citizen photo",
  afterLabel = "After · Crew photo",
  mode = "slider",
  scanning = false,
  className,
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  mode?: "slider" | "side-by-side";
  scanning?: boolean;
  className?: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(2, Math.min(98, pct)));
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    update(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) update(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  if (mode === "side-by-side") {
    return (
      <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
        <Frame src={before} label={beforeLabel} tone="before" scanning={scanning} />
        <Frame src={after} label={afterLabel} tone="after" scanning={scanning} />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative aspect-[4/3] w-full cursor-col-resize select-none overflow-hidden rounded-xl border bg-muted touch-none",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="slider"
      aria-label="Before and after comparison"
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <img src={after} alt="After" className="absolute inset-0 h-full w-full object-cover" width={1024} height={768} loading="lazy" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt="Before"
          className="absolute inset-0 h-full max-w-none object-cover"
          style={{ width: ref.current?.clientWidth ? `${ref.current.clientWidth}px` : "100%" }}
          width={1024}
          height={768}
          loading="lazy"
        />
      </div>
      <Label className="left-3">{beforeLabel}</Label>
      <Label className="right-3">{afterLabel}</Label>
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-background/90 shadow-[0_0_0_1px_oklch(0.2_0.03_210/0.25)]" />
        <div className="absolute top-1/2 -ml-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-float">
          <span className="text-[10px] font-bold text-foreground">⇔</span>
        </div>
      </div>
      {scanning && <ScanOverlay />}
    </div>
  );
}

function Frame({ src, label, tone, scanning }: { src: string; label: string; tone: "before" | "after"; scanning: boolean }) {
  return (
    <figure className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
      <img src={src} alt={label} className="h-full w-full object-cover" width={1024} height={768} loading="lazy" />
      <Label className={cn("left-3", tone === "after" && "bg-success text-success-foreground")}>{label}</Label>
      {scanning && <ScanOverlay />}
    </figure>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <figcaption
      className={cn(
        "absolute top-3 rounded-md bg-ink/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-foreground backdrop-blur",
        className,
      )}
    >
      {children}
    </figcaption>
  );
}

function ScanOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 h-16 animate-scan bg-gradient-to-b from-transparent via-ai/40 to-transparent" />
      <div className="absolute inset-0 grid-paper opacity-40" />
      <div className="absolute inset-3 rounded-lg border border-ai/60" />
      <span className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-ai" />
      <span className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-ai" />
      <span className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-ai" />
      <span className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-ai" />
    </div>
  );
}

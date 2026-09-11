import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Construction, Droplets, Lightbulb, Trash2, Waves } from "lucide-react";

const ICONS = {
  road: Construction,
  sanitation: Trash2,
  lighting: Lightbulb,
  water: Droplets,
  drainage: Waves,
} as const;

export function CategoryIcon({
  category,
  className,
  boxed = false,
}: {
  category: Category;
  className?: string;
  boxed?: boolean;
}) {
  const Icon = ICONS[category];
  if (!boxed) return <Icon className={cn("h-4 w-4", className)} />;
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

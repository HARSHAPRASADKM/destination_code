import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Easy: "border-easy/30 bg-easy/12 text-easy",
  Medium: "border-medium/30 bg-medium/12 text-medium",
  Hard: "border-hard/30 bg-hard/12 text-hard",
};

export function DifficultyBadge({ difficulty, className }: { difficulty: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[difficulty] ?? "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {difficulty}
    </span>
  );
}

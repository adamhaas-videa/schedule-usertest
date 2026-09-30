import { cn } from "@/lib/utils";

interface OperatoryHeaderProps {
  operatory: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Operatory column header. Deliberately just the chair number: the in-chair
 * patient is already named on their own card a few pixels below, and repeating
 * it here bought nothing while pushing a name into the one row of the board
 * that stays pinned while you scroll.
 */
export default function OperatoryHeader({
  operatory,
  className,
  onClick,
}: OperatoryHeaderProps) {
  const interactive = !!onClick;
  return (
    <div
      className={cn(
        "w-full h-12 px-3 flex items-center gap-4 text-left transition-colors",
        className
      )}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={!interactive}
        className={cn(
          "shrink-0 rounded-md -mx-1 px-1 py-0.5 transition-colors",
          interactive
            ? "cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            : "cursor-default"
        )}
        aria-label={interactive ? `Focus Operatory ${operatory}` : undefined}
      >
        <span className="text-[15px] font-semibold text-foreground">
          Op {operatory}
        </span>
      </button>
    </div>
  );
}

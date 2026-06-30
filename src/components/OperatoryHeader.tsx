import { cn } from "@/lib/utils";

interface OperatoryHeaderProps {
  operatory: number;
  occupied: boolean;
  activePatientName?: string;
  className?: string;
  onClick?: () => void;
  onPatientNameClick?: () => void;
}

export default function OperatoryHeader({
  operatory,
  occupied,
  activePatientName,
  className,
  onClick,
  onPatientNameClick,
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
      {occupied && activePatientName && (
        <button
          type="button"
          onClick={onPatientNameClick}
          disabled={!onPatientNameClick}
          aria-label={
            onPatientNameClick
              ? `Scroll to ${activePatientName}`
              : undefined
          }
          className={cn(
            "inline-flex items-center gap-1.5 h-[21px] px-2 py-1 rounded-full bg-card border border-border max-w-[60%] transition-colors",
            onPatientNameClick
              ? "cursor-pointer hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              : "cursor-default"
          )}
        >
          <span className="size-1.5 rounded-full bg-success shrink-0" />
          <span className="text-[11px] font-medium text-foreground truncate">
            {activePatientName}
          </span>
        </button>
      )}
    </div>
  );
}

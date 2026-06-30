import { cn } from "@/lib/utils";

interface OperatoryHeaderProps {
  operatory: number;
  occupied: boolean;
  activePatientName?: string;
  className?: string;
  onClick?: () => void;
}

export default function OperatoryHeader({
  operatory,
  occupied,
  activePatientName,
  className,
  onClick,
}: OperatoryHeaderProps) {
  const interactive = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={cn(
        "w-full h-12 px-3 flex items-center gap-4 text-left transition-colors",
        interactive
          ? "cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          : "cursor-default",
        className
      )}
      aria-label={interactive ? `Focus Operatory ${operatory}` : undefined}
    >
      <span className="text-[15px] font-semibold text-foreground shrink-0">
        Op {operatory}
      </span>
      {occupied && activePatientName && (
        <span className="inline-flex items-center gap-1.5 h-[21px] px-2 py-1 rounded-full bg-card border border-border max-w-[60%]">
          <span className="size-1.5 rounded-full bg-success shrink-0" />
          <span className="text-[11px] font-medium text-foreground truncate">
            {activePatientName}
          </span>
        </span>
      )}
    </button>
  );
}

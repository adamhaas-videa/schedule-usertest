import { cn } from "@/lib/utils";

interface OperatoryHeaderProps {
  operatory: number;
  occupied: boolean;
  activePatientName?: string;
  className?: string;
}

export default function OperatoryHeader({
  operatory,
  occupied,
  activePatientName,
  className,
}: OperatoryHeaderProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 flex items-center justify-between bg-[#E8F0F4]",
        className
      )}
    >
      <span className="text-[13px] font-bold text-deep-teal tracking-wide">
        Op {operatory}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full max-w-[60%] truncate",
          occupied
            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
            : "bg-white/70 text-gray-500 ring-1 ring-gray-200"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            occupied ? "bg-emerald-500" : "bg-gray-400"
          )}
        />
        <span className="truncate">
          {occupied && activePatientName ? activePatientName : occupied ? "Occupied" : "Available"}
        </span>
      </span>
    </div>
  );
}

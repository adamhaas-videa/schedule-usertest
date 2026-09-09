import { cn } from "@/lib/utils";

interface StripArrowProps {
  direction: -1 | 1;
  label: string;
  onClick: () => void;
}

/** Scrolls a footer thumbnail strip that has run past its width. Shared by the
 *  FMX and single-image footers so both strips page from the same control in the
 *  same place — flanking the strip. */
export default function StripArrow({
  direction,
  label,
  onClick,
}: StripArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
    >
      <i
        className={cn(
          "text-base leading-none",
          direction < 0 ? "fa-regular fa-angle-left" : "fa-regular fa-angle-right"
        )}
        aria-hidden
      />
    </button>
  );
}

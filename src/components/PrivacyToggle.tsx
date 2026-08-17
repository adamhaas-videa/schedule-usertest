import { cn } from "@/lib/utils";

interface PrivacyToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function PrivacyToggle({ enabled, onToggle }: PrivacyToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="Privacy mode"
      onClick={() => onToggle(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-[52px] shrink-0 items-center rounded-full transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        enabled ? "bg-primary" : "bg-zinc-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 flex items-center",
          enabled ? "left-0 pl-2 text-primary-foreground" : "right-0 pr-2 text-muted-foreground"
        )}
      >
        <i
          className={cn(
            "text-[10px]",
            enabled ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
          )}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "pointer-events-none absolute inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          enabled ? "translate-x-[28px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

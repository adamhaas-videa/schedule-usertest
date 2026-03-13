import { cn } from "@/lib/utils";

interface PrivacyToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function PrivacyToggle({ enabled, onToggle }: PrivacyToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label="Privacy mode"
      onClick={() => onToggle(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-[52px] shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
        enabled ? "bg-primary" : "bg-input"
      )}
    >
      <span
        className={cn(
          "pointer-events-none flex items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-200",
          "h-5 w-5",
          enabled ? "translate-x-[28px]" : "translate-x-0.5"
        )}
      >
        <i
          className={cn(
            "text-[9px] transition-colors",
            enabled ? "fa-solid fa-eye-slash text-primary" : "fa-solid fa-eye text-muted-foreground"
          )}
        />
      </span>
    </button>
  );
}

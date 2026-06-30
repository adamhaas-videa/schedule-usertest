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
        enabled ? "bg-deep-teal" : "bg-input"
      )}
    >
      <span
        className={cn(
          "pointer-events-none flex items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-200",
          "h-5 w-5",
          enabled ? "translate-x-[28px]" : "translate-x-0.5"
        )}
      >
        {enabled ? (
          <EyeSlashIcon className="h-2.5 w-2.5 text-primary" />
        ) : (
          <EyeIcon className="h-2.5 w-2.5 text-muted-foreground" />
        )}
      </span>
    </button>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeSlashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

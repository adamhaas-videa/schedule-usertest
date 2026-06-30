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
        enabled ? "bg-deep-teal" : "bg-zinc-200"
      )}
    >
      {/* Eye glyph sits in the track, opposite the knob */}
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 flex items-center",
          enabled ? "left-0 pl-2 text-primary-foreground" : "right-0 pr-2 text-zinc-500"
        )}
      >
        {enabled ? (
          <EyeSlashIcon className="h-3 w-3" />
        ) : (
          <EyeIcon className="h-3 w-3" />
        )}
      </span>

      {/* Knob */}
      <span
        className={cn(
          "pointer-events-none absolute inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          enabled ? "translate-x-[28px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeSlashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M10.7 5.1A10.7 10.7 0 0 1 22 12a10.8 10.8 0 0 1-1.4 2.5" />
      <path d="M14.1 14.2a3 3 0 0 1-4.2-4.2" />
      <path d="M17.5 17.5A10.8 10.8 0 0 1 2 12a10.8 10.8 0 0 1 4.4-5.1" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

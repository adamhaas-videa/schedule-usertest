export default function L1Header() {
  return (
    <header className="h-14 shrink-0 bg-card border-b border-border flex items-center gap-4 px-4 overflow-hidden">
      <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
        Schedule
      </h1>

      <div className="flex-1 min-w-0" />

      <button
        type="button"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary-hover transition-colors"
      >
        <i className="fa-regular fa-microphone text-base" aria-hidden />
        Start Recording
      </button>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <i className="fa-regular fa-bell text-base" aria-hidden />
        </button>
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Help"
          title="Help"
        >
          <i className="fa-regular fa-book-open w-4 h-4" aria-hidden />
        </button>
      </div>

      <div
        className="w-9 h-9 rounded-full bg-periwinkle flex items-center justify-center overflow-hidden shrink-0"
        aria-label="Account"
      >
        <span className="text-sm font-semibold text-deep-teal-800 leading-none">
          AH
        </span>
      </div>
    </header>
  );
}

import DemoMenu from "@/components/DemoMenu";

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

      <DemoMenu />
    </header>
  );
}

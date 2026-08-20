import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAiView } from "@/context/AiViewContext";
import { CARD_VERSIONS, type CardVersion } from "@/lib/cardVersions";
import { NAV_VERSIONS, type NavVersion } from "@/lib/navVersions";
import { SUMMARY_VERSIONS, type SummaryVersion } from "@/lib/summaryVersions";
import { cn } from "@/lib/utils";

interface VersionOption<T extends number> {
  id: T;
  label: string;
  title: string;
  description: string;
}

function VersionSection<T extends number>({
  heading,
  description,
  options,
  value,
  onChange,
}: {
  heading: string;
  description: string;
  options: readonly VersionOption<T>[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="px-1">
        <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label={heading}
        className="flex flex-col gap-0.5"
      >
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "w-full cursor-pointer text-left flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring/40",
                selected ? "bg-accent" : "hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded text-[11px] font-semibold tabular-nums shrink-0",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {option.label}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-[13px] font-medium leading-tight text-foreground">
                  {option.title}
                  {selected && (
                    <i
                      className="fa-solid fa-check text-primary text-[10px]"
                      aria-hidden
                    />
                  )}
                </span>
                <span className="text-[12px] leading-snug text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const PANEL_WIDTH = "!w-[360px] !max-w-[360px]";

export default function DemoMenu() {
  const [open, setOpen] = useState(false);
  const {
    cardVersion,
    setCardVersion,
    summaryVersion,
    setSummaryVersion,
    navVersion,
    setNavVersion,
  } = useAiView();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-label="Open demo menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Demo menu"
        onClick={() => setOpen(true)}
      >
        <i className="fa-regular fa-bars text-base" aria-hidden />
      </button>
      <SheetContent side="right" className={cn(PANEL_WIDTH, "gap-0 p-0")}>
        <SheetHeader className="shrink-0 border-b border-border p-4 pr-12">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <i
              className="fa-regular fa-flask text-muted-foreground text-sm"
              aria-hidden
            />
            Demo
          </SheetTitle>
          <SheetDescription>
            Prototype versions for this review. One choice per section.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
          <VersionSection
            heading="Patient card"
            description="Prototype interaction models — schedule only"
            options={CARD_VERSIONS}
            value={cardVersion}
            onChange={(id: CardVersion) => setCardVersion(id)}
          />
          <div className="h-px bg-border" />
          <VersionSection
            heading="Patient summary"
            description="Prototype chart tiers — summary slideout only"
            options={SUMMARY_VERSIONS}
            value={summaryVersion}
            onChange={(id: SummaryVersion) => setSummaryVersion(id)}
          />
          <div className="h-px bg-border" />
          <VersionSection
            heading="Sidebar navigation"
            description="Product-suite order and grouping — whole app"
            options={NAV_VERSIONS}
            value={navVersion}
            onChange={(id: NavVersion) => setNavVersion(id)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

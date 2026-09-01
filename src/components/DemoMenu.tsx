import { useRef, useState, type KeyboardEvent } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAiView } from "@/context/AiViewContext";
import {
  CARD_COLOR_MODES,
  CARD_VERSIONS,
  type CardColorMode,
  type CardVersion,
} from "@/lib/cardVersions";
import {
  NAV_FOOTER_MODES,
  NAV_VERSIONS,
  type NavFooterMode,
  type NavVersion,
} from "@/lib/navVersions";
import { SUMMARY_VERSIONS, type SummaryVersion } from "@/lib/summaryVersions";
import { cn } from "@/lib/utils";

interface VersionOption<T extends string | number> {
  id: T;
  label: string;
  title: string;
  description: string;
}

function VersionSection<T extends string | number>({
  heading,
  description,
  ariaLabel,
  options,
  value,
  onChange,
}: {
  heading?: string;
  description?: string;
  ariaLabel: string;
  options: readonly VersionOption<T>[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      {(heading || description) && (
        <div className="px-1">
          {heading && (
            <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div
        role="radiogroup"
        aria-label={ariaLabel}
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
                  // Fixed width so every group's titles share one left edge.
                  "mt-0.5 inline-flex items-center justify-center h-5 w-7 rounded text-[11px] font-semibold tabular-nums shrink-0",
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

const PANEL_WIDTH = "!w-[420px] !max-w-[420px]";

type DemoTabId = "cards" | "color" | "summary" | "navigation";

const DEMO_TABS: { id: DemoTabId; label: string; description: string }[] = [
  {
    id: "cards",
    label: "Cards",
    description: "Prototype interaction models — schedule only",
  },
  {
    id: "color",
    label: "Color",
    description: "Header fill and outline on Summary actions cards",
  },
  {
    id: "summary",
    label: "Package",
    description: "Prototype chart tiers — summary slideout only",
  },
  {
    id: "navigation",
    label: "Navigation",
    description: "Product-suite order and grouping — whole app",
  },
];

export default function DemoMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<DemoTabId>("cards");
  const tabRefs = useRef<Partial<Record<DemoTabId, HTMLButtonElement | null>>>(
    {}
  );
  const activeTab = DEMO_TABS.find((t) => t.id === tab) ?? DEMO_TABS[0];
  const {
    cardVersion,
    setCardVersion,
    cardColorMode,
    setCardColorMode,
    summaryVersion,
    setSummaryVersion,
    navVersion,
    setNavVersion,
    navFooterMode,
    setNavFooterMode,
  } = useAiView();

  // Roving tabindex: arrows move both selection and focus across the tab strip.
  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = DEMO_TABS.findIndex((t) => t.id === tab);
    const last = DEMO_TABS.length - 1;
    let next = -1;
    if (event.key === "ArrowRight") next = current === last ? 0 : current + 1;
    else if (event.key === "ArrowLeft") next = current === 0 ? last : current - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next < 0) return;
    event.preventDefault();
    const id = DEMO_TABS[next].id;
    setTab(id);
    tabRefs.current[id]?.focus();
  }

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
        <div className="shrink-0 border-b border-border px-4 py-3">
          <div
            role="tablist"
            aria-label="Demo sections"
            onKeyDown={handleTabKeyDown}
            className="flex items-center gap-1 rounded-lg bg-muted p-1"
          >
            {DEMO_TABS.map((item) => {
              const selected = item.id === tab;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[item.id] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`demo-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`demo-panel-${item.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex-1 cursor-pointer rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring/40",
                    selected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div
          role="tabpanel"
          id={`demo-panel-${tab}`}
          aria-labelledby={`demo-tab-${tab}`}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
        >
          <p className="px-1 text-xs leading-snug text-muted-foreground">
            {activeTab.description}
          </p>
          {tab === "cards" && (
            <VersionSection
              ariaLabel="Patient card"
              options={CARD_VERSIONS}
              value={cardVersion}
              onChange={(id: CardVersion) => setCardVersion(id)}
            />
          )}
          {tab === "color" && (
            <VersionSection
              ariaLabel="Card color"
              options={CARD_COLOR_MODES}
              value={cardColorMode}
              onChange={(id: CardColorMode) => setCardColorMode(id)}
            />
          )}
          {tab === "summary" && (
            <VersionSection
              ariaLabel="Patient summary"
              options={SUMMARY_VERSIONS}
              value={summaryVersion}
              onChange={(id: SummaryVersion) => setSummaryVersion(id)}
            />
          )}
          {tab === "navigation" && (
            <>
              <VersionSection
                ariaLabel="Sidebar navigation"
                options={NAV_VERSIONS}
                value={navVersion}
                onChange={(id: NavVersion) => setNavVersion(id)}
              />
              <div className="h-px bg-border" />
              <VersionSection
                heading="Footer"
                description="Help, Learning Center, and Settings — independent of the order above"
                ariaLabel="Sidebar footer"
                options={NAV_FOOTER_MODES}
                value={navFooterMode}
                onChange={(id: NavFooterMode) => setNavFooterMode(id)}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

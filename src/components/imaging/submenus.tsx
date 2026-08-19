import { useState } from "react";
import { cn } from "@/lib/utils";
import VoicePerioIcon from "@/components/icons/VoicePerioIcon";

function MenuHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 px-2 pb-1.5 mb-1 border-b border-white/10">
      <i className={cn(icon, "text-xs text-zinc-400")} aria-hidden />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </span>
    </div>
  );
}

interface FindingType {
  key: string;
  label: string;
  color?: string;
  icon?: "perio" | "anatomy";
}

const FINDING_TYPES: FindingType[] = [
  { key: "restorative", label: "Restorative", color: "#DD174C" },
  { key: "incipient", label: "Incipient", color: "#D4A700" },
  { key: "periodontal", label: "Periodontal", icon: "perio" },
  { key: "endodontic", label: "Endodontic", color: "#992D5B" },
  { key: "anatomy", label: "Tooth Anatomy", icon: "anatomy" },
];

/** Elements submenu — toggle which AI finding types are displayed. */
export function FindingTypesMenu() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    restorative: true,
    incipient: true,
    periodontal: true,
    endodontic: true,
    anatomy: false,
  });

  return (
    <div className="w-[188px]">
      <MenuHeader icon="fa-regular fa-shapes" label="Elements" />
      <div className="flex flex-col">
        {FINDING_TYPES.map((f) => {
          const on = enabled[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setEnabled((p) => ({ ...p, [f.key]: !p[f.key] }))}
              className={cn(
                "flex items-center gap-2.5 h-8 px-2 rounded-md text-left transition-colors cursor-pointer",
                on ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <span className="flex items-center justify-center size-4 shrink-0">
                {f.icon === "perio" ? (
                  <VoicePerioIcon className="size-4 text-emerald-400" />
                ) : f.icon === "anatomy" ? (
                  <i className="fa-regular fa-tooth text-sky-300 text-sm" aria-hidden />
                ) : (
                  <span
                    className="size-3.5 rounded-[3px]"
                    style={{ backgroundColor: f.color }}
                  />
                )}
              </span>
              <span className="flex-1 text-[13px] font-medium">{f.label}</span>
              <i
                className={cn(
                  "text-xs",
                  on ? "fa-solid fa-eye text-zinc-300" : "fa-solid fa-eye-slash text-zinc-600"
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const THRESHOLDS = [
  { key: "all", label: "Show All", bars: 4 },
  { key: "more", label: "More", bars: 3 },
  { key: "balanced", label: "Balanced", bars: 2 },
  { key: "less", label: "Less", bars: 1 },
];

/** Threshold submenu — AI display sensitivity (single-select). */
export function DisplayThresholdMenu() {
  const [value, setValue] = useState("balanced");
  return (
    <div className="w-[188px]">
      <MenuHeader icon="fa-regular fa-sliders-simple" label="Display Threshold" />
      <div className="flex flex-col">
        {THRESHOLDS.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setValue(t.key)}
              className={cn(
                "flex items-center gap-2.5 h-8 px-2 rounded-md text-left transition-colors cursor-pointer",
                active ? "bg-[#4A5161] text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span className="flex items-end gap-0.5 h-3.5 w-4 shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex-1 rounded-[1px]",
                      i < t.bars ? "bg-deep-teal-300" : "bg-zinc-600"
                    )}
                    style={{ height: `${40 + i * 20}%` }}
                  />
                ))}
              </span>
              <span className="flex-1 text-[13px] font-medium">{t.label}</span>
              {active && (
                <i className="fa-solid fa-check text-xs text-deep-teal-300" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SimpleAction {
  key: string;
  label: string;
  icon: string;
  shortcut?: string;
}

const QUALITY_ACTIONS: SimpleAction[] = [
  { key: "hd1", label: "HD Enhance", icon: "fa-regular fa-wand-magic-sparkles" },
  { key: "hd2", label: "HD Enhance +", icon: "fa-regular fa-wand-magic-sparkles" },
  { key: "quality-findings", label: "Image Quality Findings", icon: "fa-regular fa-image" },
];

/** Quality submenu (single-image view). */
export function QualityMenu() {
  const [active, setActive] = useState<string | null>("hd1");
  return (
    <div className="w-[196px]">
      <MenuHeader icon="fa-regular fa-gem" label="Quality" />
      <div className="flex flex-col">
        {QUALITY_ACTIONS.map((a) => {
          const on = active === a.key;
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => setActive(on ? null : a.key)}
              className={cn(
                "flex items-center gap-2.5 h-8 px-2 rounded-md text-left transition-colors cursor-pointer",
                on ? "bg-[#4A5161] text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <i className={cn(a.icon, "text-sm w-4 text-center")} aria-hidden />
              <span className="flex-1 text-[13px] font-medium">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const TOOLS_ACTIONS: SimpleAction[] = [
  { key: "reset", label: "Reset settings", icon: "fa-regular fa-clock-rotate-left", shortcut: "D" },
  { key: "brightness", label: "Brightness", icon: "fa-regular fa-sun-bright" },
  { key: "contrast", label: "Contrast", icon: "fa-regular fa-circle-half-stroke" },
  { key: "invert", label: "Invert colors", icon: "fa-regular fa-droplet-slash", shortcut: "I" },
  { key: "magnify", label: "Magnify", icon: "fa-regular fa-magnifying-glass", shortcut: "M" },
  { key: "rotate", label: "Rotate", icon: "fa-regular fa-arrow-rotate-right", shortcut: "." },
  { key: "mirror", label: "Mirror", icon: "fa-regular fa-reflect-horizontal" },
  { key: "fullscreen", label: "Full screen", icon: "fa-regular fa-expand" },
];

/** Tools submenu (single-image view). */
export function ToolsMenu() {
  return (
    <div className="w-[204px]">
      <MenuHeader icon="fa-regular fa-sliders" label="Tools" />
      <div className="flex flex-col">
        {TOOLS_ACTIONS.map((a) => (
          <button
            key={a.key}
            type="button"
            className="flex items-center gap-2.5 h-8 px-2 rounded-md text-left text-zinc-300 hover:bg-[#4A5161] transition-colors cursor-pointer"
          >
            <i className={cn(a.icon, "text-sm w-4 text-center")} aria-hidden />
            <span className="flex-1 text-[13px] font-medium">{a.label}</span>
            {a.shortcut && (
              <span className="text-[10px] font-semibold text-zinc-500 border border-zinc-600 rounded px-1">
                {a.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

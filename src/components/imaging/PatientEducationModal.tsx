import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface PatientEducationModalProps {
  open: boolean;
  onClose: () => void;
}

type Cohort = "adult" | "pediatric";

interface Treatment {
  key: string;
  label: string;
  src: string;
  isVideo?: boolean;
}

const ADULT: Treatment[] = [
  { key: "filling", label: "Filling", src: "/assets/patientEducation/filling-en.png" },
  { key: "rootCanal", label: "Root Canal", src: "/assets/patientEducation/rootCanal-en.png" },
  { key: "crown", label: "Crown", src: "/assets/patientEducation/crown-en.png" },
  { key: "implant", label: "Implant", src: "/assets/patientEducation/implant-en.png" },
  { key: "aligner", label: "Aligner", src: "/assets/patientEducation/aligner-en.png" },
  { key: "bridge", label: "Bridge", src: "/assets/patientEducation/bridge-en.mp4", isVideo: true },
  { key: "perio", label: "Perio (SRP)", src: "/assets/patientEducation/perio-en.png" },
  { key: "perio-maintenance", label: "Perio Maintenance", src: "/assets/patientEducation/perio-maintenance-en.png" },
];

const PEDIATRIC: Treatment[] = [
  { key: "filling", label: "Filling", src: "/assets/patientEducation/filling-en.png" },
  { key: "crown", label: "Stainless Crown", src: "/assets/patientEducation/crown-en.png" },
];

/** Patient Education modal (dark) — treatment list + illustration/video,
 *  adapted from the videa-ai-ui patient education dialog. */
export default function PatientEducationModal({
  open,
  onClose,
}: PatientEducationModalProps) {
  const [cohort, setCohort] = useState<Cohort>("adult");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("filling");

  const treatments = cohort === "adult" ? ADULT : PEDIATRIC;
  const filtered = useMemo(
    () =>
      treatments.filter((t) =>
        t.label.toLowerCase().includes(query.toLowerCase())
      ),
    [treatments, query]
  );
  const current =
    treatments.find((t) => t.key === selected) ?? treatments[0];

  if (!open) return null;

  return (
    <div
      className="dark fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1024px] rounded-xl bg-background text-foreground border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Patient Education</h2>
            <p className="text-sm text-muted-foreground">
              Select a treatment to present visual aids that support patient
              understanding.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <i className="fa-regular fa-xmark text-lg" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="flex gap-4 p-4 h-[516px]">
          {/* Sidebar */}
          <div className="flex flex-col gap-2.5 w-[260px] shrink-0 rounded-md bg-background p-2.5">
            <div className="inline-flex items-center gap-1 rounded-md bg-muted p-1">
              {(["adult", "pediatric"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCohort(c);
                    setQuery("");
                  }}
                  className={cn(
                    "flex-1 h-8 rounded-[6px] text-sm font-medium capitalize transition-colors cursor-pointer",
                    cohort === c
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative">
              <i
                className="fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                aria-hidden
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search list"
                className="h-9 w-full rounded-md bg-muted border border-border pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
              />
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-1">
              {filtered.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setSelected(t.key)}
                  className={cn(
                    "h-9 px-3 rounded-md text-left text-sm font-medium transition-colors cursor-pointer",
                    selected === t.key
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media — deliberately near-black letterbox backdrop for the asset */}
          <div className="flex-1 min-w-0 flex items-center justify-center rounded-md bg-zinc-950">
            {current?.isVideo ? (
              <video
                key={current.key}
                src={current.src}
                autoPlay
                loop
                muted
                playsInline
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                key={current?.key}
                src={current?.src}
                alt={current?.label}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  FINDINGS,
  StatusDot,
  TREATMENTS,
  VideaLogoHorizontal,
  VideaLogoStacked,
  type Finding,
  type TreatmentExplainer,
} from "./reportContent";

interface PaperPreviewProps {
  savedToothCount: number;
  clinicalNote: string;
}

function FindingCard({ finding }: { finding: Finding }) {
  const boneTone = finding.bone === "Healthy" ? "good" : "warn";
  const damageTone = finding.damage >= 50 ? "warn" : "good";

  return (
    <div className="flex flex-col gap-[6px]">
      <img
        alt=""
        src={finding.image}
        className="aspect-[5/3] w-full rounded-[3px] object-cover"
      />
      <div className="flex flex-col gap-[2px]">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] font-semibold leading-[13px] text-[#18181b]">
            Tooth {finding.toothNumber}
          </p>
          <p className="text-[10px] font-medium leading-[12px] text-[#18181b]">
            {finding.treatment}
          </p>
        </div>
        <p className="truncate text-[8.5px] font-normal leading-[11px] text-[#71717a]">
          {finding.location}
        </p>
        <div className="mt-[2px] flex flex-wrap items-center gap-x-[8px] gap-y-[1px]">
          <span className="inline-flex items-center gap-[3px]">
            <StatusDot tone={boneTone} />
            <span className="text-[8px] font-medium leading-[10px] text-[#3f3f46]">
              Bone: {finding.bone}
            </span>
          </span>
          <span className="inline-flex items-center gap-[3px]">
            <StatusDot tone={damageTone} />
            <span className="text-[8px] font-medium leading-[10px] text-[#3f3f46]">
              Damage: {finding.damage}%
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function TreatmentDiagramPlaceholder({ name }: { name: string }) {
  return (
    <div
      className="flex aspect-[3/2] w-full flex-col items-center justify-center rounded-[4px] border border-[#e2e8f0] bg-[#f1f5f9] text-[#18181b]"
      role="img"
      aria-label={`${name} patient education diagram`}
    >
      <p className="text-[6.5px] font-medium uppercase tracking-[0.08em] text-[#94a3b8]">
        Patient Education Diagram
      </p>
      <p className="mt-[2px] text-[13px] font-bold leading-tight">{name}</p>
    </div>
  );
}

function TreatmentCard({ treatment }: { treatment: TreatmentExplainer }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <TreatmentDiagramPlaceholder name={treatment.name} />
      <div className="flex flex-col gap-[1px]">
        <p className="text-[11px] font-semibold leading-[13px] text-[#18181b]">
          {treatment.name}
        </p>
        <p className="text-[7px] font-medium uppercase tracking-[0.06em] text-[#71717a]">
          Applied to {treatment.appliedTo}
        </p>
      </div>
      <p className="text-[8.5px] font-normal leading-[12px] text-[#27272a]">
        {treatment.description}
      </p>
    </div>
  );
}

function EmptyPaperState() {
  return (
    <div className="flex flex-col items-center gap-[8px] rounded-[6px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-[16px] py-[24px] text-center">
      <i className="fa-solid fa-teeth text-[22px] leading-none text-[#94a3b8]" aria-hidden />
      <p className="text-[11px] font-semibold leading-[14px] text-[#18181b]">
        No findings added yet
      </p>
      <p className="text-[9px] font-normal leading-[12px] text-[#52525b]">
        Select a tooth in the chart and add it to the report. Your patient will
        see their findings and treatment plan here.
      </p>
    </div>
  );
}

export function PaperPreview({
  savedToothCount,
  clinicalNote,
}: PaperPreviewProps) {
  const hasFindings = savedToothCount > 0;
  const trimmedNote = clinicalNote.trim();
  const hasNote = trimmedNote.length > 0;

  return (
    <div
      className="w-full rounded-[2px] bg-white text-[#18181b] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.55),0_2px_6px_-2px_rgba(0,0,0,0.35)]"
      style={{ aspectRatio: hasFindings ? undefined : "8.5 / 11" }}
      role="region"
      aria-label="Patient report printable preview"
    >
      <div className="flex flex-col gap-[16px] px-[20px] py-[22px]">
        <div className="flex flex-col gap-[10px]">
          <p className="text-[13px] font-semibold leading-[16px] text-[#061e3e]">
            Downtown Dental
          </p>

          <VideaLogoHorizontal height={22} />

          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold leading-[18px]">
              Patient Report
            </p>
            <p className="text-[10px] font-normal leading-[12px] text-[#27272a]">
              May 6, 2026
            </p>
          </div>
        </div>

        {hasNote && (
          <div className="flex flex-col gap-[4px]">
            <p className="text-[10.5px] font-semibold leading-[13px]">
              Clinician Note
            </p>
            <p className="whitespace-pre-wrap text-[9px] font-normal leading-[13px] text-[#27272a]">
              {trimmedNote}
            </p>
          </div>
        )}

        {hasFindings ? (
          <>
            <section className="flex flex-col gap-[8px] rounded-[6px] border border-[#e2e8f0] bg-white">
              <header className="flex h-[24px] items-center justify-between rounded-t-[6px] border-b border-[#e2e8f0] bg-[#f8fafc] px-[10px]">
                <p className="text-[10px] font-semibold leading-[12px] text-[#18181b]">
                  Findings By Tooth
                </p>
                <p className="text-[8.5px] font-medium leading-[10px] text-[#475569]">
                  {FINDINGS.length} teeth
                </p>
              </header>
              <div className="grid grid-cols-3 gap-x-[10px] gap-y-[12px] px-[10px] pb-[10px]">
                {FINDINGS.map((finding, index) => (
                  <FindingCard
                    key={`${finding.toothNumber}-${index}`}
                    finding={finding}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-[8px] rounded-[6px] border border-[#e2e8f0] bg-white">
              <header className="flex h-[24px] items-center justify-between rounded-t-[6px] border-b border-[#e2e8f0] bg-[#f8fafc] px-[10px]">
                <p className="text-[10px] font-semibold leading-[12px] text-[#18181b]">
                  What These Treatments Mean
                </p>
                <p className="text-[8.5px] font-medium leading-[10px] text-[#475569]">
                  {TREATMENTS.length} unique
                </p>
              </header>
              <div className="grid grid-cols-3 gap-x-[10px] gap-y-[12px] px-[10px] pb-[10px]">
                {TREATMENTS.map((treatment) => (
                  <TreatmentCard
                    key={treatment.name}
                    treatment={treatment}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <EmptyPaperState />
        )}

        <div className="mt-[4px] flex flex-col items-center gap-[4px] border-t border-[#e2e8f0] pt-[12px]">
          <VideaLogoStacked height={28} />
          <p className="text-[7.5px] font-normal leading-[10px] text-[#71717a]">
            © 2026 Videa. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

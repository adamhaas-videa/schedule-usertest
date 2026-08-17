import {
  FINDINGS,
  StatusDot,
  TREATMENTS,
  VideaLogoHorizontal,
  VideaLogoStacked,
  type Finding,
} from "./reportContent";

interface IPhonePreviewProps {
  savedToothCount: number;
  clinicalNote: string;
}

function StatusBar() {
  return (
    <div className="sticky top-0 z-10 flex h-[42px] shrink-0 items-center justify-between bg-white px-[18px] text-[#18181b]">
      <span className="text-[10px] font-semibold leading-none tabular-nums">
        9:41
      </span>
      <div className="flex items-center gap-[3px]">
        <svg width="11" height="8" viewBox="0 0 11 8" aria-hidden="true">
          <rect x="0" y="5" width="1.5" height="3" rx="0.5" fill="currentColor" />
          <rect x="2.5" y="3.5" width="1.5" height="4.5" rx="0.5" fill="currentColor" />
          <rect x="5" y="2" width="1.5" height="6" rx="0.5" fill="currentColor" />
          <rect x="7.5" y="0" width="1.5" height="8" rx="0.5" fill="currentColor" />
        </svg>
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none" aria-hidden="true">
          <path
            d="M5.5 7.2a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Zm0-3.6c1 0 1.95.4 2.65 1.05l.85-.85A5.6 5.6 0 0 0 5.5 2.5 5.6 5.6 0 0 0 2 3.8l.85.85A4.4 4.4 0 0 1 5.5 3.6Zm0-2.5a7 7 0 0 1 5 2.05l.85-.85a8.2 8.2 0 0 0-11.7 0l.85.85A7 7 0 0 1 5.5 1.1Z"
            fill="currentColor"
          />
        </svg>
        <svg width="18" height="8" viewBox="0 0 18 8" fill="none" aria-hidden="true">
          <rect x="0.5" y="0.5" width="14" height="7" rx="1.5" stroke="currentColor" fill="none" />
          <rect x="2" y="2" width="11" height="4" rx="0.5" fill="currentColor" />
          <rect x="15" y="2.5" width="1.5" height="3" rx="0.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const boneTone = finding.bone === "Healthy" ? "good" : "warn";
  const damageTone = finding.damage >= 50 ? "warn" : "good";

  return (
    <div className="flex items-start gap-[8px] py-[8px]">
      <img
        alt=""
        src={finding.image}
        className="h-[44px] w-[58px] shrink-0 rounded-[3px] object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[10px] font-semibold leading-[12px] text-[#18181b]">
            Tooth {finding.toothNumber}
          </p>
          <p className="text-[10px] font-medium leading-[12px] text-[#18181b]">
            {finding.treatment}
          </p>
        </div>
        <p className="truncate text-[8px] font-normal leading-[10px] text-[#71717a]">
          {finding.location}
        </p>
        <div className="mt-[2px] flex flex-wrap items-center gap-x-[8px] gap-y-[2px]">
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

function TreatmentDiagram({ name }: { name: string }) {
  return (
    <div
      className="flex h-[88px] w-full flex-col items-center justify-center rounded-[4px] bg-[#f1f5f9] text-[#18181b]"
      role="img"
      aria-label={`${name} patient education diagram`}
    >
      <p className="text-[6.5px] font-medium uppercase tracking-[0.08em] text-[#94a3b8]">
        Patient Education Diagram
      </p>
      <p className="mt-[2px] text-[14px] font-bold leading-tight">{name}</p>
    </div>
  );
}

function EmptyReportState() {
  return (
    <div className="flex flex-col items-center gap-[8px] rounded-[6px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-[12px] py-[20px] text-center">
      <i className="fa-solid fa-teeth text-[20px] leading-none text-[#94a3b8]" aria-hidden />
      <p className="text-[10px] font-semibold leading-[12px] text-[#18181b]">
        No findings added yet
      </p>
      <p className="text-[8px] font-normal leading-[12px] text-[#52525b]">
        Select a tooth in the chart and add it to the report. Your patient will
        see their findings and treatment plan here.
      </p>
    </div>
  );
}

function PatientReport({ savedToothCount, clinicalNote }: IPhonePreviewProps) {
  const hasFindings = savedToothCount > 0;
  const trimmedNote = clinicalNote.trim();
  const hasNote = trimmedNote.length > 0;

  return (
    <div className="flex w-full flex-col bg-white text-[#18181b]">
      <StatusBar />

      <div className="flex h-[36px] shrink-0 items-center border-b border-[#e2e8f0] bg-white px-[12px]">
        <p className="text-[12px] font-semibold leading-[16px] text-[#061e3e]">
          Downtown Dental
        </p>
      </div>

      <div className="flex flex-col gap-[14px] px-[12px] py-[14px]">
        <div className="flex flex-col gap-[8px]">
          <VideaLogoHorizontal height={18} />
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] font-semibold leading-[16px]">
              Patient Report
            </p>
            <p className="text-[9px] font-normal leading-[12px] text-[#27272a]">
              May 6, 2026
            </p>
          </div>
          <p className="text-[8px] font-normal leading-[11px] text-[#52525b]">
            Your dental practice has analyzed your x-rays with FDA-cleared AI
            algorithms from Videa. This is a copy of the findings for your
            records. These findings are not direct diagnoses.
          </p>
        </div>

        {hasNote && (
          <div className="flex flex-col gap-[4px]">
            <p className="text-[10px] font-semibold leading-[12px]">
              Clinician Note
            </p>
            <p className="whitespace-pre-wrap text-[8px] font-normal leading-[12px] text-[#27272a]">
              {trimmedNote}
            </p>
          </div>
        )}

        {hasFindings ? (
          <>

            <div className="overflow-hidden rounded-[6px] border border-[#e2e8f0] bg-white">
              <div className="flex h-[26px] items-center justify-between bg-[#e2e8f0] px-[10px]">
                <p className="text-[10px] font-semibold leading-[12px] text-[#18181b]">
                  Findings By Tooth
                </p>
                <p className="text-[8px] font-medium leading-[10px] text-[#475569]">
                  {FINDINGS.length} teeth
                </p>
              </div>
              <div className="flex flex-col divide-y divide-[#e2e8f0] px-[10px] py-[2px]">
                {FINDINGS.map((finding, index) => (
                  <FindingRow
                    key={`${finding.toothNumber}-${index}`}
                    finding={finding}
                  />
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[6px] border border-[#e2e8f0] bg-white">
              <div className="flex h-[26px] items-center justify-between bg-[#e2e8f0] px-[10px]">
                <p className="text-[10px] font-semibold leading-[12px] text-[#18181b]">
                  What These Treatments Mean
                </p>
                <p className="text-[8px] font-medium leading-[10px] text-[#475569]">
                  {TREATMENTS.length} unique
                </p>
              </div>
              <div className="flex flex-col divide-y divide-[#e2e8f0] px-[10px]">
                {TREATMENTS.map((treatment) => (
                  <div
                    key={treatment.name}
                    className="flex flex-col gap-[6px] py-[10px]"
                  >
                    <TreatmentDiagram name={treatment.name} />
                    <div className="flex flex-col gap-[1px]">
                      <p className="text-[11px] font-semibold leading-[14px]">
                        {treatment.name}
                      </p>
                      <p className="text-[7px] font-medium uppercase tracking-[0.06em] text-[#71717a]">
                        Applied to {treatment.appliedTo}
                      </p>
                    </div>
                    <p className="text-[8px] font-normal leading-[12px] text-[#27272a]">
                      {treatment.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-[2px] pt-[4px] text-center">
              <p className="text-[10px] font-semibold leading-[12px]">
                Ready to Book?
              </p>
              <p className="text-[8px] font-normal leading-[12px] text-[#27272a]">
                Schedule your next appointment:{" "}
                <span className="font-semibold text-[#0F4C81] underline">
                  Book Now
                </span>
              </p>
            </div>

            <div className="flex flex-col items-center gap-[6px] border-t border-[#e2e8f0] pt-[10px]">
              <p className="text-[9px] font-semibold leading-[12px]">
                Is this report helpful?
              </p>
              <div className="flex items-center gap-[8px]">
                <button
                  type="button"
                  aria-label="Yes, this report was helpful"
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[12px] hover:bg-[#f1f5f9]"
                >
                  <span aria-hidden="true">👍</span>
                </button>
                <button
                  type="button"
                  aria-label="No, this report was not helpful"
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[12px] hover:bg-[#f1f5f9]"
                >
                  <span aria-hidden="true">👎</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyReportState />
        )}
      </div>

      <div className="flex flex-col items-center gap-[6px] bg-[#f8fafc] px-[12px] py-[16px]">
        <VideaLogoStacked height={36} />
        <p className="text-[7px] font-normal leading-[10px] text-[#71717a]">
          © 2026 Videa. All rights reserved.
        </p>
      </div>
    </div>
  );
}

const IPHONE_SCALE = 1.5;
const IPHONE_BASE_WIDTH = 214.028;
const IPHONE_BASE_HEIGHT = 464;

export function IPhonePreview({
  savedToothCount,
  clinicalNote,
}: IPhonePreviewProps) {
  return (
    <div
      className="shrink-0"
      style={{
        width: IPHONE_BASE_WIDTH * IPHONE_SCALE,
        height: IPHONE_BASE_HEIGHT * IPHONE_SCALE,
      }}
    >
      <div
        className="relative h-[464px] w-[214.028px] origin-top-left"
        style={{ transform: `scale(${IPHONE_SCALE})` }}
      >
        <div
          className="absolute inset-0 z-[1] overflow-y-auto rounded-[36px] bg-white"
          role="region"
          aria-label="Patient report mobile preview"
        >
          <PatientReport
            savedToothCount={savedToothCount}
            clinicalNote={clinicalNote}
          />
        </div>
        <img
          alt=""
          aria-hidden="true"
          src="/assets/preview/iphone-bezel.png"
          className="pointer-events-none absolute left-[-21.78px] top-[-21.78px] z-[2] block h-[507.568px] w-[257.596px] max-w-none"
        />
      </div>
    </div>
  );
}

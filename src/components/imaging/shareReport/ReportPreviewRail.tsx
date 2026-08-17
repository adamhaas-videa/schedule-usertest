import { cn } from "@/lib/utils";

import { IPhonePreview } from "./IPhonePreview";
import { PaperPreview } from "./PaperPreview";
import type { PreviewTab } from "./types";
import { Button } from "./ui";

interface ReportPreviewRailProps {
  previewTab: PreviewTab;
  onPreviewTabChange: (tab: PreviewTab) => void;
  onClose?: () => void;
  savedToothCount: number;
  clinicalNote: string;
}

function ShadcnTabsRow({
  previewTab,
  onPreviewTabChange,
}: Pick<ReportPreviewRailProps, "previewTab" | "onPreviewTabChange">) {
  const tabs: Array<{ value: PreviewTab; label: string; icon: string }> = [
    { value: "qr", label: "QR Code", icon: "fa-qrcode" },
    { value: "print", label: "Print/Download", icon: "fa-print" },
  ];

  return (
    <div className="flex h-10 w-full items-center gap-1 rounded-md bg-[var(--base-muted)] p-1">
      {tabs.map((tab) => {
        const active = previewTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onPreviewTabChange(tab.value)}
            className={cn(
              "flex h-full flex-1 items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-[14px] font-medium leading-5 transition-colors cursor-pointer",
              active
                ? "bg-primary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <i className={cn("fa-solid", tab.icon, "text-sm")} aria-hidden />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function QrSection() {
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p className="w-full max-w-[320px] text-center text-[14px] leading-5 text-primary-foreground">
        Patient can use their mobile camera to access the treatment plan on
        their device.
      </p>

      <a
        href="#"
        className="flex items-center justify-center"
        aria-label="Open patient report"
      >
        <img
          alt=""
          src="/assets/preview/qr.png"
          className="size-[140px] rounded-sm object-cover"
        />
      </a>
    </div>
  );
}

function PrintActions() {
  return (
    <div className="flex w-full items-center gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        aria-label="Print patient report"
      >
        <i className="fa-solid fa-print text-sm" aria-hidden />
        Print
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        aria-label="Download patient report"
      >
        <i className="fa-solid fa-download text-sm" aria-hidden />
        Download
      </Button>
    </div>
  );
}

export function ReportPreviewRail({
  previewTab,
  onPreviewTabChange,
  onClose,
  savedToothCount,
  clinicalNote,
}: ReportPreviewRailProps) {
  const isPrint = previewTab === "print";

  return (
    <aside className="flex w-1/3 min-w-[320px] shrink-0 flex-col self-stretch border-l border-border bg-[#18181b]">
      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-6 py-6">
        <ShadcnTabsRow
          previewTab={previewTab}
          onPreviewTabChange={onPreviewTabChange}
        />

        {isPrint ? (
          <>
            <PaperPreview
              savedToothCount={savedToothCount}
              clinicalNote={clinicalNote}
            />
            <PrintActions />
          </>
        ) : (
          <>
            <QrSection />
            <IPhonePreview
              savedToothCount={savedToothCount}
              clinicalNote={clinicalNote}
            />
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-[#18181b] p-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onClose}
        >
          Done
        </Button>
      </div>
    </aside>
  );
}

import { useEffect } from "react";
import type { Patient } from "@/data/mockPatients";
import { ShareReportExperience } from "./shareReport/ShareReportExperience";

interface ShareReportModalProps {
  patient: Patient;
  open: boolean;
  onClose: () => void;
}

/** Share Report — full-screen takeover that ports the qr-code-revamp
 *  patient report experience (odontogram + treatment picker + QR / print
 *  preview). Always rendered dark via the `share-report-scope` palette. */
export default function ShareReportModal({
  patient,
  open,
  onClose,
}: ShareReportModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="share-report-scope fixed inset-0 z-[100] overflow-auto bg-[#0a0a0a]">
      <ShareReportExperience
        patient={patient}
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
      />
    </div>
  );
}

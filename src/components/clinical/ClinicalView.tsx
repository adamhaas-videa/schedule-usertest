import type { Patient } from "@/data/mockPatients";
import type { ClinicalTab } from "@/App";
import ClinicalHeader from "./ClinicalHeader";
import XrayImagesTab from "./XrayImagesTab";
import VoiceNotesTab from "./VoiceNotesTab";
import PerioChartTab from "./PerioChartTab";

interface ClinicalViewProps {
  patient: Patient;
  tab: ClinicalTab;
  onTabChange: (tab: ClinicalTab) => void;
  onBack: () => void;
  privacyMode: boolean;
  onPrivacyToggle: (enabled: boolean) => void;
}

export default function ClinicalView({
  patient,
  tab,
  onTabChange,
  onBack,
  privacyMode,
  onPrivacyToggle,
}: ClinicalViewProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <ClinicalHeader
        patient={patient}
        tab={tab}
        onTabChange={onTabChange}
        onBack={onBack}
        privacyMode={privacyMode}
        onPrivacyToggle={onPrivacyToggle}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "xray" && <XrayImagesTab patient={patient} />}
        {tab === "voice" && <VoiceNotesTab patient={patient} privacyMode={privacyMode} />}
        {tab === "perio" && <PerioChartTab patient={patient} />}
      </div>
    </div>
  );
}

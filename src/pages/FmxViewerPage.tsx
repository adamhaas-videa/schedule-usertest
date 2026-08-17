import { useNavigate, useParams } from "react-router-dom";
import WorkflowHeader from "@/components/workflow/WorkflowHeader";
import FmxViewer from "@/components/imaging/FmxViewer";
import { getPatientById } from "@/lib/patients";
import { useAiView } from "@/context/AiViewContext";

export default function FmxViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = getPatientById(id);
  const { aiOn, setAiOn, privacyMode, setPrivacyMode } = useAiView();

  if (!patient) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
        <p className="text-lg font-medium text-foreground">Patient not found</p>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => navigate("/schedule")}
        >
          Back to Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a]">
      <WorkflowHeader
        patient={patient}
        activeTab="xray"
        privacyMode={privacyMode}
        onPrivacyToggle={setPrivacyMode}
        showStudyBar={false}
      />
      <FmxViewer patient={patient} aiOn={aiOn} onAiToggle={setAiOn} />
    </div>
  );
}

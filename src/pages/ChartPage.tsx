import { useNavigate, useParams } from "react-router-dom";
import WorkflowHeader from "@/components/workflow/WorkflowHeader";
import { getPatientById } from "@/lib/patients";
import { useAiView } from "@/context/AiViewContext";
import { CHART_VERSIONS } from "@/lib/chartVersions";

export default function ChartPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = getPatientById(id);
  const { privacyMode, setPrivacyMode, chartVersion } = useAiView();
  const meta =
    CHART_VERSIONS.find((v) => v.id === chartVersion) ?? CHART_VERSIONS[0];

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
    <div className="flex h-screen flex-col bg-background">
      <WorkflowHeader
        patient={patient}
        activeTab="chart"
        privacyMode={privacyMode}
        onPrivacyToggle={setPrivacyMode}
      />
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded bg-secondary text-secondary-foreground text-xs font-semibold tabular-nums">
          {meta.label}
        </span>
        <h1 className="text-2xl font-semibold text-foreground">{meta.title}</h1>
        <p className="text-sm text-muted-foreground max-w-md">{meta.description}</p>
        <p className="text-xs text-muted-foreground">
          Chart demo placeholder for {patient.name}.
        </p>
      </div>
    </div>
  );
}

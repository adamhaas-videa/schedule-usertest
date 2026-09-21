import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppNavigate } from "@/lib/useAppNavigate";
import WorkflowHeader from "@/components/workflow/WorkflowHeader";
import SingleImageViewer from "@/components/imaging/SingleImageViewer";
import { getPatientById } from "@/lib/patients";
import { useAiView } from "@/context/AiViewContext";

const SLOTS = Array.from({ length: 18 }, (_, i) => i + 1);

export default function SingleImagePage() {
  const { id, slot } = useParams<{ id: string; slot: string }>();
  const navigate = useAppNavigate();
  const patient = getPatientById(id);
  const { aiOn, setAiOn, privacyMode, setPrivacyMode } = useAiView();
  const [expanded, setExpanded] = useState(false);

  const currentSlot = Math.min(Math.max(Number(slot) || 1, 1), SLOTS.length);

  const goToSlot = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 1), SLOTS.length);
      navigate(`/patient/${id}/image/${clamped}`, { replace: true });
    },
    [id, navigate]
  );

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

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
      {!expanded && (
        <WorkflowHeader
          patient={patient}
          activeTab="xray"
          privacyMode={privacyMode}
          onPrivacyToggle={setPrivacyMode}
          showStudyBar={false}
        />
      )}
      <SingleImageViewer
        patient={patient}
        slot={currentSlot}
        slots={SLOTS}
        aiOn={aiOn}
        onAiToggle={setAiOn}
        expanded={expanded}
        onToggleExpand={() => setExpanded((v) => !v)}
        onSelectSlot={goToSlot}
        onStep={(delta) => {
          // Cyclic navigation: stepping past the last image wraps to the first
          // (18 → 1) and stepping back from the first wraps to the last (1 → 18).
          // Index-based so it stays correct if SLOTS ever become non-contiguous.
          const i = SLOTS.indexOf(currentSlot);
          const next = SLOTS[(i + delta + SLOTS.length) % SLOTS.length];
          goToSlot(next);
        }}
      />
    </div>
  );
}

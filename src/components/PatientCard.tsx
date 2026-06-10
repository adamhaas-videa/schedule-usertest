import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";

interface PatientCardProps {
  patient: Patient;
  variant: "full" | "compact" | "calendar";
  isPeek?: boolean;
  privacyMode?: boolean;
  onClick: (patient: Patient) => void;
}

function StatusBadge({ status, readyForChair }: { status: Patient["status"]; readyForChair?: boolean }) {
  if (readyForChair) {
    return (
      <span className="inline-flex items-center h-5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-600 whitespace-nowrap">
        Patient Ready
      </span>
    );
  }
  if (status === "in-chair") {
    return (
      <span className="inline-flex items-center h-5 px-2.5 py-0.5 rounded-full bg-green-50 border border-green-100 text-[11px] font-medium text-green-600 whitespace-nowrap">
        In Chair
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="text-xs text-muted-foreground">Completed</span>
    );
  }
  return null;
}

function VisitTags({
  tags,
  maxVisible = 2,
}: {
  tags: string[];
  maxVisible?: number;
}) {
  const visible = tags.slice(0, maxVisible);
  const overflow = tags.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="text-[11px] font-normal px-1.5 py-0 h-5 bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          {tag}
        </Badge>
      ))}
      {overflow > 0 && (
        <Badge
          variant="secondary"
          className="text-[11px] font-normal px-1.5 py-0 h-5 bg-gray-100 text-gray-500"
        >
          +{overflow} more
        </Badge>
      )}
    </div>
  );
}

type PrimaryActionState = {
  label: string;
  icon: string;
  className: string;
};

function getPrimaryAction(status: Patient["status"]): PrimaryActionState | null {
  if (status === "in-chair") {
    return {
      label: "Resume Visit",
      icon: "fa-solid fa-play",
      className:
        "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
    };
  }
  if (status === "completed") {
    return {
      label: "View Summary",
      icon: "fa-regular fa-file-lines",
      className:
        "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300",
    };
  }
  return {
    label: "Start Visit",
    icon: "fa-solid fa-play",
    className:
      "bg-deep-teal text-white hover:bg-deep-teal/90 active:bg-deep-teal/80",
  };
}

function VisitActions({ status }: { status: Patient["status"] }) {
  const primary = getPrimaryAction(status);

  return (
    <div className="flex items-center gap-1.5">
      {primary && (
        <Button
          size="default"
          onClick={(e) => e.stopPropagation()}
          className={cn(primary.className)}
        >
          <i className={cn(primary.icon, "text-[11px]")} />
          {primary.label}
        </Button>
      )}
      <Button
        variant="outline"
        size="default"
        onClick={(e) => e.stopPropagation()}
      >
        <i className="fa-regular fa-eye text-[11px]" />
        Review Only
      </Button>
    </div>
  );
}

export default function PatientCard({
  patient,
  variant,
  isPeek = false,
  privacyMode = false,
  onClick,
}: PatientCardProps) {
  const nameClass = privacyMode ? "blur-sm select-none" : "";
  const borderColor = patient.readyForChair
    ? "border-l-blue-500"
    : patient.status === "in-chair"
      ? "border-l-green-600"
      : patient.status === "completed"
        ? "border-l-gray-300"
        : "border-l-gray-400";

  const readyOutline = patient.readyForChair
    ? "ring-2 ring-blue-300/60"
    : "";

  if (variant === "calendar") {
    return (
      <Card
        className={cn(
          "border-l-[4px] px-3 py-2.5 cursor-pointer hover:shadow-lg transition-all rounded-[10px] shadow-base h-full overflow-hidden flex flex-col",
          borderColor,
          readyOutline,
          patient.status === "in-chair" && "bg-white",
          patient.status === "completed" && "bg-gray-50/60"
        )}
        onClick={() => onClick(patient)}
      >
        <div className={cn("min-h-0", patient.status === "completed" && "opacity-60")}>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className={cn("text-[13px] font-semibold text-gray-950 truncate", nameClass)}>
                {patient.name}
              </div>
              <StatusBadge status={patient.status} readyForChair={patient.readyForChair} />
            </div>
            <span className="text-[12px] text-muted-foreground tabular-nums block">
              {patient.appointmentTime}
            </span>
          </div>
          {patient.visitTags && patient.visitTags.length > 0 && (
            <div className="mt-2.5">
              <VisitTags tags={patient.visitTags} maxVisible={2} />
            </div>
          )}
        </div>
        <div className="flex items-center mt-auto pt-1.5">
          <VisitActions status={patient.status} />
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "border-l-[3px] px-3 py-2 cursor-pointer hover:bg-gray-50 transition-all rounded-[10px]",
          borderColor,
          isPeek && "opacity-50",
          patient.status === "completed" && "opacity-50"
        )}
        onClick={() => onClick(patient)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("text-sm font-medium truncate", nameClass)}>
              {patient.name}
            </span>
            {patient.allergies && patient.allergies.length > 0 && (
              <i className="fa-solid fa-triangle-exclamation text-amber-600 text-[10px] shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {patient.procedure}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {patient.appointmentTime}
            </span>
          </div>
        </div>
        {patient.visitTags && patient.visitTags.length > 0 && (
          <div className="mt-1">
            <VisitTags tags={patient.visitTags} maxVisible={2} />
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-l-[4px] p-4 cursor-pointer hover:shadow-lg transition-all rounded-[10px] shadow-base",
        borderColor,
        readyOutline,
        patient.status === "in-chair" && "bg-white",
        patient.status === "completed" && "bg-gray-50/60"
      )}
      onClick={() => onClick(patient)}
    >
      <div>
        <div className={cn(patient.status === "completed" && "opacity-60")}>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className={cn("text-sm font-semibold text-gray-950", nameClass)}>
                {patient.name}
              </div>
              <StatusBadge status={patient.status} readyForChair={patient.readyForChair} />
            </div>
            <span className="text-[13px] text-muted-foreground tabular-nums block">
              {patient.appointmentTime}
            </span>
          </div>

          {patient.visitTags && patient.visitTags.length > 0 && (
            <div className="mt-3">
              <VisitTags tags={patient.visitTags} maxVisible={2} />
            </div>
          )}
        </div>

        <div className="flex items-center mt-2">
          <VisitActions status={patient.status} />
        </div>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";

interface PatientCardProps {
  patient: Patient;
  variant: "full" | "compact";
  isPeek?: boolean;
  privacyMode?: boolean;
  onClick: (patient: Patient) => void;
}

function StatusBadge({ status }: { status: Patient["status"] }) {
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

function AiFindings({
  findings,
  maxVisible = 2,
}: {
  findings: string[];
  maxVisible?: number;
}) {
  const visible = findings.slice(0, maxVisible);
  const overflow = findings.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((finding) => (
        <Badge
          key={finding}
          variant="secondary"
          className="text-[11px] font-normal px-1.5 py-0 h-5 bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          {finding}
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

function PerioIcon({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" className={cn("shrink-0", className)}>
      <path d="M13.2009 11.4583V17.6705C13.2009 18.0588 12.8723 18.3873 12.4841 18.3873C12.0958 18.3873 11.7673 18.0588 11.7673 17.6705V11.4583C11.7673 11.07 12.0958 10.7415 12.4841 10.7415C12.8723 10.7415 13.2009 11.07 13.2009 11.4583ZM15.5902 12.414V16.7148C15.5902 17.1031 15.2617 17.4316 14.8734 17.4316C14.4851 17.4316 14.1566 17.1031 14.1566 16.7148V12.414C14.1566 12.0257 14.4851 11.6972 14.8734 11.6972C15.2617 11.6972 15.5902 12.0257 15.5902 12.414ZM10.8115 12.8919V16.2369C10.8115 16.6252 10.483 16.9537 10.0947 16.9537C9.70646 16.9537 9.37793 16.6252 9.37793 16.2369V12.8919C9.37793 12.5036 9.70646 12.1751 10.0947 12.1751C10.483 12.1751 10.8115 12.5036 10.8115 12.8919ZM17.9795 13.8476V15.2812C17.9795 15.6695 17.651 15.998 17.2627 15.998C16.8745 15.998 16.5459 15.6695 16.5459 15.2812V13.8476C16.5459 13.4593 16.8745 13.1308 17.2627 13.1308C17.651 13.1308 17.9795 13.4593 17.9795 13.8476Z" fill="currentColor"/>
      <path d="M11.7666 3C13.7675 3.00011 15.3797 4.61241 15.3799 6.61328V8.79395C15.3799 9.25833 15.3098 9.73566 15.1641 10.1904C14.8589 10.3374 14.2119 10.4671 13.8018 9.70801C13.8944 9.41403 13.9463 9.10429 13.9463 8.79395V6.61328C13.9461 5.41881 12.9611 4.4337 11.7666 4.43359C11.4383 4.43359 11.0798 4.52269 10.7812 4.67188L9.01855 5.56836C8.80952 5.6579 8.57035 5.65794 8.36133 5.56836L6.59961 4.67188C6.30106 4.5226 5.97249 4.43366 5.61426 4.43359C4.41968 4.43359 3.43375 5.41874 3.43359 6.61328V8.79395C3.43361 9.27177 3.55267 9.74987 3.76172 10.168L4.47852 11.6016C4.7174 12.1092 4.86701 12.6465 4.92676 13.2139L5.22559 16.3799C5.25545 16.6487 5.49487 16.8574 5.76367 16.8574C6.00245 16.8572 6.24066 16.6782 6.27051 16.4395L7.13672 12.4072C7.15117 12.335 7.17175 12.2652 7.19531 12.1973C7.54125 12.0297 8.34446 12.1311 8.53809 12.6855L7.6748 16.7383C7.49563 17.6341 6.68934 18.2908 5.76367 18.291C4.7482 18.291 3.91187 17.5145 3.82227 16.499L3.49316 13.334C3.4633 12.9457 3.37354 12.5869 3.19434 12.2285L2.47754 10.8252C2.14902 10.198 2.00002 9.48084 2 8.79395V6.61328C2.00015 4.61234 3.61328 3 5.61426 3C6.18151 3.00005 6.719 3.11903 7.22656 3.3877L8.69043 4.10449L10.1533 3.3877C10.6611 3.1189 11.1991 3 11.7666 3ZM12.1816 16.0967C12.1681 16.1714 12.1549 16.2494 12.1416 16.3291C12.1317 16.3886 12.1213 16.4493 12.1113 16.5107L12.0459 16.3711C12.1058 16.2354 12.1627 16.0749 12.2197 15.8955C12.2065 15.9595 12.1943 16.0268 12.1816 16.0967Z" fill="currentColor"/>
    </svg>
  );
}

const CTA_BUTTONS: { icon?: string; label: string; customIcon?: React.ReactNode }[] = [
  { icon: "fa-regular fa-image", label: "Images" },
  { icon: "fa-regular fa-microphone", label: "Note" },
  { label: "Perio", customIcon: <PerioIcon className="text-[16px]" /> },
];

export default function PatientCard({
  patient,
  variant,
  isPeek = false,
  privacyMode = false,
  onClick,
}: PatientCardProps) {
  const nameClass = privacyMode ? "blur-sm select-none" : "";
  const borderColor =
    patient.status === "in-chair"
      ? "border-l-green-600"
      : patient.status === "completed"
        ? "border-l-gray-300"
        : "border-l-gray-200";

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
        {patient.aiFindings && patient.aiFindings.length > 0 && (
          <div className="mt-1">
            <AiFindings findings={patient.aiFindings} maxVisible={2} />
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
        patient.status === "in-chair" && "bg-white",
        patient.status === "completed" && "opacity-50"
      )}
      onClick={() => onClick(patient)}
    >
      <div className="space-y-2">
        {/* Row 1: Name + Status badge */}
        <div className="flex items-start justify-between gap-2">
          <div className={cn("text-sm font-semibold text-gray-950", nameClass)}>
            {patient.name}
          </div>
          <StatusBadge status={patient.status} />
        </div>

        {/* Row 2: DOB + Time */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] text-muted-foreground">
            {patient.dob}
          </span>
          <span className="text-[13px] text-muted-foreground tabular-nums">
            {patient.appointmentTime}
          </span>
        </div>

        {/* Row 3: Procedure */}
        <div className="text-[13px] font-semibold text-gray-700">
          {patient.procedure}
        </div>

        {/* AI Findings */}
        {patient.aiFindings && patient.aiFindings.length > 0 && (
          <AiFindings findings={patient.aiFindings} />
        )}

        {/* CTA Buttons - always visible */}
        <div className="flex items-center gap-1.5 pt-1">
          {CTA_BUTTONS.map(({ icon, label, customIcon }) => (
            <button
              key={label}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[13px] font-medium text-[#5C7890] hover:bg-[#EEF4FF] hover:text-deep-teal active:bg-[#E0EBFF] transition-colors"
            >
              {customIcon ?? <i className={cn(icon, "text-[13px]")} />}
              {label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

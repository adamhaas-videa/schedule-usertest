import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/data/mockPatients";
import { computeAge } from "@/data/mockPatients";
import { cn } from "@/lib/utils";

function PerioIcon({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" className={cn("shrink-0", className)}>
      <path d="M13.2009 11.4583V17.6705C13.2009 18.0588 12.8723 18.3873 12.4841 18.3873C12.0958 18.3873 11.7673 18.0588 11.7673 17.6705V11.4583C11.7673 11.07 12.0958 10.7415 12.4841 10.7415C12.8723 10.7415 13.2009 11.07 13.2009 11.4583ZM15.5902 12.414V16.7148C15.5902 17.1031 15.2617 17.4316 14.8734 17.4316C14.4851 17.4316 14.1566 17.1031 14.1566 16.7148V12.414C14.1566 12.0257 14.4851 11.6972 14.8734 11.6972C15.2617 11.6972 15.5902 12.0257 15.5902 12.414ZM10.8115 12.8919V16.2369C10.8115 16.6252 10.483 16.9537 10.0947 16.9537C9.70646 16.9537 9.37793 16.6252 9.37793 16.2369V12.8919C9.37793 12.5036 9.70646 12.1751 10.0947 12.1751C10.483 12.1751 10.8115 12.5036 10.8115 12.8919ZM17.9795 13.8476V15.2812C17.9795 15.6695 17.651 15.998 17.2627 15.998C16.8745 15.998 16.5459 15.6695 16.5459 15.2812V13.8476C16.5459 13.4593 16.8745 13.1308 17.2627 13.1308C17.651 13.1308 17.9795 13.4593 17.9795 13.8476Z" fill="currentColor"/>
      <path d="M11.7666 3C13.7675 3.00011 15.3797 4.61241 15.3799 6.61328V8.79395C15.3799 9.25833 15.3098 9.73566 15.1641 10.1904C14.8589 10.3374 14.2119 10.4671 13.8018 9.70801C13.8944 9.41403 13.9463 9.10429 13.9463 8.79395V6.61328C13.9461 5.41881 12.9611 4.4337 11.7666 4.43359C11.4383 4.43359 11.0798 4.52269 10.7812 4.67188L9.01855 5.56836C8.80952 5.6579 8.57035 5.65794 8.36133 5.56836L6.59961 4.67188C6.30106 4.5226 5.97249 4.43366 5.61426 4.43359C4.41968 4.43359 3.43375 5.41874 3.43359 6.61328V8.79395C3.43361 9.27177 3.55267 9.74987 3.76172 10.168L4.47852 11.6016C4.7174 12.1092 4.86701 12.6465 4.92676 13.2139L5.22559 16.3799C5.25545 16.6487 5.49487 16.8574 5.76367 16.8574C6.00245 16.8572 6.24066 16.6782 6.27051 16.4395L7.13672 12.4072C7.15117 12.335 7.17175 12.2652 7.19531 12.1973C7.54125 12.0297 8.34446 12.1311 8.53809 12.6855L7.6748 16.7383C7.49563 17.6341 6.68934 18.2908 5.76367 18.291C4.7482 18.291 3.91187 17.5145 3.82227 16.499L3.49316 13.334C3.4633 12.9457 3.37354 12.5869 3.19434 12.2285L2.47754 10.8252C2.14902 10.198 2.00002 9.48084 2 8.79395V6.61328C2.00015 4.61234 3.61328 3 5.61426 3C6.18151 3.00005 6.719 3.11903 7.22656 3.3877L8.69043 4.10449L10.1533 3.3877C10.6611 3.1189 11.1991 3 11.7666 3ZM12.1816 16.0967C12.1681 16.1714 12.1549 16.2494 12.1416 16.3291C12.1317 16.3886 12.1213 16.4493 12.1113 16.5107L12.0459 16.3711C12.1058 16.2354 12.1627 16.0749 12.2197 15.8955C12.2065 15.9595 12.1943 16.0268 12.1816 16.0967Z" fill="currentColor"/>
    </svg>
  );
}

interface PatientDetailDrawerProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PatientDetailDrawer({
  patient,
  open,
  onOpenChange,
}: PatientDetailDrawerProps) {
  if (!patient) return null;

  const age = computeAge(patient.dob);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-[400px] !max-w-[400px] overflow-y-auto p-0"
      >
        <SheetHeader className="p-5 pb-0">
          <SheetTitle className="text-2xl font-bold">
            {patient.name}
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-5 pt-4 space-y-5">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Date of Birth
            </div>
            <div className="text-sm">
              {patient.dob}
              <span className="text-muted-foreground ml-1">({age} yrs)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Allergies
            </div>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1 text-sm font-medium text-warning-emphasis bg-warning-muted px-2 py-0.5 rounded"
                  >
                    <i className="fa-solid fa-triangle-exclamation text-[10px]" />
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">None reported</div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Today's Appointment
            </div>
            <div className="text-sm font-medium">{patient.procedure}</div>
            <div className="text-sm text-muted-foreground">
              {patient.appointmentTime} &middot; Operatory {patient.operatory}
            </div>
            <div className="mt-1">
              {patient.status === "in-chair" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success-emphasis">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  In Chair
                </span>
              ) : patient.status === "completed" ? (
                <span className="text-xs text-muted-foreground">Completed</span>
              ) : (
                <span className="text-xs text-muted-foreground">Upcoming</span>
              )}
            </div>
          </div>

          {patient.provider && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Provider
              </div>
              <div className="flex items-center gap-2.5">
                <Avatar
                  size="sm"
                  className="size-7 bg-periwinkle-300 after:border-transparent"
                >
                  <AvatarFallback className="bg-periwinkle-300 text-deep-teal-800 text-[11px] font-semibold">
                    {patient.provider.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {patient.provider.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {patient.provider.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {patient.insurance && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Insurance
              </div>
              <div className="text-sm text-foreground">
                {patient.insurance.carrier}
              </div>
              <div className="text-xs text-muted-foreground">
                ${patient.insurance.remainingBenefit} remaining &middot;{" "}
                <span
                  className={cn(
                    patient.insurance.status === "Active" &&
                      "text-success-emphasis",
                    patient.insurance.status === "Pending" &&
                      "text-warning-emphasis",
                    patient.insurance.status === "Inactive" && "text-destructive"
                  )}
                >
                  {patient.insurance.status}
                </span>
              </div>
            </div>
          )}

          {patient.conditionAlert && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Condition Alert
              </div>
              <span
                className={cn(
                  "inline-flex w-fit items-center gap-1.5 h-[20px] px-2 rounded-full",
                  patient.conditionAlert.severity === "success" &&
                    "bg-success-muted text-success-emphasis",
                  patient.conditionAlert.severity === "accent" &&
                    "bg-accent-muted text-accent-emphasis",
                  patient.conditionAlert.severity === "warning" &&
                    "bg-warning-muted text-warning-emphasis",
                  patient.conditionAlert.severity === "error" &&
                    "bg-error-muted text-error-emphasis"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    patient.conditionAlert.severity === "success" &&
                      "bg-success",
                    patient.conditionAlert.severity === "accent" &&
                      "bg-accent-muted-foreground",
                    patient.conditionAlert.severity === "warning" &&
                      "bg-warning",
                    patient.conditionAlert.severity === "error" &&
                      "bg-destructive"
                  )}
                />
                <span className="text-[11px] font-medium">
                  {patient.conditionAlert.label}
                </span>
              </span>
            </div>
          )}

          {patient.aiFindings && patient.aiFindings.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI Findings
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.aiFindings.map((finding) => (
                  <Badge
                    key={finding}
                    variant="secondary"
                    className="text-xs font-normal bg-gray-100 text-gray-700"
                  >
                    {finding}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t border-zinc-200">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </div>
            <Button variant="outline" className="w-full justify-start gap-2 h-9">
              <i className="fa-regular fa-images text-sm" />
              Images
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-9">
              <i className="fa-regular fa-microphone text-sm" />
              Note
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-9">
              <PerioIcon className="text-base" />
              Perio
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useMemo, useState } from "react";
import DemoMenu from "@/components/DemoMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { ProductNavItem } from "@/components/navigation/products";
import { getUpsellCopy } from "@/data/upsell";
import { getEnrichedPatients } from "@/lib/patients";
import { getProviderColor } from "@/lib/providerColors";
import { cn } from "@/lib/utils";
import { useNowMinutes } from "@/lib/useNowMinutes";

const TIME_SLOTS = [
  "10:00 am",
  "10:30 am",
  "11:00 am",
  "2:00 pm",
  "2:30 pm",
  "3:00 pm",
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function statusTone(status: string) {
  if (status === "Active") return "bg-success-muted text-success-muted-foreground";
  if (status === "Pending") return "bg-warning-muted text-warning-muted-foreground";
  return "bg-error-muted text-error-muted-foreground";
}

function statusLabel(status: string) {
  if (status === "Pending") return "Confirm Details";
  if (status === "Inactive") return "No Coverage";
  return status;
}

function AutoVerifyPreview() {
  const nowMinutes = useNowMinutes();
  const rows = useMemo(() => {
    return getEnrichedPatients(nowMinutes)
      .filter((p) => p.insurance)
      .slice(0, 8);
  }, [nowMinutes]);

  const counts = useMemo(() => {
    const active = rows.filter((p) => p.insurance?.status === "Active").length;
    const pending = rows.filter((p) => p.insurance?.status === "Pending").length;
    const inactive = rows.filter((p) => p.insurance?.status === "Inactive").length;
    return { active, pending, inactive };
  }, [rows]);

  return (
    <div className="overflow-hidden rounded-xl bg-card text-sm shadow-lg ring-1 ring-foreground/10">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="rounded-md bg-muted px-2.5 py-1 text-sm font-medium text-foreground">
            Schedule
          </span>
          <span className="px-2.5 py-1 text-sm font-medium text-muted-foreground">
            Run Verification
          </span>
        </div>
        <Badge variant="outline">Mar 12, 2026</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {[
          { n: counts.active, label: "Active", hint: "coverage confirmed" },
          { n: counts.inactive, label: "No Coverage", hint: "not eligible" },
          { n: counts.pending, label: "Confirm Details", hint: "missing data" },
          { n: 0, label: "Contact Payor", hint: "manual check" },
        ].map((card) => (
          <div key={card.label} className="rounded-lg bg-muted/60 px-3 py-2">
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {card.n}
            </p>
            <p className="text-[11px] font-medium text-foreground">{card.label}</p>
            <p className="text-[11px] text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="border-y border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Patient</th>
              <th className="px-4 py-2 font-medium">Insurance</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((patient) => {
              const color = getProviderColor(patient.provider?.id);
              return (
                <tr key={patient.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                    {patient.appointmentTime}
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-2">
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                        style={{ background: color.bg, color: color.fg }}
                      >
                        {patient.provider?.initials ?? "—"}
                      </span>
                      <span className="font-medium text-foreground">
                        {patient.name}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {patient.insurance?.carrier}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={cn(
                        "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium",
                        statusTone(patient.insurance?.status ?? "")
                      )}
                    >
                      {statusLabel(patient.insurance?.status ?? "")}
                    </span>
                  </td>
                  <td className="px-4 py-2 tabular-nums text-foreground">
                    {patient.insurance
                      ? `$${patient.insurance.remainingBenefit.toLocaleString()}`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductPreview({ productKey }: { productKey: string }) {
  if (productKey === "autoverify") return <AutoVerifyPreview />;
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-xl bg-card px-8 text-center shadow-lg ring-1 ring-foreground/10">
      <div className="max-w-sm">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <i className="fa-regular fa-lock text-lg" aria-hidden />
        </div>
        <p className="text-sm font-medium text-foreground">
          Preview unlocks with the product
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Book a demo to see this surface on a schedule that looks like yours.
        </p>
      </div>
    </div>
  );
}

export default function UpsellPage({ item }: { item: ProductNavItem }) {
  const copy = getUpsellCopy(item.key);
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 20));
  const [slot, setSlot] = useState<string | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
        <h1 className="text-xl font-semibold text-foreground">{copy.product}</h1>
        <div className="min-w-0 flex-1" />
        <DemoMenu />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-border px-6 py-12 lg:px-10 lg:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-foreground text-balance">
                {copy.headline}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{copy.lede}</p>
              <ul className="mt-5 flex flex-col gap-2 text-sm text-foreground">
                {copy.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <i
                      className="fa-regular fa-check mt-0.5 text-primary"
                      aria-hidden
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {copy.stats.length > 0 && (
                <div className="mt-6 flex flex-col gap-3">
                  {copy.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-4 rounded-lg bg-periwinkle-50 px-4 py-3"
                    >
                      <p className="text-3xl font-semibold tabular-nums text-periwinkle-700">
                        {stat.value}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="cursor-pointer"
                  onClick={() => scrollToId("how-it-works")}
                >
                  See how it works
                </Button>
                <Button
                  size="lg"
                  className="cursor-pointer"
                  onClick={() => scrollToId("book-demo")}
                >
                  Book a Demo
                  <i
                    className="fa-regular fa-arrow-right text-sm"
                    aria-hidden
                  />
                </Button>
              </div>
            </div>
            <ProductPreview productKey={item.key} />
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-4 border-b border-border px-6 py-12 lg:px-10 lg:py-16"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
            <div className="flex items-start">
              <ProductPreview productKey={item.key} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                How it works
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground text-balance">
                {copy.howItWorksTitle}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {copy.howItWorksLede}
              </p>
              <ol className="mt-8 flex flex-col">
                {copy.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <div className="flex w-9 shrink-0 flex-col items-center">
                      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                      {index < copy.steps.length - 1 && (
                        <span className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className={cn("pb-6", index === copy.steps.length - 1 && "pb-0")}>
                      <p className="text-sm font-semibold text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="book-demo"
          className="scroll-mt-4 px-6 py-12 lg:px-10 lg:py-16"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Book a demo
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground text-balance">
                {copy.demoTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                {copy.demoLede}
              </p>
            </div>
            <div className="overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-foreground/10 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
              <div className="flex flex-col gap-5 border-b border-border p-6 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded bg-primary text-[10px] font-semibold text-primary-foreground">
                    V
                  </span>
                  <span className="text-sm font-medium text-foreground">Videa</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-periwinkle-200 text-sm font-semibold text-deep-teal-700">
                    MC
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Maya Chen</p>
                    <p className="text-xs text-muted-foreground">
                      Solutions Consultant, Videa
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Book time with Maya</p>
                  <p className="text-base font-semibold text-foreground">
                    {copy.meetingName}
                  </p>
                </div>
                <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <i className="fa-regular fa-clock w-4 text-center" aria-hidden />
                    30 min
                  </li>
                  <li className="flex items-start gap-2.5">
                    <i className="fa-regular fa-video mt-0.5 w-4 text-center" aria-hidden />
                    <span>Web conferencing details provided upon confirmation.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fa-regular fa-globe w-4 text-center" aria-hidden />
                    Eastern Time – US &amp; Canada
                  </li>
                </ul>
                <div className="h-px bg-border" />
                <p className="text-sm text-muted-foreground">{copy.meetingBlurb}</p>
                <p className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <i className="fa-regular fa-sparkle" aria-hidden />
                  Maya covers your region
                </p>
              </div>
              <div className="p-6">
                <p className="mb-4 text-sm font-medium text-foreground">
                  Select a date &amp; time
                </p>
                <div className="grid gap-6 lg:grid-cols-[1fr_9rem]">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    defaultMonth={date}
                    className="p-0"
                  />
                  <div className="flex flex-col gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSlot(time)}
                        className={cn(
                          "h-8 rounded-md border text-sm transition-colors cursor-pointer",
                          slot === time
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

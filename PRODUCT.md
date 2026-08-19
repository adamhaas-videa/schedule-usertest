# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: dentists (DDS/DMD) and hygienists (RDH), chairside, mid-appointment.** They work at a
wall- or arm-mounted operatory monitor driven by mouse and keyboard, roughly 3–4 ft away, angled so
the patient in the chair can see it. The patient is a second, non-operating audience for the same
screen — imaging, findings, and education are shown to them deliberately.

**Secondary: front-desk staff on a normal desktop workstation.** Same application, dense
mouse-driven use, running the day from the counter.

No touch, tablet, or gloved-hand interaction is in scope. Hover affordances and pointer precision
are available.

## Product Purpose

Videa is an AI layer over a dental practice's working day: it reads the clinical evidence, captures
the visit, and works the back office, so the practice's existing system of record stops being the
place where work is manually re-entered.

This repository is the **front-end concept lab** for that product — primarily an exploration space
for schedule and chairside clinical UI (hence `concepts/`, the card-version and chart-version
switchers, and multiple parallel treatments of the same surface). Two secondary jobs ride on it:
periodic stakeholder review of the direction, and serving as the interaction-design reference
engineers build production against. It is not itself a production front-end and does not become one.

Success for a build in this repo: a stakeholder understands the idea without narration, and an
engineer can read the interaction out of it without asking what was meant.

## Positioning

Videa's claim is the combination, not any single leg of it:

1. **AI reads the clinical evidence.** Radiographs, perio, and charting are interpreted
   automatically — findings surface before the clinician opens the image, not after they hunt for it.
2. **The visit writes itself.** Ambient voice and room signal turn the appointment into the record —
   notes, perio numbers, and charting without typing.
3. **The revenue back office runs itself.** Verification, claims, recall, and referrals — the work
   that eats front-desk hours.
4. **One intelligence across the whole day.** Not a module bolted onto a practice management system:
   schedule, imaging, notes, and billing share one layer, so the day is orchestrated rather than
   recorded.

The differentiator a neighboring product cannot truthfully copy is that this is one layer over the
entire day — competitors sell modules that each own a slice.

## Operating Context

- **Videa layers over an incumbent PMS** (Dentrix, Open Dental, Curve, and the like). The practice
  keeps its existing system as the system of record; Videa reads from and writes to it. Videa is not
  a replacement and does not own the underlying schedule, ledger, or chart data.
- **The operatory screen is shared with the patient.** Privacy masking, patient education, and the
  patient-facing report share are responses to a real room condition, not demo garnish.
- **The day is the organizing unit.** Appointments are placed in operatories (8 chairs) on a
  time-ruled grid, with non-appointment blocks such as lunch occupying chair time.
- **Product suite scope** is named in the sidebar: Schedule, Voice Notes, AutoVerify, Clean Claims,
  Recall, Referrals, Ambient Intel, Insights, Engagement. Only Schedule and the per-patient clinical
  workflows are built; the rest are routed placeholders.

## Capabilities and Constraints

**Built surfaces**

- **Schedule** — operatory calendar grid and list view, with provider/operatory filtering, date
  picker, privacy toggle, and a patient detail drawer.
- **Per-patient clinical workflows**, each on its own route: FMX radiograph viewer with an AI-findings
  on/off toggle, single-image viewer, voice notes, voice-driven perio charting, and an odontogram
  chart.
- **Patient-facing output** — patient education modal and a share-report experience with paper and
  phone previews plus a QR handoff.

**Hard constraints**

- **No backend, no API, no persistence.** All data is hard-coded mock data in
  `src/data/mockPatients.ts`; state lives in React and resets on reload. Features are wired against
  the mock model, not a data layer.
- **"Now" is a fixed simulated clock** (`SIMULATED_NOW_MINUTES`, 10:45 AM) that derives every
  in-chair / upcoming / completed / ready-for-chair status. Advancing the demo means changing that
  constant.
- **Mock cast:** 4 dentists (DDS/DMD), 3 hygienists (RDH), 8 operatories, a set of insurance carriers
  with benefit remaining and Active/Pending/Inactive status, and perio-stage condition alerts.

**Terminology** — use the profession's words, not generic software ones: *operatory* (not room),
*chair time*, *hygienist* vs *dentist* (distinct roles, distinct schedules), *prophy*, *SRP*, *perio
maintenance*, *recall*, *FMX*, *odontogram*, *remaining benefit*.

## Brand Commitments

- **Name:** Videa. Logo assets in `src/assets/icons/` (horizontal, vertical, brandmark) and
  `public/assets/preview/`.
- **Palette:** Deep Teal is the primary; Periwinkle is the accent. Both ship as full 50–950 ramps.
- **Type:** Inter Variable (`@fontsource-variable/inter`).
- **Icons:** self-hosted Font Awesome Pro 7.2.0 **Web Fonts**, `fa-regular` by default. Deliberate
  and binding — do not install `@fortawesome/*` packages or reintroduce the CDN/kit SVG+JS script;
  that mode fought React's reconciliation and caused icon blinking. See `.font-awesome.md`.
- **Design system:** the "Enamel" semantic token set in `src/index.css`, on Tailwind CSS v4 with
  shadcn `base-nova` primitives built on `@base-ui/react`. Colors go through tokens, not literals.
- **Demo practice identity:** "Vista Dental Studio" (VD). Fictional, and consistent across screens.

## Evidence on Hand

**Real assets available:**

- Radiographs — 18 FMX slots in `public/xrays/`, with an `ai-off/` variant set and a `clinical/` set,
  used to demonstrate AI findings appearing and disappearing on the same image.
- `public/assets/odontogram.svg` and the per-tooth SVG geometry in
  `src/components/imaging/shareReport/`.
- Patient education media in `public/assets/patientEducation/` — crown, filling, implant, perio,
  perio maintenance, root canal, aligner (images) and bridge (video), English only.
- Report-preview furniture in `public/assets/preview/` — iPhone bezel, QR, printed report.

**Deliberate absences that must not be fabricated:** there are no real patients, no customers, no
testimonials, no case studies, no benchmarks, no pricing, no press, and no named PMS integration
partners. Patient records, provider names, and the practice name are invented demo fixtures and
should stay recognizably so. Do not invent clinical accuracy claims, AI detection rates, or time-saved
figures.

## Product Principles

1. **The patient can see this screen.** Treat everything on the operatory surface as patient-visible
   by default. Privacy masking is a product requirement, and anything shown while the patient is
   watching should be something you would be glad to have them read.
2. **Videa is a guest on the practice's data.** It layers over an incumbent PMS rather than replacing
   it. Never design as though Videa owns the record.
3. **Show the finding before it is asked for.** The AI's value is that evidence surfaces ahead of the
   hunt — and stays legible as an interpretation the clinician can accept, question, or turn off.
4. **The day is the spine.** Schedule is where the product lives; clinical work is entered from a
   moment on that timeline, not from a separate application.
5. **Chair time is the scarcest thing in the building.** No interaction may add steps to a visit. If a
   flow costs the clinician taps mid-appointment, it is wrong regardless of how it looks.

## Accessibility & Inclusion

No formal standard has been set for this product, and no compliance claim should be made. Baseline
craft still applies — honest contrast, visible focus, keyboard-reachable paths — but nothing here is
contractually binding, and future work should not assume WCAG AA conformance has been established.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then bundle (`vite build`); a type error fails the build
- `npm run lint` — ESLint over the repo
- `npm run preview` — serve the production build locally

There is no test runner or test suite in this project.

### Dev servers and Conductor worktrees

This repo is often checked out in several **git worktrees** at once (Conductor workspaces under `~/conductor/workspaces/schedule/<name>`), each running its own dev server. Before concluding a change "isn't showing up", confirm which port belongs to which worktree:

```sh
git worktree list                                  # path → branch
lsof -nP -iTCP -sTCP:LISTEN | grep node            # port → pid
ps aux | grep vite                                 # pid → worktree path
```

Two traps that have already cost time: plain `npm run dev` **silently bumps off 5173** to 5174+ when the port is taken (sometimes by an unrelated project), and each Conductor workspace pins its own `$CONDUCTOR_PORT` via `--strictPort`, so it is never on 5173. `.conductor/settings.local.toml` holds those per-machine run scripts and is gitignored — treat it as machine-local, not shared config.

## Git workflow

This is a solo repo. Default to committing and pushing changes straight to `main` on `origin`. Do not open pull requests by default. Only create a branch + pull request when a Vercel branch preview deployment is specifically wanted. Follow the repo's existing concise commit-message style; never force-push to `main` or rewrite pushed history.

## What this is

A front-end-only demo of **Videa**, a dental practice scheduling + clinical UI. There is **no backend, no API, and no persistence** — all data is hard-coded mock data in `src/data/mockPatients.ts`, and "current time" is a fixed simulated clock. State lives entirely in React and resets on reload. Keep this in mind: features are wired against the mock model, not a data layer.

## Stack

React 19 + TypeScript + Vite, styled with **Tailwind CSS v4** (configured via `@tailwindcss/vite` and the `@import`/`@theme` blocks in `src/index.css` — there is no `tailwind.config` file). UI primitives come from **shadcn** in the `base-nova` style, which is built on **`@base-ui/react`** (not Radix) — see `src/components/ui/`. Import alias `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`). Use the `cn()` helper from `@/lib/utils` for class merging.

## Architecture

`App.tsx` is the single source of truth for app state. It holds all top-level state (selected date, privacy mode, filters, view mode, selected patient, sidebar) and passes it down as props — there is no context, store, or router. Navigation is a discriminated union rather than URL routing:

```ts
type AppView = { kind: "schedule" } | { kind: "clinical"; patient; tab };
```

Layout shell: `AppShell` wraps a collapsible `Sidebar` and the content area. The **schedule** view renders `L1Header` + `L2Header` (date picker, filters, privacy toggle, list/calendar switch) above either `PatientListView` (list) or `OperatoryGrid` (calendar). The **clinical** view (`components/clinical/`) is a per-patient screen with `xray` / `voice` / `perio` tabs, opened via `onOpenClinical(patient, tab)`.

Selecting a patient opens `PatientSummaryPanel` — a right-hand slideout (built on `ui/sheet`) driven by `selectedPatient` + `drawerOpen`. It replaced the older `PatientDetailDrawer`, which is gone; don't reintroduce it. The panel derives everything it shows from `buildPatientSummary(patient)` and renders `Odontogram` for tooth findings. `onStepPatient` moves to the previous/next patient without closing the panel.

Filtering by provider/hygienist and operatory is computed in `App.tsx` (`filteredPatients`) and the filtered list is what every view receives.

### Key domain logic (`src/lib/`)

- **`timeline.ts`** — the calendar grid's coordinate system. Pixel geometry (`PIXELS_PER_HOUR`, `minutesToY`, `durationToHeight`) and the demo's **simulated clock** (`SIMULATED_NOW_MINUTES`, default 10:45 AM). Advancing the demo clock = changing that one constant; `getSimulatedNowMinutes()` / `getNowMinutes()` / `getCurrentHour()` are thin readers over it, so the clock stays fixed rather than tracking the wall clock. `READY_FOR_CHAIR_WINDOW_MIN` is the lead time that marks an upcoming patient ready. Note the load-bearing comment on `PIXELS_PER_HOUR`: lowering it re-clips the provider chip on 30-minute cards.
- **`providerColors.ts`** — deterministically maps a provider id to a muted avatar color via a string hash; same id always yields the same palette entry.
- **`summaryVersions.ts`** — the three design tiers of the patient summary slideout (`SummaryVersion` 1–3, `DEFAULT_SUMMARY_VERSION = 3`). Each `SummaryVersionMeta` declares which `SummarySections` that tier shows. `SummaryVersionMenu` in `L1Header` switches tiers live — it exists to demo the tiers side by side.
- **`cardVersions.ts`** — the four schedule-card interaction models (`CardVersion` 1–4). Currently **not** switchable from the UI: `App.tsx` pins `cardVersion` to `DEFAULT_CARD_VERSION` because the header menu now demos summary tiers instead. The other variants are kept for comparison.

### Data model

`src/data/mockPatients.ts` defines the `Patient`, `Provider`, `Insurance`, and `ScheduleBlock` types and the mock records. `applySimulatedTime(patient, now, window)` derives runtime status (in-chair / upcoming / completed, ready-for-chair) from the simulated clock — `App.tsx` maps this over `mockPatients` on mount.

`src/data/patientSummary.ts` is the summary slideout's model: `PatientSummary` and its parts (`SummaryAlert`, `SummaryOpportunity`, `SummaryTask`, `UnscheduledTx`, `LastAppointment`, `ToothFinding`). `buildPatientSummary(patient)` **derives** all of it from a `Patient` — it is a pure function called during render, not stored state, so there is nothing to keep in sync. Extend the summary by extending that function.

### Odontogram

`src/components/Odontogram.tsx` draws the tooth chart from `ToothFinding[]`. Its artwork is 26 static SVGs in `src/assets/odontogram/` — `tooth-*.svg` outlines (paired by universal number, e.g. `tooth-03-14.svg`) plus `mark-*.svg` condition overlays (crown, filling, extraction, implant post/thread/abutment, root canal, incipient). Adding a condition means adding a `ToothMark` variant in `patientSummary.ts` and a matching `mark-*.svg`.

## Font Awesome

Icons are **self-hosted Font Awesome Pro 7.2.0 Web Fonts**, imported in `src/index.css`. Full details live in `.font-awesome.md` — read it before touching icons. Essentials:

- Render icons as plain `<i className="fa-regular fa-<name>" aria-hidden />`. Default weight is `fa-regular`.
- **Do not** install `@fortawesome/*` npm packages and **do not** reintroduce the CDN/kit SVG+JS script — that mode fought React's reconciliation and caused icon blinking. Web Font mode is deliberate.
- Use full literal class strings (`fa-regular fa-calendar-days`), not dynamic `` `fa-${name}` `` concatenation, so usage stays greppable.
- Glyphs are sized by `font-size`: pair `w-*/h-*` utilities with a `text-*` size.

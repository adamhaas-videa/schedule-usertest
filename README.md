# Videa schedule — user-test build

A fork of [`adamhaas-videa/schedule`](https://github.com/adamhaas-videa/schedule) for
running moderated user tests on a public URL. The internal demo
(`schedule-poc.netlify.app`) is a separate site built from `main` of the original
repo and is not affected by anything here.

Three things differ from the original. Everything else is identical.

## 1. The clock is pinned to 8:00 AM

`FIXED_NOW_MINUTES` in `src/lib/timeline.ts` replaces the wall clock, so every
participant opens the same board regardless of when they run the session. At 8:00
the day hasn't started moving: **6 patients in chair, 0 completed, 0 ready-for-chair**.
Move that one constant to change it (8:30 → 5 in chair / 3 completed; 10:45 → 7 / 14).

## 2. Every demo selection lives in the URL

The app is mounted under a permutation head, so the address bar always spells out
the current condition and can be copied straight into a test script.

```
/t/inline-chart                        named condition — the short link to hand a participant
/x/c6-tx-s2-on-n3-auto/schedule        the same thing spelled out
/x/c6-tx-s2-on-n3-auto/patient/p2/xray the head survives navigation into a patient
```

Tokens are self-identifying, so order doesn't matter, unknown ones are ignored, and
missing ones fall back to the default — a mistyped link still lands on a working
schedule. Anything without a head (`/`, `/schedule`, an old bookmark) is redirected
onto the default one.

| Token | Dimension | Values |
| --- | --- | --- |
| `c1`–`c7` | Card version | 1 Summary actions · 2 Always-on · 3 Hover · 4 Card→Images · 5 Card→Images, name→Summary · 6 Inline odontogram · 7 Flyout odontogram |
| `tx` / `prov` | Card color | appointment family / provider palette |
| `s1`–`s3` | Summary tier | Essentials / Core / Full suite |
| `on` / `off` | Card summary blurb | shown / hidden |
| `n1`–`n4` | Sidebar nav | Persona / Workflow / PLG / Labeled |
| `auto` `full` `min` | Sidebar footer | responsive / always rows / always in practice menu |

Named conditions live in `DEMO_PRESETS` in `src/lib/demoUrl.ts` — add, rename, or
drop them freely; any combination is reachable by spelling the tokens out either way.

## 3. A "Links" tab in the demo menu

The hamburger menu gains a fifth tab listing every named condition, with a copy
button for each and for whatever is on screen. Changing any selection rewrites the
URL in place (no history entry); clicking a named condition is a real navigation, so
Back and Forward step between conditions and restore the matching state.

## Pulling changes back to the original

`upstream` points at the original repo, so the two can be reconciled either way:

```sh
git fetch upstream
git log --oneline upstream/main..HEAD     # what this fork added
git cherry-pick <sha>                      # take one commit
```

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — `tsc -b` then `vite build`; a type error fails the build
- `npm run lint` — ESLint (4 errors and 1 warning are pre-existing, inherited from the original)
- `npm run preview` — serve the production build

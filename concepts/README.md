# Concepts

Standalone HTML explorations for the schedule app. Each file is self-contained — no build
step, no imports, no dependencies — and styled with the Enamel semantic tokens copied inline
so specimens stay honest against the real design system in both light and dark.

**Nothing in this folder is part of the Vite build.** It lives outside `src/` and `public/`,
so `npm run build` ignores it and none of it deploys with the app. It is version-controlled,
which is the point: iterate in place and let git carry the history.

## Viewing

```bash
npm run concepts
```

Serves this folder at <http://localhost:4321>, landing on `index.html` — the gallery.
Serving over HTTP rather than opening `file://` matters: it gets you the correct UTF-8
charset and lets the in-app browser tools load the page.

In Claude Code, the same thing is available as a preview target:

```
preview_start { "name": "concepts" }
```

## Iterating

Edit the `.html` file and reload. There's no HMR — these are static files by design.

When a concept is ready to share, publish it as an artifact. Republishing the **same file
path** keeps the **same URL**, so the link you've already sent someone stays current:

| Concept | Artifact |
|---|---|
| `patient-card-concepts.html` | <https://claude.ai/code/artifact/c2813725-7530-4064-9f8c-bca6644957e7> |
| `north-star-concepts.html` | <https://claude.ai/code/artifact/c015a219-3563-457c-a2e0-a3eb61ab4d0a> |

Artifacts are private until you share them from the page's share menu.

## Adding a concept

1. Drop a self-contained `.html` file in this folder.
2. Copy the `:root` / `@media (prefers-color-scheme: dark)` / `:root[data-theme="dark"]`
   token block from an existing file. All three blocks are required — the viewer's theme has
   three states, and a color defined only inside a media query renders one theme's text on
   the other theme's ground.
3. Add an `<a class="entry">` block to `index.html`.

### Conventions worth keeping

- **Use HTML entities for typography** (`&mdash;`, `&middot;`, `&ldquo;`) rather than literal
  characters. Static servers that omit a charset otherwise render them as mojibake.
- **Render specimens at true size.** If a component has a fixed footprint, set it explicitly
  and verify nothing clips — `scrollHeight > clientHeight` on the specimen is the check. A
  concept that only fits because the container grew isn't a concept, it's a wish.
- **Keep colors on tokens.** Reach for a literal hex only for the page chrome around the
  specimens, never inside one.

# Notebook Studio

<!-- docuserve:example-launch:start -->
> **[&#9654; Launch the live app](examples/notebook%5Fstudio/index.html)** — runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->


**Notebook Studio** is the flagship example: an interactive workbench that turns
three kinds of input — a terse **DSL**, raw **JSON**, or an **AI prompt** — into
a hand-drawn "notebook" diagram, rendered live in an embedded Excalidraw view.
It's the hands-on companion to the notebook-diagram generator that powers the
ecosystem's architecture diagrams.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Programmatic scene generation | `Generate-Notebook-Diagram.js` turns a fixture into an Excalidraw scene |
| Pushing a scene into a live view | `view.setScene(scene)` swaps the preview's contents |
| A compact diagram DSL | the DSL pane: `id: label (kind) {accent}` + `from -> to: label (kind)` |
| Structured fixtures | the JSON pane: `{ title, nodes, edges, layout }`, validated before every render |
| LLM-assisted authoring | the AI pane: `buildAIPrompt(description, fewShots)` → clipboard → paste the JSON back |
| Lossless export | SVG with the scene embedded (re-openable) + raw scene JSON |
| Node vocabulary | `rectangle`, `ellipse`, `diamond`, `note`; accents `{accent}` / `{link}`; `{background:highlight}` |

## Key files

- `Notebook-Studio-Application.js` — the studio actions (render, tab switching, AI prompt, export) and the built-in examples
- `Notebook-Studio-Helpers.js` — `parseStudioDSL`, `validateFixture`, `buildAIPrompt` (pure functions, DOM-free)
- `../../scripts/Generate-Notebook-Diagram.js` — the generator: fixture → Excalidraw scene
- `html/index.html` — the three-pane studio UI + live preview

## Three ways in

**1. DSL** — one node or edge per line, designed to be human-writable *and*
LLM-emittable:

```
title: service flow
layout: flow

user: User (ellipse)
api: API Gateway
auth: Auth {accent}
db: Database
cache: Cache (note) {background:highlight}

user -> api: request
api -> auth: verify
api -> db: query
api -> cache: lookup (dashed)
```

- `id: label (kind) {accent}` declares a **node**. `kind` ∈ `rectangle` (default), `ellipse`, `diamond`, `note`. Accent ∈ `ink`, `accent`, `highlight`, `link`, `deemphasis`; `{background:highlight}` fills a note. Use `\n` inside a label for a line break.
- `from -> to: label (kind)` declares an **edge**; `(dashed)` / `(dotted)` style it.
- `title:` / `layout: flow|grid|manual` set the diagram title and auto-layout; `# …` lines are comments.

**2. JSON** — the fixture the DSL compiles to, and exactly what the generator consumes:

```json
{
  "title": "service flow",
  "nodes": [
    { "id": "user", "label": "User", "kind": "ellipse" },
    { "id": "api",  "label": "API Gateway", "kind": "rectangle" }
  ],
  "edges": [
    { "from": "user", "to": "api", "label": "request" }
  ],
  "layout": "flow"
}
```

Parsing the DSL reflects the equivalent JSON into the JSON pane, so the two stay
in sync. `validateFixture` checks the shape before every render and reports any
problems in the status bar.

**3. AI prompt** — describe the diagram in prose; the studio wraps your
description with a couple of few-shot examples into a ready-to-paste prompt
(copied to your clipboard). Paste it into any LLM, then drop the returned JSON
into the JSON pane. This is the bridge from "I have a vague idea" to "I have a
structured fixture."

## Export

- **SVG** — `view.exportSvg({ exportEmbedScene: true })` writes a `.excalidraw.svg` with the scene embedded, so it re-opens losslessly in any pict-section-excalidraw view (not just as a flat picture).
- **Scene JSON** — the raw Excalidraw scene the generator produced, for committing or feeding to another tool.

## Relationship to the rest of the ecosystem

The same `Generate-Notebook-Diagram.js` generator is driven headlessly by
[pict-renderer-graph](https://fable-retold.github.io/pict-renderer-graph/) to
render this documentation's architecture diagrams from Mermaid. Notebook Studio
is the interactive way to feel out what that generator does — its node kinds,
accents, and layouts — before wiring it into a build.

# Notebook Studio

An example app for hand-crafting Excalidraw diagrams from a graph description. Three input modes, one live-rendered preview, full AI workflow.

## What it does

<!-- bespoke diagram: edit diagrams/what-it-does.mmd or .hints.json, then: npx pict-renderer-graph build modules/pict/pict-section-excalidraw/example_applications/notebook_studio -->
![What it does](diagrams/what-it-does.svg)

The DSL tab is a fast-path for users who already know the graph; the AI Prompt tab is the bridge between "I have a vague idea" and "I have valid fixture JSON".

## Three input modes

### 1. **DSL** — line-oriented mini-language

```
title: service flow

user: User (ellipse)
api: API Gateway
db: Database
cache: Cache (note) {background:highlight}

user -> api: request
api -> db: query
api -> cache: lookup (dashed)
```

Grammar:
- `<id>: <label> [(kind)] [{accent}]` — declares a node. Kind is `rectangle` (default) / `ellipse` / `diamond` / `note`. Accent is `accent` / `highlight` / `link` / `deemphasis` / `ink`.
- `<from> -> <to>: <label> [(kind)]` — declares an edge. Kind is `solid` (default) / `dashed` / `dotted`.
- `title: <text>` — diagram heading.
- `layout: flow|grid|manual` — auto-layout strategy (default `flow`).
- `# comment` — ignored.
- Blank lines ignored.

Nodes referenced by an edge but never declared get auto-declared with the id as the label.

### 2. **JSON** — direct fixture paste

The same shape `Generate-Notebook-Diagram.js` consumes:

```json
{
  "title": "service flow",
  "nodes": [
    { "id": "user", "label": "User", "kind": "ellipse" },
    { "id": "api",  "label": "API Gateway" }
  ],
  "edges": [
    { "from": "user", "to": "api", "label": "request" }
  ],
  "layout": "flow"
}
```

Use this tab to paste an LLM's response, or to fine-tune what the DSL parser produced (the DSL tab writes its parsed output to the JSON tab on every Render).

### 3. **AI Prompt** — for LLM-assisted authoring

Click **Copy AI Prompt** to put a fully-formed prompt on your clipboard. It includes:
- The complete TypeScript-like schema for the fixture shape
- Semantic guidance (when to use `accent`, when to use `note`, etc.)
- Few-shot examples drawn from the test fixtures
- Your free-text description as the final user turn

Paste into Claude / GPT / wherever. The LLM emits a JSON object → drop it into the **JSON** tab → click **Render**.

## Action buttons

| Button | What it does |
|---|---|
| **Render** | Parses the active tab's input + feeds the generator + paints the preview. |
| **Copy AI Prompt** | Builds a prompt embedding the schema, few-shots, and your description; copies to clipboard. |
| **Load example…** | Pre-fills all three tabs (and the description) with one of the built-in examples — read the DSL, read the JSON, and read the prompt side-by-side to see what each looks like. |
| **Export SVG** | Downloads `notebook-diagram.excalidraw.svg` with the scene embedded as `<metadata>` so it round-trips back into any pict-section-excalidraw view. |
| **Export JSON** | Downloads the full Excalidraw scene JSON. Same content the AI prompt + generator produce. |

## Why three modes (not just AI)

- **DSL** is faster than JSON when you already know the graph — fewer keystrokes, no escaping, line-by-line edits are obvious in source control.
- **JSON** is the canonical contract: stable, validated, the only shape the generator promises to keep working. AI output lands here, and any tooling that needs deterministic output drives this tab.
- **AI Prompt** is the bridge — most people don't already know the structure of a diagram in their head, they have an *intent*. The prompt makes the LLM do the schema work.

All three modes converge on the same JSON, the same generator, the same renderer.

## Running

```bash
cd example_applications/notebook_studio
npm install
npm run build
npx http-server dist -p 44482 -c-1 --silent
# open http://localhost:44482/
```

Or via the launch.json entry: **excalidraw-notebook-studio** (port 44482).

## Implementation notes

- The DSL parser + prompt builder + validator live in [`Notebook-Studio-Helpers.js`](Notebook-Studio-Helpers.js). They're all pure-data functions — no DOM, no pict — so they can be loaded from a node CLI too.
- The pict app at [`Notebook-Studio-Application.js`](Notebook-Studio-Application.js) instantiates a single `pict-section-excalidraw.ReactView` for the preview and wires the inline button onclicks to its own methods.
- Few-shot examples are inlined into the application (see `_FEW_SHOTS` and `_EXAMPLES`). Edit them to bias your prompts toward your own preferred shape.

## Tuning the prompt for your style

The default prompt asks the LLM to choose **structure** but never **palette / roughness / font / wobble** — those are owned by `source/style-profiles/Notebook-Default.js`. To match a specific notebook style:

1. Sample 3-5 actual notebook diagrams of yours.
2. Copy `Notebook-Default.js` to a new file (e.g. `Notebook-Steven.js`).
3. Edit the palette + roughness + font + seed salt to match your samples.
4. In the studio app's preview view configuration (`_PreviewConfiguration` in the application file), pass the new profile to `generateNotebookDiagram(fixture, profile)`.

The AI prompt doesn't change — only the renderer does. The same input JSON renders in different "hands" depending on which profile you compose with.

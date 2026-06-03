# Notebook diagram fixtures

These JSON files are the shape an AI (or any caller) is expected to produce when generating a notebook-style diagram with `scripts/Generate-Notebook-Diagram.js`.

Each file describes a diagram **structurally** — nodes and edges with intent labels — and leaves the hand-drawn aesthetic to the style profile + renderer:

```json
{
  "title":  "<optional heading>",
  "nodes":  [ { "id": "...", "label": "...", "kind": "rectangle|ellipse|diamond|note", "accent": "ink|accent|highlight|link|deemphasis", "background": "...", "x?": 0, "y?": 0 } ],
  "edges":  [ { "from": "...", "to": "...", "label": "...", "kind": "solid|dashed|dotted", "accent": "..." } ],
  "layout": "flow|grid|manual"
}
```

## Files

| File | What it demonstrates |
|---|---|
| `service-flow.json` | The canonical 4-edge service-call flow. Mix of shape kinds (ellipse for actor, rectangle for service, note for cache). Demonstrates `accent`, `background`, and a dashed edge. |
| `decision-tree.json` | A 6-node decision flow with diamond gates. Demonstrates `diamond` kind and a dotted "and" edge. |
| `mental-model.json` | A 7-node architecture diagram with two-line node labels. Demonstrates `\n` in labels and dashed alternate-path edges. |

## Running them

Generate the scene JSON without a browser:

```bash
node scripts/Generate-Notebook-Diagram.js \
    test/fixtures/notebook-diagrams/service-flow.json \
    /tmp/service-flow.excalidraw.json
```

Generate **and** render to SVG + PNG via puppeteer (uses the wrapper bundle in a real chromium):

```bash
npm run test:e2e                      # runs the default fixture (service-flow)
npm run test:e2e -- decision-tree     # specific fixture (positional arg)
npm run test:e2e -- mental-model
```

Outputs land in `test/output/`:
- `notebook-e2e.scene.json` — the generator's output
- `notebook-e2e.excalidraw.svg` — the SVG (with embedded scene for re-edit)
- `notebook-e2e.screenshot.png` — what the Excalidraw canvas looks like

## The AI workflow

<!-- bespoke diagram: edit diagrams/the-ai-workflow.mmd or .hints.json, then: npx pict-renderer-graph build modules/pict/pict-section-excalidraw/test/fixtures/notebook-diagrams -->
![The AI workflow](diagrams/the-ai-workflow.svg)

The fixture-shape JSON is **stable and small** — every field is documented above. An LLM prompt of the form:

> Produce a notebook-style diagram describing **<topic>**. Output a single JSON object with `title`, `nodes`, and `edges` fields per the schema below. Use `accent: "accent"` to call out important nodes and `kind: "dashed"` for alternate paths.

…produces output the generator accepts as-is. Nothing about the visual style needs to be in the prompt — the style profile owns palette / roughness / font / wobble / hachure fills, and the same input always wobbles the same way (deterministic seed) so iterative refinement is stable.

## Tuning the look

The aesthetic is owned by `source/style-profiles/Notebook-Default.js`. To match a personal notebook style:

1. Sample 3-5 actual notebook diagrams
2. Identify the dominant ink, accent, and highlight colors
3. Set `Palette.ink`, `.accent`, `.highlight` in the profile
4. Decide `Roughness` (0/1/2), `FillStyle` (`hachure`/`cross-hatch`/`zigzag`/`solid`/null), `StrokeWidth`, `FontFamily`
5. Bump `RandomSeedSalt` to re-roll the wobble across the whole diagram

Copy the profile to a new file under `source/style-profiles/` and pass it as the second arg to `generateNotebookDiagram(input, profile)`.

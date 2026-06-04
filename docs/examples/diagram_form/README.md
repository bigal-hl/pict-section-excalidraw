# Diagram Form

<!-- docuserve:example-launch:start -->
> **[&#9654; Launch the live app](examples/diagram%5Fform/index.html)** — runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->

**Diagram Form** is the smallest possible demonstration of the `Diagram`
InputType. A pict-section-form with exactly one field. Boots in view mode
(inline SVG), flips into Excalidraw on demand, and themeifies the SVG on
every save so the stored value resolves CSS variables on render.

The `Diagram` InputType + its provider class live in **pict-section-form**
(see [the Input Type doc](https://fable-retold.github.io/pict-section-form/#/page/input%5Fproviders/015-diagram)).
The provider lazy-requires this module on the first edit toggle — that's
why the Excalidraw vendor bundle isn't fetched at boot.

For the same InputType inside a real-feeling character-sheet form
alongside `Text` / `Number` / `Option` / `TextArea` / `RichText` fields,
see [Superhero Studio](../superhero%5Fstudio/README.md).

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| `Pict-Input-Diagram` provider registration | One `pict.addProvider(libPictSectionForm.DiagramInput.default_configuration, …)` call wires it into the form |
| Per-field runtime mode toggle | `provider.toggleMode('ArchDiagram', cb)` flips view ↔ edit |
| View-mode inline SVG | The provider writes the stored SVG verbatim into the slot; no Excalidraw bundle loaded |
| Edit-mode Excalidraw mount | First `setMode('edit')` lazy-loads the React vendor + wrapper, then mounts Excalidraw |
| Themeify-on-save | `Diagram.ThemeColors: true` runs the exported SVG through `themeifySVG()` before stamping into the form input |
| Live theme swap | Three swatches on the page hot-swap `--diagram-*` CSS variables; the view-mode SVG re-colors without a re-render |

## Key files

- `DiagramForm-Example-Application.js` — the app. Registers the Diagram input provider, defines a one-field form manifest, seeds an inline demo SVG.
- `html/index.html` — page chrome: the toggle button, three theme swatches, and a `<style id="diagram-theme">` block that owns the live tokens.

## The form descriptor

The shape is plain. The `Diagram` block carries the few provider-specific knobs:

```javascript
'ArchDiagram': {
    Name:     'Architecture Diagram',
    Hash:     'ArchDiagram',
    DataType: 'String',
    PictForm:
    {
        Section:   'Diagram',
        Row:       1,
        Width:     12,
        InputType: 'Diagram',
        Diagram:
        {
            ThemeColors:          true,    // pass the SVG through themeifySVG on save
            Height:               '480px', // applied to the slot in edit mode
            EditorImplementation: 'react'  // "react" or "iframe" — dispatches to PictView-Excalidraw-React/-Iframe
        }
    }
}
```

The stored value is the **Excalidraw-exported SVG with embedded scene metadata**. View mode writes it into the slot directly. Edit mode reads the scene back out of the metadata via `vendor.loadFromBlob` and seeds Excalidraw with it — so round-tripping an existing diagram into edit mode never loses the original strokes.

## Feature 1 — Themeify-on-save

When the user finishes drawing and the throttled `OnChange` fires:

1. The provider calls `view.exportSvg({ exportEmbedScene: true, exportBackground: false })`.
2. With `ThemeColors: true`, the result passes through `themeifySVG()` — every `stroke="#1B1F23"` becomes `stroke="var(--diagram-ink, #1B1F23)"`, and the metadata block is preserved byte-for-byte.
3. The transformed SVG is stamped into the hidden form `<input>` and a `change` event fires so Informary picks it up.

The default palette tokens cover ink, paper, accent, highlight, deemphasis, link. Colors outside that palette stay raw (the regex anchors on `stroke=`/`fill=` followed by exactly one of the palette hex values).

## Feature 2 — Live theme swap

The page's `<style id="diagram-theme">` block defines the tokens:

```css
:root {
    --diagram-ink:        #1B1F23;
    --diagram-paper:      #FDFCF7;
    --diagram-accent:     #E66C2C;
    --diagram-highlight:  #FFD966;
    --diagram-deemphasis: #A0A0A0;
    --diagram-link:       #2E7D74;
}
```

Clicking a swatch calls `applyTheme(name)` which rewrites the `<style>` block. The view-mode SVG already carries `var(--diagram-*, fallback)` references, so the visible diagram re-colors with no app interaction. Open DevTools and confirm — no module code runs during the swap.

## Feature 3 — Save round-trip preservation

Excalidraw's `exportToSvg({ exportEmbedScene: true })` writes a `<metadata>` block carrying a base64-encoded scene. `themeifySVG()` is metadata-safe: it carves the block out before its regex pass and reinserts it verbatim afterward. The stored SVG is a valid Excalidraw export — drop it into the [embedded_excalidraw](../embedded%5Fexcalidraw/README.md) demo or [full_browser_excalidraw](../full%5Fbrowser%5Fexcalidraw/README.md) and it loads with the original elements intact.

## Running the example

```sh
cd modules/pict/pict-section-excalidraw/example_applications/diagram_form
npm install
npx quack build && npx quack copy
open dist/index.html
```

The Excalidraw vendor bundle must already be present at `pict-section-excalidraw/vendor/excalidraw-built/`. Run `npm run build:vendor` from the module root once if it isn't.

## Takeaways

1. **One provider registration enables the InputType for every form on the Pict instance.** Templates are auto-injected; CSS is auto-registered; the form just sees `InputType: 'Diagram'`.
2. **View mode is free.** Until a field flips to edit, the Excalidraw vendor isn't fetched. Read-mostly views never pay for the canvas runtime.
3. **Theme is a property of the stored SVG, not of the app session.** Every saved diagram carries the same `var(...)` references with hex fallbacks; a host that swaps tokens later still gets correct rendering. A host with no theme provider gets the original notebook palette via the fallbacks.

## Related documentation

- [Superhero Studio](../superhero%5Fstudio/README.md) — the same Diagram InputType inside a real character-sheet form.
- [Embedded Excalidraw](../embedded%5Fexcalidraw/README.md) — the underlying view, not yet wrapped as a form input.
- [Notebook Studio](../notebook%5Fstudio/README.md) — programmatic scene generation; pair with the Diagram input for pre-baked-then-editable diagrams.

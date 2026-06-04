# Superhero Studio

<!-- docuserve:example-launch:start -->
> **[&#9654; Launch the live app](examples/superhero%5Fstudio/index.html)** — runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->

**Superhero Studio** is the showcase for the two new complex InputTypes
in pict-section-form — `RichText`
([docs](https://fable-retold.github.io/pict-section-form/#/page/input%5Fproviders/014-rich-text))
and `Diagram`
([docs](https://fable-retold.github.io/pict-section-form/#/page/input%5Fproviders/015-diagram))
— both living inside the same form alongside stock `Text`, `Number`,
`Option`, and `TextArea` inputs. A dropdown at the top loads one of five
pre-baked superheroes; the form's portrait recolors with the active theme
in real time.

Both providers live in pict-section-form and lazy-require their host
editor modules (pict-section-markdowneditor for RichText,
pict-section-excalidraw for Diagram) on the first edit toggle, so the
view-by-default boot loads neither CodeMirror nor the Excalidraw vendor.

If the [Diagram Form](../diagram%5Fform/README.md) and [RichText Form Input](https://fable-retold.github.io/pict-section-markdowneditor/#/page/examples/richtext%5Fform/README)
demos each show one InputType in isolation, this one is what happens when
you let them share a record.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Compound form, mixed InputTypes | One `DefaultFormManifest` with `Text` / `Number` / `Option` / `TextArea` / `RichText` / `Diagram` fields |
| Per-field runtime mode toggle | `provider.toggleMode(hash, cb)` flips Portrait or Origin Story between view and edit; the rest of the form stays put |
| View-by-default boot | The page loads with rendered markdown + inline SVG — no CodeMirror, no Excalidraw — until you click Edit |
| Themeified SVG | Portraits use `var(--diagram-ink, #...)` etc. with hex fallbacks; theme swatches recolor every portrait without a re-render |
| Record swap without leaking instances | Loading a new hero from the dropdown calls `setMode('view')` on any open editors first, then swaps `AppData` and re-marshals |
| Pluggable image uploader for RichText | `PictForm.RichText.ImageUploader: 'uploadImage'` routes pastes through `pict.PictApplication.uploadImage(file, descriptor, cb)` |

## Key files

- `SuperheroStudio-Example-Application.js` — the app. Registers both input providers, defines the `_Descriptors` map (12 fields), owns the dropdown / toggle handlers, and stubs the `uploadImage` callback.
- `superheroes/Superheroes.js` — five hero dossiers. Each entry carries identity + powers stats, a hand-illustrated themed SVG portrait, and a markdown origin story.
- `html/index.html` — page chrome: the hero-select dropdown, four theme swatches that hot-swap `--diagram-*` CSS variables, and the per-field Edit/Done buttons that call `provider.toggleMode`.
- `preview/portraits.html` — a static, build-free preview of the five portraits under all four themes. Useful for inspecting the SVGs without building the full app.

## The form manifest

Four sections, twelve fields. Each `Descriptor` selects its `InputType`:

```javascript
const _Descriptors =
{
    'Name':         { Name: 'Name',         DataType: 'String', PictForm: { Section: 'Identity', Width:  6, InputType: 'Text'   } },
    'AlterEgo':     { Name: 'Alter Ego',    DataType: 'String', PictForm: { Section: 'Identity', Width:  6, InputType: 'Text'   } },
    'ShoeSize':     { Name: 'Shoe Size',    DataType: 'Number', PictForm: { Section: 'Identity', Width:  3, InputType: 'Number', Min: 1, Max: 22, Step: 0.5 } },
    'OriginYear':   { Name: 'Origin Year',  DataType: 'Number', PictForm: { Section: 'Identity', Width:  3, InputType: 'Number', Min: 1900, Max: 2099 } },

    'PowerLevel':   { Name: 'Power Level',  DataType: 'Number', PictForm: { Section: 'Powers',   Width:  3, InputType: 'Number', Min: 1, Max: 10 } },
    'PrimaryPower': { Name: 'Primary Power',DataType: 'String', PictForm: { Section: 'Powers',   Width:  5, InputType: 'Option', SelectOptions: _PowerOptions } },
    'ThemeColor':   { Name: 'Theme Color',  DataType: 'String', PictForm: { Section: 'Powers',   Width:  4, InputType: 'Option', SelectOptions: _ColorOptions } },
    'Catchphrase':  { Name: 'Catchphrase',  DataType: 'String', PictForm: { Section: 'Powers',   Width: 12, InputType: 'TextArea', TextAreaRows: 2 } },

    'Portrait':     { Name: 'Portrait',     DataType: 'String',
        PictForm:
        {
            Section:   'Portrait',
            Width:     12,
            InputType: 'Diagram',
            Diagram:   { ThemeColors: true, Height: '320px', EditorImplementation: 'react' }
        }
    },

    'OriginStory':  { Name: 'Origin Story', DataType: 'String',
        PictForm:
        {
            Section:   'OriginStory',
            Width:     12,
            InputType: 'RichText',
            RichText:  { AllowImages: true, ImageUploader: 'uploadImage', Height: '380px' }
        }
    }
};
```

The two complex InputTypes don't need anything more elaborate than the stock ones — they just look up their template hash in pict-section-form's `DynamicTemplates` registry (which the providers populated at construction time).

## Feature 1 — View-by-default with lazy editor mount

The form boots with **every** RichText and Diagram field in view mode. The page renders pre-parsed markdown into the Origin Story slot and writes the saved SVG verbatim into the Portrait slot — that's it. Neither CodeMirror nor the Excalidraw React bundle has been touched. Open the DevTools Network tab on a fresh load and confirm: no `vendor`-side requests fire.

A field flips into edit mode on user demand:

```javascript
demo_toggleMode(pInputHash)
{
    let tmpProvider = this._providerForInput(pInputHash);
    tmpProvider.toggleMode(pInputHash, (pErr) =>
    {
        this._refreshToggleLabels();   // updates the button text "Edit" ↔ "Done"
    });
}
```

The provider's `setMode('edit', cb)` is what triggers the lazy load. Form-mostly-read consumers (dashboards, audit logs, read-only beacons) pay for neither editor bundle.

## Feature 2 — Themeified portrait SVGs

The portraits use a small palette of theme tokens, each paired with a hex fallback so the SVG is correct standalone (file viewer, `<img>` tag, etc.):

```html
<rect ... stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)"/>
<path ... stroke="var(--diagram-accent, #E66C2C)"/>
```

The page defines the tokens in a `<style id="diagram-theme">` block and `applyTheme(name)` rewrites it. The portrait SVGs re-color instantly — no app interaction, no re-render. The same `themeifySVG()` pass is the **default-on save path** in the Diagram input provider, so user-drawn portraits inherit the same theme contract automatically.

Try it: notebook → dark → blueprint → sepia. Vector Vince's CAD grid adapts. The Modal Avenger's title bar tracks the accent. Captain Verbose's thought-bubble dotted outline stays legible against either light or dark paper.

## Feature 3 — Swapping records cleanly

When the dropdown changes, the app needs to:

1. Fold any open editors back to view mode (so the next hero doesn't inherit yesterday's CodeMirror instance).
2. Replace `AppData.SuperheroForm` with the new hero's record.
3. Push the new record into the rendered form via `marshalDataFromAppDataToView()`.

The implementation:

```javascript
demo_loadHero(pSlug)
{
    let tmpHero = libSuperheroes[pSlug];
    if (!tmpHero) return;
    this._currentHeroSlug = pSlug;

    this._foldAllEditors();
    this.pict.AppData.SuperheroForm = JSON.parse(JSON.stringify(tmpHero));
    this.marshalDataFromAppDataToView();

    this._refreshToggleLabels();
}
```

`_foldAllEditors()` walks the known complex-input hashes and calls `provider.setMode('view')` on any that are currently `'edit'`. The provider tears down the editor view, frees its AppData stash, and re-renders the slot in view mode using the value it had last seen. Then the marshal step paints the new hero on top.

## Feature 4 — Image upload routed through the application

The Origin Story field has `AllowImages: true` and names an uploader. When the user pastes or drops an image, the RichText provider dispatches to `pict.PictApplication.uploadImage`:

```javascript
uploadImage(pFile, pInputDescriptor, fCallback)
{
    setTimeout(() =>
    {
        let tmpFakeURL = '/uploads/heroes/' + Date.now() + '-' +
            (pFile.name || 'image.png').replace(/[^A-Za-z0-9._-]/g, '_');
        fCallback(null, tmpFakeURL);
    }, 600);
    return true;   // we are handling this asynchronously
}
```

Returning `true` signals to the underlying `pict-section-markdowneditor` that the caller will resolve the URL. A real app would POST to its storage endpoint here. Set `AllowImages: false` to refuse images entirely; the editor surfaces the rejection in a status pill instead of inserting a half-baked data URI.

## The five superheroes

Each carries enough material to fill the form and demonstrate the rendering paths:

| Hero | Alter Ego | Why they're in the demo |
|---|---|---|
| Captain Verbose | Quintus Pedantic | Stress-tests the markdown viewer with a long, structured origin (headings, blockquotes, lists) |
| The Notebook | Margot Quill | Triple-quote code block + the manifestation-via-art metaphor that frames the studio itself |
| Markdown Marauder | Hex Brackets | Tables, inline code, `~~strikethrough~~`, and a `>` blockquote that recursively quotes itself |
| The Modal Avenger | Alice DialogBox | A short story carrying the Z-index humour; portrait has live Confirm/Cancel buttons inside the SVG |
| Vector Vince | Vince Bezier | Geometric primitives only — checks that strict-shape portraits don't bleed across themes |

## Running the example

```sh
cd modules/pict/pict-section-excalidraw/example_applications/superhero_studio
npm install
npx quack build && npx quack copy
open dist/index.html
```

The Excalidraw vendor bundle must already be present at `pict-section-excalidraw/vendor/excalidraw-built/`. If it isn't, run `npm run build:vendor` from the module root once.

## Takeaways

1. **Both new InputTypes work alongside the stock catalog without ceremony.** A form descriptor sets `PictForm.InputType: 'RichText'` or `'Diagram'` and the rest is the same shape as `Text`, `Number`, etc.
2. **View-by-default isn't just a default — it's a load-time guarantee.** Until you toggle, no editor bundle is fetched. That's the design pivot that makes these complex inputs cheap to scatter through a large form.
3. **Theme is data, not paint.** Saving a portrait runs it through `themeifySVG()` so the stored SVG carries theme tokens with hex fallbacks. The host can rewrite tokens after the fact; the portrait re-colors live.
4. **Record swaps need an editor-fold step.** Without it, the next record inherits a stale CodeMirror or Excalidraw instance. `_foldAllEditors()` is two lines and worth it.
5. **The image uploader is the host's contract.** Every consuming app can plug its own storage backend in — no PR to pict-section-markdowneditor required.

## Related documentation

- [Diagram Form](../diagram%5Fform/README.md) — the Diagram InputType in isolation.
- [richtext_form](https://fable-retold.github.io/pict-section-markdowneditor/examples/richtext_form/) — the RichText InputType in isolation (in the sister module).
- [Notebook Studio](../notebook%5Fstudio/README.md) — programmatic scene generation; useful if you want to pre-bake portraits via JSON.
- [pict-section-form input types](https://fable-retold.github.io/pict-section-form/#/page/Input%5FTypes) — the stock InputType catalog.

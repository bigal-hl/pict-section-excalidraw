# Full-Browser Excalidraw

<!-- docuserve:example-launch:start -->
> **[&#9654; Launch the live app](examples/full%5Fbrowser%5Fexcalidraw/index.html)** — runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->


**Full-Browser Excalidraw** is the minimal, maximal embed: the drawing surface
fills the whole viewport and persistence uses Pict's **default `AppData`
binding** — no custom callbacks, no glue. It's the shortest path to "Excalidraw,
but inside my Pict app," and the right starting point before you reach for the
custom-storage pattern.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Full-viewport mount | `TargetElementAddress: "#ExcalidrawContainer"` fills the page |
| Default persistence | `DrawingDataAddress: "AppData.Drawing"` — the scene lives in app data |
| Seeded empty scene | `DefaultAppData.Drawing = { elements: [], appState: {}, files: {} }` |
| Theme + assets | `Theme: "light"`, `AssetBaseURL: "./excalidraw-assets/"` |

## Key files

- `FullBrowserExcalidraw-Example-Application.js` — the view configuration and application (zero callbacks)
- `html/index.html` — a single full-bleed container

## The view configuration

```javascript
{
    ViewIdentifier:       "FullBrowserExcalidrawView",
    TargetElementAddress: "#ExcalidrawContainer",
    DrawingDataAddress:   "AppData.Drawing",   // scene is read/written here automatically
    Theme:                "light",
    AssetBaseURL:         "./excalidraw-assets/"
}
```

With `DrawingDataAddress` set and no `OnLoad` / `OnSave`, the view reads the
initial scene from `AppData.Drawing` and writes edits back to it as the user
draws — so the scene becomes part of your serializable app state for free.
Seed it through `DefaultAppData`:

```javascript
"DefaultAppData": { "Drawing": { "elements": [], "appState": {}, "files": {} } }
```

> **Contrast:** the [Embedded Excalidraw](#/page/examples/embedded_excalidraw/README)
> example overrides this with custom `OnLoad` / `OnSave` (localStorage) and puts
> the canvas in a small card instead of the whole window.

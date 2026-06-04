# Embedded Excalidraw

<!-- docuserve:example-launch:start -->
> **[&#9654; Launch the live app](examples/embedded%5Fexcalidraw/index.html)** — runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->


**Embedded Excalidraw** drops the drawing surface into a small card on an
otherwise-busy page — not full-screen — and replaces Pict's default AppData
persistence with **custom `OnLoad` / `OnSave` callbacks** backed by
`localStorage`. It's the pattern to copy when Excalidraw is one widget among
many and your app owns where the scene lives (Meadow, a REST API, IndexedDB,
the file system, …).

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Embedding in a sized container | `TargetElementAddress: "#ExcalidrawSmallBox"` — a 440px card, not the viewport |
| Custom load | `OnLoad(view, cb)` reads + parses a scene from `localStorage` |
| Custom save | `OnSave(view, sceneData, cb)` writes the scene back to `localStorage` |
| Change notifications | `OnChange(view, scene)` updates a status line on every (throttled) edit |
| Imperative API | the sidebar buttons call `view.save()`, `view.load()`, `view.exportSvg()` |
| Theme + assets | `Theme: "light"`, `AssetBaseURL: "./excalidraw-assets/"` |

## Key files

- `EmbeddedExcalidraw-Example-Application.js` — the view configuration (the callbacks) and the application
- `html/index.html` — the page chrome (diagram card + sidebar) and the Save / Reload / Clear / Download-SVG buttons

## The view configuration

The entire behavior is configuration on a `ReactView` subclass:

```javascript
{
    ViewIdentifier:       "EmbeddedExcalidrawView",
    TargetElementAddress: "#ExcalidrawSmallBox",   // a sized card, not the page
    Theme:                "light",
    AssetBaseURL:         "./excalidraw-assets/",

    OnLoad:   (pView, fCallback)             => { /* read localStorage → fCallback(err, scene) */ },
    OnSave:   (pView, pSceneData, fCallback) => { /* write localStorage → fCallback(err) */ },
    OnChange: (pView, pScene)                => { /* per-edit notification (status line) */ }
}
```

Supplying `OnLoad` / `OnSave` switches the view **out of** AppData binding and
hands persistence entirely to you — `view.save()` invokes your `OnSave`, and
`view.load()` invokes your `OnLoad`. Swap the `localStorage` body for a Meadow
write or a `fetch()` and nothing else changes.

## Save / load / export

The sidebar wires the public API directly:

```javascript
_Pict.views.EmbeddedExcalidrawView.save();          // → your OnSave
_Pict.views.EmbeddedExcalidrawView.load();          // → your OnLoad
_Pict.views.EmbeddedExcalidrawView.exportSvg({});   // → an <svg> element, downloaded as a blob
```

> **Contrast:** the [Full-Browser Excalidraw](#/page/examples/full_browser_excalidraw/README)
> example keeps the *default* persistence — it binds the scene to `AppData` via
> `DrawingDataAddress` and writes no callbacks at all. Start there for the
> simplest setup; come here when you need to own the storage.

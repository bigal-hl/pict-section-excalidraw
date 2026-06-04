# Pict Section Excalidraw

> An embeddable, themable Excalidraw drawing control for Pict applications

Wraps [Excalidraw](https://excalidraw.com) as a first-class Pict view. Drop it into any `<div>` to get a full whiteboard / diagramming canvas with save/load hooks, pict-theme conformance, and two embedding strategies that share one public API.

- **Two Embed Modes** -- React-mount (default) for tight theme conformance, or iframe for total CSS isolation
- **Pluggable Save/Load** -- `OnLoad` / `OnSave` / `OnChange` callbacks bind to localStorage, a Meadow record, IndexedDB, or any remote API
- **AppData Binding** -- two-way bind the scene JSON to a `pict.AppData` address with one option
- **Theme Bridge** -- pict-section-theme tokens are forwarded into Excalidraw's own CSS variables; switching themes re-tints without re-rendering
- **Export** -- pull the current scene out as an SVG element, a PNG blob, or an `.excalidraw` JSON string
- **Mermaid Import** -- convert a mermaid source string into Excalidraw elements (React mode)
- **Vendored** -- the full Excalidraw monorepo is mirrored under `vendor/` so the module survives upstream drift

[Overview](README.md)
[Quick Start](quickstart.md)
[Architecture](architecture.md)
[GitHub](https://github.com/fable-retold/pict-section-excalidraw)

<!-- docuserve:examples:start -->
| Example | Complexity | Launch |
|---------|------------|--------|
| [Embedded Excalidraw](examples/embedded%5Fexcalidraw/README.md) | Beginner | [&#9654; Launch](examples/embedded%5Fexcalidraw/index.html) |
| [Full-Browser Excalidraw](examples/full%5Fbrowser%5Fexcalidraw/README.md) | Beginner | [&#9654; Launch](examples/full%5Fbrowser%5Fexcalidraw/index.html) |
| [Notebook Studio](examples/notebook%5Fstudio/README.md) | Advanced | [&#9654; Launch](examples/notebook%5Fstudio/index.html) |
<!-- docuserve:examples:end -->

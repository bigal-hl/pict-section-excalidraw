# Vendor mirror maintenance

The `vendor/excalidraw/` tree is a frozen-in-time mirror of the [excalidraw monorepo](https://github.com/excalidraw/excalidraw). It has no `.git/` — it's a fork in spirit, not in git lineage. **Drift from upstream is intentional**: this insulates the Retold ecosystem from upstream packaging changes, deprecations, or GitHub disappearing.

This document is the playbook for refreshing the mirror when we want to pick up upstream improvements.

## Directory layout

```
vendor/
├── CLAUDE.md                  ← this file
├── excalidraw/                ← upstream source mirror (committed; ~55MB)
│   ├── packages/excalidraw/   ← the React component we wrap
│   ├── excalidraw-app/        ← the full excalidraw.com app (we don't ship this)
│   ├── packages/common/, element/, math/, utils/, …  ← workspace internals
│   └── package.json           ← yarn 1.22.22 workspace root
└── excalidraw-built/          ← committed build output (ships to consumers; ~29MB)
    ├── excalidraw-wrapper.min.js   ← React + ReactDOM + Excalidraw, IIFE
    ├── excalidraw-wrapper.css       ← Excalidraw's stylesheet
    ├── excalidraw-iframe-host.html  ← iframe-mode host page
    ├── excalidraw-iframe-host.js    ← iframe-mode host script
    └── assets/                      ← fonts + locale chunks + worker chunks
```

**Both directories are committed.** `vendor/excalidraw/node_modules/` is gitignored (it's ~928MB).

The published npm package ships **`vendor/excalidraw-built/` only**, never the source mirror — see `package.json#files`. Consumers do `npm install pict-section-excalidraw` and get the built artifacts; the mirror is for in-repo development only.

## When to refresh

Refresh when:
- Upstream ships a feature you want (new shape types, mermaid improvements, perf wins).
- A security advisory affects a transitive dependency in `vendor/excalidraw/yarn.lock`.
- Excalidraw's scene-data format version bumps (rare, but disruptive — existing `.excalidraw.svg` files may need migration).

Do **not** refresh on every upstream release. Stability beats currency. A working frozen mirror is more valuable than a freshly-broken one.

## How to refresh

### 1. Stash any local patches

```bash
cd vendor/excalidraw
# If we've made local patches (search for "// PICT-PATCH" comments), document them:
grep -rn "PICT-PATCH" packages/ excalidraw-app/ 2>/dev/null | tee ../../docs/known-patches.txt
```

There are no local patches as of the initial vendor (2026-05-23). If we ever add one, mark it with `// PICT-PATCH: <reason>` so this grep finds it.

### 2. Refresh the source

```bash
cd modules/pict/pict-section-excalidraw/vendor
mv excalidraw excalidraw.old
git clone --depth=1 https://github.com/excalidraw/excalidraw.git excalidraw
rm -rf excalidraw/.git
```

Compare the new tree against the old to spot structural changes:

```bash
diff -rq excalidraw.old/packages/excalidraw/src excalidraw/packages/excalidraw/src | head -40
```

Particular files that matter to us:

| File | Why it matters |
|---|---|
| `packages/excalidraw/package.json` | Peer-dep React range, dependency list — our wrapper script may need updating. |
| `packages/excalidraw/index.ts` (top-level exports) | Which named exports the wrapper re-exposes as window globals. If they renamed `exportToSvg`, our bundle breaks at runtime. |
| `scripts/buildPackage.js` | The build pipeline. If they swap esbuild for something else, our `yarn build:packages` will need updating. |
| Any file referencing `import.meta.env.VITE_APP_*` | Each `VITE_APP_*` env read needs a corresponding `define` entry in our `scripts/Build-Vendor-Bundles.js`, otherwise it becomes `undefined.PROPERTY` at runtime and the bundle crashes. **This is the most common refresh-breaks-things failure mode.** |

To find all `VITE_APP_*` references in the new source:

```bash
grep -rn "import\.meta\.env\.VITE_APP_" excalidraw/packages/ excalidraw/excalidraw-app/ | awk -F'VITE_APP_' '{print $2}' | awk -F'[^A-Z_]' '{print $1}' | sort -u
```

Compare against the keys in `scripts/Build-Vendor-Bundles.js`'s `define` block. Add `define` entries for any new ones — values should mirror what Vite would produce in a production build (usually `'""'` for strings, `false` for feature flags).

### 3. Reinstall + rebuild

```bash
cd vendor/excalidraw
corepack enable                       # if yarn isn't on PATH
yarn install --ignore-scripts         # ~30-60s, ~928MB into node_modules
yarn build:packages                   # ~30s, populates packages/*/dist
cd ../..
node scripts/Build-Vendor-Bundles.js  # ~5s, writes vendor/excalidraw-built/
```

If the build script errors with `Invalid define value` or `is not available with the "iife" output format`, that's a missing `import.meta.env.*` define — see step 2.

### 4. Verify

Run the unit tests + both demo apps:

```bash
npm test                                                       # 15 tests must still pass
cd example_applications/full_browser_excalidraw && npm run build && cd ../..
cd example_applications/embedded_excalidraw     && npm run build && cd ../..
```

Then preview-start the full-browser demo and confirm Excalidraw mounts, you can draw, and the toolbar works. The "Export SVG" button is a good smoke test — it exercises `exportSvg` which exercises the worker chunks (a place upstream churn often shows up).

For the round-trip test, draw a few shapes, click "Save to AppData", check `_Pict.AppData.Drawing` in the console — confirm the scene round-trips. Then reload the page and confirm the same scene is restored.

### 5. Bump the version + changelog

```bash
# In package.json, bump the version and note the excalidraw version we tracked to.
# Example: "version": "1.1.0" → "1.2.0" with a note in CHANGELOG.md:
#   - vendor mirror refreshed to upstream <excalidraw version>; no API changes.
```

If the refresh **does** change the public surface (new exports we want to expose, removed exports we relied on), bump the minor version and document the migration in the consumer-facing README.

### 6. Drop the old mirror

```bash
rm -rf vendor/excalidraw.old
```

Only do this **after** the build verifies. Keep `.old` around while you debug refresh issues.

## What lives in `excalidraw-built/`

Everything in `excalidraw-built/` is regenerated by `npm run build:vendor`. Consumers don't need to rebuild — these are committed.

| File | Built from | Purpose |
|---|---|---|
| `excalidraw-wrapper.min.js` | Synthesized `__entry.js` + `vendor/excalidraw/node_modules/{react,react-dom,@excalidraw/excalidraw}` via esbuild IIFE | Exposes `window.PictSectionExcalidrawVendor` |
| `excalidraw-wrapper.css` | `vendor/excalidraw/packages/excalidraw/dist/prod/index.css` (copy) | Excalidraw's own stylesheet |
| `excalidraw-iframe-host.html` | `source/iframe-host/excalidraw-iframe-host.html` (copy) | iframe-mode host page |
| `excalidraw-iframe-host.js` | `source/iframe-host/excalidraw-iframe-host.js` (copy) | iframe-mode postMessage adapter |
| `assets/fonts/`, `assets/locales/`, `assets/chunk-*.js` | `vendor/excalidraw/packages/excalidraw/dist/prod/` (copy) | Runtime-fetched chunks. Path is set via `window.EXCALIDRAW_ASSET_PATH` — config option `AssetBaseURL` on the view drives this. |

## Known patches

None at present. Add to this section whenever a local modification lands in `vendor/excalidraw/`. Tag the modified line with `// PICT-PATCH: <reason>` so future refreshes can spot it via grep.

## Tracked upstream version

| Date | Upstream commit / tag | Notes |
|---|---|---|
| 2026-05-23 | `master` (depth=1 shallow clone at first vendor) | Initial mirror; ships `@excalidraw/excalidraw 0.18.0`. |

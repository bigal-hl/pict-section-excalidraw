/**
 * Notebook-Default.js
 *
 * A style profile for diagrams that read as "hand-drawn in a notebook".
 * Encodes the Excalidraw knobs that produce the loose, warm-ink, slightly
 * wobbly aesthetic: roughness, palette, fill style, stroke weight, font,
 * seed range, line wobble.
 *
 * Used by scripts/Generate-Notebook-Diagram.js and any AI / programmatic
 * caller that wants its output to match a notebook vibe.  Apps that want a
 * different look (more polished, more colorful, dark mode notebook, etc.)
 * should copy this file and tune — the shape is intentionally minimal so
 * tweaks stay readable.
 *
 * Fingerprinting your own notebook:
 *   1. Pick 3-5 diagrams from your physical notebook.
 *   2. Identify the dominant ink color, accent color, and any highlighter.
 *   3. Set Palette.ink, .accent, .highlight (and any .extra*).
 *   4. Decide how "rough" your lines are.  0=no wobble, 1=mild, 2=heavy.
 *   5. Decide if you fill shapes (hachure looks like crosshatching).
 *   6. Tune StrokeWidth, FontSize, SeedRange.
 *   7. Set RandomSeedSalt to anything you want — it makes the SAME diagram
 *      always wobble the SAME way.  Bump it to re-roll the wobble.
 */

module.exports = ({
	// Human-readable name + provenance — surfaces in the generated scene's
	// metadata so a generated .excalidraw.json knows which profile produced it.
	"Name":        "notebook-default",
	"Description": "Hand-drawn notebook aesthetic — warm ink, mild wobble, hachure fills, Excalifont.",
	"Version":     1,

	// Roughness: 0 = perfectly smooth (no wobble), 1 = cartoonist (default,
	// what excalidraw.com uses out of the box), 2 = artist (more pronounced
	// wobble — strongest "ink in motion" feel).  Set to 1 for crisp notebook
	// notes; bump to 2 for sketchbook gestures.
	"Roughness":   1,

	// Stroke weight in pixels.  1 = thin pen, 2 = medium fineliner (default),
	// 3-4 = marker.  Sketchbook ink tends to be 1.5-2.5.
	"StrokeWidth": 2,

	// 'solid', 'dashed', 'dotted'.  Notebooks almost always 'solid'; the
	// dashed/dotted variants read as digital, not handwritten.
	"StrokeStyle": "solid",

	// Fill style for closed shapes:
	//   'solid'       — flat color fill.  Reads as digital.
	//   'hachure'     — diagonal cross-hatch.  Most notebook-y.
	//   'cross-hatch' — denser cross-hatch.  Looks like heavy shading.
	//   'zigzag'      — zigzag fill.  Useful for accent / highlight.
	//   null          — no fill, just outlines.  Cleanest hand-drawn look.
	"FillStyle":  "hachure",

	// Roundness controls corner radii of rectangles.  type=1, value≈32 is
	// Excalidraw's "sharp pencil with a kind hand" default for sketched
	// rectangles; null = perfectly sharp corners (more architectural).
	"Roundness":  { "type": 2 },     // 2 = proportional rounded for arrow/line endpoints

	// Palette.  Three to five colors, each as a hex string.  Excalidraw is
	// happiest with high-contrast monochrome + 1-2 accents rather than a
	// rainbow — that's also how most personal notebooks read.
	"Palette":
	{
		"ink":         "#1B1F23",   // primary stroke — graphite or dark blue-black
		"paper":       "#FBF7EE",   // background tint — warm off-white (cream)
		"accent":      "#C9602F",   // warm orange — first-call-out / important
		"highlight":   "#E8C547",   // dijon yellow — secondary highlight
		"deemphasis":  "#8A7F72",   // warm grey — dimmed / annotations
		"link":        "#2E7D74"    // teal — for connector text + edges
	},

	// Font.  Excalifont (Excalidraw's bundled hand-drawn font) is the default
	// and what every excalidraw.com user implicitly recognizes as "the look".
	// 'Cascadia Code' for code-style notes, 'Lilita One' for callouts.
	"FontFamily": "Excalifont",   // 'Excalifont' | 'Helvetica' | 'Cascadia' | 'Lilita One'
	"FontSize":   20,

	// Seed: rough.js uses an integer seed to deterministically jitter every
	// stroke.  Setting a fixed seed range means the SAME diagram always
	// wobbles the SAME way.  Useful for tests and reproducibility, AND for
	// keeping a personal style consistent — every shape drawn with the same
	// seed family has the same "hand".
	"SeedRange":  [ 100, 999 ],

	// Salt mixed into the per-element seed to deterministically scramble.
	// Bump this number to roll a fresh wobble across the whole diagram
	// without changing the structural input.
	"RandomSeedSalt": 17,

	// Default per-shape sizes (in px).  The generator scales these based on
	// label length, but they're the starting point.
	"DefaultSizes":
	{
		"rectangle": { "width": 180, "height": 80 },
		"ellipse":   { "width": 160, "height": 90 },
		"diamond":   { "width": 200, "height": 100 },
		"note":      { "width": 220, "height": 100 }   // sticky-note-style
	},

	// Layout defaults: spacing between nodes when auto-laid-out.
	"Layout":
	{
		"horizontalGap": 80,
		"verticalGap":   120,
		"padding":       40
	},

	// Excalidraw appState defaults applied at scene-construction time.
	// `theme: 'light'` keeps the warm-paper background; switch to 'dark' for
	// graphite-on-charcoal.
	"AppState":
	{
		"viewBackgroundColor": "#FBF7EE",   // matches Palette.paper
		"theme":               "light",
		"gridSize":            null,        // notebooks are unruled by default
		"exportBackground":    true,
		"exportEmbedScene":    true,
		"exportScale":         1,
		"currentItemFontFamily": null      // resolved at element-build time from FontFamily
	}
});

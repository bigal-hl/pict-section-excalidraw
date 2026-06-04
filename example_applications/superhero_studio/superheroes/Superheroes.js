/**
 * Superheroes.js
 *
 * Five pre-baked superhero dossiers. Each entry carries:
 *   - Identity stats (Name, AlterEgo, ShoeSize, OriginYear, …)
 *   - Powers stats (PowerLevel, PrimaryPower, Weakness, FavoriteSnack, …)
 *   - Portrait     — inline SVG, themeable via --diagram-* CSS variables
 *   - OriginStory  — markdown
 *
 * The portrait SVGs include a stub <metadata> block so the Diagram input
 * provider's view-mode treats them as round-trippable. They aren't real
 * Excalidraw exports — switching to edit mode will boot Excalidraw with an
 * empty scene. That's fine for the demo; the point is the view-mode load
 * + the themeify recoloring.
 */

const _MetaStub =
	'<metadata>' +
		'<!-- payload-type:application/vnd.excalidraw+json -->' +
		'<!-- payload-start --> e30= <!-- payload-end -->' +
	'</metadata>';

// ---- Captain Verbose ------------------------------------------------------

const _CaptainVerbosePortrait =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">' +
		_MetaStub +
		// Thought bubble (very large — telepathy)
		'<ellipse cx="120" cy="60" rx="100" ry="42" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="2" stroke-dasharray="4 4"/>' +
		'<circle cx="50"  cy="100" r="6" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="1.5"/>' +
		'<circle cx="45"  cy="115" r="3" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="1"/>' +
		'<text x="120" y="58" text-anchor="middle" style="fill: var(--diagram-link, #2E7D74); font-family: serif; font-style: italic; font-size: 13px;">In the beginning, there were words…</text>' +
		'<text x="120" y="80" text-anchor="middle" style="fill: var(--diagram-deemphasis, #A0A0A0); font-family: serif; font-style: italic; font-size: 10px;">(and oh, were there words)</text>' +
		// Body
		'<circle cx="120" cy="150" r="22" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="2"/>' +
		// Glasses (telepath nerd)
		'<circle cx="111" cy="148" r="5" stroke="var(--diagram-ink, #1B1F23)" fill="none" stroke-width="1.5"/>' +
		'<circle cx="129" cy="148" r="5" stroke="var(--diagram-ink, #1B1F23)" fill="none" stroke-width="1.5"/>' +
		'<line x1="116" y1="148" x2="124" y2="148" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1.5"/>' +
		// Torso
		'<path d="M 120 172 L 120 230" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Cape (with letter C on it)
		'<path d="M 100 175 Q 75 215, 100 250 Q 110 245, 110 230" fill="var(--diagram-accent, #E66C2C)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1.5"/>' +
		'<text x="95" y="220" style="fill: var(--diagram-paper, #FDFCF7); font-family: serif; font-weight: bold; font-size: 18px;">C</text>' +
		// Arms
		'<path d="M 120 185 L 95 210" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<path d="M 120 185 L 145 210" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Legs
		'<path d="M 120 230 L 105 265" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<path d="M 120 230 L 135 265" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
	'</svg>';

const _CaptainVerboseOrigin =
	'# The Origin of Captain Verbose\n\n' +
	'> *"Before I begin, allow me to summarize my catchphrase."*\n\n' +
	'**Quintus Pedantic** discovered his telepathic powers at age six, during a dinner conversation in which his parents debated whether the Oxford comma was strictly necessary. The mental noise — *louder than a thousand semicolons* — knocked him unconscious for a full afternoon.\n\n' +
	'## The Awakening\n\n' +
	'When he came to, Quintus could:\n\n' +
	'- Hear every thought in a 200-meter radius\n' +
	'- Hear them as **full paragraphs** with footnotes\n' +
	'- Cite the source of every prior thought he\'d ever heard\n\n' +
	'## Why He Fights\n\n' +
	'Crime, to Captain Verbose, is simply a *failure of explanation*. If only the villain could be made to understand the full historical context of their actions — preferably across three or four well-formatted PDF pages — they would surrender immediately.\n\n' +
	'Most do. The rest start to nod off.\n\n' +
	'## Known Limitation\n\n' +
	'Anyone who presses the `Tab` key near him triggers an involuntary autocomplete. Once witnessed offering a 14-minute summary of someone\'s grocery list.\n';

// ---- The Notebook ---------------------------------------------------------

const _NotebookPortrait =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">' +
		_MetaStub +
		// Head
		'<circle cx="120" cy="60" r="28" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="2"/>' +
		// Hair (top notebook spiral)
		'<path d="M 95 45 Q 100 30, 120 32 Q 140 30, 145 45" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2" fill="none"/>' +
		'<circle cx="105" cy="36" r="2" fill="var(--diagram-ink, #1B1F23)"/>' +
		'<circle cx="115" cy="33" r="2" fill="var(--diagram-ink, #1B1F23)"/>' +
		'<circle cx="125" cy="33" r="2" fill="var(--diagram-ink, #1B1F23)"/>' +
		'<circle cx="135" cy="36" r="2" fill="var(--diagram-ink, #1B1F23)"/>' +
		// Eyes
		'<circle cx="112" cy="58" r="2" fill="var(--diagram-ink, #1B1F23)"/>' +
		'<circle cx="128" cy="58" r="2" fill="var(--diagram-ink, #1B1F23)"/>' +
		// Smile
		'<path d="M 110 70 Q 120 78, 130 70" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2" fill="none"/>' +
		// Body
		'<path d="M 120 88 L 120 215" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Cape — ruled paper style
		'<path d="M 95 90 Q 70 150, 90 240 L 150 240 Q 170 150, 145 90 Z" fill="var(--diagram-paper, #FDFCF7)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<line x1="93"  y1="125" x2="147" y2="125" stroke="var(--diagram-link, #2E7D74)" stroke-width="0.8"/>' +
		'<line x1="91"  y1="145" x2="149" y2="145" stroke="var(--diagram-link, #2E7D74)" stroke-width="0.8"/>' +
		'<line x1="89"  y1="165" x2="151" y2="165" stroke="var(--diagram-link, #2E7D74)" stroke-width="0.8"/>' +
		'<line x1="87"  y1="185" x2="153" y2="185" stroke="var(--diagram-link, #2E7D74)" stroke-width="0.8"/>' +
		'<line x1="85"  y1="205" x2="155" y2="205" stroke="var(--diagram-link, #2E7D74)" stroke-width="0.8"/>' +
		'<line x1="100" y1="100" x2="100" y2="225" stroke="var(--diagram-accent, #E66C2C)" stroke-width="1.2"/>' +
		// Arm with pen
		'<path d="M 120 110 L 165 145" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<rect x="160" y="140" width="20" height="6" rx="1" fill="var(--diagram-accent, #E66C2C)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1"/>' +
		'<path d="M 180 142 L 188 145 L 180 148 Z" fill="var(--diagram-ink, #1B1F23)"/>' +
		// Other arm (with sketch in hand)
		'<path d="M 120 110 L 80 145" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<rect x="60" y="138" width="22" height="16" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="1.5"/>' +
		'<path d="M 64 144 L 78 144 M 64 148 L 76 148" stroke="var(--diagram-deemphasis, #A0A0A0)" stroke-width="0.8"/>' +
		// Legs
		'<path d="M 120 215 L 105 265" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<path d="M 120 215 L 135 265" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
	'</svg>';

const _NotebookOrigin =
	'# The Origin of The Notebook\n\n' +
	'**Margot Quill** was a third-grade art prodigy at Hawthorne Elementary. Her crayon drawings were so impossibly detailed that her teacher once accused her of tracing.\n\n' +
	'She wasn\'t tracing. She was *summoning*.\n\n' +
	'## The Apple Incident\n\n' +
	'It was a Tuesday in October when Margot, frustrated by the brown chunks of fruit at lunch, sketched the perfect apple in her notebook. Glossy. Crimson. Slightly off-axis, the way real apples are.\n\n' +
	'When the bell rang, the apple was sitting on her desk. *Real*. Warm. Suspiciously polished.\n\n' +
	'> She ate it. She still says it was the best apple she\'s ever had.\n\n' +
	'## How The Power Works\n\n' +
	'Anything Margot draws appears in the next room, three seconds after she lifts her pencil. The fidelity is **exactly proportional to the detail of the drawing**. A stick figure is a confused mannequin. A detailed dragon is, regrettably, a detailed dragon.\n\n' +
	'## Weakness\n\n' +
	'Any eraser — *any eraser at all* — can unmake what she\'s drawn. Margot carries her drawings in waxed envelopes for safety. She has not drawn a sandwich in public since 2019.\n\n' +
	'```\n' +
	'rule of thumb:\n' +
	'  drawing.render() === reality.mutate()\n' +
	'```\n';

// ---- Markdown Marauder ----------------------------------------------------

const _MarkdownMarauderPortrait =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">' +
		_MetaStub +
		// Head
		'<circle cx="120" cy="60" r="26" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="2"/>' +
		// "> " bullet eyes
		'<text x="100" y="63" style="fill: var(--diagram-ink, #1B1F23); font-family: \'SF Mono\', Menlo, monospace; font-weight: bold; font-size: 14px;">&gt;</text>' +
		'<text x="125" y="63" style="fill: var(--diagram-ink, #1B1F23); font-family: \'SF Mono\', Menlo, monospace; font-weight: bold; font-size: 14px;">&gt;</text>' +
		// Hood
		'<path d="M 92 50 Q 90 25, 120 22 Q 150 25, 148 50" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2" fill="var(--diagram-link, #2E7D74)"/>' +
		// Body
		'<path d="M 120 86 L 120 230" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Chest with # symbol
		'<rect x="95" y="100" width="50" height="60" rx="4" fill="var(--diagram-paper, #FDFCF7)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<text x="120" y="142" text-anchor="middle" style="fill: var(--diagram-accent, #E66C2C); font-family: \'SF Mono\', Menlo, monospace; font-weight: bold; font-size: 36px;">#</text>' +
		// Cape
		'<path d="M 95 100 Q 60 170, 95 235" fill="var(--diagram-link, #2E7D74)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1.5" opacity="0.85"/>' +
		'<path d="M 145 100 Q 180 170, 145 235" fill="var(--diagram-link, #2E7D74)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1.5" opacity="0.85"/>' +
		// Arms
		'<path d="M 95 115 L 75 175" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<path d="M 145 115 L 165 175" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Backtick fists
		'<text x="64" y="186" style="fill: var(--diagram-ink, #1B1F23); font-family: \'SF Mono\', Menlo, monospace; font-weight: bold; font-size: 22px;">`</text>' +
		'<text x="160" y="186" style="fill: var(--diagram-ink, #1B1F23); font-family: \'SF Mono\', Menlo, monospace; font-weight: bold; font-size: 22px;">`</text>' +
		// Legs
		'<path d="M 120 230 L 105 265" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<path d="M 120 230 L 135 265" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
	'</svg>';

const _MarkdownMarauderOrigin =
	'# The Origin of Markdown Marauder\n\n' +
	'`Hex Brackets` was born in a forked documentation repo in 2003, when a junior developer accidentally committed a `.md` file with an unclosed code fence.\n\n' +
	'The fence was never closed. To this day.\n\n' +
	'## Powers\n\n' +
	'1. **Syntax highlighting** — can color any code block on sight\n' +
	'2. **Heading authority** — speaks only in `#`, `##`, and `###` levels\n' +
	'3. **Bullet conjuration** — summons unordered lists out of thin air\n' +
	'4. **Blockquote shielding** — `>` deflects ad hominem attacks\n\n' +
	'## What They Fight\n\n' +
	'- Tab characters in a space-indented project\n' +
	'- README files that lead with "Welcome!"\n' +
	'- Trailing whitespace, *any trailing whitespace*\n' +
	'- TODO comments older than 18 months\n\n' +
	'> Their archnemesis is **Plaintext Pete**, who insists everything be rendered as a `<pre>` tag.\n\n' +
	'## Catchphrase\n\n' +
	'> "There is no ~~problem~~ that can\'t be fixed with **bold formatting**."\n';

// ---- The Modal Avenger ----------------------------------------------------

const _ModalAvengerPortrait =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">' +
		_MetaStub +
		// Modal frame around everything
		'<rect x="20" y="35" width="200" height="220" rx="8" fill="var(--diagram-paper, #FDFCF7)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Title bar
		'<rect x="20" y="35" width="200" height="20" rx="8" fill="var(--diagram-accent, #E66C2C)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<rect x="20" y="50" width="200" height="5" fill="var(--diagram-accent, #E66C2C)" stroke="none"/>' +
		// Close X button
		'<circle cx="205" cy="45" r="6" fill="var(--diagram-paper, #FDFCF7)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1.5"/>' +
		'<path d="M 202 42 L 208 48 M 208 42 L 202 48" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1.5"/>' +
		// Title text
		'<text x="30" y="49" style="fill: var(--diagram-paper, #FDFCF7); font-family: sans-serif; font-weight: bold; font-size: 11px;">Alert</text>' +
		// Body (head)
		'<circle cx="120" cy="105" r="22" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="2"/>' +
		// Eyes (square — modal-like)
		'<rect x="108" y="100" width="6" height="6" fill="var(--diagram-ink, #1B1F23)"/>' +
		'<rect x="126" y="100" width="6" height="6" fill="var(--diagram-ink, #1B1F23)"/>' +
		// Mouth (subtle smile)
		'<path d="M 113 115 Q 120 120, 127 115" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1.5" fill="none"/>' +
		// Body
		'<path d="M 120 127 L 120 200" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<rect x="100" y="135" width="40" height="40" rx="4" fill="var(--diagram-paper, #FDFCF7)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<text x="120" y="161" text-anchor="middle" style="fill: var(--diagram-accent, #E66C2C); font-family: sans-serif; font-weight: bold; font-size: 22px;">!</text>' +
		// Arms
		'<path d="M 120 145 L 95 175" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<path d="M 120 145 L 145 175" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Legs
		'<path d="M 120 200 L 105 235" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<path d="M 120 200 L 135 235" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Action buttons at bottom
		'<rect x="135" y="240" width="55" height="10" rx="2" fill="var(--diagram-link, #2E7D74)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1"/>' +
		'<text x="162" y="248" text-anchor="middle" style="fill: var(--diagram-paper, #FDFCF7); font-family: sans-serif; font-weight: bold; font-size: 7px;">CONFIRM</text>' +
		'<rect x="55" y="240" width="55" height="10" rx="2" fill="var(--diagram-deemphasis, #A0A0A0)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1"/>' +
		'<text x="82" y="248" text-anchor="middle" style="fill: var(--diagram-paper, #FDFCF7); font-family: sans-serif; font-weight: bold; font-size: 7px;">CANCEL</text>' +
	'</svg>';

const _ModalAvengerOrigin =
	'# The Origin of The Modal Avenger\n\n' +
	'**Alice DialogBox** was a UX researcher trapped on a sticky note for five years after a freak browser refresh in 2015. When the page finally repainted, she emerged with the ability to *manipulate z-index*.\n\n' +
	'## The Five Years\n\n' +
	'During her captivity on the sticky note, Alice studied:\n\n' +
	'- 47,000 modal dialogs\n' +
	'- 12,000 toast notifications\n' +
	'- 800 cookie banners (she developed a strong opinion)\n' +
	'- 4 lightboxes with *no close button*\n\n' +
	'## Powers\n\n' +
	'- **Stack-order command**: any element she touches floats to the top of the visual stack\n' +
	'- **Confirm/Cancel summoning**: can introduce a two-button decision into any conversation\n' +
	'- **Backdrop projection**: dims the world\'s saturation by 40% on demand\n\n' +
	'## Mission\n\n' +
	'> Every dialog deserves a close button.\n' +
	'> Every prompt deserves a cancel.\n' +
	'> Every escape key deserves to escape.\n\n' +
	'Alice patrols the streets of the internet looking for **un-dismissible overlays**. When she finds one, she gently — *gently* — applies a 16-pixel padding and a clear "×" in the corner.\n\n' +
	'## Weakness\n\n' +
	'Pressing the **`Escape` key** anywhere in her vicinity causes her to vanish for 1.2 seconds. Long enough, sometimes, for the villain to escape.\n';

// ---- Vector Vince ---------------------------------------------------------

const _VectorVincePortrait =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">' +
		_MetaStub +
		// Background grid
		'<defs>' +
			'<pattern id="vince-grid" width="20" height="20" patternUnits="userSpaceOnUse">' +
				'<path d="M 20 0 L 0 0 0 20" stroke="var(--diagram-deemphasis, #A0A0A0)" stroke-width="0.3" fill="none"/>' +
			'</pattern>' +
		'</defs>' +
		'<rect x="20" y="30" width="200" height="230" fill="url(#vince-grid)" stroke="none"/>' +
		'<rect x="20" y="30" width="200" height="230" fill="none" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1.5" stroke-dasharray="6 3"/>' +
		// Head (square)
		'<rect x="95" y="50" width="50" height="50" fill="var(--diagram-paper, #FDFCF7)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Eyes (perfect circles)
		'<circle cx="110" cy="75" r="4" fill="var(--diagram-ink, #1B1F23)"/>' +
		'<circle cx="130" cy="75" r="4" fill="var(--diagram-ink, #1B1F23)"/>' +
		// Mouth (single line)
		'<line x1="108" y1="90" x2="132" y2="90" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Body (triangle)
		'<polygon points="120,105 80,210 160,210" fill="var(--diagram-accent, #E66C2C)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Chest symbol (circle on triangle)
		'<circle cx="120" cy="160" r="18" fill="var(--diagram-paper, #FDFCF7)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<polygon points="120,148 108,172 132,172" fill="var(--diagram-link, #2E7D74)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="1.5"/>' +
		// Arms (arrows)
		'<line x1="90" y1="135" x2="55" y2="155" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<polygon points="55,155 65,148 62,158" fill="var(--diagram-ink, #1B1F23)"/>' +
		'<line x1="150" y1="135" x2="185" y2="155" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<polygon points="185,155 175,148 178,158" fill="var(--diagram-ink, #1B1F23)"/>' +
		// Legs (rectangles)
		'<rect x="92" y="210" width="14" height="40" fill="var(--diagram-paper, #FDFCF7)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		'<rect x="134" y="210" width="14" height="40" fill="var(--diagram-paper, #FDFCF7)" stroke="var(--diagram-ink, #1B1F23)" stroke-width="2"/>' +
		// Coordinate label
		'<text x="30" y="48" style="fill: var(--diagram-deemphasis, #A0A0A0); font-family: monospace; font-size: 9px;">(0,0)</text>' +
	'</svg>';

const _VectorVinceOrigin =
	'# The Origin of Vector Vince\n\n' +
	'**Vince Bezier** emerged fully formed from an AutoCAD blueprint in 1976. He has no childhood. His earliest memory is the *grid*.\n\n' +
	'## What He\'s Made Of\n\n' +
	'Vince\'s body is composed entirely of geometric primitives:\n\n' +
	'| Body Part   | Geometry        |\n' +
	'|-------------|-----------------|\n' +
	'| Head        | Square (50×50)  |\n' +
	'| Torso       | Equilateral triangle |\n' +
	'| Eyes        | Perfect circles |\n' +
	'| Arms        | Vectors with arrowheads |\n' +
	'| Legs        | Rectangles (golden ratio) |\n' +
	'| Hair        | (none — would compromise his silhouette) |\n\n' +
	'## Powers\n\n' +
	'- **Snap to grid**: any movement he makes is rounded to the nearest pixel\n' +
	'- **Constraint solver**: parallel lines stay parallel in his presence\n' +
	'- **Boolean operations**: can union, intersect, and subtract — slowly\n\n' +
	'## Catchphrase\n\n' +
	'> "It\'s not personal, it\'s **orthogonal**."\n\n' +
	'## Known Weaknesses\n\n' +
	'- Bezier curves with more than three control points (gives him vertigo)\n' +
	'- Hand-drawn diagrams (he involuntarily redraws them with a ruler)\n' +
	'- *Any* organic shape (refuses to acknowledge they exist)\n\n' +
	'Vince has been spotted at every CAD convention since 1981, where he is paid handsomely to stand very still and look intentional.\n';

// ---- Exported records -----------------------------------------------------

module.exports =
{
	'captain-verbose':
	{
		Name:          'Captain Verbose',
		AlterEgo:      'Quintus Pedantic',
		ShoeSize:      11,
		OriginYear:    1942,
		PowerLevel:    8,
		PrimaryPower:  'Telepathy',
		Weakness:      'The Tab key',
		FavoriteSnack: 'Em-dashes (—)',
		ThemeColor:    'Blue',
		Catchphrase:   '"In summary — and I do mean in summary — let me clarify."',
		CoffeeCupsPerDay: 7,
		NumberOfSidekicks: 2,
		Portrait:      _CaptainVerbosePortrait,
		OriginStory:   _CaptainVerboseOrigin
	},
	'the-notebook':
	{
		Name:          'The Notebook',
		AlterEgo:      'Margot Quill',
		ShoeSize:      9,
		OriginYear:    1988,
		PowerLevel:    9,
		PrimaryPower:  'Manifestation',
		Weakness:      'Erasers, any kind',
		FavoriteSnack: 'Graphite shavings',
		ThemeColor:    'Black',
		Catchphrase:   '"You can erase the drawing. You can\'t erase the doodle."',
		CoffeeCupsPerDay: 3,
		NumberOfSidekicks: 0,
		Portrait:      _NotebookPortrait,
		OriginStory:   _NotebookOrigin
	},
	'markdown-marauder':
	{
		Name:          'Markdown Marauder',
		AlterEgo:      'Hex Brackets',
		ShoeSize:      10,
		OriginYear:    2003,
		PowerLevel:    7,
		PrimaryPower:  'Syntax Highlighting',
		Weakness:      'Closing tags',
		FavoriteSnack: 'Backticks (`)',
		ThemeColor:    'Green',
		Catchphrase:   '"There is no problem that can\'t be fixed with **bold formatting**."',
		CoffeeCupsPerDay: 4,
		NumberOfSidekicks: 6,
		Portrait:      _MarkdownMarauderPortrait,
		OriginStory:   _MarkdownMarauderOrigin
	},
	'the-modal-avenger':
	{
		Name:          'The Modal Avenger',
		AlterEgo:      'Alice DialogBox',
		ShoeSize:      8,
		OriginYear:    2015,
		PowerLevel:    6,
		PrimaryPower:  'Z-Index Manipulation',
		Weakness:      'The Escape key',
		FavoriteSnack: 'Drop shadows',
		ThemeColor:    'Purple',
		Catchphrase:   '"Every dialog deserves a close button."',
		CoffeeCupsPerDay: 2,
		NumberOfSidekicks: 1,
		Portrait:      _ModalAvengerPortrait,
		OriginStory:   _ModalAvengerOrigin
	},
	'vector-vince':
	{
		Name:          'Vector Vince',
		AlterEgo:      'Vince Bezier',
		ShoeSize:      12,
		OriginYear:    1976,
		PowerLevel:    9,
		PrimaryPower:  'Snap to Grid',
		Weakness:      'Bezier curves',
		FavoriteSnack: 'Rulers (the metric kind)',
		ThemeColor:    'Red',
		Catchphrase:   '"It\'s not personal, it\'s orthogonal."',
		CoffeeCupsPerDay: 0,
		NumberOfSidekicks: 4,
		Portrait:      _VectorVincePortrait,
		OriginStory:   _VectorVinceOrigin
	}
};

/**
 * Notebook-Studio-Helpers.js
 *
 * Three pure-function helpers shared by the studio's input controls:
 *
 *   parseStudioDSL(text)  →  fixture-shape JSON
 *   buildAIPrompt(description, fewShots)  →  LLM-ready prompt string
 *   validateFixture(obj)  →  { ok, errors }
 *
 * All three intentionally do NOT depend on the DOM or pict — they're loaded
 * via the same bundle as the studio app but reusable from a node CLI too.
 */

(function (root, factory)
{
	if (typeof module === 'object' && module.exports)
	{
		module.exports = factory();
	}
	else
	{
		root.NotebookStudioHelpers = factory();
	}
}(typeof self !== 'undefined' ? self : this, function ()
{
	// =====================================================================
	// 1. Mini DSL parser
	// =====================================================================
	//
	// Line-oriented, designed to be both human-writable and LLM-emit-able.
	//
	//   title: <text>                          declares the diagram title
	//   layout: flow|grid|manual               picks the auto-layout algorithm
	//   <node-id>: <label> [(kind)] [{accent}] declares a node
	//   <from> -> <to>: <label> [(kind)] [{accent}]   declares an edge
	//   # comment                              ignored
	//   <blank line>                           ignored
	//
	//   Kinds:    rectangle, ellipse, diamond, note  (also: dashed/dotted/solid for edges)
	//   Accents:  ink, accent, highlight, link, deemphasis
	//
	// Example:
	//   title: service flow
	//   user: User (ellipse)
	//   api: API Gateway
	//   db: Database
	//   user -> api: request
	//   api -> db: query
	//
	function parseStudioDSL(pText)
	{
		let tmpInput = String(pText || '');
		let tmpLines = tmpInput.split(/\r?\n/);

		let tmpResult =
		{
			title:  null,
			nodes:  [],
			edges:  [],
			layout: 'flow'
		};
		let tmpKnownIds = {};
		let tmpErrors   = [];

		// Whitelist of values legal as a `(kind)` attribute.  Anything else
		// in parentheses — like `(React)` in a label — stays part of the
		// label so we don't smuggle arbitrary text into the kind field.
		let _KIND_WHITELIST = {
			'rectangle': true, 'ellipse': true, 'diamond': true, 'note': true,
			'solid':     true, 'dashed':  true, 'dotted':  true, 'curved': true
		};
		// `{accent}` braces always extract — they're an explicit attribute
		// container, not a label substring.  But the trailing-parens kind
		// extraction only fires when the parens are at the very end of
		// the label AND the content is a whitelisted kind word.
		function extractAttrs(pLabelText)
		{
			let tmpRaw = pLabelText;
			let tmpKind   = null;
			let tmpAccent = null;
			let tmpBackground = null;

			// Pull braces out greedy — they're unambiguous.
			tmpRaw = tmpRaw.replace(/\{([^}]*)\}/g, function (pMatch, pBraceBody)
			{
				let tmpVal = (pBraceBody || '').trim();
				let tmpParts = tmpVal.split(':').map(function (s) { return s.trim(); });
				if (tmpParts.length === 1)
				{
					tmpAccent = tmpParts[0].toLowerCase();
				}
				else if (tmpParts[0] === 'background')
				{
					tmpBackground = tmpParts[1].toLowerCase();
				}
				else
				{
					tmpAccent = tmpParts[1].toLowerCase();
				}
				return '';
			});

			// Then peel a trailing (kind) — only if it's a whitelisted word.
			// Loop because someone might write `Excalidraw (React) (note)`.
			let tmpTail = /\s*\(([A-Za-z][A-Za-z0-9_-]*)\)\s*$/;
			while (true)
			{
				let tmpMatch = tmpRaw.match(tmpTail);
				if (!tmpMatch) break;
				let tmpCandidate = tmpMatch[1].toLowerCase();
				if (!_KIND_WHITELIST[tmpCandidate]) break;
				if (!tmpKind) tmpKind = tmpCandidate;
				tmpRaw = tmpRaw.slice(0, tmpRaw.length - tmpMatch[0].length);
			}

			return { label: tmpRaw.trim(), kind: tmpKind, accent: tmpAccent, background: tmpBackground };
		}

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i].replace(/\t/g, ' ').trim();
			if (!tmpLine || tmpLine.charAt(0) === '#') continue;

			// title: / layout: directives
			let tmpDirective = tmpLine.match(/^(title|layout)\s*:\s*(.+)$/i);
			if (tmpDirective)
			{
				let tmpKey = tmpDirective[1].toLowerCase();
				let tmpVal = tmpDirective[2].trim();
				if (tmpKey === 'title')  tmpResult.title  = tmpVal;
				if (tmpKey === 'layout')
				{
					if (/^(flow|grid|manual)$/.test(tmpVal)) tmpResult.layout = tmpVal;
					else tmpErrors.push('line ' + (i + 1) + ': unknown layout "' + tmpVal + '" (use flow|grid|manual)');
				}
				continue;
			}

			// Edge:  from -> to[: label] [(kind)] [{accent}]
			let tmpEdgeMatch = tmpLine.match(/^([A-Za-z0-9_\-]+)\s*->\s*([A-Za-z0-9_\-]+)(?:\s*:\s*(.+))?$/);
			if (tmpEdgeMatch)
			{
				let tmpRawLabel = tmpEdgeMatch[3] || '';
				let tmpAttrs    = extractAttrs(tmpRawLabel);
				let tmpEdge =
				{
					from: tmpEdgeMatch[1],
					to:   tmpEdgeMatch[2]
				};
				if (tmpAttrs.label)  tmpEdge.label  = tmpAttrs.label;
				if (tmpAttrs.kind)   tmpEdge.kind   = tmpAttrs.kind;
				if (tmpAttrs.accent) tmpEdge.accent = tmpAttrs.accent;
				tmpResult.edges.push(tmpEdge);
				continue;
			}

			// Node:  id: label [(kind)] [{accent}]
			let tmpNodeMatch = tmpLine.match(/^([A-Za-z0-9_\-]+)\s*:\s*(.+)$/);
			if (tmpNodeMatch)
			{
				let tmpId     = tmpNodeMatch[1];
				let tmpAttrs  = extractAttrs(tmpNodeMatch[2]);
				if (tmpKnownIds[tmpId])
				{
					tmpErrors.push('line ' + (i + 1) + ': duplicate node id "' + tmpId + '"');
					continue;
				}
				tmpKnownIds[tmpId] = true;
				let tmpNode = { id: tmpId, label: tmpAttrs.label || tmpId };
				if (tmpAttrs.kind)       tmpNode.kind       = tmpAttrs.kind;
				if (tmpAttrs.accent)     tmpNode.accent     = tmpAttrs.accent;
				if (tmpAttrs.background) tmpNode.background = tmpAttrs.background;
				tmpResult.nodes.push(tmpNode);
				continue;
			}

			tmpErrors.push('line ' + (i + 1) + ': could not parse "' + tmpLine + '"');
		}

		// Auto-declare nodes referenced by edges but never explicitly listed
		for (let e = 0; e < tmpResult.edges.length; e++)
		{
			let tmpEdge = tmpResult.edges[e];
			if (!tmpKnownIds[tmpEdge.from])
			{
				tmpKnownIds[tmpEdge.from] = true;
				tmpResult.nodes.push({ id: tmpEdge.from, label: tmpEdge.from });
			}
			if (!tmpKnownIds[tmpEdge.to])
			{
				tmpKnownIds[tmpEdge.to] = true;
				tmpResult.nodes.push({ id: tmpEdge.to, label: tmpEdge.to });
			}
		}

		return { fixture: tmpResult, errors: tmpErrors };
	}

	// =====================================================================
	// 2. AI prompt builder
	// =====================================================================
	//
	// Wraps the description in a stable, schema-anchored prompt that any
	// modern LLM (Claude, GPT, etc.) can comfortably follow.  Few-shot
	// examples come from the fixtures we ship; the model never has to
	// invent structure from scratch.
	//
	// The output is plain text — meant to be copied into the user's AI of
	// choice.  The AI's JSON response then drops straight into the studio's
	// JSON tab and renders.
	//
	function buildAIPrompt(pDescription, pFewShots)
	{
		let tmpDesc = String(pDescription || '').trim() ||
			'(describe your diagram here)';

		let tmpFewShots = pFewShots || [];
		let tmpExamplesBlock = '';
		for (let i = 0; i < tmpFewShots.length; i++)
		{
			let tmpFs = tmpFewShots[i];
			tmpExamplesBlock += '## Example ' + (i + 1) + ': "' + tmpFs.name + '"\n\n';
			tmpExamplesBlock += '```json\n';
			tmpExamplesBlock += JSON.stringify(tmpFs.input, null, 2);
			tmpExamplesBlock += '\n```\n\n';
		}

		return [
			'You are an expert at producing notebook-style architecture diagrams.',
			'Given a description of a system, produce a JSON object describing the',
			'diagram in the schema below.  The schema is consumed by',
			'`pict-section-excalidraw`\'s Generate-Notebook-Diagram.js, which paints',
			'each node + edge with deterministic hand-drawn wobble using the',
			'configured style profile.  You only have to choose the **structure**',
			'and **semantic accents** — palette, font, roughness, and wobble are',
			'owned by the style profile.',
			'',
			'# Schema',
			'',
			'```typescript',
			'type Diagram = {',
			'  title?:  string;                      // a short heading',
			'  layout?: "flow" | "grid" | "manual";  // defaults to "flow"',
			'  nodes:   Node[];',
			'  edges:   Edge[];',
			'};',
			'',
			'type Node = {',
			'  id:           string;                  // unique snake_case identifier',
			'  label:        string;                  // short visible label (use \\n for line breaks)',
			'  kind?:        "rectangle" | "ellipse" | "diamond" | "note";',
			'  accent?:      "ink" | "accent" | "highlight" | "link" | "deemphasis";',
			'  background?:  "ink" | "accent" | "highlight" | "link" | "deemphasis";',
			'  x?: number; y?: number;                // only with layout="manual"',
			'};',
			'',
			'type Edge = {',
			'  from:    string;                       // a node id',
			'  to:      string;                       // a node id',
			'  label?:  string;                       // a short verb',
			'  kind?:   "solid" | "dashed" | "dotted";',
			'  accent?: "ink" | "accent" | "highlight" | "link" | "deemphasis";',
			'};',
			'```',
			'',
			'# Semantics',
			'',
			'**Shape kinds** carry intent:',
			'- `rectangle` — a process, service, component, module',
			'- `ellipse`   — an actor or entry point (User, System, External)',
			'- `diamond`   — a decision, gate, branch ("is X true?")',
			'- `note`      — a sticky-note callout (pair with `background: "highlight"`)',
			'',
			'**Accent colors** call out semantic role, not aesthetic:',
			'- `ink`        — default (don\'t bother specifying)',
			'- `accent`     — warm orange; mark the ONE most important node',
			'- `highlight`  — dijon yellow; secondary callout or sticky-note background',
			'- `link`       — teal; connector tint, fits "wired-up" relationships',
			'- `deemphasis` — warm grey; annotations or "for-context" items',
			'',
			'**Edge kinds** carry intent:',
			'- `solid`  — primary path (default)',
			'- `dashed` — alternate / optional / async path',
			'- `dotted` — implicit / "and also" relationship',
			'',
			'# Guidance',
			'',
			'- Prefer 5-10 nodes.  More than 12 starts to crowd a notebook page.',
			'- Use **lowercase or sentence-case** labels.  Notebooks are casual.',
			'- One accent per diagram.  Two if absolutely necessary.',
			'- Use `\\n` in labels for two-line text (e.g. `"PictView-\\nExcalidraw-React"`).',
			'- Don\'t set x/y unless the user explicitly requested manual layout.',
			'',
			'# Examples',
			'',
			tmpExamplesBlock,
			'# Now produce a diagram for:',
			'',
			'> ' + tmpDesc.split('\n').join('\n> '),
			'',
			'**Output a single JSON object.  No prose.  No code fences.**'
		].join('\n');
	}

	// =====================================================================
	// 3. Fixture validation
	// =====================================================================
	//
	// Cheap structural validation of the JSON shape.  Catches the common
	// LLM mistakes (missing ids, edges pointing nowhere, wrong types) so
	// the studio can show a friendly error before handing off to the
	// generator.
	//
	function validateFixture(pObj)
	{
		let tmpErrors = [];
		if (!pObj || typeof pObj !== 'object') return { ok: false, errors: ['input is not an object'] };
		if (!Array.isArray(pObj.nodes)) tmpErrors.push('"nodes" must be an array');
		if (!Array.isArray(pObj.edges)) tmpErrors.push('"edges" must be an array');
		if (tmpErrors.length) return { ok: false, errors: tmpErrors };

		let tmpIds = {};
		for (let i = 0; i < pObj.nodes.length; i++)
		{
			let tmpN = pObj.nodes[i];
			if (!tmpN || typeof tmpN !== 'object')
			{
				tmpErrors.push('nodes[' + i + '] is not an object'); continue;
			}
			if (typeof tmpN.id !== 'string' || !tmpN.id)
			{
				tmpErrors.push('nodes[' + i + '] missing string id'); continue;
			}
			if (tmpIds[tmpN.id])
			{
				tmpErrors.push('nodes[' + i + '] duplicate id "' + tmpN.id + '"');
			}
			tmpIds[tmpN.id] = true;
			if (tmpN.kind && !/^(rectangle|ellipse|diamond|note)$/.test(tmpN.kind))
			{
				tmpErrors.push('nodes[' + i + '] kind "' + tmpN.kind + '" — must be rectangle|ellipse|diamond|note');
			}
		}
		for (let i = 0; i < pObj.edges.length; i++)
		{
			let tmpE = pObj.edges[i];
			if (!tmpE || typeof tmpE !== 'object')
			{
				tmpErrors.push('edges[' + i + '] is not an object'); continue;
			}
			if (!tmpIds[tmpE.from])
			{
				tmpErrors.push('edges[' + i + '] from "' + tmpE.from + '" does not match any node id');
			}
			if (!tmpIds[tmpE.to])
			{
				tmpErrors.push('edges[' + i + '] to "' + tmpE.to + '" does not match any node id');
			}
			if (tmpE.kind && !/^(solid|dashed|dotted)$/.test(tmpE.kind))
			{
				tmpErrors.push('edges[' + i + '] kind "' + tmpE.kind + '" — must be solid|dashed|dotted');
			}
		}
		return { ok: tmpErrors.length === 0, errors: tmpErrors };
	}

	return {
		parseStudioDSL:  parseStudioDSL,
		buildAIPrompt:   buildAIPrompt,
		validateFixture: validateFixture
	};
}));

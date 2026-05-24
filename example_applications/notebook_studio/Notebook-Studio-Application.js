const libPictApplication = require('pict-application');
const libPictSectionExcalidraw = require('../../source/Pict-Section-Excalidraw.js');
const libGenerateNotebookDiagram = require('../../scripts/Generate-Notebook-Diagram.js');
const libNotebookStudioHelpers = require('./Notebook-Studio-Helpers.js');

// Few-shot examples consumed by the AI-prompt builder.  We pull these from
// the same fixtures the e2e test exercises, so the prompt always reflects
// shapes we've actually round-tripped through the renderer.
const _FEW_SHOTS =
[
	{
		name: 'service flow',
		input:
		{
			title: 'service flow',
			nodes:
			[
				{ id: 'user',  label: 'User',        kind: 'ellipse' },
				{ id: 'api',   label: 'API Gateway', kind: 'rectangle' },
				{ id: 'db',    label: 'Database',    kind: 'rectangle' },
				{ id: 'cache', label: 'Cache',       kind: 'note', background: 'highlight' }
			],
			edges:
			[
				{ from: 'user', to: 'api',   label: 'request' },
				{ from: 'api',  to: 'db',    label: 'query' },
				{ from: 'api',  to: 'cache', label: 'lookup', kind: 'dashed' }
			],
			layout: 'flow'
		}
	},
	{
		name: 'decision',
		input:
		{
			title: 'should i ship it?',
			nodes:
			[
				{ id: 'tests', label: 'tests passing?', kind: 'diamond' },
				{ id: 'ship',  label: 'ship it',        kind: 'ellipse', accent: 'link' },
				{ id: 'wait',  label: 'fix + retry',    kind: 'note', background: 'highlight' }
			],
			edges:
			[
				{ from: 'tests', to: 'ship', label: 'yes' },
				{ from: 'tests', to: 'wait', label: 'no' }
			],
			layout: 'flow'
		}
	}
];

class NotebookStudioPreviewView extends libPictSectionExcalidraw.ReactView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

const _PreviewConfiguration =
{
	"ViewIdentifier":       "NotebookStudioPreviewView",
	"TargetElementAddress": "#StudioPreview",
	"Theme":                "light",
	"AssetBaseURL":         "./excalidraw-assets/"
};

class NotebookStudioApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.pict.addView('NotebookStudioPreviewView', _PreviewConfiguration, NotebookStudioPreviewView);

		// Expose the helpers + generator on the application so inline
		// onclick handlers in index.html can reach them via _Pict.PictApplication.
		this.helpers   = libNotebookStudioHelpers;
		this.generator = libGenerateNotebookDiagram;
		this.fewShots  = _FEW_SHOTS;
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();
		let tmpView = this.pict.views.NotebookStudioPreviewView;
		if (tmpView) tmpView.render();
	}

	// ---- Studio actions: called from inline onclick handlers in index.html ----

	/**
	 * Read whichever input pane is currently active (DSL or JSON), parse it
	 * into a fixture-shape object, run it through the generator, and feed
	 * the result into the live Excalidraw preview.
	 */
	renderDiagram()
	{
		let tmpFixture = this._currentFixture();
		if (!tmpFixture) return;

		let tmpScene = this.generator(tmpFixture, null);
		let tmpView = this.pict.views.NotebookStudioPreviewView;
		if (tmpView && tmpView.setScene)
		{
			tmpView.setScene(tmpScene);
			this._setStatus(`Rendered ${tmpFixture.nodes.length} nodes + ${tmpFixture.edges.length} edges → ${tmpScene.elements.length} Excalidraw elements.`, 'ok');
		}
	}

	/**
	 * Determine which input pane is active and return the parsed fixture.
	 * Reports errors via the status bar and returns null on failure.
	 */
	_currentFixture()
	{
		let tmpActiveTab = document.querySelector('.studio-tab.active');
		let tmpMode = tmpActiveTab ? tmpActiveTab.getAttribute('data-mode') : 'dsl';

		if (tmpMode === 'json')
		{
			let tmpRaw = document.getElementById('studio-json').value;
			let tmpParsed;
			try { tmpParsed = JSON.parse(tmpRaw); }
			catch (pErr) { this._setStatus('JSON parse error: ' + pErr.message, 'err'); return null; }
			let tmpV = this.helpers.validateFixture(tmpParsed);
			if (!tmpV.ok)
			{
				this._setStatus('Validation: ' + tmpV.errors.join('; '), 'err');
				return null;
			}
			return tmpParsed;
		}

		// DSL mode
		let tmpDsl = document.getElementById('studio-dsl').value;
		let tmpParsed = this.helpers.parseStudioDSL(tmpDsl);
		if (tmpParsed.errors.length)
		{
			this._setStatus('DSL: ' + tmpParsed.errors.join('; '), 'err');
			return null;
		}
		let tmpV = this.helpers.validateFixture(tmpParsed.fixture);
		if (!tmpV.ok)
		{
			this._setStatus('Validation: ' + tmpV.errors.join('; '), 'err');
			return null;
		}
		// Reflect the parsed fixture into the JSON pane so users can see
		// what the AI prompt is asking the LLM to produce.
		document.getElementById('studio-json').value =
			JSON.stringify(tmpParsed.fixture, null, 2);
		return tmpParsed.fixture;
	}

	/**
	 * Build an AI prompt from the current description textarea and copy
	 * it to the clipboard.  This is the bridge between "I have a vague
	 * idea" and "I have a structured fixture" — the user pastes the prompt
	 * into their LLM, then drops the LLM's JSON back into the JSON pane.
	 */
	copyAIPrompt()
	{
		let tmpDesc = document.getElementById('studio-description').value;
		let tmpPrompt = this.helpers.buildAIPrompt(tmpDesc, this.fewShots);
		document.getElementById('studio-prompt-preview').value = tmpPrompt;

		// Copy to clipboard — preferred path is navigator.clipboard, with
		// a textarea-fallback for older browsers / non-https origins.
		if (navigator.clipboard && navigator.clipboard.writeText)
		{
			navigator.clipboard.writeText(tmpPrompt).then(() =>
			{
				this._setStatus('AI prompt copied to clipboard.', 'ok');
			}).catch((pErr) =>
			{
				this._fallbackCopy(tmpPrompt);
			});
		}
		else
		{
			this._fallbackCopy(tmpPrompt);
		}
	}

	_fallbackCopy(pText)
	{
		let tmpTextarea = document.createElement('textarea');
		tmpTextarea.value = pText;
		tmpTextarea.style.position = 'fixed';
		tmpTextarea.style.top  = '-1000px';
		document.body.appendChild(tmpTextarea);
		tmpTextarea.select();
		try { document.execCommand('copy'); this._setStatus('AI prompt copied (fallback).', 'ok'); }
		catch (pErr)   { this._setStatus('Copy failed; select the prompt below and copy manually.', 'warn'); }
		document.body.removeChild(tmpTextarea);
	}

	/**
	 * Switch input pane (DSL ↔ JSON ↔ AI Prompt).  Wired from the tab buttons.
	 */
	selectTab(pMode)
	{
		let tmpTabs = document.querySelectorAll('.studio-tab');
		for (let i = 0; i < tmpTabs.length; i++)
		{
			tmpTabs[i].classList.toggle('active', tmpTabs[i].getAttribute('data-mode') === pMode);
		}
		let tmpPanes = document.querySelectorAll('.studio-pane');
		for (let i = 0; i < tmpPanes.length; i++)
		{
			tmpPanes[i].classList.toggle('active', tmpPanes[i].getAttribute('data-mode') === pMode);
		}
	}

	/**
	 * Load one of the built-in examples into the DSL pane (and JSON pane)
	 * so a new user can see what the input shape looks like.
	 */
	loadExample(pKey)
	{
		let tmpExample = _EXAMPLES[pKey];
		if (!tmpExample) return;
		document.getElementById('studio-dsl').value         = tmpExample.dsl;
		document.getElementById('studio-json').value        = JSON.stringify(tmpExample.json, null, 2);
		document.getElementById('studio-description').value = tmpExample.description;
		this.renderDiagram();
	}

	exportSvg()
	{
		let tmpView = this.pict.views.NotebookStudioPreviewView;
		if (!tmpView) return;
		tmpView.exportSvg({ exportEmbedScene: true, exportBackground: true }).then((pSvgEl) =>
		{
			let tmpStr = new XMLSerializer().serializeToString(pSvgEl);
			let tmpBlob = new Blob([ tmpStr ], { type: 'image/svg+xml' });
			let tmpUrl  = URL.createObjectURL(tmpBlob);
			let tmpA    = document.createElement('a');
			tmpA.href = tmpUrl;
			tmpA.download = 'notebook-diagram.excalidraw.svg';
			tmpA.click();
			setTimeout(() => URL.revokeObjectURL(tmpUrl), 1000);
			this._setStatus('Exported SVG (scene embedded — re-openable in any pict-section-excalidraw view).', 'ok');
		}).catch((pErr) =>
		{
			this._setStatus('Export failed: ' + pErr.message, 'err');
		});
	}

	exportJson()
	{
		let tmpFixture = this._currentFixture();
		if (!tmpFixture) return;
		let tmpScene = this.generator(tmpFixture, null);
		let tmpBlob = new Blob([ JSON.stringify(tmpScene, null, 2) ], { type: 'application/json' });
		let tmpUrl  = URL.createObjectURL(tmpBlob);
		let tmpA    = document.createElement('a');
		tmpA.href = tmpUrl;
		tmpA.download = 'notebook-diagram.excalidraw.json';
		tmpA.click();
		setTimeout(() => URL.revokeObjectURL(tmpUrl), 1000);
		this._setStatus('Exported scene JSON.', 'ok');
	}

	_setStatus(pMessage, pLevel)
	{
		let tmpEl = document.getElementById('studio-status');
		if (!tmpEl) return;
		tmpEl.textContent = pMessage;
		tmpEl.className = 'studio-status studio-status-' + (pLevel || 'info');
	}
}

// Built-in DSL + JSON + description examples for the "Load example" picker.
const _EXAMPLES =
{
	'service-flow':
	{
		description: 'A four-service backend: a user makes a request to an API gateway, which queries a database and looks up a cache (asynchronously).',
		dsl:
			'title: service flow\n' +
			'\n' +
			'user: User (ellipse)\n' +
			'api: API Gateway\n' +
			'auth: Auth {accent}\n' +
			'db: Database\n' +
			'cache: Cache (note) {background:highlight}\n' +
			'\n' +
			'user -> api: request\n' +
			'api -> auth: verify\n' +
			'api -> db: query\n' +
			'api -> cache: lookup (dashed)\n',
		json:
		{
			title: 'service flow',
			nodes:
			[
				{ id: 'user',  label: 'User',        kind: 'ellipse' },
				{ id: 'api',   label: 'API Gateway', kind: 'rectangle' },
				{ id: 'auth',  label: 'Auth',        kind: 'rectangle', accent: 'accent' },
				{ id: 'db',    label: 'Database',    kind: 'rectangle' },
				{ id: 'cache', label: 'Cache',       kind: 'note', background: 'highlight' }
			],
			edges:
			[
				{ from: 'user',  to: 'api',   label: 'request' },
				{ from: 'api',   to: 'auth',  label: 'verify' },
				{ from: 'api',   to: 'db',    label: 'query' },
				{ from: 'api',   to: 'cache', label: 'lookup', kind: 'dashed' }
			],
			layout: 'flow'
		}
	},
	'decision':
	{
		description: 'A ship-readiness decision flow with two diamond gates (tests passing? CI green?) leading to either ship or fix.',
		dsl:
			'title: should i ship it?\n' +
			'\n' +
			'tests: tests passing? (diamond)\n' +
			'ci: CI green? (diamond)\n' +
			'ship: ship it (ellipse) {link}\n' +
			'wait: fix + retry (note) {background:highlight}\n' +
			'\n' +
			'tests -> ci: yes\n' +
			'tests -> wait: no\n' +
			'ci -> ship: yes\n' +
			'ci -> wait: no\n',
		json:
		{
			title: 'should i ship it?',
			nodes:
			[
				{ id: 'tests', label: 'tests passing?', kind: 'diamond' },
				{ id: 'ci',    label: 'CI green?',      kind: 'diamond' },
				{ id: 'ship',  label: 'ship it',        kind: 'ellipse', accent: 'link' },
				{ id: 'wait',  label: 'fix + retry',    kind: 'note', background: 'highlight' }
			],
			edges:
			[
				{ from: 'tests', to: 'ci',   label: 'yes' },
				{ from: 'tests', to: 'wait', label: 'no' },
				{ from: 'ci',    to: 'ship', label: 'yes' },
				{ from: 'ci',    to: 'wait', label: 'no' }
			],
			layout: 'flow'
		}
	},
	'mental-model':
	{
		description: 'How pict-section-excalidraw wraps the React Excalidraw component, with an alternate iframe path.',
		dsl:
			'title: pict-section-excalidraw\n' +
			'\n' +
			'app: Pict App (ellipse)\n' +
			'section: pict-section-\\nexcalidraw {link}\n' +
			'react: React Mount\n' +
			'iframe: Iframe Mount\n' +
			'wrapper: wrapper bundle (note) {background:highlight}\n' +
			'excalidraw: Excalidraw\\n(React) {accent}\n' +
			'scene: .excalidraw.svg\\n+ .excalidraw.json\n' +
			'\n' +
			'app -> section: addView\n' +
			'section -> react: react mode\n' +
			'section -> iframe: iframe mode (dashed)\n' +
			'react -> wrapper: loads\n' +
			'iframe -> wrapper: loads in iframe (dashed)\n' +
			'wrapper -> excalidraw: mounts\n' +
			'excalidraw -> scene: saves\n',
		json:
		{
			title: 'pict-section-excalidraw',
			nodes:
			[
				{ id: 'app',        label: 'Pict App',           kind: 'ellipse' },
				{ id: 'section',    label: 'pict-section-\nexcalidraw', kind: 'rectangle', accent: 'link' },
				{ id: 'react',      label: 'React Mount',        kind: 'rectangle' },
				{ id: 'iframe',     label: 'Iframe Mount',       kind: 'rectangle' },
				{ id: 'wrapper',    label: 'wrapper bundle',     kind: 'note', background: 'highlight' },
				{ id: 'excalidraw', label: 'Excalidraw\n(React)', kind: 'rectangle', accent: 'accent' },
				{ id: 'scene',      label: '.excalidraw.svg\n+ .excalidraw.json', kind: 'rectangle' }
			],
			edges:
			[
				{ from: 'app',        to: 'section',    label: 'addView' },
				{ from: 'section',    to: 'react',      label: 'react mode' },
				{ from: 'section',    to: 'iframe',     label: 'iframe mode', kind: 'dashed' },
				{ from: 'react',      to: 'wrapper',    label: 'loads' },
				{ from: 'iframe',     to: 'wrapper',    label: 'loads in iframe', kind: 'dashed' },
				{ from: 'wrapper',    to: 'excalidraw', label: 'mounts' },
				{ from: 'excalidraw', to: 'scene',      label: 'saves' }
			],
			layout: 'flow'
		}
	}
};

module.exports = NotebookStudioApplication;

module.exports.default_configuration = (
{
	"Name": "Notebook Studio",
	"Hash": "NotebookStudio",
	"MainViewportViewIdentifier": "NotebookStudioPreviewView",
	"pict_configuration":
	{
		"Product": "NotebookStudio-Example",
		"DefaultAppData": {}
	}
});

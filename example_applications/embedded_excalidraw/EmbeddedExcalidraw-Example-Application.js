const libPictApplication = require('pict-application');
const libPictSectionExcalidraw = require('../../source/Pict-Section-Excalidraw.js');

// LocalStorage-backed "store" — demonstrates OnLoad/OnSave overrides.  Real
// apps would talk to Meadow, a remote API, IndexedDB, or the file system here.
const STORAGE_KEY = 'pict-section-excalidraw-demo-scene';

class EmbeddedExcalidrawView extends libPictSectionExcalidraw.ReactView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

const _EmbeddedExcalidrawConfiguration = (
{
	"ViewIdentifier": "EmbeddedExcalidrawView",
	"TargetElementAddress": "#ExcalidrawSmallBox",
	"Theme": "light",
	"AssetBaseURL": "./excalidraw-assets/",

	// Custom load/save: pull from / push to localStorage.
	"OnLoad": (pView, fCallback) =>
	{
		try
		{
			let tmpRaw = window.localStorage.getItem(STORAGE_KEY);
			if (!tmpRaw) return fCallback(null, null);
			let tmpParsed = JSON.parse(tmpRaw);
			fCallback(null, tmpParsed);
		}
		catch (pErr) { fCallback(pErr); }
	},
	"OnSave": (pView, pSceneData, fCallback) =>
	{
		try
		{
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pSceneData));
			fCallback(null);
		}
		catch (pErr) { fCallback(pErr); }
	},

	// Notify-and-stamp on every throttled change so the sidebar status line
	// can show a "Unsaved changes" indicator.
	"OnChange": (pView, pScene) =>
	{
		let tmpEl = document.getElementById('SceneStatus');
		if (tmpEl) tmpEl.textContent = `Last edited at ${new Date().toLocaleTimeString()} — ${pScene.elements.length} element(s).`;
	}
});

class EmbeddedExcalidrawApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.pict.addView('EmbeddedExcalidrawView', _EmbeddedExcalidrawConfiguration, EmbeddedExcalidrawView);
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();
		let tmpView = this.pict.views.EmbeddedExcalidrawView;
		if (tmpView)
		{
			tmpView.render();
			// Pull whatever's in localStorage on first load.
			setTimeout(() => { try { tmpView.load(); } catch (e) {} }, 200);
		}
	}
}

module.exports = EmbeddedExcalidrawApplication;

module.exports.default_configuration = (
{
	"Name": "Embedded Excalidraw Example",
	"Hash": "EmbeddedExcalidrawExample",
	"MainViewportViewIdentifier": "EmbeddedExcalidrawView",
	"pict_configuration":
	{
		"Product": "EmbeddedExcalidraw-Example",
		"DefaultAppData": {}
	}
});

const libPictApplication = require('pict-application');
const libPictSectionExcalidraw = require('../../source/Pict-Section-Excalidraw.js');

class FullBrowserExcalidrawView extends libPictSectionExcalidraw.ReactView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

const _FullBrowserExcalidrawConfiguration = (
{
	"ViewIdentifier": "FullBrowserExcalidrawView",
	"TargetElementAddress": "#ExcalidrawContainer",
	"DrawingDataAddress": "AppData.Drawing",
	"Theme": "light",
	"AssetBaseURL": "./excalidraw-assets/"
});

class FullBrowserExcalidrawApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView('FullBrowserExcalidrawView', _FullBrowserExcalidrawConfiguration, FullBrowserExcalidrawView);
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();
		let tmpView = this.pict.views.FullBrowserExcalidrawView;
		if (tmpView)
		{
			tmpView.render();
		}
	}
}

module.exports = FullBrowserExcalidrawApplication;

module.exports.default_configuration = (
{
	"Name": "Full-Browser Excalidraw Example",
	"Hash": "FullBrowserExcalidrawExample",
	"MainViewportViewIdentifier": "FullBrowserExcalidrawView",
	"pict_configuration":
	{
		"Product": "FullBrowserExcalidraw-Example",
		"DefaultAppData":
		{
			"Drawing":
			{
				"elements": [],
				"appState": {},
				"files":    {}
			}
		}
	}
});

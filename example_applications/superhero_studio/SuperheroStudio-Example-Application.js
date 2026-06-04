/**
 * SuperheroStudio-Example-Application.js
 *
 * The "Superhero Studio" — a pict-section-form showcase that exercises both
 * new complex InputTypes in one place:
 *
 *   - RichText (origin story)   — markdown editor / rendered markdown
 *   - Diagram  (portrait)       — Excalidraw / inline themed SVG
 *
 * Plus a bunch of stock inputs (Text, Number, Select, TextArea) so the form
 * feels like a real character-sheet UI.
 *
 * A dropdown at the top loads one of five pre-baked superheroes — their
 * stats, portraits, and origin stories all flow into the form via
 * marshalDataFromAppDataToView(). Try toggling the portrait or origin into
 * edit mode and editing them — the rest of the form keeps working.
 */

const libPictApplication = require('pict-application');
const libPictSectionForm = require('pict-section-form');

const libSuperheroes = require('./superheroes/Superheroes.js');

// ----- Form manifest -------------------------------------------------------

const _PowerOptions =
[
	{ id: 'Telepathy',           text: 'Telepathy'              },
	{ id: 'Manifestation',       text: 'Manifestation'          },
	{ id: 'Syntax Highlighting', text: 'Syntax Highlighting'    },
	{ id: 'Z-Index Manipulation',text: 'Z-Index Manipulation'   },
	{ id: 'Snap to Grid',        text: 'Snap to Grid'           },
	{ id: 'Flight',              text: 'Flight'                 },
	{ id: 'Super Strength',      text: 'Super Strength'         },
	{ id: 'Invisibility',        text: 'Invisibility'           },
	{ id: 'Time Travel',         text: 'Time Travel'            },
	{ id: 'Pyrokinesis',         text: 'Pyrokinesis'            }
];

const _ColorOptions =
[
	{ id: 'Red',    text: 'Red'    },
	{ id: 'Blue',   text: 'Blue'   },
	{ id: 'Green',  text: 'Green'  },
	{ id: 'Black',  text: 'Black'  },
	{ id: 'Yellow', text: 'Yellow' },
	{ id: 'Purple', text: 'Purple' }
];

const _Descriptors =
{
	// ---- Identity ----
	'Name': {
		Name: 'Name', Hash: 'Name', DataType: 'String',
		PictForm: { Section: 'Identity', Row: 1, Width: 6, InputType: 'Text' }
	},
	'AlterEgo': {
		Name: 'Alter Ego', Hash: 'AlterEgo', DataType: 'String',
		PictForm: { Section: 'Identity', Row: 1, Width: 6, InputType: 'Text' }
	},
	'ShoeSize': {
		Name: 'Shoe Size (US)', Hash: 'ShoeSize', DataType: 'Number',
		PictForm: { Section: 'Identity', Row: 2, Width: 3, InputType: 'Number', Min: 1, Max: 22, Step: 0.5 }
	},
	'OriginYear': {
		Name: 'Year of Origin', Hash: 'OriginYear', DataType: 'Number',
		PictForm: { Section: 'Identity', Row: 2, Width: 3, InputType: 'Number', Min: 1900, Max: 2099 }
	},
	'CoffeeCupsPerDay': {
		Name: 'Coffee Cups / Day', Hash: 'CoffeeCupsPerDay', DataType: 'Number',
		PictForm: { Section: 'Identity', Row: 2, Width: 3, InputType: 'Number', Min: 0, Max: 99 }
	},
	'NumberOfSidekicks': {
		Name: 'Active Sidekicks', Hash: 'NumberOfSidekicks', DataType: 'Number',
		PictForm: { Section: 'Identity', Row: 2, Width: 3, InputType: 'Number', Min: 0, Max: 99 }
	},

	// ---- Powers ----
	'PowerLevel': {
		Name: 'Power Level (1–10)', Hash: 'PowerLevel', DataType: 'Number',
		PictForm: { Section: 'Powers', Row: 1, Width: 3, InputType: 'Number', Min: 1, Max: 10 }
	},
	'PrimaryPower': {
		Name: 'Primary Power', Hash: 'PrimaryPower', DataType: 'String',
		PictForm: { Section: 'Powers', Row: 1, Width: 5, InputType: 'Option', SelectOptions: _PowerOptions }
	},
	'ThemeColor': {
		Name: 'Theme Color', Hash: 'ThemeColor', DataType: 'String',
		PictForm: { Section: 'Powers', Row: 1, Width: 4, InputType: 'Option', SelectOptions: _ColorOptions }
	},
	'Weakness': {
		Name: 'Known Weakness', Hash: 'Weakness', DataType: 'String',
		PictForm: { Section: 'Powers', Row: 2, Width: 6, InputType: 'Text' }
	},
	'FavoriteSnack': {
		Name: 'Favorite Snack', Hash: 'FavoriteSnack', DataType: 'String',
		PictForm: { Section: 'Powers', Row: 2, Width: 6, InputType: 'Text' }
	},
	'Catchphrase': {
		Name: 'Signature Catchphrase', Hash: 'Catchphrase', DataType: 'String',
		PictForm: { Section: 'Powers', Row: 3, Width: 12, InputType: 'TextArea', TextAreaRows: 2 }
	},

	// ---- Portrait (Diagram InputType) ----
	'Portrait': {
		Name: 'Portrait', Hash: 'Portrait', DataType: 'String',
		PictForm:
		{
			Section: 'Portrait', Row: 1, Width: 12,
			InputType: 'Diagram',
			Diagram:
			{
				ThemeColors:          true,
				Height:               '320px',
				EditorImplementation: 'react'
			}
		}
	},

	// ---- Origin Story (RichText InputType) ----
	'OriginStory': {
		Name: 'Origin Story', Hash: 'OriginStory', DataType: 'String',
		PictForm:
		{
			Section: 'OriginStory', Row: 1, Width: 12,
			InputType: 'RichText',
			RichText:
			{
				AllowImages:   true,
				ImageUploader: 'uploadImage',
				Height:        '380px'
			}
		}
	}
};

const _FormManifest =
{
	Scope: 'SuperheroForm',
	Sections:
	[
		{ Hash: 'Identity',    Name: 'Identity'      },
		{ Hash: 'Powers',      Name: 'Powers & Loadout' },
		{ Hash: 'Portrait',    Name: 'Portrait'      },
		{ Hash: 'OriginStory', Name: 'Origin Story'  }
	],
	Descriptors: _Descriptors
};

// ----- Application ---------------------------------------------------------

class SuperheroStudioApplication extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Register the RichText input provider (from pict-section-markdowneditor).
		// Both complex InputType providers live in pict-section-form. The heavy
		// editor deps (markdowneditor → CodeMirror, excalidraw → vendor bundle)
		// lazy-load on the first setMode('edit'), so this view-by-default form
		// pays for neither editor at boot.
		let libRichTextInput = libPictSectionForm.RichTextInput;
		this.pict.addProvider(
			libRichTextInput.default_configuration.ProviderIdentifier,
			libRichTextInput.default_configuration,
			libRichTextInput);

		let libDiagramInput = libPictSectionForm.DiagramInput;
		this.pict.addProvider(
			libDiagramInput.default_configuration.ProviderIdentifier,
			libDiagramInput.default_configuration,
			libDiagramInput);

		// Seed with the first hero so the form has data on load.
		this._currentHeroSlug = 'captain-verbose';
		this.pict.AppData.SuperheroForm =
			JSON.parse(JSON.stringify(libSuperheroes[this._currentHeroSlug]));
	}

	// -----------------------------------------------------------------
	// Dropdown / page handlers (called from index.html inline onclick)
	// -----------------------------------------------------------------

	demo_loadHero(pSlug)
	{
		let tmpHero = libSuperheroes[pSlug];
		if (!tmpHero) return;
		this._currentHeroSlug = pSlug;

		// Tear down any currently-open editor instances so the swap doesn't
		// leave a stale CodeMirror/Excalidraw painting yesterday's hero.
		this._foldAllEditors();

		// Replace the form's source-of-truth record.
		this.pict.AppData.SuperheroForm = JSON.parse(JSON.stringify(tmpHero));

		// Push the new record into the rendered form.
		try { this.marshalDataFromAppDataToView(); }
		catch (pErr) { if (this.log) this.log.warn('[superhero_studio] marshal failed', { error: pErr.message }); }

		this._refreshToggleLabels();
	}

	demo_toggleMode(pInputHash)
	{
		let tmpProvider = this._providerForInput(pInputHash);
		if (!tmpProvider) return;
		tmpProvider.toggleMode(pInputHash, (pErr) =>
		{
			if (pErr && this.log) this.log.warn('[superhero_studio] toggleMode error',
				{ error: pErr.message, inputHash: pInputHash });
			this._refreshToggleLabels();
		});
	}

	/**
	 * Demo image uploader for the RichText origin-story field. In a real app
	 * this would POST to your image-storage endpoint and call back with the
	 * permanent URL. Here we mint a fake CDN URL after a brief delay.
	 */
	uploadImage(pFile, pInputDescriptor, fCallback)
	{
		setTimeout(() =>
		{
			let tmpFakeURL = '/uploads/heroes/' + Date.now() + '-' +
				(pFile.name || 'image.png').replace(/[^A-Za-z0-9._-]/g, '_');
			fCallback(null, tmpFakeURL);
			if (this.log) this.log.info('[superhero_studio] uploadImage resolved', { url: tmpFakeURL });
		}, 600);
		return true;
	}

	// -----------------------------------------------------------------
	// Internals
	// -----------------------------------------------------------------

	_providerForInput(pInputHash)
	{
		let tmpDescriptor = _Descriptors[pInputHash];
		if (!tmpDescriptor) return null;
		let tmpType = tmpDescriptor.PictForm && tmpDescriptor.PictForm.InputType;
		if (tmpType === 'RichText') return this.pict.providers['Pict-Input-RichText'];
		if (tmpType === 'Diagram')  return this.pict.providers['Pict-Input-Diagram'];
		return null;
	}

	_foldAllEditors()
	{
		let tmpHashes = ['Portrait', 'OriginStory'];
		for (let i = 0; i < tmpHashes.length; i++)
		{
			let tmpProvider = this._providerForInput(tmpHashes[i]);
			if (tmpProvider && tmpProvider.getMode(tmpHashes[i]) === 'edit')
			{
				try { tmpProvider.setMode(tmpHashes[i], 'view', () => {}); }
				catch (pErr) { /* swallow — happens if not yet mounted */ }
			}
		}
	}

	_refreshToggleLabels()
	{
		if (typeof document === 'undefined') return;
		let tmpHashes = ['Portrait', 'OriginStory'];
		for (let i = 0; i < tmpHashes.length; i++)
		{
			let tmpHash = tmpHashes[i];
			let tmpProvider = this._providerForInput(tmpHash);
			let tmpBtn = document.getElementById('toggle-' + tmpHash);
			if (!tmpBtn) continue;
			let tmpMode = tmpProvider ? tmpProvider.getMode(tmpHash) : null;
			tmpBtn.textContent = (tmpMode === 'edit') ? 'Done' : 'Edit';
		}
	}
}

module.exports = SuperheroStudioApplication;

module.exports.default_configuration =
{
	Name: 'Superhero Studio',
	Hash: 'SuperheroStudio',
	pict_configuration:
	{
		Product: 'SuperheroStudio-Example',
		DefaultFormManifest: _FormManifest
	}
};

// Expose the slug list so the HTML dropdown can render its options dynamically.
module.exports.HeroSlugs = Object.keys(libSuperheroes);
module.exports.Heroes    = libSuperheroes;

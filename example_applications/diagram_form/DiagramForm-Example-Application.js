/**
 * DiagramForm-Example-Application.js
 *
 * Demonstrates the Diagram InputType from pict-section-excalidraw inside a
 * pict-section-form. The form boots with every Diagram field in VIEW mode
 * (inline themed SVG). A page button toggles into edit mode (Excalidraw).
 *
 * Theme demo:
 *
 *   The saved SVG carries `var(--diagram-ink, #1B1F23)` etc., with hex
 *   fallbacks. A "Theme" button on the page swaps a <style> tag that defines
 *   those custom properties — the view-mode SVG visibly recolors without
 *   re-rendering anything. No editor bundle touched.
 */

const libPictApplication       = require('pict-application');
const libPictSectionForm = require('pict-section-form');

const _FormDescriptors =
{
	'ArchDiagram':
	{
		Name: 'Architecture Diagram',
		Hash: 'ArchDiagram',
		DataType: 'String',
		PictForm:
		{
			Section:   'Diagram',
			Row:       1,
			Width:     12,
			InputType: 'Diagram',
			Diagram:
			{
				ThemeColors:          true,
				Height:               '480px',
				EditorImplementation: 'react'
			}
		}
	}
};

// A minimal pre-baked SVG (notebook style, hex fallbacks already in place via
// themeifySVG) so the form has something to display in view mode at boot. In a
// real app this would come from the record being edited.
const _DemoSvg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200">
	<metadata><!-- payload-type:application/vnd.excalidraw+json --><!-- payload-start --> e30= <!-- payload-end --></metadata>
	<g>
		<rect x="20"  y="40" width="100" height="50" rx="6" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="2"/>
		<text x="70"  y="72" text-anchor="middle" style="fill: var(--diagram-ink, #1B1F23); font-family: sans-serif;">Client</text>

		<path d="M 120 65 L 220 65" stroke="var(--diagram-accent, #E66C2C)" fill="none" stroke-width="2" marker-end="url(#arrow)"/>

		<rect x="220" y="40" width="120" height="50" rx="6" stroke="var(--diagram-ink, #1B1F23)" fill="var(--diagram-paper, #FDFCF7)" stroke-width="2"/>
		<text x="280" y="72" text-anchor="middle" style="fill: var(--diagram-ink, #1B1F23); font-family: sans-serif;">API Server</text>

		<defs>
			<marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
				<path d="M 0 0 L 8 4 L 0 8 z" fill="var(--diagram-accent, #E66C2C)"/>
			</marker>
		</defs>
	</g>
</svg>`;

const _FormManifest =
{
	Scope: 'DiagramDemoForm',
	Sections:
	[
		{ Hash: 'Diagram', Name: 'Architecture' }
	],
	Descriptors: _FormDescriptors
};

class DiagramFormApplication extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Register the Diagram input provider. It lives in pict-section-form
		// and lazy-requires pict-section-excalidraw on the first edit toggle —
		// the view-mode SVG path doesn't load the editor bundle at all.
		let libDiagramInput = libPictSectionForm.DiagramInput;
		this.pict.addProvider(
			libDiagramInput.default_configuration.ProviderIdentifier,
			libDiagramInput.default_configuration,
			libDiagramInput
		);

		this.pict.AppData.DiagramDemoForm = { ArchDiagram: _DemoSvg };
	}

	demo_toggleMode(pInputHash)
	{
		let tmpProvider = this.pict.providers['Pict-Input-Diagram'];
		if (!tmpProvider) return;
		tmpProvider.toggleMode(pInputHash, (pErr) =>
		{
			if (pErr && this.log) this.log.warn('[diagram_form demo] toggleMode error', { error: pErr.message });
			this._refreshModeLabel(pInputHash);
		});
	}

	_refreshModeLabel(pInputHash)
	{
		let tmpProvider = this.pict.providers['Pict-Input-Diagram'];
		if (!tmpProvider) return;
		let tmpMode  = tmpProvider.getMode(pInputHash);
		let tmpLabel = (tmpMode === 'edit') ? 'Done' : 'Edit';
		let tmpBtn   = (typeof document !== 'undefined') ? document.getElementById('toggle-' + pInputHash) : null;
		if (tmpBtn) tmpBtn.textContent = tmpLabel;
	}
}

module.exports = DiagramFormApplication;

module.exports.default_configuration =
{
	Name: 'Diagram Form Example',
	Hash: 'DiagramFormExample',
	pict_configuration:
	{
		Product: 'DiagramForm-Example',
		DefaultFormManifest: _FormManifest
	}
};

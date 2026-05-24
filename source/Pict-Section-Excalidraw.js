/**
 * pict-section-excalidraw — main entry.
 *
 * Exports a single dispatch view class that picks between the React-mount and
 * iframe implementations at construction time based on the EmbedMode option.
 *
 * Consumers can either:
 *   1. Use the default export and pass EmbedMode in the configuration
 *   2. Pull the explicit implementation classes directly:
 *        const { ReactView, IframeView } = require('pict-section-excalidraw');
 */

const libPictViewClass            = require('pict-view');
const libExcalidrawReactView      = require('./views/PictView-Excalidraw-React.js');
const libExcalidrawIframeView     = require('./views/PictView-Excalidraw-Iframe.js');
const _DefaultConfiguration       = require('./Pict-Section-Excalidraw-DefaultConfiguration.js');

/**
 * Resolve which implementation class the consumer wants based on the merged
 * configuration.  Exposed so the dispatch view and any framework registration
 * helpers can agree on the same selection logic.
 */
function selectImplementation(pOptions)
{
	let tmpMode = ((pOptions && pOptions.EmbedMode) || _DefaultConfiguration.EmbedMode || 'react').toLowerCase();
	if (tmpMode === 'iframe')
	{
		return libExcalidrawIframeView;
	}
	return libExcalidrawReactView;
}

/**
 * PictSectionExcalidraw — thin dispatcher.  Constructs the chosen
 * implementation as a sibling pict-view on the same fable and proxies the
 * public surface onto it.  We don't extend either implementation directly
 * because the embed mode is a runtime decision, not a class-level one.
 */
class PictSectionExcalidraw extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DefaultConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this._ImplementationClass = selectImplementation(tmpOptions);

		// Instantiate the actual implementation view as a peer pict-view.  It
		// gets its own ViewIdentifier (suffixed) so AppData/template scopes
		// don't clash with the dispatcher.
		let tmpImplOptions = Object.assign({}, tmpOptions);
		tmpImplOptions.ViewIdentifier = (tmpOptions.ViewIdentifier || 'PictSectionExcalidraw') + '-Impl';

		this._Implementation = new this._ImplementationClass(pFable, tmpImplOptions, pServiceHash);

		// Public-API proxy: forward every method the implementations expose so
		// consumers can hold a reference to the dispatcher and not care which
		// mode is active.
		let tmpForwardedMethods =
		[
			'getScene', 'setScene', 'exportSvg', 'exportBlob', 'serialize',
			'setTheme', 'setReadOnly', 'load', 'save', 'destroy',
			'getApi', 'connectExcalidrawGlobal', 'isDestroyed',
			'convertMermaidToExcalidraw'
		];
		for (let i = 0; i < tmpForwardedMethods.length; i++)
		{
			let tmpName = tmpForwardedMethods[i];
			this[tmpName] = (...pArgs) =>
			{
				if (typeof this._Implementation[tmpName] === 'function')
				{
					return this._Implementation[tmpName].apply(this._Implementation, pArgs);
				}
				return undefined;
			};
		}
	}

	onAfterRender(pRenderable, pAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();

		// The implementation is what actually owns the destination div.  We
		// render it once the dispatcher's own render cycle has fired so the
		// outer container exists.
		if (this._Implementation && typeof this._Implementation.render === 'function')
		{
			if (!this._dispatchedRender)
			{
				this._dispatchedRender = true;
				this._Implementation.render();
			}
		}

		return super.onAfterRender(pRenderable, pAddress, pRecord, pContent);
	}
}

module.exports = PictSectionExcalidraw;

module.exports.default_configuration = _DefaultConfiguration;
module.exports.ReactView             = libExcalidrawReactView;
module.exports.IframeView            = libExcalidrawIframeView;
module.exports.selectImplementation  = selectImplementation;

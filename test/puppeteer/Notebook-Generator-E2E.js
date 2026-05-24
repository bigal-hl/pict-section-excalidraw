#!/usr/bin/env node
/**
 * Notebook-Generator-E2E.js
 *
 * End-to-end test that exercises:
 *   1. Generate-Notebook-Diagram.js          (JSON-in → scene-JSON-out)
 *   2. PictView-Excalidraw-React mount       (scene → live Excalidraw canvas)
 *   3. exportSvg via the wrapper bundle      (canvas → SVG with embedded scene)
 *
 * Why a puppeteer test and not just a unit test:  the generator emits raw
 * scene JSON, but Excalidraw is the only thing that can actually *render*
 * that JSON.  Without a real browser + wrapper bundle in scope we'd be
 * asserting against ourselves.  Puppeteer gives us a real chromium that
 * actually paints the scene and exports SVG so we can confirm the
 * generator's output is valid Excalidraw input end-to-end.
 *
 * Outputs land in test/output/ for inspection:
 *   - notebook-e2e.input.json              the structured input
 *   - notebook-e2e.scene.json              what the generator produced
 *   - notebook-e2e.excalidraw.svg          the rendered SVG (with embedded scene)
 *   - notebook-e2e.screenshot.png          a screenshot of the Excalidraw canvas
 *
 * Run with: npm run test:e2e
 */

const libFs   = require('fs');
const libPath = require('path');
const libNet  = require('net');
const libHttp = require('http');
const libChild = require('child_process');

const libPuppeteer = require('puppeteer');
const generateNotebookDiagram = require('../../scripts/Generate-Notebook-Diagram.js');

const REPO_ROOT   = libPath.resolve(__dirname, '..', '..');
const DEMO_DIST   = libPath.join(REPO_ROOT, 'example_applications', 'full_browser_excalidraw', 'dist');
const OUTPUT_DIR  = libPath.join(REPO_ROOT, 'test', 'output');
const FIXTURES    = libPath.join(REPO_ROOT, 'test', 'fixtures', 'notebook-diagrams');

/**
 * Resolve which fixtures to run.  No args → all of them.  Positional args
 * (e.g. `npm run test:e2e -- decision-tree mental-model`) → just those.
 */
function resolveFixtures()
{
	let tmpArgs = process.argv.slice(2);
	let tmpAll = libFs.readdirSync(FIXTURES)
		.filter((f) => f.endsWith('.json'))
		.map((f) => f.replace(/\.json$/, ''));
	if (tmpArgs.length === 0) return tmpAll;
	let tmpRequested = [];
	for (let i = 0; i < tmpArgs.length; i++)
	{
		let tmpName = tmpArgs[i].replace(/\.json$/, '');
		if (tmpAll.indexOf(tmpName) === -1)
		{
			throw new Error(`unknown fixture "${tmpName}".  Available: ${tmpAll.join(', ')}`);
		}
		tmpRequested.push(tmpName);
	}
	return tmpRequested;
}

// ----------------------------------------------------------------------------

function ensureDir(p) { libFs.mkdirSync(p, { recursive: true }); }

function getFreePort()
{
	return new Promise((fResolve, fReject) =>
	{
		let tmpSrv = libNet.createServer();
		tmpSrv.listen(0, () =>
		{
			let tmpPort = tmpSrv.address().port;
			tmpSrv.close(() => fResolve(tmpPort));
		});
		tmpSrv.on('error', fReject);
	});
}

function startStaticServer(pPort, pDistPath)
{
	let tmpSrv = libHttp.createServer((pReq, pRes) =>
	{
		let tmpPath = pReq.url.split('?')[0];
		if (tmpPath === '/' || tmpPath === '') tmpPath = '/index.html';
		let tmpFile = libPath.join(pDistPath, tmpPath);
		if (!tmpFile.startsWith(pDistPath))
		{
			pRes.writeHead(403); return pRes.end('forbidden');
		}
		libFs.readFile(tmpFile, (pErr, pData) =>
		{
			if (pErr) { pRes.writeHead(404); return pRes.end('not found: ' + tmpPath); }
			let tmpExt = libPath.extname(tmpFile).toLowerCase();
			let tmpMime = {
				'.html': 'text/html; charset=utf-8',
				'.js':   'application/javascript; charset=utf-8',
				'.css':  'text/css; charset=utf-8',
				'.json': 'application/json; charset=utf-8',
				'.svg':  'image/svg+xml',
				'.png':  'image/png',
				'.woff2': 'font/woff2',
				'.woff':  'font/woff',
				'.ttf':   'font/ttf',
				'.map':   'application/json; charset=utf-8'
			}[tmpExt] || 'application/octet-stream';
			pRes.writeHead(200, { 'Content-Type': tmpMime });
			pRes.end(pData);
		});
	});
	return new Promise((fResolve, fReject) =>
	{
		tmpSrv.listen(pPort, '127.0.0.1', () => fResolve(tmpSrv));
		tmpSrv.on('error', fReject);
	});
}

function logStep(pMessage)
{
	process.stdout.write(`[e2e] ${pMessage}\n`);
}

async function main()
{
	if (!libFs.existsSync(DEMO_DIST))
	{
		throw new Error(
			'Demo dist not found at ' + DEMO_DIST + '\n' +
			'Run `cd example_applications/full_browser_excalidraw && npm run build` first.'
		);
	}
	ensureDir(OUTPUT_DIR);

	let tmpFixtures = resolveFixtures();
	logStep(`running ${tmpFixtures.length} fixture(s): ${tmpFixtures.join(', ')}`);

	logStep('booting static server for the demo dist');
	let tmpPort = await getFreePort();
	let tmpSrv  = await startStaticServer(tmpPort, DEMO_DIST);
	let tmpURL  = `http://127.0.0.1:${tmpPort}/index.html`;
	logStep(`  serving ${DEMO_DIST} at ${tmpURL}`);

	let tmpBrowser, tmpExitCode = 0;
	let tmpResults = [];
	try
	{
		logStep('launching puppeteer');
		tmpBrowser = await libPuppeteer.launch({
			headless: true,
			args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
		});
		let tmpPage = await tmpBrowser.newPage();
		await tmpPage.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

		// Forward page errors to the runner's stdout so the user sees them.
		tmpPage.on('pageerror',  (pErr)  => process.stderr.write('[page-error] ' + pErr.message + '\n'));
		tmpPage.on('console',    (pMsg) =>
		{
			if (pMsg.type() === 'error')
			{
				process.stderr.write('[page-console] ' + pMsg.text() + '\n');
			}
		});

		logStep('navigating to demo');
		await tmpPage.goto(tmpURL, { waitUntil: 'networkidle0', timeout: 30000 });

		logStep('waiting for vendor + view + Excalidraw API');
		await tmpPage.waitForFunction(() =>
		{
			let view = (typeof _Pict !== 'undefined') ? _Pict.views.FullBrowserExcalidrawView : null;
			return !!(window.PictSectionExcalidrawVendor && view && view.getApi());
		}, { timeout: 30000 });

		// Run each fixture: read, generate, set, export, snapshot, round-trip.
		for (let i = 0; i < tmpFixtures.length; i++)
		{
			let tmpName  = tmpFixtures[i];
			let tmpInputPath = libPath.join(FIXTURES, tmpName + '.json');
			logStep(`--- fixture: ${tmpName} ---`);

			let tmpInput = JSON.parse(libFs.readFileSync(tmpInputPath, 'utf8'));
			let tmpScene = generateNotebookDiagram(tmpInput, null);

			libFs.writeFileSync(libPath.join(OUTPUT_DIR, tmpName + '.scene.json'),
				JSON.stringify(tmpScene, null, 2));

			let tmpShapeCount = tmpScene.elements.filter(e => /rectangle|ellipse|diamond/.test(e.type)).length;
			let tmpArrowCount = tmpScene.elements.filter(e => e.type === 'arrow').length;
			let tmpTextCount  = tmpScene.elements.filter(e => e.type === 'text').length;
			logStep(`  generated: shapes=${tmpShapeCount} arrows=${tmpArrowCount} text=${tmpTextCount}`);
			if (tmpShapeCount !== tmpInput.nodes.length) throw new Error(tmpName + ': shape count != node count');
			if (tmpArrowCount !== tmpInput.edges.length) throw new Error(tmpName + ': arrow count != edge count');

			let tmpSetSceneResult = await tmpPage.evaluate((pScene) =>
			{
				let tmpView = _Pict.views.FullBrowserExcalidrawView;
				let tmpResult = tmpView.setScene(pScene);
				return {
					setScene: tmpResult,
					sceneElements: (tmpView.getScene().elements || []).length
				};
			}, tmpScene);
			logStep(`  setScene=${tmpSetSceneResult.setScene}, elements=${tmpSetSceneResult.sceneElements}`);

			// Excalidraw repaints async — wait for it to settle.
			await new Promise(r => setTimeout(r, 500));

			// Scroll the canvas content into view + zoom-to-fit so the
			// screenshot actually captures the whole diagram (Excalidraw's
			// default zoom can leave a flow diagram partially off-screen).
			await tmpPage.evaluate(() =>
			{
				let tmpView = _Pict.views.FullBrowserExcalidrawView;
				let tmpApi = tmpView && tmpView.getApi();
				if (tmpApi && typeof tmpApi.scrollToContent === 'function')
				{
					tmpApi.scrollToContent(undefined, { fitToContent: true, animate: false });
				}
			});
			await new Promise(r => setTimeout(r, 300));

			let tmpSvgString = await tmpPage.evaluate(async () =>
			{
				let tmpView = _Pict.views.FullBrowserExcalidrawView;
				let tmpEl   = await tmpView.exportSvg({ exportEmbedScene: true, exportBackground: true });
				return new XMLSerializer().serializeToString(tmpEl);
			});

			libFs.writeFileSync(libPath.join(OUTPUT_DIR, tmpName + '.excalidraw.svg'), tmpSvgString);
			logStep(`  SVG: ${tmpSvgString.length} bytes`);

			if (!tmpSvgString.includes('payload-version:'))           throw new Error(tmpName + ': payload-version missing');
			if (!tmpSvgString.includes('payload-type:application/vnd.excalidraw+json')) throw new Error(tmpName + ': payload-type missing');
			if (!tmpSvgString.includes('payload-start') || !tmpSvgString.includes('payload-end')) throw new Error(tmpName + ': payload sentinels missing');

			await tmpPage.screenshot({
				path: libPath.join(OUTPUT_DIR, tmpName + '.screenshot.png'),
				fullPage: false
			});

			let tmpReloadCount = await tmpPage.evaluate(async (pSvgString) =>
			{
				let tmpVendor = window.PictSectionExcalidrawVendor;
				let tmpBlob   = new Blob([ pSvgString ], { type: 'image/svg+xml' });
				let tmpLoaded = await tmpVendor.loadFromBlob(tmpBlob, null, null);
				return (tmpLoaded && tmpLoaded.elements || []).length;
			}, tmpSvgString);
			logStep(`  round-trip: ${tmpReloadCount} elements`);
			if (tmpReloadCount !== tmpSetSceneResult.sceneElements)
			{
				throw new Error(tmpName + ': round-trip element count mismatch: set=' + tmpSetSceneResult.sceneElements + ' reloaded=' + tmpReloadCount);
			}

			tmpResults.push({
				name: tmpName,
				elements: tmpSetSceneResult.sceneElements,
				svgBytes: tmpSvgString.length
			});
		}

		logStep('================================');
		logStep('all fixtures passed:');
		for (let i = 0; i < tmpResults.length; i++)
		{
			logStep(`  ${tmpResults[i].name}: ${tmpResults[i].elements} elements, ${tmpResults[i].svgBytes} bytes SVG`);
		}
	}
	catch (pErr)
	{
		process.stderr.write('[e2e] FAILED: ' + (pErr && pErr.stack || pErr) + '\n');
		tmpExitCode = 1;
	}
	finally
	{
		if (tmpBrowser) await tmpBrowser.close();
		await new Promise(r => tmpSrv.close(r));
	}
	process.exit(tmpExitCode);
}

main().catch((pErr) =>
{
	process.stderr.write('[e2e] UNCAUGHT: ' + (pErr && pErr.stack || pErr) + '\n');
	process.exit(2);
});

/*
	Unit tests for the Notebook Studio helpers (DSL parser, AI prompt
	builder, fixture validator).  These live in the studio example app
	but are pure-data functions, so they round-trip cleanly through
	plain mocha.
*/

const Chai = require('chai');
const Expect = Chai.expect;

const libHelpers = require('../example_applications/notebook_studio/Notebook-Studio-Helpers.js');

suite
(
	'NotebookStudioHelpers',
	() =>
	{
		setup(() => { });

		suite
		(
			'Module exports',
			() =>
			{
				test('exports the three helpers', (fDone) =>
				{
					Expect(libHelpers).to.be.an('object');
					Expect(libHelpers.parseStudioDSL).to.be.a('function');
					Expect(libHelpers.buildAIPrompt).to.be.a('function');
					Expect(libHelpers.validateFixture).to.be.a('function');
					return fDone();
				});
			}
		);

		suite
		(
			'parseStudioDSL',
			() =>
			{
				test('a minimal flow parses to nodes + edges', (fDone) =>
				{
					let tmp = libHelpers.parseStudioDSL(
						'title: hi\n' +
						'a: User (ellipse)\n' +
						'b: API\n' +
						'a -> b: request\n'
					);
					Expect(tmp.errors).to.deep.equal([]);
					Expect(tmp.fixture.title).to.equal('hi');
					Expect(tmp.fixture.nodes).to.have.length(2);
					Expect(tmp.fixture.edges).to.have.length(1);
					Expect(tmp.fixture.nodes[0]).to.include({ id: 'a', label: 'User', kind: 'ellipse' });
					Expect(tmp.fixture.edges[0]).to.include({ from: 'a', to: 'b', label: 'request' });
					return fDone();
				});

				test('edges declared without explicit nodes auto-declare the endpoints', (fDone) =>
				{
					let tmp = libHelpers.parseStudioDSL('user -> api: request\n');
					Expect(tmp.errors).to.deep.equal([]);
					Expect(tmp.fixture.nodes.map((n) => n.id).sort()).to.deep.equal(['api', 'user']);
					return fDone();
				});

				test('# starts a comment line', (fDone) =>
				{
					let tmp = libHelpers.parseStudioDSL('# this is ignored\na: A\n');
					Expect(tmp.fixture.nodes).to.have.length(1);
					Expect(tmp.fixture.nodes[0].id).to.equal('a');
					return fDone();
				});

				test('{accent} extracts even when the label contains parens that are not whitelisted kinds', (fDone) =>
				{
					// Regression: an earlier version of the parser greedily
					// extracted ANY (parens) as a kind, so "Excalidraw\n(React)
					// {accent}" produced kind='react' (invalid).  The fix:
					// only known whitelisted kind words extract — everything
					// else stays in the label.
					let tmp = libHelpers.parseStudioDSL('exc: Excalidraw (React) {accent}\n');
					Expect(tmp.errors).to.deep.equal([]);
					Expect(tmp.fixture.nodes[0].id).to.equal('exc');
					Expect(tmp.fixture.nodes[0].label).to.equal('Excalidraw (React)');
					Expect(tmp.fixture.nodes[0].kind).to.equal(undefined);
					Expect(tmp.fixture.nodes[0].accent).to.equal('accent');
					return fDone();
				});

				test('whitelisted (kind) at end of label extracts cleanly', (fDone) =>
				{
					let tmp = libHelpers.parseStudioDSL(
						'a: Some Node (rectangle)\n' +
						'b: Another (note) {background:highlight}\n' +
						'c: Diamond Decision (diamond)\n'
					);
					Expect(tmp.errors).to.deep.equal([]);
					Expect(tmp.fixture.nodes[0]).to.include({ label: 'Some Node', kind: 'rectangle' });
					Expect(tmp.fixture.nodes[1]).to.include({ label: 'Another', kind: 'note', background: 'highlight' });
					Expect(tmp.fixture.nodes[2]).to.include({ label: 'Diamond Decision', kind: 'diamond' });
					return fDone();
				});

				test('duplicate node ids report an error', (fDone) =>
				{
					let tmp = libHelpers.parseStudioDSL(
						'a: First\n' +
						'a: Second\n'
					);
					Expect(tmp.errors.length).to.be.greaterThan(0);
					Expect(tmp.errors[0]).to.match(/duplicate node id "a"/);
					return fDone();
				});

				test('unknown layout value reports an error', (fDone) =>
				{
					let tmp = libHelpers.parseStudioDSL('layout: weirdly\n');
					Expect(tmp.errors.length).to.be.greaterThan(0);
					Expect(tmp.errors[0]).to.match(/unknown layout/);
					return fDone();
				});

				test('layout defaults to flow', (fDone) =>
				{
					let tmp = libHelpers.parseStudioDSL('a: A\n');
					Expect(tmp.fixture.layout).to.equal('flow');
					return fDone();
				});

				test('edge kinds parse correctly', (fDone) =>
				{
					let tmp = libHelpers.parseStudioDSL(
						'a: A\nb: B\nc: C\n' +
						'a -> b: solid edge\n' +
						'b -> c: dashed edge (dashed)\n' +
						'a -> c: dotted (dotted)\n'
					);
					Expect(tmp.errors).to.deep.equal([]);
					Expect(tmp.fixture.edges[0].kind).to.equal(undefined);
					Expect(tmp.fixture.edges[1].kind).to.equal('dashed');
					Expect(tmp.fixture.edges[2].kind).to.equal('dotted');
					return fDone();
				});

				test('blank lines and indentation are tolerated', (fDone) =>
				{
					let tmp = libHelpers.parseStudioDSL(
						'\n\n  a: A\n   \n  b: B\n\n  a -> b\n'
					);
					Expect(tmp.errors).to.deep.equal([]);
					Expect(tmp.fixture.nodes).to.have.length(2);
					Expect(tmp.fixture.edges).to.have.length(1);
					return fDone();
				});
			}
		);

		suite
		(
			'buildAIPrompt',
			() =>
			{
				test('produces a prompt with the schema, examples, and user description', (fDone) =>
				{
					let tmpFewShots = [
						{ name: 'sample', input: { nodes: [{ id: 'x', label: 'X' }], edges: [] } }
					];
					let tmp = libHelpers.buildAIPrompt('build a flow for a thing', tmpFewShots);
					Expect(tmp).to.be.a('string');
					Expect(tmp).to.include('type Diagram');
					Expect(tmp).to.include('## Example 1: "sample"');
					Expect(tmp).to.include('build a flow for a thing');
					Expect(tmp).to.include('Output a single JSON object');
					return fDone();
				});

				test('empty description gets a placeholder', (fDone) =>
				{
					let tmp = libHelpers.buildAIPrompt('', []);
					Expect(tmp).to.include('(describe your diagram here)');
					return fDone();
				});

				test('few-shots inline as JSON code blocks', (fDone) =>
				{
					let tmp = libHelpers.buildAIPrompt('hi', [
						{ name: 'one', input: { nodes: [], edges: [] } },
						{ name: 'two', input: { nodes: [{ id: 'n', label: 'N' }], edges: [] } }
					]);
					Expect(tmp).to.include('## Example 1: "one"');
					Expect(tmp).to.include('## Example 2: "two"');
					Expect(tmp).to.include('```json');
					return fDone();
				});
			}
		);

		suite
		(
			'validateFixture',
			() =>
			{
				test('a well-formed fixture validates', (fDone) =>
				{
					let tmp = libHelpers.validateFixture({
						nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
						edges: [{ from: 'a', to: 'b' }]
					});
					Expect(tmp.ok).to.equal(true);
					Expect(tmp.errors).to.deep.equal([]);
					return fDone();
				});

				test('missing nodes array fails', (fDone) =>
				{
					let tmp = libHelpers.validateFixture({ edges: [] });
					Expect(tmp.ok).to.equal(false);
					Expect(tmp.errors[0]).to.match(/nodes/);
					return fDone();
				});

				test('edge pointing to unknown node fails', (fDone) =>
				{
					let tmp = libHelpers.validateFixture({
						nodes: [{ id: 'a', label: 'A' }],
						edges: [{ from: 'a', to: 'ghost' }]
					});
					Expect(tmp.ok).to.equal(false);
					Expect(tmp.errors[0]).to.match(/ghost/);
					return fDone();
				});

				test('duplicate node id fails', (fDone) =>
				{
					let tmp = libHelpers.validateFixture({
						nodes: [{ id: 'a', label: 'A' }, { id: 'a', label: 'B' }],
						edges: []
					});
					Expect(tmp.ok).to.equal(false);
					Expect(tmp.errors[0]).to.match(/duplicate id "a"/);
					return fDone();
				});

				test('invalid kind fails', (fDone) =>
				{
					let tmp = libHelpers.validateFixture({
						nodes: [{ id: 'a', label: 'A', kind: 'react' }],
						edges: []
					});
					Expect(tmp.ok).to.equal(false);
					Expect(tmp.errors[0]).to.match(/kind "react"/);
					return fDone();
				});

				test('invalid edge kind fails', (fDone) =>
				{
					let tmp = libHelpers.validateFixture({
						nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
						edges: [{ from: 'a', to: 'b', kind: 'wobbly' }]
					});
					Expect(tmp.ok).to.equal(false);
					Expect(tmp.errors[0]).to.match(/kind "wobbly"/);
					return fDone();
				});

				test('non-object input fails cleanly', (fDone) =>
				{
					let tmp = libHelpers.validateFixture(null);
					Expect(tmp.ok).to.equal(false);
					Expect(tmp.errors[0]).to.equal('input is not an object');
					return fDone();
				});
			}
		);
	}
);

module.exports = {
	src: [
		'lib',
	],
	out: './docs',
	mode: 'file',
	includeDeclarations: true,
	tsconfig: 'tsconfig.lib.json',
	excludePrivate: true,
	excludeProtected: true,
	excludeExternals: true,
	readme: 'DOCS_README.md',
	name: 'Paris',
	ignoreCompilerErrors: true,
	plugin: 'none',
};

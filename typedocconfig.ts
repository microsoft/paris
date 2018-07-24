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
	readme: 'README.md',
	name: 'Paris',
	ignoreCompilerErrors: true,
	plugin: 'none',
};

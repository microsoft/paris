import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

// found this online, it does seem to correctly rewrite the rxjs paths
// but is it helping or hurting?
class RollupRx {

	constructor( options ){
		this.options = options;
	}

	resolveId( id ){
		if(id.startsWith('rxjs/')){
			return `${__dirname}/node_modules/rxjs-es/${id.replace('rxjs/', '')}.js`;
		}
	}
}

const rollupRx = config => new RollupRx( config );

export default [
	// browser-friendly UMD build
	{
		entry: 'bundle/lib/main.js',
		dest: pkg.browser,
		format: 'umd',
		moduleName: 'paris',
		plugins: [
			resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		],
		external: id => {
			return /^(rxjs|lodash)/.test(id);
		}
	}
	/*
	,

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// the `targets` option which can specify `dest` and `format`)
	{
		entry: 'bundle/lib/main.js',
		external: ['ms'],
		targets: [
			{ dest: pkg.main, format: 'cjs' },
			{ dest: pkg.module, format: 'es' }
		]
	}
	*/
];

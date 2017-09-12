import {join} from 'path';

import {SeedConfig} from './seed.config';
import {ExtendPackages} from "./seed.config.interfaces";

// import { ExtendPackages } from './seed.config.interfaces';

/**
 * This class extends the basic seed configuration, allowing for project specific overrides. A few examples can be found
 * below.
 */
export class ProjectConfig extends SeedConfig {

	PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');

	constructor() {
		super();
		this.APP_TITLE = 'Paris';
		// this.GOOGLE_ANALYTICS_ID = 'Your site's ID';

		let envConfs: { [index: string]: serverConfig } = {
			'dev': {
				address: 'http://localhost:5001'
			}
		};

		/* Enable typeless compiler runs (faster) between typed compiler runs. */
		// this.TYPED_COMPILE_INTERVAL = 5;

		// Add `NPM` third-party libraries to be injected/bundled.
		this.NPM_DEPENDENCIES = [
			...this.NPM_DEPENDENCIES,
			// {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
			// {src: 'lodash/lodash.min.js', inject: 'libs'},
		];

		// Add `local` third-party libraries to be injected/bundled.
		this.APP_ASSETS = [
			// {src: `${this.APP_SRC}/your-path-to-lib/libs/jquery-ui.js`, inject: true, vendor: false}
			// {src: `${this.CSS_SRC}/path-to-lib/test-lib.css`, inject: true, vendor: false},
		];

		this.ROLLUP_INCLUDE_DIR = [
			...this.ROLLUP_INCLUDE_DIR,
			//'node_modules/moment/**'
		];

		this.ROLLUP_NAMED_EXPORTS = [
			...this.ROLLUP_NAMED_EXPORTS,
			//{'node_modules/immutable/dist/immutable.js': [ 'Map' ]},
		];

		let additionalPackages: ExtendPackages[] = [
			{
				name: '@angular/common/http',
				path: 'node_modules/@angular/common',
				packageMeta: {
					main: 'bundles/common-http.umd.js',
					defaultExtension: 'js'
				}
			},
			{
				name: 'tslib',
				path: 'node_modules/tslib',
				packageMeta: {
					main: 'tslib.js',
					defaultExtension: 'js'
				}
			},
			{
				name: 'reflect-metadata',
				path: 'node_modules/reflect-metadata',
				packageMeta: {
					main: 'Reflect.js',
					defaultExtension: 'js'
				}
			}
		];

		this.addPackagesBundles(additionalPackages);

		/* Add proxy middleware */
		let env = 'dev';
		let server: serverConfig = envConfs[env] ? envConfs[env] : envConfs['dev'];
		let httpProxyMiddleware = require('http-proxy-middleware');
		this.PROXY_MIDDLEWARE = [
			httpProxyMiddleware('/api', {target: server.address + (server.port ? ':' + server.port : '')}),
			httpProxyMiddleware('/ws', {
				ws: true,
				target: server.address + (server.wsPort ? ':' + server.wsPort : server.port ? ':' + server.port : '')
			})
		];

		/* Add to or override NPM module configurations: */
		// this.PLUGIN_CONFIGS['browser-sync'] = { ghostMode: false };
	}

}

interface serverConfig {
	address: string,
	port?: string,
	wsPort?: string
}

import * as webpack from "webpack";
import * as path from 'path';
import { CompilationInfoPlugin } from "../src";

function run(options: webpack.Configuration, action: (stats: webpack.Stats) => void) {
	return new Promise((resolve, reject) => {
		webpack(options, (err, stats) => {
			if (err) {
				reject(err);
				return;
			}
			if (stats.hasErrors()) {
				reject(stats.toString());
				return;
			}

			try {
				action(stats);

				resolve();
			}
			catch (ex) {
				reject(ex);
			}
		})
	});
}

it('basic: emits json by default', async () => {
	await run({
		entry: path.join(__dirname, './data/basic/index.js'),
		output: {
			path: path.join(__dirname, './data/basic/dist/'),
		},
		mode: 'production',
		plugins: [ new CompilationInfoPlugin() ]
	}, stats => {
		expect(stats.compilation.assets['compilation.json']).toMatchObject({ emitted: true });
		expect(stats.compilation.assets['entrypoint_main.json']).toMatchObject({ emitted: true });
	});
});

it('autochunk: emits json by default', async () => {
	await run({
		entry: path.join(__dirname, './data/autochunk/index.js'),
		output: {
			path: path.join(__dirname, './data/autochunk/dist/'),
			chunkFilename: 'chunk.[id].[chunkhash].js',
			filename: '[name].js',
		},
		optimization: {
			splitChunks: {
				chunks: 'all',
				name: true,
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						priority: -10,
						maxSize: 256 * 1024,
						reuseExistingChunk: true,
					},
					default: {
						minChunks: 2,
						priority: -20,
						maxSize: 256 * 1024,
						reuseExistingChunk: true,
					},
				},
			}
		},
		mode: 'production',
		plugins: [ new CompilationInfoPlugin() ]
	}, stats => {
		expect(stats.compilation.assets['compilation.json']).toMatchObject({ emitted: true });
		expect(stats.compilation.assets['entrypoint_main.json']).toMatchObject({ emitted: true });
	});
});

it('replace: replaces value within templates', async () => {
	await run({
		entry: path.join(__dirname, './data/replace/index.js'),
		output: {
			path: path.join(__dirname, './data/replace/dist/'),
		},
		mode: 'production',
		plugins: [ new CompilationInfoPlugin({
			compilationTemplate: {
				output: 'entry-points.txt',
				template: `{{#each entryPoints}}{{{replace name 'main' 'bunny'}}}{{/each}}`
			}
		}) ]
	}, stats => {
		expect(stats.compilation.assets['entry-points.txt']).toMatchObject({ emitted: true });
	});
});

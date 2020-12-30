import * as webpack from 'webpack';
import * as Handlebars from 'handlebars';
import * as model from './model';
import { RawSource } from 'webpack-sources';

const handlebars = Handlebars.create();
handlebars.registerHelper('json', function (context) {
	return JSON.stringify(context, null, 4);
});
handlebars.registerHelper('replace', function (context, searchValue, replaceValue) {
	if (context === null || context === undefined) {
		return context;
	}

	return context.toString().replace(searchValue, replaceValue);
});

export interface CompilationInfoPluginTemplateOptions {
	/**
	 * Handlebars template string.
	 */
	template: string;
	/**
	 * Output filename. Allowed tokens:
	 *  - Compilation: --
	 *  - Entry point: [name]
	 */
	output: string;
}

export interface CompilationInfoPluginOptions {
	/**
	 * Template rendered for each compilation.
	 */
	compilationTemplate?: CompilationInfoPluginTemplateOptions;
	/**
	 * Template rendered for each entry point.
	 */
	entryPointTemplate?: CompilationInfoPluginTemplateOptions;
}

const defaultOptions: CompilationInfoPluginOptions = {
	compilationTemplate: {
		output: 'compilation.json',
		template: '{{{json .}}}'
	},
	entryPointTemplate: {
		output: 'entrypoint_[name].json',
		template: '{{{json .}}}'
	}
};

export class CompilationInfoPlugin {
	constructor(options: Partial<CompilationInfoPluginOptions> = defaultOptions) {
		this.options = {
			compilationTemplate: options.compilationTemplate,
			entryPointTemplate: options.entryPointTemplate,
		};
	}

	private options: CompilationInfoPluginOptions;
	private compilationTemplate?: Handlebars.TemplateDelegate<model.Compilation>;
	private entryPointTemplate?: Handlebars.TemplateDelegate<model.EntryPoint>;

	apply(compiler: webpack.Compiler): void {
		if (this.options.compilationTemplate) {
			this.compilationTemplate = handlebars.compile<model.Compilation>(this.options.compilationTemplate.template);
		}
		if (this.options.entryPointTemplate) {
			this.entryPointTemplate = handlebars.compile<model.EntryPoint>(this.options.entryPointTemplate.template);
		}

		compiler.hooks.thisCompilation.tap('CompilationInfoPlugin', (compilation) => {
			compilation.hooks.processAssets.tapPromise(
				{ name: 'CompilationInfoPlugin', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT },
				async () => {
					const compilationModel: model.Compilation = {
						entryPoints: []
					};
		
					// gather information
					compilation.entrypoints.forEach((entryPoint) => {
						if (!entryPoint.name) {
							return;
						}
		
						const entryPointModel: model.EntryPoint = {
							name: entryPoint.name,
							chunks: [],
						};
		
						for (const chunk of entryPoint.chunks) {
							const chunkModel: model.Chunk = {
								files: [],
							};
		
							for (const file of chunk.files) {
								const fileModel: model.File = {
									name: file,
								};
		
								chunkModel.files.push(fileModel);
							}
		
							entryPointModel.chunks.push(chunkModel);
						}
		
						compilationModel.entryPoints.push(entryPointModel);
					});
		
					// render
					if (this.options.compilationTemplate && this.compilationTemplate) {
						const result = this.compilationTemplate(compilationModel);
						const outputFileName = this.options.compilationTemplate.output;
		
						compilation.emitAsset(outputFileName, new RawSource(result) as any);
					}
					if (this.options.entryPointTemplate && this.entryPointTemplate) {
						for (const entryPoint of compilationModel.entryPoints) {
							const result = this.entryPointTemplate(entryPoint);
							const outputFileName = this.options.entryPointTemplate.output.replace('[name]', entryPoint.name);
		
							compilation.emitAsset(outputFileName, new RawSource(result) as any);
						}
					}
				}
			)
		});
	}
}

# compilation-info-webpack-plugin

Plugin allowing to render compilation information as additional outputs.

**:warning: This library is in an early stage and doesn't have API set in stone. Major changes can happen without warning. :warning:**

## Installation

* `npm install --save-dev webpack` (dependencies)
* `npm install --save-dev compilation-info-webpack-plugin`

## Configuration

```ts
interface CompilationInfoPluginOptions {
    /**
     * Template rendered for each compilation. Template model is `Compilation`.
     */
    compilationTemplate?: CompilationInfoPluginTemplateOptions;
    /**
     * Template rendered for each entry point. Template model is `EntryPoint`.
     */
    entryPointTemplate?: CompilationInfoPluginTemplateOptions;
}
```

```ts
interface CompilationInfoPluginTemplateOptions {
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
```

## Configuration sample

Sample webpack configuration to print out all chunks as `script` tags for ASP.NET Core Razor Pages:

```ts
{
    plugins: [
        new CompilationInfoPlugin({
            entryPointTemplate: {
                output: '../../Pages/Generated/_[name].cshtml',
                template: `@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
{{#each chunks}}
{{#each files}}
<script src="~/assets/{{replace name '@' '@@'}}" asp-append-version="true"></script>
{{/each}}
{{/each}}
`
            }
        }),
    ]
};
```

## Template model

```ts
interface Compilation {
    entryPoints: EntryPoint[];
}

interface EntryPoint {
    name: string;
    chunks: Chunk[];
}

interface Chunk {
    files: File[];
}

interface File {
    name: string;
}
```

## Template omdel sample

```json
{
    "entryPoints": [
        {
            "name": "main",
            "chunks": [
                {
                    "files": [
                        {
                            "name": "main.js"
                        }
                    ]
                }
            ]
        }
    ]
}
```
# Fusion Imports

This package provides utility functions for handling imports.

> [!important]
> This module is meant for usage of __file__ content, not __url__

## Usage

This module is primary for loading configuration from scripts runtime.

### importConfig

`importConfig` will resolve the provided basename by looking for `TypeScript`, then `JavaScript` and then `json`. Internally it will call [importScript](#importscript) and [importJSON](#importjson)

```ts
import { importConfig } from '@equinor/fusion-imports';

type MyConfig {
  name: string;
  bar: {
    foobar: number;
  }
};

type ScriptModule = {
  generateConfig: (options: any) => MyConfig;
}

const config = importConfig('my-config', {
  script: {
    resolve: (module: ScriptModule) => {
      return module.generateConfig(someOptions);
    }
  }
});
```

__example file: `./my-config.ts`__
```ts
import { base } from './baseConfig.ts'

export function generateConfig(options: any): MyConfig {
  return {
    name: 'foo'
    ...base(options)
  }
}
```

#### resolve

`importConfig` will try to resolve `module.default` as default

```ts
// my-script.ts
const config = importConfig<number>('my-config');

// my-config.ts
export default 1;
```

### importScript

Method for loading a script module. This function will use `EsBuild` under the hood, which is useful for loading external script within runtime of other script since it will transpile within the context of the target script.

#### EsBuild

`ImportScriptOptions` is a restricted set of `EsBuild.BuildOptions` which means that you could provide options for compiling the import content.

**plugins**

our implementation does not use any plugins, but working with mono-repos you most likely need to add plugins like:
- [esbuild-plugin-alias](https://www.npmjs.com/package/esbuild-plugin-alias)
- [esbuild-plugin-tsc](https://www.npmjs.com/package/esbuild-plugin-tsc)
- [...more](https://github.com/esbuild/community-plugins)


### importJSON

Method for loading json from disk. Will read content and parse.

### Plugins

The `importScript` function includes built-in plugins to handle common import scenarios:

#### createMarkdownRawPlugin

Creates an esbuild plugin that handles `?raw` imports for markdown files. This plugin is automatically included when using `importScript`, but can also be used independently.

```ts
import { importScript, createMarkdownRawPlugin } from '@equinor/fusion-imports';

// The plugin is automatically included, but you can also add it explicitly
const module = await importScript('./my-script.ts', {
  plugins: [createMarkdownRawPlugin()],
});
```

**Usage in imported files:**

```ts
// my-script.ts
import readmeContent from '../../README.md?raw';

export default readmeContent; // Returns the raw markdown content as a string
```

The plugin:
- Intercepts imports ending with `?raw`
- Resolves paths relative to the importing file (handles `../` correctly)
- Reads the file content and exports it as a default string export

#### createImportMetaResolvePlugin

Creates an esbuild plugin that handles `import.meta.resolve()` calls. This plugin is automatically included when using `importScript`.
# @equinor/fusion-framework-cli-plugin-ai-base

> [!CAUTION]
> **Internal base package** — not intended for direct consumption.
> Use the higher-level AI CLI plugins (`ai-chat`, `ai-index`) instead.

Shared utilities, option definitions, and framework bootstrapping for the
Fusion Framework AI CLI plugins. Every AI sub-command in the Fusion CLI
inherits its Commander options, Zod validation, and framework initialisation
logic from this package.

## Who should use this

Authors of **new Fusion CLI AI plugins** that need the same Azure OpenAI /
Azure Cognitive Search options and framework setup that the existing plugins
share. If you are building a Fusion application, use the published CLI
plugins directly.

## Quick start

### 1. Add the dependency

```jsonc
// package.json (monorepo)
{
  "dependencies": {
    "@equinor/fusion-framework-cli-plugin-ai-base": "workspace:*"
  }
}
```

### 2. Create a sub-command with AI options

```ts
import { createCommand } from 'commander';
import {
  withOptions,
  type AiOptions,
} from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';
import {
  registerAiPlugin,
  setupFramework,
} from '@equinor/fusion-framework-cli-plugin-ai-base';

const myCommand = createCommand('my-task')
  .description('Run my custom AI task');

// Attach core + chat + embedding options and pre-action validation
withOptions(myCommand, { includeChat: true, includeEmbedding: true });

myCommand.action(async (options: AiOptions) => {
  const framework = await setupFramework(options);
  // use framework.ai …
});

// Register under `fusion-cli ai my-task`
export const register = (program: Command) =>
  registerAiPlugin(program, myCommand);
```

### 3. Load a configuration file (optional)

```ts
import {
  loadFusionAIConfig,
  configureFusionAI,
} from '@equinor/fusion-framework-cli-plugin-ai-base';

// fusion-ai.config.ts
export default configureFusionAI(async () => ({
  apiKey: process.env.OPENAI_API_KEY,
  deployment: 'gpt-4',
}));

// at runtime
const config = await loadFusionAIConfig('fusion-ai.config', {
  baseDir: process.cwd(),
});
```

## Export map

The package exposes two entry points:

| Entry point | Import path | Purpose |
|---|---|---|
| Main | `@equinor/fusion-framework-cli-plugin-ai-base` | Framework setup, plugin registration, config loading |
| Command options | `@equinor/fusion-framework-cli-plugin-ai-base/command-options` | Commander option definitions, Zod schema, types |

### Main entry point (`.`)

| Export | Kind | Description |
|---|---|---|
| `setupFramework` | function | Initialise the Fusion Framework with Azure OpenAI chat, embedding, and vector-store modules |
| `registerAiPlugin` | function | Register a Commander sub-command under the shared `ai` command group |
| `loadFusionAIConfig` | function | Locate and import a `fusion-ai.config.{ts,mjs,js,json}` file |
| `configureFusionAI` | function | Type-safe factory for writing configuration files |
| `FrameworkInstance` | type | Initialised framework with the AI module |
| `FusionAIConfig` | interface | Base configuration shape (extend for custom fields) |
| `LoadFusionAIConfigOptions` | interface | Options for `loadFusionAIConfig` (base dir, extensions) |

### Command options entry point (`./command-options`)

| Export | Kind | Description |
|---|---|---|
| `withOptions` | function | Attach AI options and pre-action validation to a Commander command |
| `options` | object | All Commander `Option` instances as a single record |
| `AiOptionsSchema` | Zod schema | Runtime validation for the AI options object |
| `AiOptionsType` | type | Inferred type from `AiOptionsSchema` |
| `AiOptions` | interface | Hand-authored TypeScript interface for the options |

## Environment variables

Every CLI flag has an environment-variable fallback, so plugins work in CI
without explicit flags.

| Flag | Environment variable | Required | Default |
|---|---|---|---|
| `--openai-api-key` | `AZURE_OPENAI_API_KEY` | Yes | — |
| `--openai-api-version` | `AZURE_OPENAI_API_VERSION` | Yes | `2024-02-15-preview` |
| `--openai-instance` | `AZURE_OPENAI_INSTANCE_NAME` | Yes | — |
| `--openai-chat-deployment` | `AZURE_OPENAI_CHAT_DEPLOYMENT_NAME` | When chat is enabled | — |
| `--openai-embedding-deployment` | `AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` | When embedding is enabled | — |
| `--azure-search-endpoint` | `AZURE_SEARCH_ENDPOINT` | When search is enabled | — |
| `--azure-search-api-key` | `AZURE_SEARCH_API_KEY` | When search is enabled | — |
| `--azure-search-index-name` | `AZURE_SEARCH_INDEX_NAME` | When search is enabled | — |

## Key concepts

### Selective option inclusion

`withOptions` accepts an `args` object with three boolean flags — `includeChat`,
`includeEmbedding`, and `includeSearch` — that control which options (and which
pre-action validation rules) are attached. Only include what your command needs.

### Pre-action validation

`withOptions` registers a Commander `preAction` hook that validates required
options before the action handler runs. If a required option is missing or
empty the hook throws `InvalidOptionArgumentError` with a descriptive message
that includes the corresponding environment variable name.

### Framework bootstrap

`setupFramework` creates a `ModulesConfigurator`, enables the AI module, and
conditionally registers chat models, embedding models, and an Azure Cognitive
Search vector store based on which options are present. The returned
`FrameworkInstance` is ready for downstream use.

## Consuming plugins

Changes to this package affect every AI CLI plugin:

- `@equinor/fusion-framework-cli-plugin-ai-chat`
- `@equinor/fusion-framework-cli-plugin-ai-index`

Coordinate updates carefully and create changesets for any consumer-visible
change.

## Development

```sh
pnpm build        # type-check (no bundling)
pnpm test         # run Vitest suite
```


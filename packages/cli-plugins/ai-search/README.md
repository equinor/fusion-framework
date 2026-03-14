# @equinor/fusion-framework-cli-plugin-ai-search

Fusion Framework CLI plugin that adds the **`ffc ai search`** command for
semantic vector-store search against Azure Cognitive Search.  Use it to validate
indexed embeddings, explore the retrieval corpus, or test OData metadata filters
from the command line.

## Who should use this

- **Framework contributors** verifying that TSDoc / README embeddings are
  correctly indexed in Azure Cognitive Search.
- **AI-pipeline developers** debugging retrieval quality, filter expressions, or
  re-ranking strategies (similarity vs. MMR).
- **DevOps engineers** smoke-testing search infrastructure after index
  re-creation or configuration changes.

## Quick start

### 1. Install

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-search
```

### 2. Register the plugin

Create (or update) a `fusion-cli.config.ts` in your project root:

```ts
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: [
    '@equinor/fusion-framework-cli-plugin-ai-search',
  ],
}));
```

The CLI auto-discovers and loads registered plugins.  The config file can be
`.ts`, `.js`, or `.json`; the `defineFusionCli` helper provides type safety.

### 3. Set environment variables (or use flags)

```sh
export AZURE_OPENAI_API_KEY="<your-key>"
export AZURE_OPENAI_INSTANCE_NAME="<instance>"
export AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME="<deployment>"
export AZURE_SEARCH_ENDPOINT="https://<service>.search.windows.net"
export AZURE_SEARCH_API_KEY="<search-key>"
export AZURE_SEARCH_INDEX_NAME="<index>"
```

### 4. Run a search

```sh
ffc ai search "how to configure modules"
```

## Key concepts

| Concept | Description |
|---|---|
| **Vector store** | An Azure Cognitive Search index with vector fields, queried via LangChain's retriever interface. |
| **Similarity search** | Default cosine-similarity ranking over document embeddings. |
| **MMR search** | Maximum Marginal Relevance re-ranking that balances relevance with diversity. |
| **OData filter** | Metadata filter expression applied server-side before ranking (e.g. `metadata/source eq 'README.md'`). |
| **Metadata normalisation** | Flattens Azure Search's `attributes[]` array into a plain key-value object for cleaner output. |

## CLI reference — `ai search`

```text
ffc ai search <query> [options]
```

### Options

| Flag | Default | Description |
|---|---|---|
| `--limit <number>` | `10` | Maximum results to return. |
| `--search-type <type>` | `similarity` | `similarity` or `mmr`. |
| `--filter <expression>` | — | OData filter expression for metadata filtering. |
| `--json` | `false` | Emit results as JSON objects (one per document). |
| `--raw` | `false` | Keep Azure Search metadata in its native format. |
| `--verbose` | `false` | Print diagnostic details (index name, filters, metadata). |
| `--openai-api-key <key>` | `$AZURE_OPENAI_API_KEY` | API key for Azure OpenAI. |
| `--openai-api-version <v>` | `2024-02-15-preview` | Azure OpenAI REST API version. |
| `--openai-instance <name>` | `$AZURE_OPENAI_INSTANCE_NAME` | Azure OpenAI instance name. |
| `--openai-embedding-deployment <name>` | `$AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` | Embedding model deployment. |
| `--azure-search-endpoint <url>` | `$AZURE_SEARCH_ENDPOINT` | Azure Search endpoint URL. |
| `--azure-search-api-key <key>` | `$AZURE_SEARCH_API_KEY` | Azure Search API key. |
| `--azure-search-index-name <name>` | `$AZURE_SEARCH_INDEX_NAME` | Azure Search index name. |

### Examples

```sh
# Basic similarity search
ffc ai search "how to use the framework"

# Limit results and switch to MMR ranking
ffc ai search "authentication" --limit 5 --search-type mmr

# Filter by metadata source path
ffc ai search "typescript" --filter "metadata/source eq 'src/index.ts'"

# JSON output for piping to jq or other tools
ffc ai search "documentation" --json

# Raw metadata with verbose diagnostics
ffc ai search "API reference" --verbose --raw
```

## API surface

The package exports a small public API intended for CLI plugin registration:

| Export | Module | Description |
|---|---|---|
| `registerAiPlugin(program)` | `index.ts` | Registers the `ai search` subcommand on a Commander program. |
| `command` | `search.ts` | Pre-configured Commander `Command` for `ai search`. |
| `AiOptions` | `options/ai.ts` | TypeScript interface for resolved Azure OpenAI / Search CLI options. |
| `withAiOptions(cmd, args)` | `options/ai.ts` | Higher-order helper that decorates a Commander command with AI option flags and validation. |
| `setupFramework(options)` | `utils/setup-framework.ts` | Bootstraps a headless Fusion Framework instance with the AI module. |

## Related packages

- `@equinor/fusion-framework-cli` — the parent CLI that loads this plugin.
- `@equinor/fusion-framework-cli-plugin-ai-base` — shared AI plugin infrastructure.
- `@equinor/fusion-framework-module-ai` — the AI module providing embeddings, models, and vector stores.

## License

ISC


# @equinor/fusion-framework-cli-plugin-ai-search

AI search plugin for Fusion Framework CLI providing vector store search capabilities.

## Installation

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-search
```

## Configuration

After installing the plugin, create a `fusion-cli.config.ts` file in your project root:

```typescript
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: [
    '@equinor/fusion-framework-cli-plugin-ai-search',
  ],
}));
```

The CLI will automatically discover and load plugins listed in this configuration file. The config file can be `.ts`, `.js`, or `.json`. The `defineFusionCli` helper provides type safety and IntelliSense support.

## Features

This plugin extends the Fusion Framework CLI with AI search capabilities:

- **Vector store search** for validating embeddings
- Semantic search using vector embeddings
- Configurable result limits
- Filter support for metadata-based filtering
- JSON output option for programmatic use

## Usage

Once installed, the search command is automatically available:

```sh
# Search the vector store
ffc ai search "your query"
```

## Commands

### `ai search`

Search the vector store to validate embeddings and retrieve relevant documents.

**Features:**
- Semantic search using vector embeddings
- Configurable result limits
- Filter support for metadata-based filtering
- JSON output option for programmatic use
- Detailed result display with scores and metadata

**Options:**
- `--limit <number>` - Maximum number of results to return (default: 10)
- `--search-type <type>` - Search type: 'mmr' or 'similarity' (default: similarity)
- `--filter <expression>` - OData filter expression for metadata filtering
- `--json` - Output results as JSON
- `--raw` - Output raw metadata without normalization
- `--verbose` - Enable verbose output
- `--openai-api-key <key>` - API key for Azure OpenAI
- `--openai-api-version <version>` - API version (default: 2024-02-15-preview)
- `--openai-instance <name>` - Azure OpenAI instance name
- `--openai-embedding-deployment <name>` - Azure OpenAI embedding deployment name
- `--azure-search-endpoint <url>` - Azure Search endpoint URL
- `--azure-search-api-key <key>` - Azure Search API key
- `--azure-search-index-name <name>` - Azure Search index name

**Examples:**
```sh
$ ffc ai search "how to use the framework"
$ ffc ai search "authentication" --limit 5
$ ffc ai search "typescript" --filter "metadata/source eq 'src/index.ts'"
$ ffc ai search "documentation" --search-type mmr
$ ffc ai search "documentation" --json
$ ffc ai search "documentation" --json --raw
$ ffc ai search "API reference" --verbose
```

## Configuration

The plugin requires Azure OpenAI and Azure Cognitive Search configuration. See the main CLI documentation for details on setting up API keys and endpoints.

## License

ISC


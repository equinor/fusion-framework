# @equinor/fusion-framework-cli-plugin-ai-index

AI indexing plugin for Fusion Framework CLI providing document embedding and chunking utilities.

## Installation

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-index
```

## Configuration

After installing the plugin, create a `fusion-cli.config.ts` file in your project root:

```typescript
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: [
    '@equinor/fusion-framework-cli-plugin-ai-index',
  ],
}));
```

The CLI will automatically discover and load plugins listed in this configuration file. The config file can be `.ts`, `.js`, or `.json`. The `defineFusionCli` helper provides type safety and IntelliSense support.

## Features

This plugin extends the Fusion Framework CLI with AI indexing capabilities:

- **Document embedding** and chunking utilities
- Markdown/MDX document chunking with frontmatter extraction
- TypeScript/TSX TSDoc extraction and chunking
- Glob pattern support for file collection
- Git diff-based processing for workflow integration
- Dry-run mode for testing without actual processing

## Usage

Once installed, the embeddings command is automatically available:

```sh
# Generate embeddings from documents
ffc ai embeddings ./src
```

## Commands

### `ai embeddings`

Document embedding utilities for Large Language Model processing.

**Features:**
- Markdown/MDX document chunking with frontmatter extraction
- TypeScript/TSX TSDoc extraction and chunking
- Glob pattern support for file collection
- Git diff-based processing for workflow integration
- Dry-run mode for testing without actual processing
- Configurable file patterns via fusion-ai.config.ts

**Options:**
- `--dry-run` - Show what would be processed without actually doing it
- `--config <config>` - Path to a config file (default: fusion-ai.config.ts)
- `--diff` - Process only changed files (workflow mode)
- `--base-ref <ref>` - Git reference to compare against (default: HEAD~1)
- `--clean` - Delete all existing documents from the vector store before processing
- `--openai-api-key <key>` - API key for Azure OpenAI
- `--openai-api-version <version>` - API version (default: 2024-02-15-preview)
- `--openai-instance <name>` - Azure OpenAI instance name
- `--openai-embedding-deployment <name>` - Azure OpenAI embedding deployment name
- `--azure-search-endpoint <url>` - Azure Search endpoint URL
- `--azure-search-api-key <key>` - Azure Search API key
- `--azure-search-index-name <name>` - Azure Search index name

**Examples:**
```sh
$ ffc ai embeddings --dry-run ./src
$ ffc ai embeddings "*.ts" "*.md" "*.mdx"
$ ffc ai embeddings --diff
$ ffc ai embeddings --diff --base-ref origin/main
$ ffc ai embeddings --clean "*.ts"
```

## Configuration

The plugin requires Azure OpenAI and Azure Cognitive Search configuration. See the main CLI documentation for details on setting up API keys and endpoints.

You can also create a `fusion-ai.config.ts` file to configure file patterns and metadata processing:

```typescript
import { configureFusionAI } from '@equinor/fusion-framework-cli-plugin-ai-index';
import type { FusionAIConfigWithIndex } from '@equinor/fusion-framework-cli-plugin-ai-index';

export default configureFusionAI((): FusionAIConfigWithIndex => ({
  index: {
    patterns: ['**/*.ts', '**/*.md', '**/*.mdx'],
    metadata: {
      attributeProcessor: (attributes, document) => {
        // Custom metadata processing
        return attributes;
      },
    },
    embedding: {
      chunkSize: 1000,
      chunkOverlap: 200,
    },
  },
}));
```

## License

ISC


# @equinor/fusion-framework-cli-plugin-ai-index

AI indexing plugin for the Fusion Framework CLI that chunks TypeScript, Markdown, and MDX source files, generates embeddings via Azure OpenAI, and upserts them into an Azure AI Search vector store.

## Features

- **Markdown / MDX chunking** — splits documents by heading hierarchy with YAML frontmatter extraction.
- **TypeScript / TSX TSDoc extraction** — extracts documented declarations (functions, classes, interfaces, types, enums) into individual vector-store documents.
- **Raw-file passthrough** — index files as-is when chunking is not needed.
- **Semantic search** — query the vector store to validate indexed content.
- **Git-diff workflow mode** — process only files changed since a base ref (`--diff`).
- **Dry-run mode** — preview what would be indexed without writing to the vector store.
- **Document removal** — remove stale documents by source path or OData filter.
- **Package & git metadata** — optionally resolve `package.json` info and git commit/permalink metadata per document.
- **Configurable patterns** — define file globs, ignore lists, chunk sizes, and custom attribute processors in `fusion-ai.config.ts`.

## Installation

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-index
```

## Usage

### Register the plugin

```ts
// fusion-cli.config.ts
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: ['@equinor/fusion-framework-cli-plugin-ai-index'],
}));
```

### Add documents to the index

```sh
# Index all files matching default patterns
ffc ai index add

# Index specific globs
ffc ai index add "packages/**/*.ts" "packages/**/*.md"

# Preview without writing (dry-run)
ffc ai index add --dry-run

# Process only files changed since origin/main
ffc ai index add --diff --base-ref origin/main

# Wipe the vector store before re-indexing
ffc ai index add --clean "**/*.ts"
```

### Search the index

```sh
# Semantic search
ffc ai index search "how to configure modules"

# Filter by package name
ffc ai index search "hooks" --filter "metadata/attributes/any(a: a/key eq 'pkg_name' and a/value eq '@equinor/fusion-framework-react')"

# JSON output
ffc ai index search "API reference" --json --limit 5
```

### Remove documents from the index

```sh
# Remove by source paths
ffc ai index remove src/old-module.ts src/legacy/helper.ts

# Preview what would be removed
ffc ai index remove --dry-run src/old-module.ts

# Remove with a raw OData filter
ffc ai index remove --filter "metadata/source eq 'src/old-module.ts'"
```

## Configuration

Create a `fusion-ai.config.ts` at the project root to customise file patterns, metadata enrichment, and chunk sizing:

```ts
import { configureFusionAI, type FusionAIConfigWithIndex } from '@equinor/fusion-framework-cli-plugin-ai-index';

export default configureFusionAI((): FusionAIConfigWithIndex => ({
  index: {
    patterns: ['packages/**/src/**/*.ts', 'packages/**/*.md'],
    rawPatterns: ['packages/**/README.md'],
    ignore: ['**/dist/**', '**/node_modules/**'],
    metadata: {
      resolvePackage: true,
      resolveGit: true,
      attributeProcessor: (attributes, _document) => ({
        ...attributes,
        custom_tag: 'my-project',
      }),
    },
    embedding: {
      chunkSize: 2000,
      chunkOverlap: 300,
    },
  },
}));
```

### Environment variables

Azure OpenAI and Azure AI Search credentials can be provided via CLI options or environment variables:

| Variable | Description |
|---|---|
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_OPENAI_INSTANCE_NAME` | Azure OpenAI instance name |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` | Embedding model deployment name |
| `AZURE_SEARCH_ENDPOINT` | Azure AI Search endpoint URL |
| `AZURE_SEARCH_API_KEY` | Azure AI Search admin API key |
| `AZURE_SEARCH_INDEX_NAME` | Target search index name |

## API Reference

### Entry point

| Export | Description |
|---|---|
| `registerAiPlugin(program)` | Registers the `ai index` command with `add`, `search`, and `remove` subcommands on a Commander program. |
| `configureFusionAI(fn)` | Re-exported helper to create a typed `fusion-ai.config.ts`. |

### Types

| Type | Description |
|---|---|
| `FusionAIConfigWithIndex` | Full config interface including `index` settings. |
| `IndexConfig` | Index-specific configuration (patterns, metadata, embedding). |
| `CommandOptions` | Validated options for the `ai index add` command. |
| `DeleteOptions` | Validated options for the `ai index remove` command. |

### Utilities (sub-path imports)

| Function / Type | Module | Description |
|---|---|---|
| `generateChunkId(path, index?)` | `utils/generate-chunk-id` | Deterministic, URL-safe document ID from a file path. |
| `parseMarkdown(content, source)` | `utils/markdown` | Chunk Markdown/MDX content into vector-store documents. |
| `parseTsDocSync(content, opts?)` | `utils/ts-doc` | Extract TSDoc documents from a TypeScript string. |
| `parseTsDocFromFileSync(file, opts?)` | `utils/ts-doc` | Extract TSDoc documents from a TypeScript file on disk. |
| `resolvePackage(filePath)` | `utils/package-resolver` | Resolve the nearest `package.json` for a file path. |
| `getChangedFiles(options)` | `utils/git` | List files changed between a base ref and HEAD. |
| `extractGitMetadata(filePath)` | `utils/git` | Extract commit hash, date, and GitHub permalink for a file. |

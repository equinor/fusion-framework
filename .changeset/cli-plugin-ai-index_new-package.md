---
"@equinor/fusion-framework-cli-plugin-ai-index": major
---

Add new AI indexing plugin package for document embedding and chunking utilities.

This plugin extends the Fusion Framework CLI with comprehensive document embedding and indexing capabilities for building searchable vector stores from code and documentation.

**Features:**
- Document chunking and embedding generation
- Git metadata extraction for context-aware embeddings
- Markdown/MDX and TypeScript/TSX documentation parsing
- File change tracking (new, modified, removed) via git diff
- Batch operations for efficient vector store updates
- Package metadata resolution
- TSDoc extraction utilities
- Dry-run mode for testing

**Quick Usage:**

1. Install the plugin:
```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-index
```

2. Configure in `fusion-cli.config.ts`:
```typescript
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: [
    '@equinor/fusion-framework-cli-plugin-ai-index',
  ],
}));
```

3. Use the embeddings command:
```sh
# Process all TypeScript and Markdown files
ffc ai embeddings "*.ts" "*.md" "*.mdx"

# Dry-run to preview what would be processed
ffc ai embeddings --dry-run ./src

# Process only changed files (git diff mode)
ffc ai embeddings --diff

# Clean and re-index all documents
ffc ai embeddings --clean "*.ts"
```

The plugin supports Azure OpenAI and Azure Cognitive Search configuration via command-line options or environment variables. Configure file patterns and chunking options via `fusion-ai.config.ts`.

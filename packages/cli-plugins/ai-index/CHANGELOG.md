# @equinor/fusion-framework-cli-plugin-ai-index

## 1.0.0

### Major Changes

- [`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633) Thanks [@odinr](https://github.com/odinr)! - Add new AI indexing plugin package for document embedding and chunking utilities.

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
  import { defineFusionCli } from "@equinor/fusion-framework-cli";

  export default defineFusionCli(() => ({
    plugins: ["@equinor/fusion-framework-cli-plugin-ai-index"],
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

### Patch Changes

- Updated dependencies [[`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633), [`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633), [`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633)]:
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.0
  - @equinor/fusion-framework-cli@13.0.0
  - @equinor/fusion-framework-module-ai@2.0.0

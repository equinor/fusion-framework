# @equinor/fusion-framework-cli-plugin-ai-index

## 1.0.4-msal-v5.1

### Patch Changes

- [#3944](https://github.com/equinor/fusion-framework/pull/3944) [`312755f`](https://github.com/equinor/fusion-framework/commit/312755f01c7592329aec847ee4956fe9bf58458f) Thanks [@dependabot](https://github.com/apps/dependabot)! - pre-release msal v5

- Updated dependencies [[`312755f`](https://github.com/equinor/fusion-framework/commit/312755f01c7592329aec847ee4956fe9bf58458f)]:
  - @equinor/fusion-framework-cli@13.1.2-msal-v5.1
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.4-msal-v5.1
  - @equinor/fusion-framework-module-ai@2.0.1-msal-v5.1
  - @equinor/fusion-framework-module@5.0.6-msal-v5.0
  - @equinor/fusion-imports@1.1.11-msal-v5.0

## 1.0.4-msal-v5.0

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-cli@13.1.2-msal-v5.0
  - @equinor/fusion-framework-module-ai@2.0.1-msal-v5.0
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.4-msal-v5.0

## 1.0.3

### Patch Changes

- [#3939](https://github.com/equinor/fusion-framework/pull/3939) [`d98b8f7`](https://github.com/equinor/fusion-framework/commit/d98b8f75e8e35e39f2263878f9aff7a534327b2e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: update `read-package-up` dependency from 11.0.0 to 12.0.0; no functional changes.

- [#3866](https://github.com/equinor/fusion-framework/pull/3866) [`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: Dedupe zod dependency to 4.3.5

  Deduplicated zod dependency to version 4.3.5 across all packages using `pnpm dedupe`. This aligns all packages (AI plugins upgraded from v3.25.76, other packages consolidated from v4.1.8/v4.1.11) to use the same latest stable version, improving consistency and reducing bundle size. All builds, tests, and linting pass successfully.

- Updated dependencies [[`d34ebd8`](https://github.com/equinor/fusion-framework/commit/d34ebd82c93acabc88f88e44a725f084af3af5ec), [`37f63d5`](https://github.com/equinor/fusion-framework/commit/37f63d5b9646d0b19c98041e0897d6e1abf69dcf), [`5a25a5e`](https://github.com/equinor/fusion-framework/commit/5a25a5e6fefc660131b77f58e667b1a05dca0d6b), [`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da)]:
  - @equinor/fusion-framework-cli@13.1.1
  - @equinor/fusion-imports@1.1.10
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.3

## 1.0.2

### Patch Changes

- [#3856](https://github.com/equinor/fusion-framework/pull/3856) [`29ea9fb`](https://github.com/equinor/fusion-framework/commit/29ea9fb4a9c13d0e92e21c6556d565594e231ae5) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: bump globby from 15.0.0 to 16.1.0 to benefit from improved .gitignore handling and fixes to negation patterns.

- Updated dependencies [[`4eae807`](https://github.com/equinor/fusion-framework/commit/4eae8070c1ad48eaa7d83a9aecfe5588c6aec41c), [`19ee28f`](https://github.com/equinor/fusion-framework/commit/19ee28fc0f6108fc59f0098b449a511221d2d860), [`8796e99`](https://github.com/equinor/fusion-framework/commit/8796e994173ff1757b557d096a7a95915785dcc1), [`b8ab0b7`](https://github.com/equinor/fusion-framework/commit/b8ab0b72d422996d38fae3e6d82cecfa77686487), [`9fff06a`](https://github.com/equinor/fusion-framework/commit/9fff06a2327fe569a62418eb2b65a0ec9e2e69f5), [`b8ab0b7`](https://github.com/equinor/fusion-framework/commit/b8ab0b72d422996d38fae3e6d82cecfa77686487), [`f382399`](https://github.com/equinor/fusion-framework/commit/f38239914070dce4f5701c09f6c28336ad5ed73a), [`15aaa87`](https://github.com/equinor/fusion-framework/commit/15aaa87e6a8b391c0672db0dcdca4c1cac3b50a7)]:
  - @equinor/fusion-framework-cli@13.1.0
  - @equinor/fusion-imports@1.1.9
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.2

## 1.0.1

### Patch Changes

- [#3898](https://github.com/equinor/fusion-framework/pull/3898) [`037e2e2`](https://github.com/equinor/fusion-framework/commit/037e2e29b6696e8925f054f5a1656ece24e55878) Thanks [@odinr](https://github.com/odinr)! - Add `@azure/search-documents` as a dependency to ensure it's automatically installed when users install the plugin. Previously, users had to manually install this peer dependency required by the AI module.

- Updated dependencies [[`037e2e2`](https://github.com/equinor/fusion-framework/commit/037e2e29b6696e8925f054f5a1656ece24e55878), [`528c7d7`](https://github.com/equinor/fusion-framework/commit/528c7d7f4fd93a72878e38843a2efb011a976ae6)]:
  - @equinor/fusion-framework-cli@13.0.1
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.1

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

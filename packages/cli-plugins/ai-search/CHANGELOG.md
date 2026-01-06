# @equinor/fusion-framework-cli-plugin-ai-search

## 1.0.0-cli-search-index.0

### Major Changes

- [#3757](https://github.com/equinor/fusion-framework/pull/3757) [`fd26636`](https://github.com/equinor/fusion-framework/commit/fd266363fc6d0445733b16a9e25b303ec6fe4a50) Thanks [@odinr](https://github.com/odinr)! - Add new AI search plugin package for vector store search capabilities.

  This plugin extends the Fusion Framework CLI with semantic search functionality for querying vector store embeddings, enabling validation of indexed documents and retrieval of relevant content.

  **Features:**

  - Semantic search using vector embeddings
  - Configurable result limits
  - OData filter expressions for metadata-based filtering
  - Multiple search types (similarity and MMR - Maximum Marginal Relevance)
  - JSON output option for programmatic use
  - Raw metadata output option
  - Verbose output mode

  **Quick Usage:**

  1. Install the plugin:

  ```sh
  pnpm add -D @equinor/fusion-framework-cli-plugin-ai-search
  ```

  2. Configure in `fusion-cli.config.ts`:

  ```typescript
  import { defineFusionCli } from "@equinor/fusion-framework-cli";

  export default defineFusionCli(() => ({
    plugins: ["@equinor/fusion-framework-cli-plugin-ai-search"],
  }));
  ```

  3. Use the search command:

  ```sh
  # Basic semantic search
  ffc ai search "how to use the framework"

  # Limit results and use MMR search
  ffc ai search "authentication" --limit 5 --search-type mmr

  # Filter by metadata
  ffc ai search "typescript" --filter "metadata/source eq 'src/index.ts'"

  # JSON output for programmatic use
  ffc ai search "documentation" --json

  # Raw metadata output
  ffc ai search "API reference" --json --raw --verbose
  ```

  The plugin supports Azure OpenAI and Azure Cognitive Search configuration via command-line options or environment variables.

### Patch Changes

- [#3757](https://github.com/equinor/fusion-framework/pull/3757) [`fd26636`](https://github.com/equinor/fusion-framework/commit/fd266363fc6d0445733b16a9e25b303ec6fe4a50) Thanks [@odinr](https://github.com/odinr)! - preview before pr

- Updated dependencies [[`fd26636`](https://github.com/equinor/fusion-framework/commit/fd266363fc6d0445733b16a9e25b303ec6fe4a50), [`fd26636`](https://github.com/equinor/fusion-framework/commit/fd266363fc6d0445733b16a9e25b303ec6fe4a50), [`fd26636`](https://github.com/equinor/fusion-framework/commit/fd266363fc6d0445733b16a9e25b303ec6fe4a50)]:
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.0-cli-search-index.0
  - @equinor/fusion-framework-module@5.0.6-cli-search-index.1
  - @equinor/fusion-framework-module-ai@1.1.0-cli-search-index.1
  - @equinor/fusion-framework-cli@13.0.0-cli-search-index.0

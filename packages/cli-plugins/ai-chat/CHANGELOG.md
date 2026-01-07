# @equinor/fusion-framework-cli-plugin-ai-chat

## 1.0.0

### Major Changes

- [`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633) Thanks [@odinr](https://github.com/odinr)! - Add new AI chat plugin package for interactive chat with AI models.

  This plugin extends the Fusion Framework CLI with interactive chat capabilities using vector store context retrieval for enhanced, context-aware responses.

  **Features:**

  - Interactive conversation mode with readline interface
  - Real-time streaming responses from AI models
  - Intelligent message history compression using AI summarization
  - Automatic vector store context retrieval for enhanced responses
  - Configurable context and history limits

  **Quick Usage:**

  1. Install the plugin:

  ```sh
  pnpm add -D @equinor/fusion-framework-cli-plugin-ai-chat
  ```

  2. Configure in `fusion-cli.config.ts`:

  ```typescript
  import { defineFusionCli } from "@equinor/fusion-framework-cli";

  export default defineFusionCli(() => ({
    plugins: ["@equinor/fusion-framework-cli-plugin-ai-chat"],
  }));
  ```

  3. Use the chat command:

  ```sh
  # Start interactive chat
  ffc ai chat

  # With custom context limit
  ffc ai chat --context-limit 10

  # With verbose output
  ffc ai chat --verbose
  ```

  The plugin supports Azure OpenAI and Azure Cognitive Search configuration via command-line options or environment variables.

### Patch Changes

- Updated dependencies [[`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633), [`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633), [`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633)]:
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.0
  - @equinor/fusion-framework-cli@13.0.0
  - @equinor/fusion-framework-module-ai@2.0.0

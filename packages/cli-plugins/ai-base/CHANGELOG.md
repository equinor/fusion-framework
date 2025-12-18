# @equinor/fusion-framework-cli-plugin-ai-base

## 1.0.0-cli-search-index.0

### Major Changes

- [#3757](https://github.com/equinor/fusion-framework/pull/3757) [`6bc3057`](https://github.com/equinor/fusion-framework/commit/6bc305794fdd0db1ceeb22cb14642e9d26b57b34) Thanks [@odinr](https://github.com/odinr)! - Add new base plugin package for AI CLI plugins providing shared utilities and configuration.

  This package provides shared utilities and options used across multiple AI CLI plugins including framework setup, AI configuration, and command option handling.

  **Features:**

  - Shared AI options and configuration schema
  - Framework setup utilities
  - Common command option handling
  - Type-safe AI configuration interfaces

  **Quick Usage:**

  ```typescript
  import { createCommand } from "commander";
  import {
    withOptions,
    type AiOptions,
  } from "@equinor/fusion-framework-cli-plugin-ai-base/command-options";
  import { setupFramework } from "@equinor/fusion-framework-cli-plugin-ai-base";

  const command = createCommand("my-ai-command").description("My AI command");

  // Add AI options to the command
  const enhancedCommand = withOptions(command, {
    includeChat: true,
    includeEmbedding: true,
    includeSearch: true,
  });

  enhancedCommand.action(async (options: AiOptions) => {
    // Initialize framework with AI module
    const framework = await setupFramework(options);

    // Use framework.modules.ai for AI operations
    const aiService = framework.modules.ai;
    // ... your command logic
  });
  ```

### Patch Changes

- [#3757](https://github.com/equinor/fusion-framework/pull/3757) [`6bc3057`](https://github.com/equinor/fusion-framework/commit/6bc305794fdd0db1ceeb22cb14642e9d26b57b34) Thanks [@odinr](https://github.com/odinr)! - preview before pr

- Updated dependencies [[`6bc3057`](https://github.com/equinor/fusion-framework/commit/6bc305794fdd0db1ceeb22cb14642e9d26b57b34), [`6bc3057`](https://github.com/equinor/fusion-framework/commit/6bc305794fdd0db1ceeb22cb14642e9d26b57b34), [`41f8e9b`](https://github.com/equinor/fusion-framework/commit/41f8e9b7a9b2680553e089d04095a9db7821567e)]:
  - @equinor/fusion-framework-module@5.0.6-cli-search-index.1
  - @equinor/fusion-imports@1.1.8-cli-search-index.0
  - @equinor/fusion-framework-module-ai@1.1.0-cli-search-index.1
  - @equinor/fusion-framework-cli@13.0.0-cli-search-index.0

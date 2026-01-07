# @equinor/fusion-framework-cli-plugin-ai-base

## 1.0.0

### Major Changes

- [`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633) Thanks [@odinr](https://github.com/odinr)! - Add new base plugin package for AI CLI plugins providing shared utilities and configuration.

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

- Updated dependencies [[`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633), [`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633)]:
  - @equinor/fusion-framework-cli@13.0.0
  - @equinor/fusion-framework-module-ai@2.0.0

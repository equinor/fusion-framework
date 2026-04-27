# @equinor/fusion-framework-cli-plugin-ai-base

## 3.0.0

### Major Changes

- ece8f42: **BREAKING:** Replace Azure API key options with Fusion service discovery options.

  CLI options now use `--env`, `--token`, `--tenant-id`, `--client-id`, `--chat-model`, `--embed-model`, and `--index-name` instead of `--openai-api-key`, `--openai-instance`, `--azure-search-endpoint`, etc. The `setupFramework` function bootstraps MSAL authentication and resolves the AI service endpoint via Fusion service discovery.

  Ref: https://github.com/equinor/fusion-framework/issues/1008

### Patch Changes

- Updated dependencies [ece8f42]
- Updated dependencies [ece8f42]
  - @equinor/fusion-framework-module-ai@4.0.0

## 2.0.1

### Patch Changes

- Updated dependencies [4f71408]
- Updated dependencies [ee9c669]
  - @equinor/fusion-framework-module-ai@3.0.1

## 2.0.0

### Major Changes

- abffa53: Major version bump for Fusion Framework React 19 release.

  All packages are bumped to the next major version as part of the React 19 upgrade. This release drops support for React versions below 18 and includes breaking changes across the framework.

  **Breaking changes:**
  - Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
  - React Router upgraded from v6 to v7
  - Navigation module refactored with new history API
  - `renderComponent` and `renderApp` now use `createRoot` API

  **Migration:**
  - Update your React version to 18.0.0 or higher before upgrading
  - Replace `NavigationProvider.createRouter()` with `@equinor/fusion-framework-react-router`
  - See individual package changelogs for package-specific migration steps

### Patch Changes

- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [ae92f13]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [c123c39]
- Updated dependencies [3de232c]
- Updated dependencies [32bcf83]
  - @equinor/fusion-framework-cli@14.0.0
  - @equinor/fusion-framework-module@6.0.0
  - @equinor/fusion-framework-module-ai@3.0.0
  - @equinor/fusion-imports@2.0.0

## 1.0.5

### Patch Changes

- [#4157](https://github.com/equinor/fusion-framework/pull/4157) [`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581) Thanks [@Noggling](https://github.com/Noggling)! - Internal: patch release to align TypeScript types across packages for consistent type compatibility.

- Updated dependencies [[`0a3a23c`](https://github.com/equinor/fusion-framework/commit/0a3a23c230778d64c23fa3008d59d80908d44f45), [`5cc81f5`](https://github.com/equinor/fusion-framework/commit/5cc81f58ad159f9308b1fe028f04629c407dac37), [`9d4d520`](https://github.com/equinor/fusion-framework/commit/9d4d520e9d3c3a3c4ef68a96952fbbc6f6d34720), [`40328c3`](https://github.com/equinor/fusion-framework/commit/40328c3a1489ad29c7bbc03fa283e1daa9a9ee2e), [`0dc5e05`](https://github.com/equinor/fusion-framework/commit/0dc5e058d4adb28ee72a1aac6dbdbc4da84741e9), [`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581)]:
  - @equinor/fusion-framework-cli@13.3.16
  - @equinor/fusion-framework-module-ai@2.0.2
  - @equinor/fusion-framework-module@5.0.6
  - @equinor/fusion-imports@1.1.11

## 1.0.4

### Patch Changes

- Updated dependencies [[`5121c48`](https://github.com/equinor/fusion-framework/commit/5121c48020accfa0b91415ddafb61ea82b3b24b6), [`2eb7f69`](https://github.com/equinor/fusion-framework/commit/2eb7f6932f6becf965f7773ef065a0ee9f0b80bc), [`343f5f9`](https://github.com/equinor/fusion-framework/commit/343f5f9cc0acbd8e69b62cc73dda577c9015a620)]:
  - @equinor/fusion-framework-cli@13.2.0
  - @equinor/fusion-framework-module-ai@2.0.1

## 1.0.3

### Patch Changes

- [#3866](https://github.com/equinor/fusion-framework/pull/3866) [`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: Dedupe zod dependency to 4.3.5

  Deduplicated zod dependency to version 4.3.5 across all packages using `pnpm dedupe`. This aligns all packages (AI plugins upgraded from v3.25.76, other packages consolidated from v4.1.8/v4.1.11) to use the same latest stable version, improving consistency and reducing bundle size. All builds, tests, and linting pass successfully.

- Updated dependencies [[`d34ebd8`](https://github.com/equinor/fusion-framework/commit/d34ebd82c93acabc88f88e44a725f084af3af5ec), [`37f63d5`](https://github.com/equinor/fusion-framework/commit/37f63d5b9646d0b19c98041e0897d6e1abf69dcf), [`5a25a5e`](https://github.com/equinor/fusion-framework/commit/5a25a5e6fefc660131b77f58e667b1a05dca0d6b), [`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da)]:
  - @equinor/fusion-framework-cli@13.1.1
  - @equinor/fusion-imports@1.1.10

## 1.0.2

### Patch Changes

- Updated dependencies [[`4eae807`](https://github.com/equinor/fusion-framework/commit/4eae8070c1ad48eaa7d83a9aecfe5588c6aec41c), [`19ee28f`](https://github.com/equinor/fusion-framework/commit/19ee28fc0f6108fc59f0098b449a511221d2d860), [`8796e99`](https://github.com/equinor/fusion-framework/commit/8796e994173ff1757b557d096a7a95915785dcc1), [`b8ab0b7`](https://github.com/equinor/fusion-framework/commit/b8ab0b72d422996d38fae3e6d82cecfa77686487), [`9fff06a`](https://github.com/equinor/fusion-framework/commit/9fff06a2327fe569a62418eb2b65a0ec9e2e69f5), [`b8ab0b7`](https://github.com/equinor/fusion-framework/commit/b8ab0b72d422996d38fae3e6d82cecfa77686487), [`f382399`](https://github.com/equinor/fusion-framework/commit/f38239914070dce4f5701c09f6c28336ad5ed73a), [`15aaa87`](https://github.com/equinor/fusion-framework/commit/15aaa87e6a8b391c0672db0dcdca4c1cac3b50a7)]:
  - @equinor/fusion-framework-cli@13.1.0
  - @equinor/fusion-imports@1.1.9

## 1.0.1

### Patch Changes

- Updated dependencies [[`037e2e2`](https://github.com/equinor/fusion-framework/commit/037e2e29b6696e8925f054f5a1656ece24e55878), [`528c7d7`](https://github.com/equinor/fusion-framework/commit/528c7d7f4fd93a72878e38843a2efb011a976ae6)]:
  - @equinor/fusion-framework-cli@13.0.1

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

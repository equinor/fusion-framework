# @equinor/fusion-framework-cli-plugin-ai-chat

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

- aaa3f74: fix(security): address undici multiple vulnerabilities (CVE-2026-1524, 1527, 1528, 2581)

  Upgrade undici from 7.22.0 to 7.24.3 to fix multiple security vulnerabilities affecting WebSocket parsing, HTTP header validation, and request deduplication:
  - **CVE-2026-1528** (HIGH): WebSocket 64-bit length integer overflow causing process crash
  - **CVE-2026-1524** (MODERATE): HTTP/1.1 response field header injection
  - **CVE-2026-1527** (MODERATE): CRLF injection via upgrade option enabling protocol smuggling
  - **CVE-2026-2581** (MODERATE): Unbounded memory consumption in deduplication handler

  These are non-breaking security patches that harden undici against untrusted upstream endpoints and malicious WebSocket frames.

  **Advisories**: GHSA-f269-vfmq-vjvj, GHSA-v9p9-hfj2-hcw8, GHSA-4992-7rv2-5pvq, GHSA-phc3-fgpg-7m6h
  **Fixed in**: undici 7.24.0+ (deployed 7.24.3)

- 3de232c: fix(cli): break turbo workspace cycle for AI plugins

  Upgrade turbo from 2.8.10 to 2.8.14. This version introduces stricter workspace cycle detection, requiring the AI plugin dependencies to be moved from the CLI package's devDependencies to the root package.json.

  The CLI plugins are now configured at the repository root (fusion-cli.config.ts) instead of in the packages/cli package, ensuring a clean workspace dependency graph for turbo's build scheduler.

  This change has no impact on the published CLI package's public API. Plugins continue to be wired identically; only the source of the wire definition has changed.

  Additional improvements from turbo 2.8.14:
  - Fix: Ensures turbo watch mode respects task dependencies on first run
  - Perf: Skip irrelevant packages for faster monorepo builds
  - Feature: AI agent telemetry support in turbo traces

- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [ae92f13]
- Updated dependencies [abffa53]
- Updated dependencies [c123c39]
- Updated dependencies [3de232c]
- Updated dependencies [32bcf83]
  - @equinor/fusion-framework-cli@14.0.0
  - @equinor/fusion-framework-cli-plugin-ai-base@2.0.0
  - @equinor/fusion-framework-module@6.0.0
  - @equinor/fusion-framework-module-ai@3.0.0

## 1.0.5

### Patch Changes

- [#4157](https://github.com/equinor/fusion-framework/pull/4157) [`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581) Thanks [@Noggling](https://github.com/Noggling)! - Internal: patch release to align TypeScript types across packages for consistent type compatibility.

- Updated dependencies [[`0a3a23c`](https://github.com/equinor/fusion-framework/commit/0a3a23c230778d64c23fa3008d59d80908d44f45), [`5cc81f5`](https://github.com/equinor/fusion-framework/commit/5cc81f58ad159f9308b1fe028f04629c407dac37), [`9d4d520`](https://github.com/equinor/fusion-framework/commit/9d4d520e9d3c3a3c4ef68a96952fbbc6f6d34720), [`40328c3`](https://github.com/equinor/fusion-framework/commit/40328c3a1489ad29c7bbc03fa283e1daa9a9ee2e), [`0dc5e05`](https://github.com/equinor/fusion-framework/commit/0dc5e058d4adb28ee72a1aac6dbdbc4da84741e9), [`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581)]:
  - @equinor/fusion-framework-cli@13.3.16
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.5
  - @equinor/fusion-framework-module-ai@2.0.2
  - @equinor/fusion-framework-module@5.0.6

## 1.0.4

### Patch Changes

- Updated dependencies [[`5121c48`](https://github.com/equinor/fusion-framework/commit/5121c48020accfa0b91415ddafb61ea82b3b24b6), [`2eb7f69`](https://github.com/equinor/fusion-framework/commit/2eb7f6932f6becf965f7773ef065a0ee9f0b80bc), [`343f5f9`](https://github.com/equinor/fusion-framework/commit/343f5f9cc0acbd8e69b62cc73dda577c9015a620)]:
  - @equinor/fusion-framework-cli@13.2.0
  - @equinor/fusion-framework-module-ai@2.0.1
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.4

## 1.0.3

### Patch Changes

- Updated dependencies [[`d34ebd8`](https://github.com/equinor/fusion-framework/commit/d34ebd82c93acabc88f88e44a725f084af3af5ec), [`37f63d5`](https://github.com/equinor/fusion-framework/commit/37f63d5b9646d0b19c98041e0897d6e1abf69dcf), [`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da)]:
  - @equinor/fusion-framework-cli@13.1.1
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [[`4eae807`](https://github.com/equinor/fusion-framework/commit/4eae8070c1ad48eaa7d83a9aecfe5588c6aec41c), [`19ee28f`](https://github.com/equinor/fusion-framework/commit/19ee28fc0f6108fc59f0098b449a511221d2d860), [`8796e99`](https://github.com/equinor/fusion-framework/commit/8796e994173ff1757b557d096a7a95915785dcc1), [`b8ab0b7`](https://github.com/equinor/fusion-framework/commit/b8ab0b72d422996d38fae3e6d82cecfa77686487), [`9fff06a`](https://github.com/equinor/fusion-framework/commit/9fff06a2327fe569a62418eb2b65a0ec9e2e69f5), [`f382399`](https://github.com/equinor/fusion-framework/commit/f38239914070dce4f5701c09f6c28336ad5ed73a), [`15aaa87`](https://github.com/equinor/fusion-framework/commit/15aaa87e6a8b391c0672db0dcdca4c1cac3b50a7)]:
  - @equinor/fusion-framework-cli@13.1.0
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [[`037e2e2`](https://github.com/equinor/fusion-framework/commit/037e2e29b6696e8925f054f5a1656ece24e55878), [`528c7d7`](https://github.com/equinor/fusion-framework/commit/528c7d7f4fd93a72878e38843a2efb011a976ae6)]:
  - @equinor/fusion-framework-cli@13.0.1
  - @equinor/fusion-framework-cli-plugin-ai-base@1.0.1

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

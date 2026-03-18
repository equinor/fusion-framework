---
'@equinor/fusion-framework-cli': patch
'@equinor/fusion-framework-cli-plugin-ai-index': patch
'@equinor/fusion-framework-cli-plugin-ai-chat': patch
'@equinor/fusion-framework-cli-plugin-ai-mcp': patch
---

fix(cli): break turbo workspace cycle for AI plugins

Upgrade turbo from 2.8.10 to 2.8.14. This version introduces stricter workspace cycle detection, requiring the AI plugin dependencies to be moved from the CLI package's devDependencies to the root package.json.

The CLI plugins are now configured at the repository root (fusion-cli.config.ts) instead of in the packages/cli package, ensuring a clean workspace dependency graph for turbo's build scheduler.

This change has no impact on the published CLI package's public API. Plugins continue to be wired identically; only the source of the wire definition has changed.

Additional improvements from turbo 2.8.14:
- Fix: Ensures turbo watch mode respects task dependencies on first run
- Perf: Skip irrelevant packages for faster monorepo builds
- Feature: AI agent telemetry support in turbo traces

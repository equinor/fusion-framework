---
"@equinor/fusion-framework-cli-plugin-copilot": patch
---

Internal: stop running `agent-browser`'s and `koffi`'s native-binary install scripts on every `pnpm install`. Both now build explicitly in this package's `prepack` script, so publishing still bundles the binaries but everyday installs no longer download them.

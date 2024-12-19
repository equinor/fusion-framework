---
"@equinor/fusion-framework-cli": patch
---

Added `noOpen` option to the development server configuration.

**Modified files:**
- `packages/cli/src/bin/create-dev-serve.ts`
- `packages/cli/src/bin/main.app.ts`

**Changes:**
- Added `noOpen` boolean option to `createDevServer` function.
- Updated the server configuration to conditionally open the app in the default browser based on the `noOpen` option.
- Added `-n, --noOpen` option to the CLI command for starting the development server.

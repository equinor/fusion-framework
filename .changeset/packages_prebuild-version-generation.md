---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-cli-plugin-ai-base": patch
"@equinor/fusion-framework-cli-plugin-ai-chat": patch
"@equinor/fusion-framework-cli-plugin-ai-index": patch
"@equinor/fusion-framework-cli-plugin-copilot": patch
"@equinor/fusion-framework-cli-plugin-mock-server": patch
"@equinor/fusion-framework-dev-server": patch
"@equinor/fusion-framework-lint-config": patch
"@equinor/fusion-framework-lint-core": patch
"@equinor/fusion-framework-lint-lsp": patch
"@equinor/fusion-framework-lint-rules": patch
"@equinor/fusion-framework-module": patch
"@equinor/fusion-framework-module-ai": patch
"@equinor/fusion-framework-module-analytics": patch
"@equinor/fusion-framework-module-azure-identity": patch
"@equinor/fusion-framework-module-msal-node": patch
"@equinor/fusion-framework-module-roles": patch
"@equinor/fusion-framework-module-state": patch
"@equinor/fusion-framework-react-module": patch
"@equinor/fusion-framework-react-router": patch
"@equinor/fusion-framework-vite-plugin-api-service": patch
"@equinor/fusion-framework-vite-plugin-markdown": patch
"@equinor/fusion-framework-vite-plugin-raw-imports": patch
"@equinor/fusion-framework-vite-plugin-react-router": patch
"@equinor/fusion-framework-vite-plugin-routes-dsl": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
"@equinor/fusion-imports": patch
"@equinor/fusion-lint": patch
"@equinor/fusion-log": patch
"@equinor/fusion-observable": patch
"@equinor/fusion-openapi-mock": patch
"@equinor/fusion-openapi-mock-server": patch
---

Internal: generate `src/version.ts` in each package's `prebuild` so direct builds and `prepack` no longer depend on the root install script having run. No change to the published output.

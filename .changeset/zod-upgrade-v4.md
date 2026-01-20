---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-cli-plugin-ai-base": patch
"@equinor/fusion-framework-cli-plugin-ai-index": patch
"@equinor/fusion-framework-cli-plugin-ai-mcp": patch
"@equinor/fusion-framework-module-analytics": patch
"@equinor/fusion-framework-module-app": patch
"@equinor/fusion-framework-module-bookmark": patch
"@equinor/fusion-framework-module-http": patch
"@equinor/fusion-framework-module-msal": patch
"@equinor/fusion-framework-module-service-discovery": patch
"@equinor/fusion-framework-module-services": patch
"@equinor/fusion-framework-module-telemetry": patch
---

Internal: Dedupe zod dependency to 4.3.5

Deduplicated zod dependency to version 4.3.5 across all packages using `pnpm dedupe`. This aligns all packages (AI plugins upgraded from v3.25.76, other packages consolidated from v4.1.8/v4.1.11) to use the same latest stable version, improving consistency and reducing bundle size. All builds, tests, and linting pass successfully.

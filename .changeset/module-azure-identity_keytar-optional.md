---
"@equinor/fusion-framework-module-azure-identity": patch
---

Move `@azure/identity-cache-persistence` and `@azure/msal-node-extensions` to `optionalDependencies` and guard all dynamic imports with descriptive error handling.

The native `keytar` addon (required for OS keychain access on Linux) previously caused `pnpm install` to fail in headless environments without `libsecret-1`. Dynamic import sites now catch load failures and throw a clear, actionable error explaining that credential persistence requires an interactive desktop environment with the optional dependency installed.

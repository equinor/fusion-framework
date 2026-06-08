---
"@equinor/fusion-framework-module-msal-node": patch
---

Move `@azure/msal-node-extensions` to `optionalDependencies` and convert its static import to a dynamic loader.

The native `keytar` addon (required by `msal-node-extensions` for OS keychain access) previously caused `pnpm install` to fail on Linux environments without `libsecret-1`, and the static top-level import caused the module to fail to load entirely when the optional build did not succeed.

Token cache persistence remains fully functional in interactive desktop environments. When the optional dependency is absent, a clear, actionable error is thrown at call-time instead of a raw `ERR_MODULE_NOT_FOUND` at import-time.

# @equinor/fusion-framework-module-azure-identity

## 0.2.1

### Patch Changes

- 3e82dee: Move `@azure/identity-cache-persistence` and `@azure/msal-node-extensions` to `optionalDependencies` and guard all dynamic imports with descriptive error handling.

  The native `keytar` addon (required for OS keychain access on Linux) previously caused `pnpm install` to fail in headless environments without `libsecret-1`. Dynamic import sites now catch load failures and throw a clear, actionable error explaining that credential persistence requires an interactive desktop environment with the optional dependency installed.

## 0.2.0

### Minor Changes

- 8d7b8a1: Add new Azure Identity authentication module with three auth modes:
  - **`interactive`** — `InteractiveBrowserCredential` with `AuthenticationRecord` persistence via OS keychain (Keychain / DPAPI / libsecret)
  - **`default_credential`** — `DefaultAzureCredential` for CI/CD, managed identity, and Azure CLI
  - **`token_only`** — static access token passthrough

  Includes a type-safe configurator with mode-specific setters (`setInteractive`, `setDefaultCredential`, `setTokenOnly`) and convenience enablers for each mode.

  Ref: https://github.com/equinor/fusion-core-tasks/issues/1067

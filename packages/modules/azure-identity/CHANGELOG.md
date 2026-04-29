# @equinor/fusion-framework-module-azure-identity

## 0.2.0

### Minor Changes

- 8d7b8a1: Add new Azure Identity authentication module with three auth modes:
  - **`interactive`** — `InteractiveBrowserCredential` with `AuthenticationRecord` persistence via OS keychain (Keychain / DPAPI / libsecret)
  - **`default_credential`** — `DefaultAzureCredential` for CI/CD, managed identity, and Azure CLI
  - **`token_only`** — static access token passthrough

  Includes a type-safe configurator with mode-specific setters (`setInteractive`, `setDefaultCredential`, `setTokenOnly`) and convenience enablers for each mode.

  Ref: https://github.com/equinor/fusion-core-tasks/issues/1067

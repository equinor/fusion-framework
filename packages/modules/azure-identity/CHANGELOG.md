# @equinor/fusion-framework-module-azure-identity

## 0.2.2

### Patch Changes

- 80c3e4a: Internal: resolve `fusion-lint` warnings (`require-intent-comment`, `require-tsdoc`, `single-export-per-file`). Split `ensureCachePersistencePlugin` out of `AuthProviderDefaultCredential.ts` and split the `enableAzureIdentity*` helper functions out of `enable-module.ts` into individual files to resolve `single-export-per-file` without conflicting with TSDoc adjacency. Added missing constructor/`@param`/`@returns`/`@throws` TSDoc and intent comments to control-flow blocks.
- 80c3e4a: Internal: renamed 45 source files across these packages to comply with the `filename-convention` lint rule (e.g. `AIConfigurator.ts` → `AiConfigurator.ts`, `BookmarkProvider.actions.ts` → `bookmark-actions.ts`, `errors/app-build-error.ts` → `errors/AppBuildError.ts`, `plugins/api/plugin.ts` → `plugins/api/ApiPlugin.ts`, `errors.ts` → `UnsupportedApiVersion.ts`, etc.). Also added `enable-signalr.ts` to the `filename-convention` exclude list since the suggested rename would incorrectly split the "SignalR" brand name. No public API changes.
- 80c3e4a: Internal: added missing intent comments ahead of non-obvious control flow, RxJS `.pipe()` chains, iterator calls, and multi-source object merges to comply with the `require-intent-comment` and `require-tsdoc` lint rules. Also removed dead duplicate files left over from an earlier refactor in `navigation` (`events.ts`, `navigated-event.ts`, `history.flows.ts` — all fully superseded by their split replacements) and renamed `bookmarks/schemas.ts` to `bookmarks/bookmark.schemas.ts` in `services` to match the `*.schemas.ts` filename convention. No public API changes.

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

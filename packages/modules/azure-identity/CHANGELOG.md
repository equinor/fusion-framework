# @equinor/fusion-framework-module-azure-identity

## 0.4.0-next.0

### Minor Changes

- 03f523c: Record Azure Identity authentication outcomes when a telemetry module is registered.
  `acquireToken` (also used by `acquireAccessToken`), `login` and `logout` record
  `fusion.azure-identity.<operation>.duration` metrics, with one sanitized failure exception
  per failure. Tokens, scopes, auth records and original errors are never recorded, results
  and errors are unchanged, and static `token_only` providers are never instrumented. Calls for a telemetry export request, marked with
  `markTelemetryExportRequest`, are not recorded. Without
  telemetry the provider is untouched, and the package stays Node-compatible.
  
  Ref: #5804.

### Patch Changes

- Updated dependencies [03f523c]
- Updated dependencies [e98f6ec]
- Updated dependencies [e98f6ec]
  - @equinor/fusion-framework-module-telemetry@8.0.0-next.0
  - @equinor/fusion-framework-module@6.2.0-next.0

## 0.3.4

### Patch Changes

- 72f0bdc: `AuthProviderDefaultCredential`, `AuthProviderTokenOnly`, `AuthProviderInteractiveBrowser`, and the mock `MockAuthProvider` now extend `BaseModuleProvider` and expose the package `version`, so the CLI no longer emits `ModuleConfigurator.provider.invalidBase` and `ModuleConfigurator.provider.versionMissing` warnings for the auth module. Each provider also gains a `dispose()` method. Constructor signatures are unchanged, and access tokens are not passed to the base class.
  
  Resolves equinor/fusion-core-tasks#2389
- 1aeab73: Internal: upgrade the test toolchain to Vitest 5 through the shared `vitest` pnpm catalog, keeping `vitest`, `@vitest/browser-playwright`, and `vitest-browser-react` aligned for browser-mode tests. Browser tests now use Vitest 5's explicit partial-text assertions and locator matching where needed.

## 0.3.3

### Patch Changes

- 0d1e372: Internal: generate `src/version.ts` in each package's `prebuild` so direct builds and `prepack` no longer depend on the root install script having run. No change to the published output.

## 0.3.2

### Patch Changes

- 02473c5: Internal: bump `@azure/msal-node-extensions` from `5.4.0` to `5.5.0`.

## 0.3.1

### Patch Changes

- d04e564: Internal: restrict published package contents to compiled distribution files and required runtime artifacts so editor tooling does not load workspace TypeScript configurations from dependencies.

## 0.3.0

### Minor Changes

- f663b46: Add `MockAuthProvider`, a configurable `IAuthProvider` test double, exported from a new `/mock` subpath (`@equinor/fusion-framework-module-azure-identity/mock`).
  
  Unlike `token_only` mode's `AuthProviderTokenOnly` — a single fixed token where `login`/`logout` always throw — `MockAuthProvider` actually implements `login`/`logout`: a test can drive the provider from signed-out to signed-in (and back), and control the returned access token and its `expiresOn`, including setting an expiry in the past to exercise a consuming application's own token-refresh logic. No real `@azure/identity` network calls are made.
  
  ```typescript
  import { enableAuthMock } from '@equinor/fusion-framework-module-azure-identity/mock';
  
  const auth = enableAuthMock(configurator, (auth) => {
    auth.setAccount({ username: 'ada@equinor.com', signedOut: true });
  });
  
  await auth.login({ request: { scopes: ['User.Read'] } });
  const token = await auth.acquireAccessToken({ request: { scopes: ['User.Read'] } });
  
  // simulate an expired token
  auth.setExpiresOn(new Date(Date.now() - 1000));
  ```
  
  `MockAuthProvider` registers as the `'auth'` module's provider exactly like any real implementation — no special-cased wiring in the module itself. This does not change or replace `token_only` mode, which remains the right choice for CI/CD scenarios needing a static token.
  
  Related: equinor/fusion-core-tasks#1665.

## 0.2.3

### Patch Changes

- de2b4fb: Added missing TSDoc comments on class fields flagged by the new `require-property-tsdoc` fusion-lint rule.

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

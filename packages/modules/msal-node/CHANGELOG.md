# @equinor/fusion-framework-module-msal-node

## 2.0.2

### Patch Changes

- [#3828](https://github.com/equinor/fusion-framework/pull/3828) [`24403fc`](https://github.com/equinor/fusion-framework/commit/24403fc96d24d942f0c9632ed900b1a0f4065c1e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update `@azure/msal-node` dependency from 3.8.3 to 3.8.4.

  This patch release includes security fixes for React and Next.js CVEs and updates `@azure/msal-common` to v15.13.3.

## 2.0.1

### Patch Changes

- [#3789](https://github.com/equinor/fusion-framework/pull/3789) [`0d31799`](https://github.com/equinor/fusion-framework/commit/0d31799be8da15b7ee4ddca643d6dc684092b905) Thanks [@odinr](https://github.com/odinr)! - Update @azure/msal-node from 3.7.3 to 3.8.3 and @azure/msal-node-extensions from 1.5.11 to 1.5.25.

  This patch update includes bug fixes and improvements to the MSAL Node.js library, including enhanced logging to HttpClient and compatibility updates.

  Closes #3780
  Closes #3781

## 2.0.0

### Major Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Update AuthProvider interfaces to match MSAL v4 API format.

  This is a breaking change that updates the method signatures:

  - `login(options: { scopes: string[] })` → `login(options: { request: { scopes: string[] } })`
  - `acquireAccessToken(options: { scopes: string[]; interactive?: boolean })` → `acquireAccessToken(options: { request: { scopes: string[] }; interactive?: boolean })`

  **Migration:** Update all calls to use the new `{ request: { scopes } }` format.

  ```typescript
  // Before
  await authProvider.login({ scopes: ["user.read"] });
  await authProvider.acquireAccessToken({ scopes: ["api.read"] });

  // After
  await authProvider.login({ request: { scopes: ["user.read"] } });
  await authProvider.acquireAccessToken({ request: { scopes: ["api.read"] } });
  ```

  Fixes TypeScript compilation errors and ensures API consistency with MSAL v4.

## 1.0.8

### Patch Changes

- [#3674](https://github.com/equinor/fusion-framework/pull/3674) [`fe667d5`](https://github.com/equinor/fusion-framework/commit/fe667d54a8b9cb030ed7c2f2a6465c80b1b6b4f2) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @azure/msal-node from 3.8.0 to 3.8.1

  ## Changes

  - Update AccountEntity.getAccountInfo method
  - Fixed minor type error in BaseManagedIdentitySource.ts
  - Improved Managed Identity JSDocs
  - Bump @azure/msal-common to v15.13.1

  This patch release includes bug fixes and documentation improvements for enhanced reliability and developer experience.

- Updated dependencies [[`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59)]:
  - @equinor/fusion-framework-module@5.0.5

## 1.0.7

### Patch Changes

- [#3448](https://github.com/equinor/fusion-framework/pull/3448) [`d812d12`](https://github.com/equinor/fusion-framework/commit/d812d12f537a49006602362918613427e618e97e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated @azure/msal-node from 3.7.4 to 3.8.0, including enhanced security features and data boundary claim instrumentation.

## 1.0.6

### Patch Changes

- [#3442](https://github.com/equinor/fusion-framework/pull/3442) [`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update biome to latest version

- Updated dependencies [[`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6)]:
  - @equinor/fusion-framework-module@5.0.2

## 1.0.5

### Patch Changes

- [#3403](https://github.com/equinor/fusion-framework/pull/3403) [`2fff2ea`](https://github.com/equinor/fusion-framework/commit/2fff2ea1e4838627e297b7b401601f1186c95335) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @azure/msal-node from 3.7.3 to 3.7.4

  ### Links

  - [GitHub releases](https://github.com/AzureAD/microsoft-authentication-library-for-js/releases/tag/msal-node-v3.7.4)
  - [npm changelog](https://www.npmjs.com/package/@azure/msal-node?activeTab=versions)

## 1.0.4

### Patch Changes

- [#3209](https://github.com/equinor/fusion-framework/pull/3209) [`4215d80`](https://github.com/equinor/fusion-framework/commit/4215d80799d156a248feb0f195af370907332a33) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated open dependency from 10.1.2 to 10.2.0

  - Internal refactoring: replaced `is-wsl` dependency with `wsl-utils`
  - No breaking changes to public API
  - Improved WSL detection and compatibility
  - No functional changes for consumers

  **Release Notes**: [open v10.2.0](https://github.com/sindresorhus/open/releases/tag/v10.2.0)

- Updated dependencies [[`3049232`](https://github.com/equinor/fusion-framework/commit/30492326336bea0d1af683b89e62a18eceec4402)]:
  - @equinor/fusion-framework-module@5.0.1

## 1.0.3

### Patch Changes

- [#3361](https://github.com/equinor/fusion-framework/pull/3361) [`1f629b5`](https://github.com/equinor/fusion-framework/commit/1f629b556c4e26170b1eb6ad8823c082cb2ac59d) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add caution message about Linux support.

## 1.0.2

### Patch Changes

- [#3343](https://github.com/equinor/fusion-framework/pull/3343) [`c1cd89a`](https://github.com/equinor/fusion-framework/commit/c1cd89abad4ca8f232a497316232d1f5ac8c530a) Thanks [@odinr](https://github.com/odinr)! - Comprehensive documentation overhaul with enhanced developer experience and platform-specific guidance.

  - **Complete README rewrite** with modern structure and comprehensive examples
  - **Added detailed API reference** with TypeScript interfaces and method documentation
  - **Enhanced authentication mode documentation** with clear use cases and examples
  - **Added comprehensive configuration guide** with required/optional settings tables
  - **Created platform-specific libsecret setup guide** with Windows, macOS, and Linux instructions
  - **Improved troubleshooting section** with common issues and platform-specific solutions
  - **Added quick start examples** for all authentication modes (token_only, silent, interactive)
  - **Enhanced security documentation** explaining platform keychains and encryption

  **New Documentation:**

  - `docs/libsecret.md` - Platform-specific credential storage setup guide
  - Comprehensive Windows build tools installation instructions
  - Enhanced Linux libsecret installation for multiple distributions
  - macOS troubleshooting and setup guidance

  **Key Improvements:**

  - Clear separation between authentication modes with practical examples
  - Platform-specific installation and troubleshooting guidance
  - Better developer onboarding with quick start examples
  - Comprehensive API reference with TypeScript interfaces
  - Enhanced security documentation explaining credential storage

## 1.0.1

### Patch Changes

- [#3301](https://github.com/equinor/fusion-framework/pull/3301) [`152eecb`](https://github.com/equinor/fusion-framework/commit/152eecbccccd5ee3aafc5d59cebdb9b9554ca026) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update dependency `@azure/msal-node` from 3.7.1 to 3.7.3.

  This update ensures compatibility with the latest features and fixes in `msal-node`.

## 1.0.0

### Major Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - This release makes `@equinor/fusion-framework-module-msal-node` an explicit ESM package by setting `type: "module"` in `package.json` and updating all internal TypeScript imports to use explicit `.js` extensions. This ensures compatibility with NodeNext module resolution and ESM environments, and aligns the runtime and published output with ESM standards.

  - All internal imports now use `.js` extensions (e.g., `import { X } from './foo.js'`)
  - `package.json` now explicitly sets `"type": "module"`
  - `tsconfig.json` updated to use `module` and `moduleResolution` set to `NodeNext`
  - **Dynamic import for libsecret dependency**: Converted `createAuthClient` to use dynamic imports to avoid requiring `libsecret` installation in environments where it's not needed (like CI/CD pipelines)
  - No other runtime logic changes

  **BREAKING CHANGE:**
  Consumers must use ESM-compatible tooling and update any imports of this package to use explicit `.js` extensions for internal imports. CommonJS is no longer supported. This may require changes to build tooling, import paths, and runtime environments if not already ESM-ready.

### Patch Changes

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module@5.0.0

## 0.1.2

### Patch Changes

- [`391c618`](https://github.com/equinor/fusion-framework/commit/391c618a8ff4e808d904941b0425961a79def7e7) Thanks [@odinr](https://github.com/odinr)! - bump @azure/msal-node from 3.6.1 to 3.7.0

## 0.1.1

### Patch Changes

- [#3091](https://github.com/equinor/fusion-framework/pull/3091) [`a7127fd`](https://github.com/equinor/fusion-framework/commit/a7127fdc54d9f884dca09a8a85a16d0e3a69053e) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @azure/msal-node from 3.5.3 to 3.6.0

## 0.1.0

### Minor Changes

- [#3056](https://github.com/equinor/fusion-framework/pull/3056) [`378bade`](https://github.com/equinor/fusion-framework/commit/378bade86c38e1057afe125fffc0bb06d6927deb) Thanks [@odinr](https://github.com/odinr)! - Easily add secure Azure AD authentication to your Node.js Fusion Framework apps with the new `@equinor/fusion-framework-module-msal-node` package. This module is designed for developers who need to authenticate services, CLI tools, or background jobs against Microsoft Azure using familiar, robust MSAL flows—without the hassle of manual token management or insecure storage.

  **Why use this module?**

  - **Simple integration:** Plug into the Fusion Framework with minimal setup.
  - **Multiple auth flows:** Choose the right authentication mode for your use case—CI/CD, background jobs, or interactive CLI tools.
  - **Secure by default:** Tokens are encrypted and stored safely using `@azure/msal-node-extensions`.
  - **Consistent API:** Acquire tokens the same way across all your Node.js Fusion projects.

  **How to use:**

  1. Install the package in your Fusion Framework Node.js project.
  2. Enable the module and pick your authentication mode (`token_only`, `silent`, or `interactive`).
  3. Use the provided API to acquire tokens for Azure resources—no need to handle refresh logic or storage yourself.

  - Supports token_only, silent, and interactive authentication modes
  - Provides secure, encrypted token storage using `@azure/msal-node-extensions`
  - Integrates with Fusion Framework for seamless authentication
  - Includes comprehensive documentation and usage examples

  ## Example Setups

  ### `token_only` Mode

  ```ts
  import {
    enableAuthModule,
    type MsalNodeModule,
  } from "@equinor/fusion-framework-msal-node";
  import { ModulesConfigurator } from "@equinor/fusion-framework-module";

  const configurator = new ModulesConfigurator<[MsalNodeModule]>();

  enableAuthModule(configurator, (builder) => {
    builder.setMode("token_only");
    builder.setAccessToken("your-access-token"); // Provide your token
  });

  const instance = await initialize();
  console.log(
    await instance.auth.acquireAccessToken({ scopes: ["user.read"] })
  );
  ```

  ### `silent` Mode

  ```ts
  import {
    enableAuthModule,
    type MsalNodeModule,
  } from "@equinor/fusion-framework-msal-node";
  import { ModulesConfigurator } from "@equinor/fusion-framework-module";

  const configurator = new ModulesConfigurator<[MsalNodeModule]>();

  enableAuthModule(configurator, (builder) => {
    builder.setMode("silent");
    builder.setClientId("your-client-id");
    builder.setTenantId("your-tenant-id");
  });

  const instance = await initialize();
  console.log(
    await instance.auth.acquireAccessToken({ scopes: ["user.read"] })
  );
  ```

  ### `interactive` Mode

  ```ts
  import {
    enableAuthModule,
    type MsalNodeModule,
  } from "@equinor/fusion-framework-msal-node";
  import { ModulesConfigurator } from "@equinor/fusion-framework-module";

  const configurator = new ModulesConfigurator<[MsalNodeModule]>();

  enableAuthModule(configurator, (builder) => {
    builder.setMode("interactive");
    builder.setClientId("your-client-id");
    builder.setTenantId("your-tenant-id");
    builder.setServerPort(3000); // Local server port for auth callback
    builder.setServerOnOpen((url) => {
      console.log(`Please navigate to: ${url}`);
    });
  });

  const instance = await initialize();
  console.log(await instance.auth.login({ scopes: ["user.read"] }));
  ```

  See README.md for details.

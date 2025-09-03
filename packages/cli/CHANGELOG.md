# Change Log

## 11.1.1

### Patch Changes

- [#3327](https://github.com/equinor/fusion-framework/pull/3327) [`22d6d3b`](https://github.com/equinor/fusion-framework/commit/22d6d3b7753da8ad30054839e8a6083850a208fa) Thanks [@odinr](https://github.com/odinr)! - moved plugin `vite-tsconfig-paths` to `@equinor/fusion-framework-dev-server`

- Updated dependencies [[`22d6d3b`](https://github.com/equinor/fusion-framework/commit/22d6d3b7753da8ad30054839e8a6083850a208fa)]:
  - @equinor/fusion-framework-dev-server@1.0.1

## 11.1.0

### Minor Changes

- [#3323](https://github.com/equinor/fusion-framework/pull/3323) [`8b2633d`](https://github.com/equinor/fusion-framework/commit/8b2633dca8e61e18f19e605f5338a9925a8588ab) Thanks [@odinr](https://github.com/odinr)! - Add `vite-plugin-tsconfig-paths` to allow apps to use path aliases in tsconfig, instead of defining them manually in Vite config.

  > [!NOTE]
  > Newer versions of Vite wont resolve files from `baseUrl` in `tsconfig.json`.
  >
  > To fix this, you can either:
  >
  > - Update import with full relative path
  > - Add paths to `tsconfig.json`

  example:

  ```json
  {
    "compilerOptions": {
      "baseUrl": "src",
      "paths": {
        "@/*": ["./*"]
      }
    }
  }
  ```

  ```typescript
  import { MyComponent } from "@/components";
  ```

  ‼️ Bad practice:

  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "MyComponent": ["src/components/MyComponent"]
      }
    }
  }
  ```

  ```typescript
  import { MyComponent } from "MyComponent";
  ```

  > [!IMPORTANT]
  > This is just best effort for resolving paths at build time. It does not guarantee that all paths will be resolved correctly in all scenarios. Please verify that your paths are working as expected after this update.

### Patch Changes

- [#3323](https://github.com/equinor/fusion-framework/pull/3323) [`8b2633d`](https://github.com/equinor/fusion-framework/commit/8b2633dca8e61e18f19e605f5338a9925a8588ab) Thanks [@odinr](https://github.com/odinr)! - Added debug logging of included file system paths.

  > [!Note] > _Vite will not resolve files outside the working directory unless explicitly allowed._

- [#3323](https://github.com/equinor/fusion-framework/pull/3323) [`8b2633d`](https://github.com/equinor/fusion-framework/commit/8b2633dca8e61e18f19e605f5338a9925a8588ab) Thanks [@odinr](https://github.com/odinr)! - Improved CLI logger by adding a missing argument for enhanced debugging.
  Running `ffc app dev --debug` now provides more detailed output during development server startup.

- [#3323](https://github.com/equinor/fusion-framework/pull/3323) [`8b2633d`](https://github.com/equinor/fusion-framework/commit/8b2633dca8e61e18f19e605f5338a9925a8588ab) Thanks [@odinr](https://github.com/odinr)! - Fixed issue where app routing was not properly handled in the development server configuration. Some request where given with `/` instead of `@`, so now we support both formats.

  example `/apps/bundles/apps/my-app/6.7.8/src/index.ts?import` was expected to be `/apps/bundles/apps/my-app@6.7.8/src/index.ts?import`.

  Should fix https://github.com/equinor/fusion/issues/640

- Updated dependencies [[`39188bf`](https://github.com/equinor/fusion-framework/commit/39188bfc84fe2b62f72b07acd58f10fe7149579c), [`39188bf`](https://github.com/equinor/fusion-framework/commit/39188bfc84fe2b62f72b07acd58f10fe7149579c), [`866d1c5`](https://github.com/equinor/fusion-framework/commit/866d1c52ab86aaa742605e401d8633bc032efeb2)]:
  - @equinor/fusion-imports@1.1.2

## 11.0.2

### Patch Changes

- [`00c1851`](https://github.com/equinor/fusion-framework/commit/00c1851c1f80a89531796fb7487176867a4af533) Thanks [@odinr](https://github.com/odinr)! - fixed broken link in migration guide

## 11.0.1

### Patch Changes

- [#3271](https://github.com/equinor/fusion-framework/pull/3271) [`7832bd7`](https://github.com/equinor/fusion-framework/commit/7832bd78843621ca95373596761bec29d4bdbbb8) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update dependency `chalk` to ^5.6.0

  - Updated `chalk` to version ^5.6.0 in root, CLI, and log utils packages.
  - No breaking changes expected.

  See [chalk changelog](https://github.com/chalk/chalk/releases) for details.

- [#3309](https://github.com/equinor/fusion-framework/pull/3309) [`29efd10`](https://github.com/equinor/fusion-framework/commit/29efd10c48f9d11ba5aa7246d3217c5ea81ddc14) Thanks [@odinr](https://github.com/odinr)! - - Removed all YAML/Markdown frontmatter blocks from CLI documentation files in `/packages/cli/docs` and `/packages/cli/README.md` for a cleaner, more maintainable documentation source.

  - Updated all internal documentation links to use relative paths without leading `./` for consistency and compatibility with VuePress.
  - Updated the `TODO.md` file to remove completed or obsolete tasks and clarify remaining todos.

- [#3300](https://github.com/equinor/fusion-framework/pull/3300) [`219c449`](https://github.com/equinor/fusion-framework/commit/219c4492cb9d8925cdf73f31fd6d6ad2507ed971) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump rollup from 4.46.2 to 4.49.0

- Updated dependencies [[`6480bf1`](https://github.com/equinor/fusion-framework/commit/6480bf197db9428fed80299c235f0608db0ca6a3), [`152eecb`](https://github.com/equinor/fusion-framework/commit/152eecbccccd5ee3aafc5d59cebdb9b9554ca026), [`113a9ac`](https://github.com/equinor/fusion-framework/commit/113a9ac9b11f4cdb09dad22cbea010a3f5097343)]:
  - @equinor/fusion-framework-dev-portal@1.0.1
  - @equinor/fusion-framework-module-msal-node@1.0.1

## 11.0.0

### Major Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - **Major Changes**

  - **Rewrite:** The CLI has been rewritten to use Fusion Framework internally, minimizing dependencies and improving performance. It is now a first-class citizen in the Fusion Framework ecosystem, providing a more consistent and integrated experience.
  - **Dev Portal Modularization:** The dev portal has been moved to a separate package `@equinor/fusion-framework-dev-server`, enabling modular architecture and independent updates. The dev portal can be configured via `dev-server.config.js` and supports live preview and API mocking.
  - **Command Structure:** CLI is now divided into three main groups: `bin` (executable functions), `commands` (CLI commands), and `lib` (for consumers, config, and utilities). This improves organization and modularity.
  - **BREAKING:** The `--service` flag has been removed. The CLI now uses service discovery via Fusion environment variables. All `app -build-???` commands are deprecated and will be removed in the next major version.

  - **Dev Server Abstraction:** Vite configuration and dev server functionality has been abstracted into the `@equinor/fusion-framework-dev-server` package. The CLI now provides a higher-level API that handles Vite configuration internally, eliminating the need for users to manage Vite configuration directly while still allowing for customization through configuration options.

  - **New Utility Functions:** The CLI now includes new utility modules for resolving CI/CD metadata (GitHub Actions, Azure DevOps), git commit and remote info, and package metadata. These utilities support advanced scripting and automation scenarios.

  **Minor Changes**

  - **Portal Config Support:** Added helpers for loading and resolving portal configuration files, with new types and utilities for authoring static or dynamic portal configs. Dev server logic updated to use resolved portal config.
  - **Manifest Refactor:** Portal manifest now uses `name` and `templateEntry` for consistency with app manifests. Dev server config and routing updated. Asset paths now use `/@fs` for local development. Improved type safety and schema validation.
  - **ESM Modernization:** Refactored CLI to use deepmerge instead of lodash.mergewith, updated all imports to use explicit `.js` extensions, and re-exported all bin entrypoints for ESM compatibility. Updated package.json and tsconfig.json for ESM.

  **Patch Changes**

  - **Dev Server Config:** Refactored config loading and merging, added `RecursivePartial` type, custom array merge strategy, and improved documentation. Arrays of route objects are now merged by `match` property to ensure uniqueness.
  - **Node Version Check:** Added Node.js version check and LTS recommendation to CLI entrypoint. Build config injects version info via environment variables.

  **Other**

  - Improved maintainability, type safety, and developer experience throughout the CLI and dev server packages.

  **Note:**

  - The removal of Vite config and schema utilities is a breaking change for users who previously relied on CLI-provided defaults. Please migrate to custom configuration as needed.
  - The new utility modules are available for advanced use cases and automation, but do not affect most standard CLI usage.
  - If you are authoring an `app.config.ts` file, you now need to import the config helper as follows:

    ```diff
    -import { defineAppConfig } from '@equinor/fusion-framework-cli';
    +import { defineAppConfig } from '@equinor/fusion-framework-cli/app';
    ```

  **Further Reading & Documentation Highlights**

  +- See the CLI's [README](https://github.com/equinor/fusion-framework/blob/main/packages/cli/README.md) for a full overview, installation, and command reference.
  +- The [docs folder](https://github.com/equinor/fusion-framework/tree/main/packages/cli/docs) contains:

  - - [Developing Apps](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/application.md): Step-by-step guide to app setup, config, CI/CD, and best practices.
  - - [Developing Portals](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/portal.md): Portal template development, manifest/schema, and deployment.
  - - [Authentication](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/auth.md): Local and CI/CD authentication, MSAL, and secure token storage.
  - - [Migration Guide: v10 to v11](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/migration-v10-to-v11.md): Breaking changes, deprecated commands, and upgrade steps.
  - - [libsecret setup](https://github.com/equinor/fusion-framework/blob/main/packages/cli/docs/libsecret.md): Secure credential storage for Linux users.
      +- For real-world examples, see the [cookbooks/](https://github.com/equinor/fusion-framework/tree/main/cookbooks) directory.

  * Key usage notes:
    - All config and manifest files must use helpers from `@equinor/fusion-framework-cli/app`.
    - Use `fusion-framework-cli auth login` for local authentication; use `FUSION_TOKEN` for CI/CD.
    - Deprecated commands (`build-pack`, `build-upload`, etc.) are replaced by `pack`, `upload`, etc. Use `--env` instead of `--service`.
    - The CLI supports "build once, deploy many" CI/CD workflows.
    - Utilities like `mergeAppManifests` are available for advanced config/manifest merging.

  This consolidated changeset replaces all previous CLI-related changesets for this release.

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Upgrade zod dependency to ^3.25.76 in all affected packages.

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-dev-portal@1.0.0
  - @equinor/fusion-framework-dev-server@1.0.0
  - @equinor/fusion-framework-module-msal-node@1.0.0
  - @equinor/fusion-imports@1.1.1

## 10.7.6

### Patch Changes

- [#3268](https://github.com/equinor/fusion-framework/pull/3268) [`7ef5afc`](https://github.com/equinor/fusion-framework/commit/7ef5afc96a8c2cebecedc85703be820d84e3885a) Thanks [@odinr](https://github.com/odinr)! - Fix: Improve type safety and error handling in `AppAssetExportPlugin` (app-assets plugin).

  - Use `unknown as PluginContext` for type casting in `resolveId` and `emitAssetSync` calls.
  - Add null check and warning if asset emission fails.
  - Minor code style and safety improvements.

  This change improves plugin robustness and aligns with best practices for Vite/Rollup plugin development.

- [#3268](https://github.com/equinor/fusion-framework/pull/3268) [`7ef5afc`](https://github.com/equinor/fusion-framework/commit/7ef5afc96a8c2cebecedc85703be820d84e3885a) Thanks [@odinr](https://github.com/odinr)! - Upgraded rollup from `4.22.4` to `4.46.3`

## 10.7.5

### Patch Changes

- [#3164](https://github.com/equinor/fusion-framework/pull/3164) [`31e4477`](https://github.com/equinor/fusion-framework/commit/31e447749cffc6d05e9dc3aef8ec49bd29751714) Thanks [@Noggling](https://github.com/Noggling)! - Fixes a bug where the app module was not using the correct configured HTTP client. Updates the configuration to ensure the app module uses the HTTP client that matches its expected name.

## 10.7.4

### Patch Changes

- [#3064](https://github.com/equinor/fusion-framework/pull/3064) [`231e24e`](https://github.com/equinor/fusion-framework/commit/231e24eef9ca33db2fbde2fdd1c918eeb620c8c4) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add support for html and svg in meta and graphic for context result

## 10.7.3

### Patch Changes

- [#2969](https://github.com/equinor/fusion-framework/pull/2969) [`cf67e87`](https://github.com/equinor/fusion-framework/commit/cf67e87c0bf83230fa77ff7a66254cd615675c34) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/eds-core-react from 0.43.0 to 0.45.0

## 10.7.2

### Patch Changes

- [#2962](https://github.com/equinor/fusion-framework/pull/2962) [`79f1205`](https://github.com/equinor/fusion-framework/commit/79f120535caf65e5f2a97dbca666165b55e53320) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update `@equinor/fusion-wc-person` to 3.1.7

## 10.7.1

### Patch Changes

- [#2954](https://github.com/equinor/fusion-framework/pull/2954) [`aac72ce`](https://github.com/equinor/fusion-framework/commit/aac72ce780588c72eb517d3e8c4860f002cc570d) Thanks [@odinr](https://github.com/odinr)! - fixed issues with overriding proxy options

- [#2955](https://github.com/equinor/fusion-framework/pull/2955) [`6f104e2`](https://github.com/equinor/fusion-framework/commit/6f104e2ed191e77c6127376e035bbf7af80f166b) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - - Add env to 'onReactAppLoaded' event
  - Prevent context provider change if app key is not current app for 'onReactAppLoaded'

## 10.7.0

### Minor Changes

- [#2930](https://github.com/equinor/fusion-framework/pull/2930) [`5da6b2d`](https://github.com/equinor/fusion-framework/commit/5da6b2d4cb7fb93ff3784753a0052d3362ab828d) Thanks [@odinr](https://github.com/odinr)! - **@equinor/fusion-framework-react:**

  - Enhanced `useAppContextNavigation` to support custom context path extraction and generation. This allows for more flexible navigation handling based on application-specific requirements.

  **@equinor/fusion-framework-module-context:**

  - Added support for custom context path extraction and generation in `ContextConfigBuilder`, `ContextProvider`, and `ContextModuleConfigurator`.
  - Introduced `setContextPathExtractor` and `setContextPathGenerator` methods in `ContextConfigBuilder` to allow developers to define custom logic for extracting and generating context paths.
  - Updated `ContextProvider` to utilize `extractContextIdFromPath` and `generatePathFromContext` from the configuration, enabling dynamic path handling.
  - Enhanced `ContextModuleConfigurator` to include `extractContextIdFromPath` and `generatePathFromContext` in the module configuration.

  If you are using `@equinor/fusion-framework-module-context` and need custom logic for context path handling:

  1. Use `setContextPathExtractor` to define how to extract context IDs from paths.
  2. Use `setContextPathGenerator` to define how to generate paths based on context items.

  Example:

  ```typescript
  builder.setContextPathExtractor((path) => {
    // Custom logic to extract context ID from path
    return path.match(/\/custom\/(.+)/)?.[1];
  });

  builder.setContextPathGenerator((context, path) => {
    // Custom logic to generate path from context
    return path.replace(/^(\/)?custom\/[^/]+(.*)$/, `/app/${item.id}$2`);
  });
  ```

  If your portal is generating context paths based on context items, you can now define custom logic for context path handling:

  ```typescript
  contextProvider.currentContext$
    .pipe(
      map((context) => {
        // Custom logic to generate path from context
        const path = contextProvider.generatePathFromContext?.(
          context,
          location.pathname
        );
        return path ?? fallbackPathGenerator(context, location.pathname);
      }),
      filter(Boolean)
    )
    .subscribe((path) => history.push(path));
  ```

## 10.6.1

### Patch Changes

- [#2913](https://github.com/equinor/fusion-framework/pull/2913) [`4b3a72b`](https://github.com/equinor/fusion-framework/commit/4b3a72b57d1069ea4e3fc72d852cbef03bf00d60) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump vite from 6.1.1 to 6.2.2

- [#2920](https://github.com/equinor/fusion-framework/pull/2920) [`8362ea2`](https://github.com/equinor/fusion-framework/commit/8362ea223dd9909cb523f0353c80d52aab573a5f) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/fusion-react-side-sheet from 1.3.5 to 1.3.6

## 10.6.0

### Minor Changes

- [#2907](https://github.com/equinor/fusion-framework/pull/2907) [`4ab33e9`](https://github.com/equinor/fusion-framework/commit/4ab33e91d827d4ff28947eab6c856e9e49866a6f) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add `help-proxy` plugin for the CLI.

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- [#2890](https://github.com/equinor/fusion-framework/pull/2890) [`1ad39f5`](https://github.com/equinor/fusion-framework/commit/1ad39f509a33627f2ad877a4125386a80ab8f510) Thanks [@odinr](https://github.com/odinr)! - refactor: adhere to self-closing tags for components

  - Updated `SelectorPage.tsx` to use self-closing tags for `PersonSelect` components.
  - Updated `Header.Actions.tsx` to use self-closing tags for `fwc-person-avatar` component.
  - Updated `FeatureSheetContent.tsx` to use self-closing tags for `Icon` and `Divider` components.

## 10.5.5

### Patch Changes

- [#2888](https://github.com/equinor/fusion-framework/pull/2888) [`a1deeb0`](https://github.com/equinor/fusion-framework/commit/a1deeb07fd60c61eecd61ef038544ecb7c274271) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update `@equinor/fusion-react-context-selector` to 1.0.4

## 10.5.4

### Patch Changes

- [#2877](https://github.com/equinor/fusion-framework/pull/2877) [`b547618`](https://github.com/equinor/fusion-framework/commit/b547618f2dfbebc350f4285c36ab481f591c0c5c) Thanks [@odinr](https://github.com/odinr)! - update fusion react and web components

## 10.5.3

### Patch Changes

- [#2870](https://github.com/equinor/fusion-framework/pull/2870) [`012e69c`](https://github.com/equinor/fusion-framework/commit/012e69cacf0601c00de550545fa8cd93538f12c8) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump vite from 6.1.1 to 6.2.0

- [#2867](https://github.com/equinor/fusion-framework/pull/2867) [`5bc278a`](https://github.com/equinor/fusion-framework/commit/5bc278a456d5b4b258f82a83a54558df45124427) Thanks [@odinr](https://github.com/odinr)! - Ensures App Assets plugin emits source as `Uint8Array`, previously it was emitting as `Buffer`, which was not catched by `Typescript` < 5.7.

## 10.5.2

### Patch Changes

- [#2852](https://github.com/equinor/fusion-framework/pull/2852) [`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d) Thanks [@odinr](https://github.com/odinr)! - replaced forEach with for-of loops for better readability

- [#2851](https://github.com/equinor/fusion-framework/pull/2851) [`c1c9dfa`](https://github.com/equinor/fusion-framework/commit/c1c9dfa5bf0323ab4e146c45c475fa4f6af61088) Thanks [@odinr](https://github.com/odinr)! - fixed links with blank targets and svg without title

- [#2855](https://github.com/equinor/fusion-framework/pull/2855) [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1) Thanks [@odinr](https://github.com/odinr)! - Conformed to Biome `linter.correctness.useExhaustiveDependencies`

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- [#2836](https://github.com/equinor/fusion-framework/pull/2836) [`6961024`](https://github.com/equinor/fusion-framework/commit/6961024f4ea330ac5d742037623834ee95b05b2b) Thanks [@dependabot](https://github.com/apps/dependabot)! - updated @equinor/fusion-wc-person to 3.1.5

## 10.5.1

### Patch Changes

- [#2831](https://github.com/equinor/fusion-framework/pull/2831) [`4e2b961`](https://github.com/equinor/fusion-framework/commit/4e2b961ac6ace80b95f2795b3f3b839c763cbb28) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add support for clearing context in CLI - aligning with same behaviour as portal

- [#2847](https://github.com/equinor/fusion-framework/pull/2847) [`59348f0`](https://github.com/equinor/fusion-framework/commit/59348f02f7ced10782691f69bae32274b88a4b53) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update dep `@equinor/fusion-react-context-selector` to `1.0.1`

## 10.5.0

### Minor Changes

- [#2814](https://github.com/equinor/fusion-framework/pull/2814) [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa) Thanks [@odinr](https://github.com/odinr)! - updated configuration of MSAL

## 10.4.2

### Patch Changes

- [#2801](https://github.com/equinor/fusion-framework/pull/2801) [`c2ffb02`](https://github.com/equinor/fusion-framework/commit/c2ffb026edacd3dc9eed570dc83aa71c3e58adea) Thanks [@eikeland](https://github.com/eikeland)! - Updating fwc-person to resolve height issues on variant dense

## 10.4.1

### Patch Changes

- [#2791](https://github.com/equinor/fusion-framework/pull/2791) [`0f87836`](https://github.com/equinor/fusion-framework/commit/0f878368780f57df07dc766bc0afb945ca1346ce) Thanks [@eikeland](https://github.com/eikeland)! - Updating `@equinor/fusion-wc-person` to get latest fixes in dev-portal

- [#2781](https://github.com/equinor/fusion-framework/pull/2781) [`25dfe68`](https://github.com/equinor/fusion-framework/commit/25dfe68275c4da267cda9a0699dc123e5febc708) Thanks [@eikeland](https://github.com/eikeland)! - Updating `@equinor/fusion-react-context-selector` to get latest wc in devportal

## 10.4.0

### Minor Changes

- [#2691](https://github.com/equinor/fusion-framework/pull/2691) [`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb) Thanks [@odinr](https://github.com/odinr)! - Refactored dev-portal bookmark sidesheet to use component context

### Patch Changes

- [#2748](https://github.com/equinor/fusion-framework/pull/2748) [`81a8e9b`](https://github.com/equinor/fusion-framework/commit/81a8e9b2201be89801eddfc8f84f989c3cab26cc) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/fusion-react-context-selector from 0.6.6 to 0.6.8

- [#2715](https://github.com/equinor/fusion-framework/pull/2715) [`a567179`](https://github.com/equinor/fusion-framework/commit/a567179009e1e2f710acb3bf707be0b1f3d7d02b) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/fusion-react-context-selector from 0.6.6 to 0.6.8

- [#2691](https://github.com/equinor/fusion-framework/pull/2691) [`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb) Thanks [@odinr](https://github.com/odinr)! - updated bookmark component for dev portal

- [#2691](https://github.com/equinor/fusion-framework/pull/2691) [`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb) Thanks [@odinr](https://github.com/odinr)! - improved markup for bookmark

- [#2712](https://github.com/equinor/fusion-framework/pull/2712) [`a466c37`](https://github.com/equinor/fusion-framework/commit/a466c371a47d47b6d7a037dd5343bb71972dfc70) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @remix-run/router from 1.18.0 to 1.21.0

- [#2696](https://github.com/equinor/fusion-framework/pull/2696) [`7897219`](https://github.com/equinor/fusion-framework/commit/789721988959ea21a4ebe769128d5a92de90a678) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - wc-person component update from 3.1.0 to 3.1.1

## 10.3.6

### Patch Changes

- [#2671](https://github.com/equinor/fusion-framework/pull/2671) [`9ccfe80`](https://github.com/equinor/fusion-framework/commit/9ccfe8024de221ce5b26beec6ab230dfa635f759) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated commander from 12.1.0 to 13.0.0

- [#2675](https://github.com/equinor/fusion-framework/pull/2675) [`e36756d`](https://github.com/equinor/fusion-framework/commit/e36756dfff11ca06957a9132df6a89ba47eba338) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump vite from 5.4.3 to 6.0.7

- [#2679](https://github.com/equinor/fusion-framework/pull/2679) [`04f0597`](https://github.com/equinor/fusion-framework/commit/04f059702b665c8ec079daba9ba8b8b21eadf9a2) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/fusion-react-context-selector from 0.6.6 to 0.6.8

- [#2653](https://github.com/equinor/fusion-framework/pull/2653) [`4e1e47d`](https://github.com/equinor/fusion-framework/commit/4e1e47d3250027b757ad647534cffcb35add1011) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/fusion-react-side-sheet from 1.3.3 to 1.3.4

- [#2686](https://github.com/equinor/fusion-framework/pull/2686) [`9c2b6c5`](https://github.com/equinor/fusion-framework/commit/9c2b6c5f97203aa793dc76a8fcd8c3ec3c7eb810) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump rollup from 4.22.4 to 4.30.1

- [#2690](https://github.com/equinor/fusion-framework/pull/2690) [`809bee0`](https://github.com/equinor/fusion-framework/commit/809bee089d5d84799a3834294ca02937eaa46a0e) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/eds-icons from 0.21.0 to 0.22.0

## 10.3.5

### Patch Changes

- [#2661](https://github.com/equinor/fusion-framework/pull/2661) [`f60748b`](https://github.com/equinor/fusion-framework/commit/f60748b4f3980f00fa3aed131fef97513f1424c6) Thanks [@eikeland](https://github.com/eikeland)! - Added `noOpen` option to the development server configuration.

  **Modified files:**

  - `packages/cli/src/bin/create-dev-serve.ts`
  - `packages/cli/src/bin/main.app.ts`

  **Changes:**

  - Added `noOpen` boolean option to `createDevServer` function.
  - Updated the server configuration to conditionally open the app in the default browser based on the `noOpen` option.
  - Added `-n, --noOpen` option to the CLI command for starting the development server.

## 10.3.4

### Patch Changes

- [#2657](https://github.com/equinor/fusion-framework/pull/2657) [`dfb69b5`](https://github.com/equinor/fusion-framework/commit/dfb69b5d710503cbcec35be70e6e50dd0b9a34f7) Thanks [@eikeland](https://github.com/eikeland)! - - Updates link to fusion ci portal

## 10.3.3

### Patch Changes

- [#2648](https://github.com/equinor/fusion-framework/pull/2648) [`270f2ba`](https://github.com/equinor/fusion-framework/commit/270f2ba5c7447fff79e3a54130c10614aa35fea7) Thanks [@odinr](https://github.com/odinr)! - Fixed resolving of app key from manifest when publishing (earlier only resolved from package)

## 10.3.2

### Patch Changes

- [#2639](https://github.com/equinor/fusion-framework/pull/2639) [`98dfe48`](https://github.com/equinor/fusion-framework/commit/98dfe48602531c9b364ea7efe355392567c26f7c) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Updated `@equinor/fusion-wc-person` dependency from version `^3.0.6` to `^3.1.0`

## 10.3.1

### Patch Changes

- [#2632](https://github.com/equinor/fusion-framework/pull/2632) [`b136b45`](https://github.com/equinor/fusion-framework/commit/b136b4565da1af09c8447956716f3d9f0ea91698) Thanks [@eikeland](https://github.com/eikeland)! - ### Changes

  Updated `@equinor/fusion-wc-person` dependency from version `^3.0.5` to `^3.0.6`

## 10.3.0

### Minor Changes

- [#2577](https://github.com/equinor/fusion-framework/pull/2577) [`c3ba9f1`](https://github.com/equinor/fusion-framework/commit/c3ba9f109d9f96d6dc6ee2f0ddac00c8b3090982) Thanks [@eikeland](https://github.com/eikeland)! - Created a plugin for handling application settings. This plugin allows retrieving and setting application settings when developing locally by intercepting the request to the settings API and returning the local settings instead. Settings are stored in memory and are not persisted, which means the CLI will always provide settings as if the user has never set them before. By restarting the CLI, the settings will be lost. This plugin is useful for testing and development purposes.

  Also added a utility function `parseJsonFromRequest` to parse JSON from a request body. This function is used in the plugin to parse the `PUT` request body and update the settings accordingly.

  The default development server has enabled this plugin by default and confiuigred it to intercept the settings API on `/apps-proxy/persons/me/apps/${CURRENT_APP_KEY}/settings`

## 10.2.5

### Patch Changes

- [#2612](https://github.com/equinor/fusion-framework/pull/2612) [`1f9da67`](https://github.com/equinor/fusion-framework/commit/1f9da67df85f466763788039c9f0df67164eb391) Thanks [@eikeland](https://github.com/eikeland)! - ### Changes

  - Stopped using node:path join in app-proxy-plugin since it caused issues on windows

## 10.2.4

### Patch Changes

- [#2606](https://github.com/equinor/fusion-framework/pull/2606) [`00fb17d`](https://github.com/equinor/fusion-framework/commit/00fb17d9e753462a7acf6a34281a50194b94db20) Thanks [@eikeland](https://github.com/eikeland)! - ### Modified Files

  `AppLoader.tsx`

  ### Changes

  - Added import for last operator from rxjs/operators.
  - Updated the initialize subscription to use the last operator.

## 10.2.3

### Patch Changes

- [#2591](https://github.com/equinor/fusion-framework/pull/2591) [`445760c`](https://github.com/equinor/fusion-framework/commit/445760ce73e1d76303c83c367a394adfb5b7a479) Thanks [@eikeland](https://github.com/eikeland)! - ### Updated Dependencies:

  - Updated @equinor/fusion-wc-person to ^3.0.5 in package.json.

## 10.2.2

### Patch Changes

- [#2582](https://github.com/equinor/fusion-framework/pull/2582) [`8dfb437`](https://github.com/equinor/fusion-framework/commit/8dfb4370d1c961a1f24af93344034facaef87646) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump rollup from 4.22.4 to 4.27.2

## 10.2.1

### Patch Changes

- [`71f2de5`](https://github.com/equinor/fusion-framework/commit/71f2de516bbbb270e8c110197fb7c90288075b05) Thanks [@odinr](https://github.com/odinr)! - hotfix

## 10.2.0

### Minor Changes

- [#2410](https://github.com/equinor/fusion-framework/pull/2410) [`9d1cb90`](https://github.com/equinor/fusion-framework/commit/9d1cb9003fa10e7ccaa95c20ef86f0a618034641) Thanks [@odinr](https://github.com/odinr)! - Updated Bookmark Integration in Dev Portal

  - **Refactored `BookMarkSideSheet.tsx`:**

    - Replaced `useHasBookmark` with `useCurrentAppModule<BookmarkModule>('bookmark')` for better module integration.
    - Updated button `disabled` state to use `bookmarkProvider?.hasBookmarkCreators`.

  - **Updated `Header.tsx`:**

    - Added `useCurrentAppModule<BookmarkModule>('bookmark')` to manage bookmark module state.
    - Disabled bookmark button if `bookmarkProvider` is not available.
    - Passed `bookmarkProvider` to `BookmarkProvider` component.

  - **Configuration Changes in `config.ts`:**
    - Switched import from `@equinor/fusion-framework-module-bookmark` to `@equinor/fusion-framework-react-module-bookmark`.
    - Added `builder.setFilter('application', true)` to bookmark configuration.

## 10.1.0

### Minor Changes

- [#2567](https://github.com/equinor/fusion-framework/pull/2567) [`71d57c2`](https://github.com/equinor/fusion-framework/commit/71d57c2955861e86f8026068fb7cd4fe39b195f6) Thanks [@odinr](https://github.com/odinr)! - Added functionality for allow providing paths for `config`, `manifest` and bundle in `app-proxy-plugin`. This is useful for plugins that need to load resources from a specific path.

  This was required since the AppClient was changed in [#2520](https://github.com/equinor/fusion-framework/pull/2520) which broke the ability to load resources from the plugin.

## 10.0.4

### Patch Changes

- [#2542](https://github.com/equinor/fusion-framework/pull/2542) [`29565b8`](https://github.com/equinor/fusion-framework/commit/29565b80d1fd2287a91009e3315da852665886ec) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump @equinor/fusion-wc-person from 3.0.1 to 3.0.3

- [#2551](https://github.com/equinor/fusion-framework/pull/2551) [`4570ffb`](https://github.com/equinor/fusion-framework/commit/4570ffb0f3bf1561bdd679c9280de83dda0d9bf8) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update @equinor/eds-core-react from 0.41.2 to 0.42.3

- [#2556](https://github.com/equinor/fusion-framework/pull/2556) [`1a59364`](https://github.com/equinor/fusion-framework/commit/1a59364477520859a00152e182cdbc4f8f271a27) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump rollup from 4.22.4 to 4.25.0

## 10.0.3

### Patch Changes

- [#2523](https://github.com/equinor/fusion-framework/pull/2523) [`e188193`](https://github.com/equinor/fusion-framework/commit/e188193a09802cfb74bd8aeaa8713b75b10a0638) Thanks [@eikeland](https://github.com/eikeland)! - ## changes:

  - changing ci urls to new domain

## 10.0.2

### Patch Changes

- [#2521](https://github.com/equinor/fusion-framework/pull/2521) [`65f03fa`](https://github.com/equinor/fusion-framework/commit/65f03fa01b71d387874dbe8ae21163c7c1c3d4b8) Thanks [@eikeland](https://github.com/eikeland)! - ### Adds CHANGELOG.md to app zip package

  - Removed individual file additions for package.json, LICENSE.md, and README.md.
  - Added a loop to handle multiple files (package.json, LICENSE.md, README.md, CHANGELOG.md) in a more concise manner.
  - Updated the spinner messages accordingly.

## 10.0.1

### Patch Changes

- [#2517](https://github.com/equinor/fusion-framework/pull/2517) [`e78861a`](https://github.com/equinor/fusion-framework/commit/e78861a17cb0174ad96cd05e1b873e5fee42660f) Thanks [@eikeland](https://github.com/eikeland)! - Make `app.config.ts` definition scopes optional by updating the `AppConfigFn` type to use `z.input<typeof ApiAppConfigSchema>`.

## 10.0.0

### Major Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Adding new commands for app management, `build-publish`, `build-pack`, `build-upload`, `build-config`, `build-manifest` and `build-tag`.

  Introduces new parameters to the `build-config` command for publishing the app config to a build version.

  Commands:

  - `build-pack` - Bundle the app for distribution
    - `-o, --output <output>` - Output directory for the packed app
    - `-a, --archive` - Archive name for the packed app
  - `build-upload` - Upload the packed app to the Fusion App Store
    - `-b, --bundle <bundle>` - Path to the packed app bundle
    - `-e, --env <ci | fqa | tr | fprd>` - Environment to upload the app to
    - `-s, --service <service>` - Custom app service
  - `build-tag` - Tag the uploaded app with a version
    - `-t, --tag <tag>` - Tag to apply to the uploaded app
    - `-v, --version <version>` - Version to attach to the tag
    - `-e, --env <ci | fqa | tr | fprd>` - Environment to tag the app in
    - `-s, --service <service>` - Custom app service
  - `build-publish` - Publish the app config to a build version
    - `-t, --tag <tag>` - Tag to apply to the uploaded app
    - `-e, --env <ci | fqa | tr | fprd>` - Environment to tag the app in
    - `-s, --service <service>` - Custom app service
  - `build-config` - Generate app config for an environment
    - `-o, --output <output>` - Output file for the app config
    - `-c, --config <config>` - Path to the app config file (for config generation)
    - `-p, --publish` - Flag for upload the generated config
    - `-v, --version<semver | current | latest | preview>` - Publish the app config to version
    - `-e, --env <ci | fqa | tr | fprd>` - Environment to publish the app config to
    - `-s, --service <service>` - Custom app service
  - `upload-config` - Upload the app config to a build version
    - `-c, --config <config>` - Path to the app config json file to upload
    - `-p, --publish<semver | current | latest | preview>` - Publish the app config to the build version
    - `-e, --env <ci | fqa | tr | fprd>` - Environment to publish the app config to
    - `-s, --service <service>` - Custom app service
  - `build-manifest` - Creates the build manifest to publish with app
    - `-o, --output <output>` - Output file for manifest
    - `-c, --config <config>` - Manifest config file

  simple usage:

  ```sh
  fusion-framework-cli app build-publish -e ci
  ```

  complex usage:

  ```sh
  fusion-framework-cli app build-pack -o ./dist -a my-app.zip
  fusion-framework-cli app build-upload -b ./dist/my-app.zip -e ci
  fusion-framework-cli app build-tag -t my-tag -v 1.0.0 -e ci
  ```

  After publishing a build of an app, the app config should be uploaded to the build version. This is done by running the `build-config` command.

  ```sh
  # Publish the app config to the build version
  fusion-framework-cli app build-config -p -e ci

  # Publish the app config to a specific build tag
  fusion-framework-cli app build-config -p preview -e ci

  # Publish the app config to a specific build version
  fusion-framework-cli app build-config -p 1.0.0 -e ci
  ```

  **breaking changes:**

  - renaming all commands accociated with build.
  - The app-config endpoints is now an object containing url and scopes, where name is the object key:

    ```ts
      environment: {
          myProp: 'foobar',
      },
      endpoints: {
          api: {
              url: 'https://foo.bars'
              scopes: ['foobar./default']
          },
      },
    ```

  - The `config` command has been removed, use `build-config` instead

### Minor Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Introduced `proxyRequestLogger` to log proxy requests in the CLI.

  - Show the request URL and method in the console when a proxy request is made.
  - Show proxy response status code

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Create a plugin `externalPublicPlugin` to fix the issue with serving the `index.html` file from the specified external public directory. Vite mode `spa` will not serve the `index.html` file from the specified external public directory.

  - Enhanced the middleware to intercept requests and serve the `index.html` file from the specified external public directory.
  - Transformed the HTML using Vite's `transformIndexHtml` method.
  - Applied appropriate content headers and additional configured headers before sending the response.

  ```typescript
  const viteConfig = defineConfig({
    // vite configuration
    root: "./src", // this where vite will look for the index.html file
    plugins: [
      // path which contains the index.html file
      externalPublicPlugin("./my-portal"),
    ],
  });
  ```

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Updated commands in CLI to reflect purpose of the command:

  - renamed `config` to `build-config` to generate build config of an application.
  - renamed `pack`to `build-pack` to bundle an application.
  - added `build-manifest` command to generate build manifest of an application.

  > [!WARNING]
  > Config callback for `manifest` and `config` now allows `void` return type.
  > Return value from callback is now merged with default config instead of replacing it, this might be a breaking change for some applications.

  > [!NOTE]
  > This mean that `mergeAppConfig` and `mergeManifestConfig` functions are no longer needed and can be removed from the application.

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - The `appProxyPlugin` is a Vite plugin designed to proxy requests to a Fusion app backend.
  It sets up proxy rules for API and bundle requests and serves the app configuration and manifest based on the app key and version.

  Key Features:

  1. Proxy Configuration:

     - Proxies API calls to the Fusion apps backend.
     - Proxies bundle requests to the Fusion apps backend.
     - Uses a base path `proxyPath` for proxying.
     - Captures and reuses authorization tokens for asset requests.

  2. **App Configuration and Manifest**:

     - Serves the app configuration if the request matches the current app and version.
     - Serves the app manifest if the request matches the current app.

  3. **Middleware Setup**:
     - Sets up middleware to handle requests for app configuration, manifest, and local bundles.

  This plugin is used by the CLI for local development, but design as exportable for custom CLI to consume applications from other API`s

  example configuration:

  ```typescript
  const viteConfig = defineConfig({
    // vite configuration
    plugins: [
      appProxyPlugin({
        proxy: {
          path: "/app-proxy",
          target: "https://fusion-s-apps-ci.azurewebsites.net/",
          // optional callback when matched request is proxied
          onProxyReq: (proxyReq, req, res) => {
            proxyReq.on("response", (res) => {
              console.log(res.statusCode);
            });
          },
        },
        // optional, but required for serving local app configuration, manifest and resources
        app: {
          key: "my-app",
          version: "1.0.0",
          generateConfig: async () => ({}),
          generateManifest: async () => ({}),
        },
      }),
    ],
  });
  ```

  example usage:

  ```typescript
  // Example API calls
  fetch("/app-proxy/apps/my-app/builds/1.0.0/config"); // local
  fetch("/app-proxy/apps/my-app/builds/0.0.9/config"); // proxy
  fetch("/app-proxy/apps/other-app/builds/1.0.0/config"); // proxy

  // Example asset calls
  fetch("/app-proxy/bundles/my-app/builds/1.0.0/index.js"); // local
  fetch("/app-proxy/bundles/my-app/builds/0.0.9/index.js"); // proxy
  ```

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - when building an application the `AppAssetExportPlugin` is now added to the `ViteConfig` and configure to include `manifest.build.allowedExtensions`

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - **App Assets Export Plugin**

  Create a plugin that exports assets from the app's source code.
  This plugin resolves the issue where assets are not extracted from the app's source code since the app is in `lib` mode.

  ```typescript
  export default {
    plugins: [
      AppAssetExportPlugin(
        include: createExtensionFilterPattern(
          manifest.build.allowedExtensions
          ),
      ),
    ]
  }
  ```

  see readme for more information.

### Patch Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Updating fusion-wc-person to fix issues when using selectedPerson = null in PersonSelect component.

  Updated the following dependencies

  - `@equinor/fusion-wc-person` from `^3.0.1` to `^3.0.3` in `packages/cli/package.json` and `packages/react/components/people-resolver/package.json`.

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Generated base manifest from package will now include `StandardIncludeAssetExtensions` as `allowedExtensions`

## 9.13.1

### Patch Changes

- [#2493](https://github.com/equinor/fusion-framework/pull/2493) [`4839295`](https://github.com/equinor/fusion-framework/commit/4839295263f07704bc43930351ce34dfb27a4c81) Thanks [@eikeland](https://github.com/eikeland)! - Updating fusion-wc-person to fix issues when using selectedPerson = null in PersonSelect component.

  Updated the following dependencies

  - `@equinor/fusion-wc-person` from `^3.0.1` to `^3.0.3` in `packages/cli/package.json` and `packages/react/components/people-resolver/package.json`.

- Updated dependencies [[`4839295`](https://github.com/equinor/fusion-framework/commit/4839295263f07704bc43930351ce34dfb27a4c81)]:
  - @equinor/fusion-framework-react-components-people-provider@1.4.8
  - @equinor/fusion-framework-app@9.1.9
  - @equinor/fusion-framework-module-feature-flag@1.1.9

## 9.13.0

### Minor Changes

- [#2465](https://github.com/equinor/fusion-framework/pull/2465) [`eb11a19`](https://github.com/equinor/fusion-framework/commit/eb11a1952cfa5a1ec8ca40d8f53303ff7c675cbe) Thanks [@dependabot](https://github.com/apps/dependabot)! - updated @equinor/eds-core-react to 0.42.0

- [#2459](https://github.com/equinor/fusion-framework/pull/2459) [`15152e4`](https://github.com/equinor/fusion-framework/commit/15152e413c054a5f57af93211a470c98c7696caa) Thanks [@odinr](https://github.com/odinr)! - **@equinor/fusion-framework-cli**

  Updated the CLI to use the new service discovery API.

  > [!NOTE]
  > This is a quick fix until the new major version of the CLI is released.

  - Updated the `baseUri` to use a more specific URL path for service discovery.
  - Changed from `new URL(import.meta.url).origin` to `String(new URL('/_discovery/environments/current', import.meta.url))`.
  - Changed parsing of service discovery response to match new API format.

### Patch Changes

- [#2458](https://github.com/equinor/fusion-framework/pull/2458) [`202cf10`](https://github.com/equinor/fusion-framework/commit/202cf10ae434d6432c8b57c2867b182223c19212) Thanks [@odinr](https://github.com/odinr)! - changed service discover url to match #c776845e753acf4a0bceda1c59d31e5939c44c31

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.8
  - @equinor/fusion-framework-module-feature-flag@1.1.9
  - @equinor/fusion-framework-react-components-people-provider@1.4.7

## 9.12.14

### Patch Changes

- [#2431](https://github.com/equinor/fusion-framework/pull/2431) [`53ff9cc`](https://github.com/equinor/fusion-framework/commit/53ff9ccdbac95ae8d279aed49f173708bbe9adbe) Thanks [@dependabot](https://github.com/apps/dependabot)! - Upgrade vite from 5.3.5 to [5.4.3](<(https://github.com/vitejs/vite/blob/create-vite@5.4.0/packages/create-vite/CHANGELOG.md)>)

- Updated dependencies [[`f7c143d`](https://github.com/equinor/fusion-framework/commit/f7c143d44a88cc25c377d3ce8c3d1744114b891d)]:
  - @equinor/fusion-observable@8.4.1
  - @equinor/fusion-framework-module-feature-flag@1.1.8
  - @equinor/fusion-framework-app@9.1.7
  - @equinor/fusion-framework-react-components-people-provider@1.4.6

## 9.12.13

### Patch Changes

- [#2403](https://github.com/equinor/fusion-framework/pull/2403) [`67ea61d`](https://github.com/equinor/fusion-framework/commit/67ea61dad8f50e8b8b977008b26374c2f982eb4d) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump @equinor/eds-core-react from 0.40.1 to 0.41.2

  [see EDS changelog](https://github.com/equinor/design-system/blob/develop/packages/eds-core-react/CHANGELOG.md)

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.6
  - @equinor/fusion-framework-module-feature-flag@1.1.7
  - @equinor/fusion-framework-react-components-people-provider@1.4.5

## 9.12.12

### Patch Changes

- [#2349](https://github.com/equinor/fusion-framework/pull/2349) [`0dd8160`](https://github.com/equinor/fusion-framework/commit/0dd8160b7b840e04ec6a92ed2bf8d00494752a00) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @vitejs/plugin-react from 4.2.1 to 4.3.1

- [#2389](https://github.com/equinor/fusion-framework/pull/2389) [`a3543e3`](https://github.com/equinor/fusion-framework/commit/a3543e31353c9eac25140842643cb8e27e9b187e) Thanks [@eikeland](https://github.com/eikeland)! - Updating fusion(react|wc)-person to fix issues with clearing component

- [#2337](https://github.com/equinor/fusion-framework/pull/2337) [`79fa856`](https://github.com/equinor/fusion-framework/commit/79fa8566d27dcc4d38da3a6b3fef1b78223f7458) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump rollup from 4.12.0 to 4.18.1

- [#2358](https://github.com/equinor/fusion-framework/pull/2358) [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb) Thanks [@eikeland](https://github.com/eikeland)! - Updating vitest to 2.0.4. Setting vitest as devDependency in fusion-query. Updating vite to 5.3.4

- [#2352](https://github.com/equinor/fusion-framework/pull/2352) [`2025368`](https://github.com/equinor/fusion-framework/commit/202536855f736fb58f09442da5ca473325c1141c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump vite from 5.2.10 to 5.3.3

- [#2256](https://github.com/equinor/fusion-framework/pull/2256) [`db92a9d`](https://github.com/equinor/fusion-framework/commit/db92a9d2132f74e2a72287640e6fdfbe3afa2824) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump commander from 12.0.0 to 12.1.0

- [#2253](https://github.com/equinor/fusion-framework/pull/2253) [`6f93346`](https://github.com/equinor/fusion-framework/commit/6f9334672c6dd77237d52508bef8893303f33ca7) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-context-selector from 0.6.3 to 0.6.5

- [#2264](https://github.com/equinor/fusion-framework/pull/2264) [`797095a`](https://github.com/equinor/fusion-framework/commit/797095ab3b51a675159be5541381ca06637a1b71) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump express-rate-limit from 7.2.0 to 7.3.1

- [#2350](https://github.com/equinor/fusion-framework/pull/2350) [`960ca34`](https://github.com/equinor/fusion-framework/commit/960ca34cae26f386e28c16bac00e7932f4f9199a) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/eds-core-react from 0.38.0 to 0.40.1

- [#2360](https://github.com/equinor/fusion-framework/pull/2360) [`1c7ac1b`](https://github.com/equinor/fusion-framework/commit/1c7ac1b42213f33a668e79d750e0b12b227a7052) Thanks [@eikeland](https://github.com/eikeland)! - Enhanced ContextSelector component in the CLI package:

  - Implemented responsive context clearing mechanism
  - Improved handling of context selection and clearing events
  - Optimized component rendering with useMemo and useCallback hooks

- [#2261](https://github.com/equinor/fusion-framework/pull/2261) [`aae93b9`](https://github.com/equinor/fusion-framework/commit/aae93b95120f1285545ea1b8344817c31e134ff5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump adm-zip from 0.5.10 to 0.5.14

- Updated dependencies [[`bbde502`](https://github.com/equinor/fusion-framework/commit/bbde502e638f459379f63968febbc97ebe282b76), [`a3543e3`](https://github.com/equinor/fusion-framework/commit/a3543e31353c9eac25140842643cb8e27e9b187e), [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`e092f75`](https://github.com/equinor/fusion-framework/commit/e092f7599f1f2e0e0676a9f10565299272813594)]:
  - @equinor/fusion-observable@8.4.0
  - @equinor/fusion-framework-react-components-people-provider@1.4.4
  - @equinor/fusion-framework-module-feature-flag@1.1.6
  - @equinor/fusion-framework-app@9.1.5

## 9.12.11

### Patch Changes

- [#2251](https://github.com/equinor/fusion-framework/pull/2251) [`60afeaa`](https://github.com/equinor/fusion-framework/commit/60afeaab11ad2a76469807142098464bd5442e68) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @vitejs/plugin-react from 4.2.1 to 4.3.1

- [#2340](https://github.com/equinor/fusion-framework/pull/2340) [`9435ee4`](https://github.com/equinor/fusion-framework/commit/9435ee4ddebade18436c5c6bd57ee86b6baf0b24) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump vite from 5.2.10 to 5.3.3

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.4
  - @equinor/fusion-framework-module-feature-flag@1.1.5
  - @equinor/fusion-framework-react-components-people-provider@1.4.3

## 9.12.10

### Patch Changes

- [#2328](https://github.com/equinor/fusion-framework/pull/2328) [`33d394f`](https://github.com/equinor/fusion-framework/commit/33d394f9718340f579e3f427bc68b59df5030d15) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump vite from 5.2.10 to 5.3.3

- [#2322](https://github.com/equinor/fusion-framework/pull/2322) [`b4dd215`](https://github.com/equinor/fusion-framework/commit/b4dd2150b5f3202e4bae9773afd55993043b4a5e) Thanks [@dependabot](https://github.com/apps/dependabot)! - The Vite changelog highlights several fixes, features, and refactors in versions 5.3.3, 5.3.2, and 5.3.0.
  Key updates include lazy evaluation of `__vite__mapDeps` files, removal of pure CSS dynamic import, and improvements to build and asset handling.
  Additionally, Vite now supports the `system` library format and adds options for not starting a WebSocket server and ignoring certain code sections.
  The changelog also notes performance enhancements, dependency updates, and bug fixes, including resolving circular dependencies, improving error recovery, and updating non-major dependencies.

  build(deps): bump vite from 5.2.10 to 5.3.3

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

- [#2320](https://github.com/equinor/fusion-framework/pull/2320) [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee) Thanks [@odinr](https://github.com/odinr)! - Removed the `removeComments` option from the `tsconfig.base.json` file.

  Removing the `removeComments` option allows TypeScript to preserve comments in the compiled JavaScript output. This can be beneficial for several reasons:

  1. Improved debugging: Preserved comments can help developers understand the code better during debugging sessions.
  2. Documentation: JSDoc comments and other important code documentation will be retained in the compiled output.
  3. Source map accuracy: Keeping comments can lead to more accurate source maps, which is crucial for debugging and error tracking.

  No action is required from consumers of the library. This change affects the build process and doesn't introduce any breaking changes or new features.

  Before:

  ```json
  {
    "compilerOptions": {
      "module": "ES2022",
      "target": "ES6",
      "incremental": true,
      "removeComments": true,
      "preserveConstEnums": true,
      "sourceMap": true,
      "moduleResolution": "node"
    }
  }
  ```

  After:

  ```json
  {
    "compilerOptions": {
      "module": "ES2022",
      "target": "ES6",
      "incremental": true,
      "preserveConstEnums": true,
      "sourceMap": true,
      "moduleResolution": "node"
    }
  }
  ```

  This change ensures that comments are preserved in the compiled output, potentially improving the development and debugging experience for users of the Fusion Framework.

- [#2330](https://github.com/equinor/fusion-framework/pull/2330) [`4c4471a`](https://github.com/equinor/fusion-framework/commit/4c4471a61d083c6b00d25ebf82952632ff50e200) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump rollup from 4.12.0 to 4.18.1

- Updated dependencies [[`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`a723e86`](https://github.com/equinor/fusion-framework/commit/a723e8605059ad126602d053c65114c3ce908964), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
  - @equinor/fusion-framework-react-components-people-provider@1.4.2
  - @equinor/fusion-framework-module-feature-flag@1.1.5
  - @equinor/fusion-observable@8.3.3
  - @equinor/fusion-framework-app@9.1.3

## 9.12.9

### Patch Changes

- [#2270](https://github.com/equinor/fusion-framework/pull/2270) [`b739416`](https://github.com/equinor/fusion-framework/commit/b7394165a573e545152cfcedc2ddae186ec94112) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - - Update fusion-wc-person to resolve issue with positioning

- Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb), [`b739416`](https://github.com/equinor/fusion-framework/commit/b7394165a573e545152cfcedc2ddae186ec94112)]:
  - @equinor/fusion-observable@8.3.2
  - @equinor/fusion-framework-react-components-people-provider@1.4.1
  - @equinor/fusion-framework-module-feature-flag@1.1.4
  - @equinor/fusion-framework-app@9.1.2

## 9.12.8

### Patch Changes

- Updated dependencies [[`b8d52ad`](https://github.com/equinor/fusion-framework/commit/b8d52adb2ca1f9857c672a3deb774409ff2bdb37)]:
  - @equinor/fusion-framework-app@9.1.1

## 9.12.7

### Patch Changes

- [#2205](https://github.com/equinor/fusion-framework/pull/2205) [`4e64552`](https://github.com/equinor/fusion-framework/commit/4e64552a3c1b0324e1deda93779eab16dbebbed3) Thanks [@odinr](https://github.com/odinr)! - Updated `@equinor/eds-core-react` dependency to version `^0.38.0`
  Updated `@equinor/eds-utils` dependency to version `^0.8.5`
- Updated dependencies [[`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8), [`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab)]:
  - @equinor/fusion-framework-react-components-people-provider@1.4.0
  - @equinor/fusion-framework-app@9.1.0
  - @equinor/fusion-observable@8.3.1
  - @equinor/fusion-framework-module-feature-flag@1.1.3

## 9.12.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.0.9
  - @equinor/fusion-framework-module-feature-flag@1.1.2
  - @equinor/fusion-framework-react-components-people-provider@1.3.8

## 9.12.5

### Patch Changes

- [#2135](https://github.com/equinor/fusion-framework/pull/2135) [`3cd63d5`](https://github.com/equinor/fusion-framework/commit/3cd63d58e4e3ffd15bccdebaa94b391e3e3d12f0) Thanks [@odinr](https://github.com/odinr)! - Fixed styling of the render root element for the application

  fixes: https://github.com/equinor/fusion/issues/301

  ## @equinor/fusion-framework-cli

  ### What the change is

  This change fixes an issue where the root element rendered by the CLI was not being styled correctly, causing layout issues in some applications.

  ### Why the change was made

  Previously, the root element was not receiving the correct styles due to an issue with the way styles were being applied. This led to visual inconsistencies and layout problems in applications rendered by the CLI.

  ### How a consumer should update their code

  No code changes are required for consumers. This fix will be automatically applied when using the updated version of the `@equinor/fusion-framework-cli` package.

- Updated dependencies []:
  - @equinor/fusion-framework-react-components-people-provider@1.3.7
  - @equinor/fusion-framework-app@9.0.8

## 9.12.4

### Patch Changes

- [#2107](https://github.com/equinor/fusion-framework/pull/2107) [`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197) Thanks [@odinr](https://github.com/odinr)! - Fixed issue with missing process env `FUSION_LOG_LEVEL`

  - added default resolve value when generating base vite configuration
  - moved default query log level resolve outside class

  fixes: https://github.com/equinor/fusion/issues/343

- Updated dependencies []:
  - @equinor/fusion-framework-react-components-people-provider@1.3.6
  - @equinor/fusion-framework-app@9.0.7

## 9.12.3

### Patch Changes

- [#2098](https://github.com/equinor/fusion-framework/pull/2098) [`5093391`](https://github.com/equinor/fusion-framework/commit/5093391eabda84873041ee89632f26770734b03c) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump @equinor/eds-core-react from 0.36.1 to 0.37.0

- [#2103](https://github.com/equinor/fusion-framework/pull/2103) [`975f65c`](https://github.com/equinor/fusion-framework/commit/975f65cdae9882279f18e1f9f8d243df03218650) Thanks [@odinr](https://github.com/odinr)! - bumped vite to 5.2.10

- [`cf4a17a`](https://github.com/equinor/fusion-framework/commit/cf4a17a07540b05b0d44de7e188aaaa8f9fef8f8) Thanks [@odinr](https://github.com/odinr)! - updated Query, ref #2095

- Updated dependencies []:
  - @equinor/fusion-framework-react-components-people-provider@1.3.5
  - @equinor/fusion-framework-module-feature-flag@1.1.1
  - @equinor/fusion-framework-app@9.0.6

## 9.12.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.0.5
  - @equinor/fusion-framework-module-feature-flag@1.1.1
  - @equinor/fusion-framework-react-components-people-provider@1.3.4

## 9.12.1

### Patch Changes

- [#2059](https://github.com/equinor/fusion-framework/pull/2059) [`303c962`](https://github.com/equinor/fusion-framework/commit/303c96234e381ddc3ad86daeff9baaec5ade6bbe) Thanks [@eikeland](https://github.com/eikeland)! - Removes z-index from apploader section to make ContextSelector dropdown usable again

- Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a)]:
  - @equinor/fusion-observable@8.3.0
  - @equinor/fusion-framework-module-feature-flag@1.1.1
  - @equinor/fusion-framework-react-components-people-provider@1.3.3
  - @equinor/fusion-framework-app@9.0.4

## 9.12.0

### Minor Changes

- [#2051](https://github.com/equinor/fusion-framework/pull/2051) [`3eba53a`](https://github.com/equinor/fusion-framework/commit/3eba53a7eb113a9985092a3c6166ab6bdd44c02f) Thanks [@odinr](https://github.com/odinr)! - Aligned CLI dev-portal more to fusion classic portal layout

  > the dev-portal is a generic portal for developing application, not a 100% replica of the environment _(this will be a feature in future, which the developer kan test the application in different simulated portals)_

  **No functionality changed, only the markup of dev-portal**

### Patch Changes

- [#2050](https://github.com/equinor/fusion-framework/pull/2050) [`1cf4003`](https://github.com/equinor/fusion-framework/commit/1cf400389d8d15afbacdc33789130e268c492a0c) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Person component update

- [#2052](https://github.com/equinor/fusion-framework/pull/2052) [`545a090`](https://github.com/equinor/fusion-framework/commit/545a0902bc670724498add3f4fd82f251e9156e6) Thanks [@odinr](https://github.com/odinr)! - fix for #2051

- Updated dependencies [[`1cf4003`](https://github.com/equinor/fusion-framework/commit/1cf400389d8d15afbacdc33789130e268c492a0c)]:
  - @equinor/fusion-framework-react-components-people-provider@1.3.2
  - @equinor/fusion-framework-app@9.0.3
  - @equinor/fusion-framework-module-feature-flag@1.1.0

## 9.11.1

### Patch Changes

- Updated dependencies [[`036ec15`](https://github.com/equinor/fusion-framework/commit/036ec151ace9c051ded41798ab94b8ee5e3d4461)]:
  - @equinor/fusion-framework-app@9.0.2

## 9.11.0

### Minor Changes

- [#1998](https://github.com/equinor/fusion-framework/pull/1998) [`14530fa`](https://github.com/equinor/fusion-framework/commit/14530fa2d8d7afd45b6849cec2665f2f396bb27f) Thanks [@eikeland](https://github.com/eikeland)! - Updates cli contextselector and resolver

## 9.10.1

### Patch Changes

- [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework-react-components-people-provider@1.3.1
  - @equinor/fusion-framework-app@9.0.1
  - @equinor/fusion-framework-module-feature-flag@1.1.0

## 9.10.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- [#1945](https://github.com/equinor/fusion-framework/pull/1945) [`b59d314`](https://github.com/equinor/fusion-framework/commit/b59d3142a551574117d3cdeb274cceb996459000) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - bump @equinor/fusion-wc-person from 2.6.4 to 2.6.5

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`b59d314`](https://github.com/equinor/fusion-framework/commit/b59d3142a551574117d3cdeb274cceb996459000), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-react-components-people-provider@1.3.0
  - @equinor/fusion-framework-module-feature-flag@1.1.0
  - @equinor/fusion-observable@8.2.0
  - @equinor/fusion-framework-app@9.0.0

## 9.9.0

### Minor Changes

- [#1933](https://github.com/equinor/fusion-framework/pull/1933) [`701c297`](https://github.com/equinor/fusion-framework/commit/701c29709351ff80864d26311efc72a439cd4098) Thanks [@odinr](https://github.com/odinr)! - CLI will now update pathname when current context changes

  CLI will now resolve initial context _(if context module enabled)_

  Fixes: https://github.com/equinor/fusion/issues/307

  Will work even if not application has not enabled navigation

### Patch Changes

- [#1929](https://github.com/equinor/fusion-framework/pull/1929) [`86e7556`](https://github.com/equinor/fusion-framework/commit/86e7556b212f42501ef5e885fea36d20002e43ac) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update to latest fusion-react-context-selector

- Updated dependencies []:
  - @equinor/fusion-framework-app@8.1.4
  - @equinor/fusion-framework-react-components-people-provider@1.2.6

## 9.8.7

### Patch Changes

- [#1930](https://github.com/equinor/fusion-framework/pull/1930) [`057f204`](https://github.com/equinor/fusion-framework/commit/057f204fc01ee6579280b621bc83ca74589acd6b) Thanks [@eikeland](https://github.com/eikeland)! - update fusion-react-context-selector

## 9.8.6

### Patch Changes

- [#1926](https://github.com/equinor/fusion-framework/pull/1926) [`6f3315a`](https://github.com/equinor/fusion-framework/commit/6f3315a83ea43d5355a5d95c1e9e4caf6f6b7c72) Thanks [@eikeland](https://github.com/eikeland)! - Updating fusion-wc-person to fix issues with multiple tasks

- [#1919](https://github.com/equinor/fusion-framework/pull/1919) [`666780c`](https://github.com/equinor/fusion-framework/commit/666780cb2f6e5b3d5b861a179220362c1bf4b0ad) Thanks [@odinr](https://github.com/odinr)! - removed unused packages

- Updated dependencies [[`6f3315a`](https://github.com/equinor/fusion-framework/commit/6f3315a83ea43d5355a5d95c1e9e4caf6f6b7c72)]:
  - @equinor/fusion-framework-react-components-people-provider@1.2.5

## 9.8.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@8.1.3
  - @equinor/fusion-framework-react-components-people-provider@1.2.4

## 9.8.4

### Patch Changes

- [#1890](https://github.com/equinor/fusion-framework/pull/1890) [`722f43f`](https://github.com/equinor/fusion-framework/commit/722f43f01c7a46175ad72e84c22fb3562d21bc26) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Fix typo

- [#1902](https://github.com/equinor/fusion-framework/pull/1902) [`06d3739`](https://github.com/equinor/fusion-framework/commit/06d373990b481bcae361cfa4fa8a905b4256c7d8) Thanks [@eikeland](https://github.com/eikeland)! - Updates cli dep fwc-person and improve people cookbook

- Updated dependencies [[`06d3739`](https://github.com/equinor/fusion-framework/commit/06d373990b481bcae361cfa4fa8a905b4256c7d8)]:
  - @equinor/fusion-framework-react-components-people-provider@1.2.3

## 9.8.3

### Patch Changes

- [#1878](https://github.com/equinor/fusion-framework/pull/1878) [`fe1a239`](https://github.com/equinor/fusion-framework/commit/fe1a239e9ce9fc0e39b4faf67ffda40d287d5bd2) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - - Add error icon for errors

  - Add info icon for no result

- [#1875](https://github.com/equinor/fusion-framework/pull/1875) [`e018c6e`](https://github.com/equinor/fusion-framework/commit/e018c6e5b5f8676b642ded1bb8b5b41bc65f674f) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Show message when unhandled error occurs in context selector

- [#1867](https://github.com/equinor/fusion-framework/pull/1867) [`b7504d1`](https://github.com/equinor/fusion-framework/commit/b7504d1352a0107383f8f76f9ed7f77744d1f99b) Thanks [@eikeland](https://github.com/eikeland)! - Removes person react components from cli

## 9.8.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@8.1.2
  - @equinor/fusion-framework-react-components-people-provider@1.2.2

## 9.8.1

### Patch Changes

- [#1839](https://github.com/equinor/fusion-framework/pull/1839) [`f2e5d9f`](https://github.com/equinor/fusion-framework/commit/f2e5d9f78546b4e933f012d58081439a1c2f5554) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bumps @equinor/fusion-wc-person to 2.5.1

- Updated dependencies [[`f2e5d9f`](https://github.com/equinor/fusion-framework/commit/f2e5d9f78546b4e933f012d58081439a1c2f5554)]:
  - @equinor/fusion-framework-react-components-people-provider@1.2.1

## 9.8.0

### Minor Changes

- [#1827](https://github.com/equinor/fusion-framework/pull/1827) [`91a5782`](https://github.com/equinor/fusion-framework/commit/91a5782d22b25c562a1c65cc702bee1c96b97737) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update @equinor/fusion-react-person to 0.7.0 and @equinor/fusion-wc-person to 2.4.0

### Patch Changes

- [#1823](https://github.com/equinor/fusion-framework/pull/1823) [`9733563`](https://github.com/equinor/fusion-framework/commit/9733563ad072a6c21d61952d6d71978b88612ac5) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump @equinor/eds-core-react from 0.35.1 to 0.36.0

- Updated dependencies [[`91a5782`](https://github.com/equinor/fusion-framework/commit/91a5782d22b25c562a1c65cc702bee1c96b97737)]:
  - @equinor/fusion-framework-react-components-people-provider@1.2.0

## 9.7.0

### Minor Changes

- [#1801](https://github.com/equinor/fusion-framework/pull/1801) [`6e8fb78`](https://github.com/equinor/fusion-framework/commit/6e8fb78698fe11402ceef8d8ab48530bb8866699) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump commander from 11.1.0 to 12.0.0

  see [changelog](https://github.com/tj/commander.js/releases/tag/v12.0.0)

### Patch Changes

- [#1719](https://github.com/equinor/fusion-framework/pull/1719) [`5658d04`](https://github.com/equinor/fusion-framework/commit/5658d04bac8957fd3741083385bc2d7871da7df9) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-context-selector from 0.5.0 to 0.6.0

## 9.6.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react-components-people-provider@1.1.15
  - @equinor/fusion-framework-app@8.1.1
  - @equinor/fusion-framework-module-feature-flag@1.0.2

## 9.6.3

### Patch Changes

- [#1786](https://github.com/equinor/fusion-framework/pull/1786) [`a5f74f2`](https://github.com/equinor/fusion-framework/commit/a5f74f2096a55c4dab4b1d263bd39cd0dc39ac7a) Thanks [@odinr](https://github.com/odinr)! - support resources in `defineAppManifest`

  ref [issue 286](https://github.com/equinor/fusion/issues/286#issuecomment-1923401234)

## 9.6.2

### Patch Changes

- Updated dependencies [[`09f8dd2`](https://github.com/equinor/fusion-framework/commit/09f8dd2dad31e8de47409e6bd751f74e3dd02607), [`0f3affa`](https://github.com/equinor/fusion-framework/commit/0f3affa45b7b7dc0a0f01682682293e4b899a5d9)]:
  - @equinor/fusion-framework-react-components-people-provider@1.1.14
  - @equinor/fusion-framework-app@8.1.0

## 9.6.1

### Patch Changes

- Updated dependencies [[`036546f`](https://github.com/equinor/fusion-framework/commit/036546f2e3d9c0d289c7145da84e940673027b5e), [`d0c0c6a`](https://github.com/equinor/fusion-framework/commit/d0c0c6a971a478e3f447663bf50b4e3a7cb1517e)]:
  - @equinor/fusion-observable@8.1.5
  - @equinor/fusion-framework-module-feature-flag@1.0.1
  - @equinor/fusion-framework-app@8.0.1
  - @equinor/fusion-framework-react-components-people-provider@1.1.13

## 9.6.0

### Minor Changes

- [#1747](https://github.com/equinor/fusion-framework/pull/1747) [`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e) Thanks [@odinr](https://github.com/odinr)! - refactor side-sheet for displaying framework and application feature flags

### Patch Changes

- [#1754](https://github.com/equinor/fusion-framework/pull/1754) [`81e7db7`](https://github.com/equinor/fusion-framework/commit/81e7db74690aa7284584d3820494cb71e6ad6c91) Thanks [@eikeland](https://github.com/eikeland)! - Updating eds packages to mitigate type errors after latest version, @equinor/ids-icons >= 0.20.0.

- [`cb20fc1`](https://github.com/equinor/fusion-framework/commit/cb20fc1a0259a8e0f91d43e44a035b2ad26951f3) Thanks [@odinr](https://github.com/odinr)! - [security update](https://github.com/equinor/fusion-framework/security/dependabot/90)

- Updated dependencies [[`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e), [`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e)]:
  - @equinor/fusion-framework-app@8.0.0
  - @equinor/fusion-framework-module-feature-flag@1.0.0
  - @equinor/fusion-framework-react-components-people-provider@1.1.12

## 9.5.10

### Patch Changes

- [#1738](https://github.com/equinor/fusion-framework/pull/1738) [`1241772`](https://github.com/equinor/fusion-framework/commit/124177256696f2d83f739a1bbc9022c9840db106) Thanks [@eikeland](https://github.com/eikeland)! - Updating fwc-person

## 9.5.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react-components-people-provider@1.1.11

## 9.5.8

### Patch Changes

- [#1215](https://github.com/equinor/fusion-framework/pull/1215) [`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d) Thanks [@odinr](https://github.com/odinr)! - Adding PersonSidesheet to cli with featuretoggler

- Updated dependencies [[`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d), [`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d)]:
  - @equinor/fusion-framework-module-feature-flag@0.0.1
  - @equinor/fusion-framework-react-components-people-provider@1.1.10

## 9.5.7

### Patch Changes

- [`cb39579`](https://github.com/equinor/fusion-framework/commit/cb39579d8845df2f8b2a8e0b1afc04e1cc8dd8a6) Thanks [@odinr](https://github.com/odinr)! - prevent code splitting in the CLI

## 9.5.6

### Patch Changes

- [#1556](https://github.com/equinor/fusion-framework/pull/1556) [`1e0eda4`](https://github.com/equinor/fusion-framework/commit/1e0eda439f9096d91506b4bfae17ad4d03efab73) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/fusion-react-person from 0.6.0 to 0.6.1

- [#1614](https://github.com/equinor/fusion-framework/pull/1614) [`a3235ee`](https://github.com/equinor/fusion-framework/commit/a3235ee05a4fb237ad36fc641119195207687a4a) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-context-selector from 0.5.0 to 0.5.3

- [#1642](https://github.com/equinor/fusion-framework/pull/1642) [`a67d77b`](https://github.com/equinor/fusion-framework/commit/a67d77b5fa1fbff626c08e85ad00fe9bb63da80d) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump ora from 7.0.1 to 8.0.1

- [#1662](https://github.com/equinor/fusion-framework/pull/1662) [`e7dbce5`](https://github.com/equinor/fusion-framework/commit/e7dbce5413dff7186b1004e11b6051d1fb4373d1) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/fusion-wc-person from 2.1.8 to 2.3.0

- [#1565](https://github.com/equinor/fusion-framework/pull/1565) [`4e7dbce`](https://github.com/equinor/fusion-framework/commit/4e7dbce1a92b093bec91d48d38afd7b70fe03296) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/fusion-wc-person from 2.1.8 to 2.3.0

- Updated dependencies [[`4e7dbce`](https://github.com/equinor/fusion-framework/commit/4e7dbce1a92b093bec91d48d38afd7b70fe03296)]:
  - @equinor/fusion-framework-react-components-people-provider@1.1.9
  - @equinor/fusion-framework-app@7.1.15

## 9.5.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@7.1.14
  - @equinor/fusion-framework-react-components-people-provider@1.1.8

## 9.5.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@7.1.13
  - @equinor/fusion-framework-react-components-people-provider@1.1.7

## 9.5.3

### Patch Changes

- Updated dependencies [[`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a)]:
  - @equinor/fusion-observable@8.1.4
  - @equinor/fusion-framework-app@7.1.12
  - @equinor/fusion-framework-react-components-people-provider@1.1.6

## 9.5.2

### Patch Changes

- [#1579](https://github.com/equinor/fusion-framework/pull/1579) [`8aecfdd`](https://github.com/equinor/fusion-framework/commit/8aecfdd892c5e4cc6afbf6c736d7d46d0199611b) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-side-sheet from 1.2.2 to 1.2.3

- [#1578](https://github.com/equinor/fusion-framework/pull/1578) [`e6859bf`](https://github.com/equinor/fusion-framework/commit/e6859bf9604b1ac388c077db97cb7bd7127f59db) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-menu from 0.2.0 to 0.3.0

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-observable@8.1.3
  - @equinor/fusion-framework-react-components-people-provider@1.1.5
  - @equinor/fusion-framework-app@7.1.11

## 9.5.1

### Patch Changes

- [#1553](https://github.com/equinor/fusion-framework/pull/1553) [`f4e02e9`](https://github.com/equinor/fusion-framework/commit/f4e02e93960ca3d1e8c1ee422c6fd8c6742bf755) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-side-sheet from 1.2.1 to 1.2.2

- [`72e12c8`](https://github.com/equinor/fusion-framework/commit/72e12c84efb6ac7f131a8d0f217076cbb9d5ab52) Thanks [@odinr](https://github.com/odinr)! - support for module resolution EsNext

## 9.5.0

### Minor Changes

- [#1532](https://github.com/equinor/fusion-framework/pull/1532) [`f77c1169`](https://github.com/equinor/fusion-framework/commit/f77c11694adf3c96e86732818cbf05aaae06a695) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump vite from 4.4.9 to 5.0.0

### Patch Changes

- Updated dependencies [[`22909e77`](https://github.com/equinor/fusion-framework/commit/22909e77488b099697dccec93e7ac8416dc4a5bd)]:
  - @equinor/fusion-framework-react-components-people-provider@1.1.4

## 9.4.3

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@7.1.10
  - @equinor/fusion-framework-react-components-people-provider@1.1.3

## 9.4.2

### Patch Changes

- [#1533](https://github.com/equinor/fusion-framework/pull/1533) [`a571b640`](https://github.com/equinor/fusion-framework/commit/a571b640c9fe94519ce2ede22f1eb1c336ecdac9) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump find-up from 6.3.0 to 7.0.0

- [#1534](https://github.com/equinor/fusion-framework/pull/1534) [`8c77de20`](https://github.com/equinor/fusion-framework/commit/8c77de209df2f41a78636f1f6f85a81d653484d2) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump vite-plugin-restart from 0.3.1 to 0.4.0

- Updated dependencies []:
  - @equinor/fusion-framework-app@7.1.9
  - @equinor/fusion-framework-react-components-people-provider@1.1.3

## 9.4.1

### Patch Changes

- [#1498](https://github.com/equinor/fusion-framework/pull/1498) [`7287fa3d`](https://github.com/equinor/fusion-framework/commit/7287fa3dca655c84b3a4f5f904e3f423ec341e7a) Thanks [@odinr](https://github.com/odinr)! - bump @equinor/fusion-wc-person from 2.1.0 to 2.1.8

- Updated dependencies [[`7287fa3d`](https://github.com/equinor/fusion-framework/commit/7287fa3dca655c84b3a4f5f904e3f423ec341e7a)]:
  - @equinor/fusion-framework-react-components-people-provider@1.1.3

## 9.4.0

### Minor Changes

- [#1491](https://github.com/equinor/fusion-framework/pull/1491) [`0f2b4e3a`](https://github.com/equinor/fusion-framework/commit/0f2b4e3a97aa08cac2644642b612cd3432d07be4) Thanks [@odinr](https://github.com/odinr)! - Allow setting archive name when packing bundle

### Patch Changes

- [#1487](https://github.com/equinor/fusion-framework/pull/1487) [`0dfe5a94`](https://github.com/equinor/fusion-framework/commit/0dfe5a94c89b05da3ea94d5ec0180448ba0df392) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump [rollup](https://github.com/rollup/rollup/blob/master/CHANGELOG.md) from 3.29.2 to 4.3.0

- [#1478](https://github.com/equinor/fusion-framework/pull/1478) [`28bd0b8c`](https://github.com/equinor/fusion-framework/commit/28bd0b8c17fd6e7c5f5146ff490441d5b3caf602) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump [@equinor/fusion-react-side-sheet](https://github.com/equinor/fusion-react-components/releases/tag/%40equinor%2Ffusion-react-side-sheet%401.2.1) from 1.2.0 to 1.2.1

- [#1485](https://github.com/equinor/fusion-framework/pull/1485) [`24d02ddd`](https://github.com/equinor/fusion-framework/commit/24d02ddd532424462059a7465ac82df688e1bc6e) Thanks [@dependabot](https://github.com/apps/dependabot)! - [bump read-pkg-up from 10.1.0 to 11.0.0](https://github.com/sindresorhus/read-package-up/compare/v10.1.0...v11.0.0)

## 9.3.5

### Patch Changes

- [#1475](https://github.com/equinor/fusion-framework/pull/1475) [`9b22a14d`](https://github.com/equinor/fusion-framework/commit/9b22a14d791878a83b6df84190922d3143fdc0df) Thanks [@odinr](https://github.com/odinr)! - fix log loop

  ```bash
  if (msg.match(/^Failed to load url \/assets/)) {
  RangeError: Maximum call stack size exceeded
      at String.match (<anonymous>)
  ```

## 9.3.4

### Patch Changes

- [#1465](https://github.com/equinor/fusion-framework/pull/1465) [`1cdc52ab`](https://github.com/equinor/fusion-framework/commit/1cdc52abbdf8aa714d4b4035a01e474fbe56d8f6) Thanks [@odinr](https://github.com/odinr)! - cli should no use provided config when developing an application which exists in Fusion App Service.

  > when dev proxy server did not get 404 when requesting application config, it provided the manifest instead of config file path

## 9.3.3

### Patch Changes

- [`a56172c9`](https://github.com/equinor/fusion-framework/commit/a56172c9ec241550ce57b1ea1e6ffcc8848618d5) Thanks [@odinr](https://github.com/odinr)! - rebuild cli (navigation module)

## 9.3.2

### Patch Changes

- [#1462](https://github.com/equinor/fusion-framework/pull/1462) [`e35d8e2b`](https://github.com/equinor/fusion-framework/commit/e35d8e2b69148a497c7acaa8e1e0bf86987f475e) Thanks [@odinr](https://github.com/odinr)! - silent error when failing to optimize pre-built assets

  Vite tries to import optimize pre-built assets for the dev portal (which it should not).

  see [fix: exclude external dependencies from html rewriting](https://github.com/vitejs/vite/pull/11854#issuecomment-1500453147)

- [#1442](https://github.com/equinor/fusion-framework/pull/1442) [`1173f715`](https://github.com/equinor/fusion-framework/commit/1173f71597b7b90c17d314188d83f46e1d81a2f3) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-side-sheet from 1.1.0 to 1.2.0

## 9.3.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react-components-people-provider@1.1.2
  - @equinor/fusion-framework-app@7.1.8

## 9.3.0

### Minor Changes

- [#1374](https://github.com/equinor/fusion-framework/pull/1374) [`a1eacf9f`](https://github.com/equinor/fusion-framework/commit/a1eacf9f30728bf96a17e60a5b7d7d08e85798f3) Thanks [@odinr](https://github.com/odinr)! - update `@equinor/fusion-wc-person` to ^2.1.0

### Patch Changes

- [#1399](https://github.com/equinor/fusion-framework/pull/1399) [`52910a53`](https://github.com/equinor/fusion-framework/commit/52910a5322109ab729508432d9fab695e8dc7697) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-styles from 0.5.11 to 0.6.0

- [#1395](https://github.com/equinor/fusion-framework/pull/1395) [`dcd09dea`](https://github.com/equinor/fusion-framework/commit/dcd09dea7160cf85ababf827bc6ee32d9f9a0aca) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-icon from 0.2.16 to 0.3.0

- [#1409](https://github.com/equinor/fusion-framework/pull/1409) [`8b8ce0df`](https://github.com/equinor/fusion-framework/commit/8b8ce0dfc77bc592d3f525a2b09782fc2f570011) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-context-selector from 0.4.9 to 0.5.0

- [#1397](https://github.com/equinor/fusion-framework/pull/1397) [`15cb5a59`](https://github.com/equinor/fusion-framework/commit/15cb5a597fa0856bf56b7e618d3e974f3974a968) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-progress-indicator from 0.1.7 to 0.2.0

- [#1394](https://github.com/equinor/fusion-framework/pull/1394) [`710ea8a9`](https://github.com/equinor/fusion-framework/commit/710ea8a9574acfa55e8affb33a52594d6136d460) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-button from 0.8.3 to 0.9.0

- [#1393](https://github.com/equinor/fusion-framework/pull/1393) [`f049479b`](https://github.com/equinor/fusion-framework/commit/f049479bfb51369a227eb432089d0da20be86529) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/fusion-react-person from 0.5.1 to 0.6.0

- [#1392](https://github.com/equinor/fusion-framework/pull/1392) [`99f70720`](https://github.com/equinor/fusion-framework/commit/99f707205ad9f773f0672fabccfe52dec0c9b10f) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-react-side-sheet from 1.0.2 to 1.1.0

## 9.2.1

### Patch Changes

- [#1375](https://github.com/equinor/fusion-framework/pull/1375) [`f50ea5da`](https://github.com/equinor/fusion-framework/commit/f50ea5dab449ce7a5e3071f65fac4e800a619eec) Thanks [@odinr](https://github.com/odinr)! - update people deps

- Updated dependencies [[`f50ea5da`](https://github.com/equinor/fusion-framework/commit/f50ea5dab449ce7a5e3071f65fac4e800a619eec)]:
  - @equinor/fusion-framework-react-components-people-provider@1.1.1

## 9.2.0

### Minor Changes

- [#1323](https://github.com/equinor/fusion-framework/pull/1323) [`6a4c697f`](https://github.com/equinor/fusion-framework/commit/6a4c697fc255bd189a6e45e48f76c1c4e4e59c24) Thanks [@yusijs](https://github.com/yusijs)! - Allow using a custom dev-portal

## 9.1.4

### Patch Changes

- [#1348](https://github.com/equinor/fusion-framework/pull/1348) [`0acc8827`](https://github.com/equinor/fusion-framework/commit/0acc8827e5e2df8b5b2aeac5e1a2cd29c4384e78) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/eds-core-react from 0.32.4 to 0.33.0

  - support for [styled-components@6](https://styled-components.com/releases#v6.0.0)

## 9.1.3

### Patch Changes

- [`c4e38415`](https://github.com/equinor/fusion-framework/commit/c4e384152765d86df5093b35355d0c4b0bcfee43) Thanks [@odinr](https://github.com/odinr)! - [remove console](https://github.com/equinor/fusion-framework/commit/cb2f694697e7a130ff82bbb5fc570892211bbb70)

## 9.1.2

### Patch Changes

- [#1306](https://github.com/equinor/fusion-framework/pull/1306) [`f65c4531`](https://github.com/equinor/fusion-framework/commit/f65c453178e2c581acb154d5839971c75f60fa86) Thanks [@odinr](https://github.com/odinr)! - add fallback image to person provider

- [#1335](https://github.com/equinor/fusion-framework/pull/1335) [`5bad9c87`](https://github.com/equinor/fusion-framework/commit/5bad9c87d6ab6d0a9a518ba7525f3eb5b659a9c0) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - add cookbooks and documentation for people react components

- [`cc7bcfb5`](https://github.com/equinor/fusion-framework/commit/cc7bcfb51187fb757b95793356da4a11b233d930) Thanks [@odinr](https://github.com/odinr)! - update @equinor/fusion-wc-person to 1.1.1

- [`6ec59f64`](https://github.com/equinor/fusion-framework/commit/6ec59f64f35e553cd68d6d6e03c1e5867aba87ce) Thanks [@odinr](https://github.com/odinr)! - fixed loading of config files for Windows

  found internal [issues](https://github.com/radarsu/ts-import/issues/39) with `ts-import` where file url path crashed native `fs` command, but failed on imports since windows can`t handle absolute paths.

  quick and dirty transpile code and eject of `ts-import`

- [#1264](https://github.com/equinor/fusion-framework/pull/1264) [`ace9fa37`](https://github.com/equinor/fusion-framework/commit/ace9fa379215fd75e37b140db5c8ea2d3680b0c0) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump express-rate-limit from 6.9.0 to [7.0.0](https://github.com/express-rate-limit/express-rate-limit/releases/tag/v7.0.0)

- [#1345](https://github.com/equinor/fusion-framework/pull/1345) [`9d9f629e`](https://github.com/equinor/fusion-framework/commit/9d9f629e007df38db75067781b251b7e5e9673da) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - update @equinor/fusion-wc-person to 2.0.1

- [`5b8c4ebc`](https://github.com/equinor/fusion-framework/commit/5b8c4ebc85f636e18e7666fd5dbbaf9ee10d8608) Thanks [@odinr](https://github.com/odinr)! - fixed packing of application

- Updated dependencies [[`cc7bcfb5`](https://github.com/equinor/fusion-framework/commit/cc7bcfb51187fb757b95793356da4a11b233d930), [`f65c4531`](https://github.com/equinor/fusion-framework/commit/f65c453178e2c581acb154d5839971c75f60fa86), [`9f121865`](https://github.com/equinor/fusion-framework/commit/9f121865254a0c76c4a812e6e42bfe3c7086c714), [`518b8476`](https://github.com/equinor/fusion-framework/commit/518b8476bb40255d05e937663d3a513de479a1f8), [`9d9f629e`](https://github.com/equinor/fusion-framework/commit/9d9f629e007df38db75067781b251b7e5e9673da), [`3e38c9cc`](https://github.com/equinor/fusion-framework/commit/3e38c9cc925fc0456837e42e7ee3ac55e9553bad), [`63592229`](https://github.com/equinor/fusion-framework/commit/63592229cea4d3606289738fe14b432e9978623f)]:
  - @equinor/fusion-framework-react-components-people-provider@1.1.0
  - @equinor/fusion-framework-app@7.1.7

## 9.1.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-app@7.1.6
  - @equinor/fusion-framework-react-components-people-provider@1.0.1
  - @equinor/fusion-observable@8.1.2

## 9.1.0

### Minor Changes

- [#1257](https://github.com/equinor/fusion-framework/pull/1257) [`780b229a`](https://github.com/equinor/fusion-framework/commit/780b229a709d83b275e88473df0236b3f218c037) Thanks [@odinr](https://github.com/odinr)! - person resolving

  the CLI now resolves persons from `azureId` or `upn`

  ```tsx
  const MyPage = () => {
    return (
      <fwc-person-avatar azureId='cbc6480d-12c1-467e-b0b8-cfbb22612daa'></fwc-person-avatar>
      <fwc-person-card azureId='cbc6480d-12c1-467e-b0b8-cfbb22612daa'></fwc-person-card>
      <fwc-person-list-item azureId='cbc6480d-12c1-467e-b0b8-cfbb22612daa'></fwc-person-list-item>
    )
  }
  ```

### Patch Changes

- [#1273](https://github.com/equinor/fusion-framework/pull/1273) [`9f570356`](https://github.com/equinor/fusion-framework/commit/9f570356939f077e0a6ca101fa0b7e51d369f7b4) Thanks [@Noggling](https://github.com/Noggling)! - Added display content to the div element that is provided to applications

- [`0d84d39e`](https://github.com/equinor/fusion-framework/commit/0d84d39ed9d452aa7bb8bc4dfc6ff2e46d3af82b) Thanks [@odinr](https://github.com/odinr)! - enable services for CLI portal

- Updated dependencies [[`de46f0a2`](https://github.com/equinor/fusion-framework/commit/de46f0a2ce93134fc32bf587d29dd32d7ab9a8d9)]:
  - @equinor/fusion-framework-react-components-people-provider@1.0.0
  - @equinor/fusion-framework-app@7.1.5

## 9.0.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@7.1.4

## 9.0.1

### Patch Changes

- [`5d2df189`](https://github.com/equinor/fusion-framework/commit/5d2df189e022941f91ce7048f99f42f59d17c456) Thanks [@odinr](https://github.com/odinr)! - fixed naming convention of CLI config files

## 9.0.0

### Major Changes

- [#1194](https://github.com/equinor/fusion-framework/pull/1194) [`a424aef5`](https://github.com/equinor/fusion-framework/commit/a424aef5dc6575204a9448b74e0170192147b1b3) Thanks [@odinr](https://github.com/odinr)! - Rewrite fusion framework CLI

  Rework of the Fusion Framework CLI to support future features

  > the CLI was thrown together as a proof of concept, but grown un-manageable, because of lack of structure

  **Main Features**

  - Separate logic and utilities from program (app/cli commands)
  - allow user to provide config files `app.{config,manifest,vite}.{ts,js,json}`
    - the cli will try to resolve from `.ts` then `.js` then `.json`
    - `app.config` is used to configure application environment configs (app-service config)
    - `app.manifest` application manifest, information about the application
    - `app.vite` override the CLI vite configuration
  - provide interface for `app.TYPE.ts` config
    - `define` and `merge` functionality
    - note that `app.config` and `app.manifest` needs to return full object _(will not be merged by CLI)_
  - allow providing config file in command
  - using config when resolving proxy request
  - improved CLI logging

  **examples**

  app.config.ts

  ```ts
  import {
    mergeAppConfigs,
    defineAppConfig,
  } from "@equinor/fusion-framework-cli";
  export default defineAppConfig((_nev, { base }) =>
    mergeAppConfigs(base, {
      environment: {
        api: {
          foo: {
            baseUri: "https://foo.bars",
            scopes: ["foobar"],
          },
        },
      },
    })
  );
  ```

  app.manifest

  ```ts
  import {
    defineAppManifest,
    mergeManifests,
  } from "@equinor/fusion-framework-cli";

  export default defineAppManifest((env, { base }) => {
    if (env.command === "serve") {
      return mergeManifests(base, {
        key: "simple",
      });
    }
    return base;
  });
  ```

  fusion-framework-cli app

  ```sh
  fusion-framework-cli app dev --manifest app.manifest.local.ts
  ```

### Minor Changes

- [#1194](https://github.com/equinor/fusion-framework/pull/1194) [`a424aef5`](https://github.com/equinor/fusion-framework/commit/a424aef5dc6575204a9448b74e0170192147b1b3) Thanks [@odinr](https://github.com/odinr)! - add command for generating manifest

  generate manifest for application

  ```sh
  fusion-framework-cli app manifest
  #output to file
  fusion-framework-cli app manifest -o manifest.json
  #specify custom config
  fusion-framework-cli app manifest -c app.manifest.custom.ts
  ```

- [#1194](https://github.com/equinor/fusion-framework/pull/1194) [`a424aef5`](https://github.com/equinor/fusion-framework/commit/a424aef5dc6575204a9448b74e0170192147b1b3) Thanks [@odinr](https://github.com/odinr)! - add pack command to cli

  add method which will build, generate manifest and pack assets into a zip file (**just like the legacy @equinor/fusion-cli**)

  ```sh
  fusion-framework-cli app pack
  ```

### Patch Changes

- [#1194](https://github.com/equinor/fusion-framework/pull/1194) [`a424aef5`](https://github.com/equinor/fusion-framework/commit/a424aef5dc6575204a9448b74e0170192147b1b3) Thanks [@odinr](https://github.com/odinr)! - Add command for outputting application configuration

  **example**

  ```sh
  fusion-framework-cli app config -o my-app.config.json
  fdev portal config -e ci -k my-app --config-file my-app.config.json set
  ```

## 8.1.1

### Patch Changes

- Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4)]:
  - @equinor/fusion-observable@8.1.1
  - @equinor/fusion-framework-app@7.1.3

## 8.1.0

### Minor Changes

- [`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594) Thanks [@odinr](https://github.com/odinr)! - Remove emotion decencies from CLI

  align CLI with EDS and use style components instead of emotion 🥲
  prevent conflict of react types dependent on both emotion and eds

  - remove @emotion/\*
  - convert emotion to styled-components
  - fix styling of cli
    - convert main placeholder to grid
    - remove unnecessary styling from header
    - set dynamic width of context selector (min 25rem)

### Patch Changes

- [`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594) Thanks [@odinr](https://github.com/odinr)! - fixed bin resolve for pnpm

- Updated dependencies []:
  - @equinor/fusion-framework-app@7.1.2

## 8.0.1

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1130](https://github.com/equinor/fusion-framework/pull/1130) [`542356ee`](https://github.com/equinor/fusion-framework/commit/542356eecfcc1bc8b896e71377308a1de29f4ab9) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @emotion/styled from 11.10.6 to 11.11.0

- [#1129](https://github.com/equinor/fusion-framework/pull/1129) [`f672d0bb`](https://github.com/equinor/fusion-framework/commit/f672d0bba71a7ea6cd08135778fda67ff38f3ac3) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/eds-core-react from 0.30.0 to 0.32.4

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

- [#1122](https://github.com/equinor/fusion-framework/pull/1122) [`1a055b21`](https://github.com/equinor/fusion-framework/commit/1a055b21e07f84bc5d35cc891586aa9aa0bdf661) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update styled-components to [^6.0.7](https://github.com/styled-components/styled-components/releases/tag/v6.0.7)

  - upgraded dev deps of `@equinor/fusion-framework-react-components-bookmark` to react 18, see style-components [changelog](https://github.com/styled-components/styled-components/releases/tag/v6.0.0)
  - removed `@types/style-components` from `@equinor/fusion-framework-react-components-bookmark`

  see style-components [migration guide](https://styled-components.com/docs/faqs#what-do-i-need-to-do-to-migrate-to-v6)

- [#1148](https://github.com/equinor/fusion-framework/pull/1148) [`46201069`](https://github.com/equinor/fusion-framework/commit/46201069505f2526d1bdec05c134da17012b6d31) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump vite from 4.2.3 to 4.4.9

  see [changelog](https://github.com/vitejs/vite/blob/create-vite@4.4.0/packages/create-vite/CHANGELOG.md)

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- [#1156](https://github.com/equinor/fusion-framework/pull/1156) [`dfee1f79`](https://github.com/equinor/fusion-framework/commit/dfee1f79c9b70c2c2f27c12096000e6fc1e8ff7a) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump vite-tsconfig-paths from [4.0.7](https://github.com/aleclarson/vite-tsconfig-paths/releases/tag/v4.0.7) to [4.2.0](https://github.com/aleclarson/vite-tsconfig-paths/releases/tag/v4.2.0)

- [#1087](https://github.com/equinor/fusion-framework/pull/1087) [`6887c016`](https://github.com/equinor/fusion-framework/commit/6887c0164102e17b4a6d6f16193d9e34a0f41149) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @vitejs/plugin-react from 3.1.0 to 4.0.4

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-observable@8.1.0
  - @equinor/fusion-framework-app@7.1.1

## 8.0.0

### Major Changes

- [#973](https://github.com/equinor/fusion-framework/pull/973) [`713c94d9`](https://github.com/equinor/fusion-framework/commit/713c94d9a493f5aecb9fefa44942f83bd30ae29c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump commander from [10.0.1](https://github.com/tj/commander.js/releases/tag/v10.0.1) to [11.0.0](https://github.com/tj/commander.js/releases/tag/v11.0.0)

  **Breaking**

  @equinor/fusion-framework-cli now requires Node.js v16 or higher

### Patch Changes

- [#1047](https://github.com/equinor/fusion-framework/pull/1047) [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @typescript-eslint/eslint-plugin from 5.59.11 to 6.1.0

  only style semantics updated

- Updated dependencies [[`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`0a785d5c`](https://github.com/equinor/fusion-framework/commit/0a785d5c339ceec7cbbe2a6ff9e16053c86ce511), [`38869a87`](https://github.com/equinor/fusion-framework/commit/38869a87788c340d363e9be1e7fc6ce0e29efa63)]:
  - @equinor/fusion-observable@8.0.3
  - @equinor/fusion-framework-app@7.1.0

## 7.1.0

### Minor Changes

- [#1055](https://github.com/equinor/fusion-framework/pull/1055) [`6c2fd59e`](https://github.com/equinor/fusion-framework/commit/6c2fd59e66ff77629ce1b7ecd5fd47e799719b91) Thanks [@odinr](https://github.com/odinr)! - **Allow loading of custom vite config**

  When running the CLI, allow the user to provide custom [Vite config](https://vitejs.dev/config/).
  The provided config is merged with the built-in config (default generated by the CLI).

  updated [documentation](https://equinor.github.io/fusion-framework/guide/app/cli.html#config)

## 7.0.13

### Patch Changes

- [#1002](https://github.com/equinor/fusion-framework/pull/1002) [`7f506120`](https://github.com/equinor/fusion-framework/commit/7f506120c702f157f95f477ddfc514a906176870) Thanks [@eikeland](https://github.com/eikeland)! - # Updating @equinor/fusion-react-styles

  Updating dependency @equinor/fusion-react-styles to version 0.5.6.

  This ads the correct equinor-font cdn link to the themeprovider.

## 7.0.12

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

- Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
  - @equinor/fusion-framework-app@7.0.16

## 7.0.11

### Patch Changes

- [#910](https://github.com/equinor/fusion-framework/pull/910) [`d40951a3`](https://github.com/equinor/fusion-framework/commit/d40951a3f5044083e7aec416c065342d0207e5d5) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Removes requirement of leading slash in `main` attr in `package.json`, meaning
  both `"main": "src/index.ts"` and `"main": "/src/index.ts"` will resolve.

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
  - @equinor/fusion-framework-app@7.0.15

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [7.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@7.0.9...@equinor/fusion-framework-cli@7.0.10) (2023-05-24)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [7.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@7.0.8...@equinor/fusion-framework-cli@7.0.9) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [7.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@7.0.7...@equinor/fusion-framework-cli@7.0.8) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [7.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@7.0.6...@equinor/fusion-framework-cli@7.0.7) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## 7.0.6 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [7.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@7.0.4...@equinor/fusion-framework-cli@7.0.5) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [7.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@7.0.3...@equinor/fusion-framework-cli@7.0.4) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [7.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@7.0.2...@equinor/fusion-framework-cli@7.0.3) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## 7.0.2 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [7.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@7.0.0...@equinor/fusion-framework-cli@7.0.1) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [7.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@6.1.0...@equinor/fusion-framework-cli@7.0.0) (2023-05-05)

### ⚠ BREAKING CHANGES

- **module-context:** `ContextProvider.setCurrentContext` now returns an `Observable`

### Features

- **module-context:** make setting context as an observable ([21e1c6b](https://github.com/equinor/fusion-framework/commit/21e1c6b64f541ec63dd6ea830410c7bb5cbdd84a))

## 6.1.0 (2023-04-24)

### Features

- **cli:** added bookmark side sheet to cli and updated header ([d5da5eb](https://github.com/equinor/fusion-framework/commit/d5da5eb2c61983c8f038956a18e7a8c16a987450))

### Bug Fixes

- **bookmark:** fix linting ([17b179f](https://github.com/equinor/fusion-framework/commit/17b179fbb25243730dd65cc116c86471074faabc))
- cli package json ([966695a](https://github.com/equinor/fusion-framework/commit/966695a7701cbea9115053226f48d378a77d6af3))

## 6.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [6.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@6.0.2...@equinor/fusion-framework-cli@6.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [6.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@6.0.1...@equinor/fusion-framework-cli@6.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [6.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@6.0.0...@equinor/fusion-framework-cli@6.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [6.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.20...@equinor/fusion-framework-cli@6.0.0) (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.19...@equinor/fusion-framework-cli@5.1.20) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.16...@equinor/fusion-framework-cli@5.1.19) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.16...@equinor/fusion-framework-cli@5.1.18) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.16...@equinor/fusion-framework-cli@5.1.17) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.15...@equinor/fusion-framework-cli@5.1.16) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.14...@equinor/fusion-framework-cli@5.1.15) (2023-04-14)

### Bug Fixes

- :bug: fix incorrect height cli portal ([38aee24](https://github.com/equinor/fusion-framework/commit/38aee24011fe1d3c049d7667d777c91b19a02d2c))

## [5.1.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.13...@equinor/fusion-framework-cli@5.1.14) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.12...@equinor/fusion-framework-cli@5.1.13) (2023-04-11)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.11...@equinor/fusion-framework-cli@5.1.12) (2023-03-31)

### Bug Fixes

- force build of cli ([3fdff80](https://github.com/equinor/fusion-framework/commit/3fdff80c69c769d789d00f7cec5895a080be3ccf))

## [5.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.9...@equinor/fusion-framework-cli@5.1.11) (2023-03-31)

### Bug Fixes

- **cli:** contextSearch shows current context in selector ([52b4cc4](https://github.com/equinor/fusion-framework/commit/52b4cc4f2ade64e4f2722e16a2d27358d0121c05))
- **cli:** moved vite-plugin-enviornment from dev-dependencie to dependecies ([1c42889](https://github.com/equinor/fusion-framework/commit/1c428894503cdd95c5bfc2b60c0148860491f305))
- **cli:** update deps ([86cc317](https://github.com/equinor/fusion-framework/commit/86cc31728ce6d78ebd198eadc0ccddcaf16df55e))

## [5.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.9...@equinor/fusion-framework-cli@5.1.10) (2023-03-31)

### Bug Fixes

- **cli:** contextSearch shows current context in selector ([52b4cc4](https://github.com/equinor/fusion-framework/commit/52b4cc4f2ade64e4f2722e16a2d27358d0121c05))
- **cli:** moved vite-plugin-enviornment from dev-dependencie to dependecies ([1c42889](https://github.com/equinor/fusion-framework/commit/1c428894503cdd95c5bfc2b60c0148860491f305))
- **cli:** update deps ([86cc317](https://github.com/equinor/fusion-framework/commit/86cc31728ce6d78ebd198eadc0ccddcaf16df55e))

## [5.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.8...@equinor/fusion-framework-cli@5.1.9) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.7...@equinor/fusion-framework-cli@5.1.8) (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.6...@equinor/fusion-framework-cli@5.1.7) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.5...@equinor/fusion-framework-cli@5.1.6) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.4...@equinor/fusion-framework-cli@5.1.5) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## 5.1.4 (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## 5.1.3 (2023-03-22)

### Bug Fixes

- **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [5.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.1...@equinor/fusion-framework-cli@5.1.2) (2023-03-21)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.0...@equinor/fusion-framework-cli@5.1.1) (2023-03-20)

### Bug Fixes

- **cli:** add missing proxy target ([1f14f99](https://github.com/equinor/fusion-framework/commit/1f14f99290d6ee3c112115f29b9f28d1a6959b62))

## [5.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.8...@equinor/fusion-framework-cli@5.1.0) (2023-03-20)

### Features

- **cli:** allow configuring portal host in cli ([9641b21](https://github.com/equinor/fusion-framework/commit/9641b215a1bff957687e9eda661679f000588a47))

## [5.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.7...@equinor/fusion-framework-cli@5.0.8) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.7...@equinor/fusion-framework-cli@5.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.6...@equinor/fusion-framework-cli@5.0.7) (2023-03-17)

### Bug Fixes

- **cli:** use referer as proxy uri ([35edbdc](https://github.com/equinor/fusion-framework/commit/35edbdcae83d51595e013550303b8ea8b7e1c675))

## [5.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.5...@equinor/fusion-framework-cli@5.0.6) (2023-03-10)

### Bug Fixes

- **cli:** fix mounting element in app loader ([0410c7f](https://github.com/equinor/fusion-framework/commit/0410c7f0ce7a1b9f25c7716e0206534a1d047529))

## 5.0.5 (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.3...@equinor/fusion-framework-cli@5.0.4) (2023-03-09)

### Bug Fixes

- **cli:** include `NODE_ENV` environment in build ([28faf2a](https://github.com/equinor/fusion-framework/commit/28faf2abc1adb09cc52242e26abb61e2ddfeb6c1))

## [5.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.2...@equinor/fusion-framework-cli@5.0.3) (2023-03-06)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.1...@equinor/fusion-framework-cli@5.0.2) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.0...@equinor/fusion-framework-cli@5.0.1) (2023-02-20)

### Bug Fixes

- **cli:** allow cli to read paths from tsconfig ([c78673f](https://github.com/equinor/fusion-framework/commit/c78673f7d85a2c3697798aa6a59ef1792ca53af6))

## [5.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@4.1.0...@equinor/fusion-framework-cli@5.0.0) (2023-02-13)

### ⚠ BREAKING CHANGES

- **utils/observable:** `useObservableInputState` and `useObservableSelectorState` now return full state, not only value

### Bug Fixes

- **utils/observable:** rename `next` to `value`from `useObservableState` ([4a08445](https://github.com/equinor/fusion-framework/commit/4a08445645af2488666564c2da716d32aa5e88c0))
- **utils/observable:** when subject in useObservableState reset state ([9c5c041](https://github.com/equinor/fusion-framework/commit/9c5c041d3d8c0b01bd507ea7f672711d9f5cb653))

## [4.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@4.0.4...@equinor/fusion-framework-cli@4.1.0) (2023-02-09)

### Features

- (framework): person provider ([d4a3936](https://github.com/equinor/fusion-framework/commit/d4a3936d6a60f093f71eac1dacc05cd60c7bf554))
- **cli:** add react es lint for cli ([55137d7](https://github.com/equinor/fusion-framework/commit/55137d7baee9611fcb3e4bde4a4c0a954a8a68c6))

### Bug Fixes

- **cli:** add custom element register ([3f30c34](https://github.com/equinor/fusion-framework/commit/3f30c34324ca43fcc947f9163919a31611471afd))
- **cli:** update person resolver ([4ef99ae](https://github.com/equinor/fusion-framework/commit/4ef99ae5da870ec5d076041996ee98548fc18e5a))

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@4.0.4...@equinor/fusion-framework-cli@4.0.5) (2023-02-02)

### Bug Fixes

- **cli:** add custom element register ([3f30c34](https://github.com/equinor/fusion-framework/commit/3f30c34324ca43fcc947f9163919a31611471afd))

## 4.0.4 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@4.0.2...@equinor/fusion-framework-cli@4.0.3) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@4.0.0...@equinor/fusion-framework-cli@4.0.2) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@4.0.0...@equinor/fusion-framework-cli@4.0.1) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.1.0...@equinor/fusion-framework-cli@4.0.0) (2023-02-01)

### ⚠ BREAKING CHANGES

- hook has new return type

### Bug Fixes

- references to useObservableState ([614a569](https://github.com/equinor/fusion-framework/commit/614a5691f856765f07f5d71e39708f80dea49a6e))

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.5...@equinor/fusion-framework-cli@3.1.0) (2023-02-01)

### Features

- **equinorloader:** centered starprogress loader ([081226d](https://github.com/equinor/fusion-framework/commit/081226d4afa1bdbb9daca0304ce34bc13471e8d7))

### Bug Fixes

- **cli:** fixing contextresolver ([41edf18](https://github.com/equinor/fusion-framework/commit/41edf18223aed93b393c0fab1e1f41797b7f06da)), closes [#591](https://github.com/equinor/fusion-framework/issues/591)

## [3.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.4...@equinor/fusion-framework-cli@3.0.5) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [3.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.3...@equinor/fusion-framework-cli@3.0.4) (2023-01-30)

### Bug Fixes

- **cli:** disable 'x-powered-by' ([29cc4a8](https://github.com/equinor/fusion-framework/commit/29cc4a866f3f38a17a2df23eac047e7b82129696))

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.2...@equinor/fusion-framework-cli@3.0.3) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.1...@equinor/fusion-framework-cli@3.0.2) (2023-01-27)

### Bug Fixes

- **cli:** named exports ([b03381b](https://github.com/equinor/fusion-framework/commit/b03381bde924db1979e9e5e870b356dc5db4b81d))

## 3.0.1 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.11...@equinor/fusion-framework-cli@3.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.11...@equinor/fusion-framework-cli@3.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [2.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.10...@equinor/fusion-framework-cli@2.0.11) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## 2.0.10 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.8...@equinor/fusion-framework-cli@2.0.9) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.7...@equinor/fusion-framework-cli@2.0.8) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## 2.0.7 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.5...@equinor/fusion-framework-cli@2.0.6) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.4...@equinor/fusion-framework-cli@2.0.5) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## 2.0.4 (2023-01-10)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.2...@equinor/fusion-framework-cli@2.0.3) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.1...@equinor/fusion-framework-cli@2.0.2) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@2.0.0...@equinor/fusion-framework-cli@2.0.1) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.14...@equinor/fusion-framework-cli@2.0.0) (2023-01-04)

### ⚠ BREAKING CHANGES

- **module-app:** manifest prop rename

### Bug Fixes

- **module-app:** rename `appKey` to `key` ([9ee97b1](https://github.com/equinor/fusion-framework/commit/9ee97b149b9167a3747da371de76490e287d9514))

## [1.2.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.13...@equinor/fusion-framework-cli@1.2.14) (2022-12-22)

### Bug Fixes

- **utils/cli:** typo in import ([e4c3d0a](https://github.com/equinor/fusion-framework/commit/e4c3d0ac13f8a47ec4447cc07f7b9dc4210ba0c1))

## [1.2.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.12...@equinor/fusion-framework-cli@1.2.13) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.11...@equinor/fusion-framework-cli@1.2.12) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.10...@equinor/fusion-framework-cli@1.2.11) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.9...@equinor/fusion-framework-cli@1.2.10) (2022-12-19)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.8...@equinor/fusion-framework-cli@1.2.9) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.7...@equinor/fusion-framework-cli@1.2.8) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.6...@equinor/fusion-framework-cli@1.2.7) (2022-12-16)

### Bug Fixes

- **utils/cli:** update app-loader ([4b1d5e7](https://github.com/equinor/fusion-framework/commit/4b1d5e7a5ca1e7b9d7a34556799a7c9aa77b9440))

## [1.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.5...@equinor/fusion-framework-cli@1.2.6) (2022-12-14)

### Bug Fixes

- **module-app:** make app module optional ([fa5c0ed](https://github.com/equinor/fusion-framework/commit/fa5c0ed0a9afc1f9ade3adb6e52e4425a59a7aa6))

## [1.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.4...@equinor/fusion-framework-cli@1.2.5) (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.3...@equinor/fusion-framework-cli@1.2.4) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.2...@equinor/fusion-framework-cli@1.2.3) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.1...@equinor/fusion-framework-cli@1.2.2) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.0...@equinor/fusion-framework-cli@1.2.1) (2022-12-12)

### Bug Fixes

- **context:** method for contextParameterFn on enableContext ([398658d](https://github.com/equinor/fusion-framework/commit/398658de26355a8ca99aea291963b8c302df3ddc))

## [1.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.9...@equinor/fusion-framework-cli@1.2.0) (2022-12-12)

### Features

- **utils/cli:** update context selector ([c091107](https://github.com/equinor/fusion-framework/commit/c09110735e019b47f16300332fedb360d3396cfc))

### Bug Fixes

- **utils/cli:** fix layout of router outlet ([ac99033](https://github.com/equinor/fusion-framework/commit/ac99033061ae9867adf6c47f1293266fd20ab8ef))
- **utils/cli:** update header of error view ([971b5e5](https://github.com/equinor/fusion-framework/commit/971b5e5ee8f3ec98e2ec41eb485bf01b35ee501e))
- **utils/cli:** update loading of application ([4de3289](https://github.com/equinor/fusion-framework/commit/4de3289942f8e3d81f4ee5749311479f4f49b680))

## [1.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.8...@equinor/fusion-framework-cli@1.1.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.7...@equinor/fusion-framework-cli@1.1.8) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.6...@equinor/fusion-framework-cli@1.1.7) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.5...@equinor/fusion-framework-cli@1.1.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.4...@equinor/fusion-framework-cli@1.1.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.3...@equinor/fusion-framework-cli@1.1.4) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.2...@equinor/fusion-framework-cli@1.1.3) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.1...@equinor/fusion-framework-cli@1.1.2) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.0...@equinor/fusion-framework-cli@1.1.1) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.0.1...@equinor/fusion-framework-cli@1.1.0) (2022-12-05)

### Features

- **context-selector:** adds icon to orgchart result items ([90343d9](https://github.com/equinor/fusion-framework/commit/90343d9915cb85eaa9945012c8709a2d40f6f023))
- **context-selector:** header type contextselector and appcheck ([8ab0a50](https://github.com/equinor/fusion-framework/commit/8ab0a50e3f7ea3487796735c868f2e65d84fecd2))
- **contextselector:** cli context selector ([f414466](https://github.com/equinor/fusion-framework/commit/f4144668e4deee32ed229807d81a0ea08ba5a476))
- fusionlogo component ([b02fe16](https://github.com/equinor/fusion-framework/commit/b02fe16d3bb723b13413115826df0bbbc2b46815))
- header with contextselector and logo ([174ed3d](https://github.com/equinor/fusion-framework/commit/174ed3d14383b6a813d2264ad5dfd9397fe17185))

### Bug Fixes

- **app:** adding type contextModule in event details for app package ([abea386](https://github.com/equinor/fusion-framework/commit/abea386c76c6297934a236d1bba9c71a12425065))
- **cli:** contextselector improvements and comments ([bf8363e](https://github.com/equinor/fusion-framework/commit/bf8363e86909407632caa5ec46182643cbdd2205))
- **cli:** updated dependencie versions ([12cb3c8](https://github.com/equinor/fusion-framework/commit/12cb3c8d56cad82986d910f45ec1933fe43bfd67))

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.0.1...@equinor/fusion-framework-cli@1.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.0.0...@equinor/fusion-framework-cli@1.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.20...@equinor/fusion-framework-cli@1.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.20...@equinor/fusion-framework-cli@1.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.19...@equinor/fusion-framework-cli@0.3.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.18...@equinor/fusion-framework-cli@0.3.19) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.17...@equinor/fusion-framework-cli@0.3.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.16...@equinor/fusion-framework-cli@0.3.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.15...@equinor/fusion-framework-cli@0.3.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.14...@equinor/fusion-framework-cli@0.3.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.13...@equinor/fusion-framework-cli@0.3.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.12...@equinor/fusion-framework-cli@0.3.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.11...@equinor/fusion-framework-cli@0.3.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.10...@equinor/fusion-framework-cli@0.3.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.9...@equinor/fusion-framework-cli@0.3.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.8...@equinor/fusion-framework-cli@0.3.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.7...@equinor/fusion-framework-cli@0.3.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.6...@equinor/fusion-framework-cli@0.3.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.5...@equinor/fusion-framework-cli@0.3.6) (2022-11-23)

### Bug Fixes

- **cli:** windows url path ([0176fa8](https://github.com/equinor/fusion-framework/commit/0176fa8ac1337025c584101ec2ceac8092eb0c13))

## 0.3.5 (2022-11-23)

### Bug Fixes

- **cli:** relative path resolve windows ([0316c30](https://github.com/equinor/fusion-framework/commit/0316c30fd0e75d230893015c40c96dd369e8e472))

## [0.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.3...@equinor/fusion-framework-cli@0.3.4) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.2...@equinor/fusion-framework-cli@0.3.3) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.1...@equinor/fusion-framework-cli@0.3.2) (2022-11-18)

### Bug Fixes

- basename in app render ([ae75815](https://github.com/equinor/fusion-framework/commit/ae75815877701c364f853413b29ad4f053d9c2c2))

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.0...@equinor/fusion-framework-cli@0.3.1) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.2.3...@equinor/fusion-framework-cli@0.3.0) (2022-11-17)

### Features

- **module-navigation:** initial ([891e69d](https://github.com/equinor/fusion-framework/commit/891e69d9a98ba02ee1f9dd1c5b0cb31ff1b5fd0f))

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.2.2...@equinor/fusion-framework-cli@0.2.3) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.2.1...@equinor/fusion-framework-cli@0.2.2) (2022-11-17)

### Bug Fixes

- **cli:** update dev scope for service discovery ([af1ff9c](https://github.com/equinor/fusion-framework/commit/af1ff9cb2eebb2a19b658549feef3b5822d8f8a3))

## [0.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.2.0...@equinor/fusion-framework-cli@0.2.1) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.15...@equinor/fusion-framework-cli@0.2.0) (2022-11-14)

### Features

- add router and app loader ([f21661d](https://github.com/equinor/fusion-framework/commit/f21661d1255633848d1662dabb74e8e33ab629d5))
- **cli:** add proxy routing for app and config ([b923830](https://github.com/equinor/fusion-framework/commit/b9238309a2f15a470d63411d2da0b58a1eb63e90))

## 0.1.15 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.13...@equinor/fusion-framework-cli@0.1.14) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.12...@equinor/fusion-framework-cli@0.1.13) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.11...@equinor/fusion-framework-cli@0.1.12) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.10...@equinor/fusion-framework-cli@0.1.11) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.9...@equinor/fusion-framework-cli@0.1.10) (2022-11-07)

### Bug Fixes

- **cli:** add dep @vitejs/plugin-react ([415dd9f](https://github.com/equinor/fusion-framework/commit/415dd9f466076f232e751bbbffa54a8b10c0bea4))

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.8...@equinor/fusion-framework-cli@0.1.9) (2022-11-07)

### Bug Fixes

- **cli:** requires vite ([c512d9e](https://github.com/equinor/fusion-framework/commit/c512d9e0e413e515fe0dcb412af49996b04d2484))

## [0.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.7...@equinor/fusion-framework-cli@0.1.8) (2022-11-07)

### Bug Fixes

- **cli:** allow overwrite on build ([8e648d7](https://github.com/equinor/fusion-framework/commit/8e648d7ea17518a3ec74f3bb366c4247b8f4fce9))
- **cli:** set default dev-server logging to info ([5f302d4](https://github.com/equinor/fusion-framework/commit/5f302d4773abdca9e29660e8f9dd5c8d80e1ebe2))

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.6...@equinor/fusion-framework-cli@0.1.7) (2022-11-03)

### Bug Fixes

- **cli:** allow default export of render app ([d27a336](https://github.com/equinor/fusion-framework/commit/d27a336874d918448389a79b1291b13a1b2f41d9))
- **cli:** transform request to index.html ([e531958](https://github.com/equinor/fusion-framework/commit/e5319586598cf8567987040468f933438a4a7521))
- deprecate useFramework from hooks ([d3d9b24](https://github.com/equinor/fusion-framework/commit/d3d9b24fe56937e2c9feba7de4228d8eb1cbbec5))

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.5...@equinor/fusion-framework-cli@0.1.6) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.4...@equinor/fusion-framework-cli@0.1.5) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.3...@equinor/fusion-framework-cli@0.1.4) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.2...@equinor/fusion-framework-cli@0.1.3) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.1...@equinor/fusion-framework-cli@0.1.2) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.0...@equinor/fusion-framework-cli@0.1.1) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## 0.1.0 (2022-11-03)

### Features

- **cli:** initial commit ([#380](https://github.com/equinor/fusion-framework/issues/380)) ([775b74f](https://github.com/equinor/fusion-framework/commit/775b74f5cc8507cf5449a9f91e018d80a4ab50a1))

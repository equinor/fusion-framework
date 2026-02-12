# @equinor/fusion-framework-docs

## 0.4.13

### Patch Changes

- [#4000](https://github.com/equinor/fusion-framework/pull/4000) [`0b34d5d`](https://github.com/equinor/fusion-framework/commit/0b34d5d895c740a77fc995abeca910fdca1cf633) Thanks [@odinr](https://github.com/odinr)! - Add documentation for backend-issued auth code flow in MSAL module

  Add comprehensive guide explaining the SPA Auth Code Flow pattern, including:

  - Overview and motivation for using backend-issued codes
  - Step-by-step usage instructions with code examples
  - API documentation for `setAuthCode()` method
  - Security considerations and best practices
  - Troubleshooting guide for common issues

  This enables developers to implement seamless authentication without double-login prompts.

## 0.4.12

### Patch Changes

- [#3990](https://github.com/equinor/fusion-framework/pull/3990) [`8719068`](https://github.com/equinor/fusion-framework/commit/8719068b723975db90a1b4bee59808734eb87e20) Thanks [@odinr](https://github.com/odinr)! - Update CLI documentation to include the new `--config` flag for the `app publish` command, showing how to upload application configuration after publishing in a single command.

## 0.4.11

### Patch Changes

- [#3792](https://github.com/equinor/fusion-framework/pull/3792) [`79a121b`](https://github.com/equinor/fusion-framework/commit/79a121be49f115a19990e734f51dfdd6a3dcf778) Thanks [@dependabot](https://github.com/apps/dependabot)! - Upgrade VuePress and related dependencies:

  - @vuepress/bundler-vite: 2.0.0-rc.24 → 2.0.0-rc.26
  - @vuepress/cli: 2.0.0-rc.24 → 2.0.0-rc.26
  - @vuepress/client: 2.0.0-rc.24 → 2.0.0-rc.26
  - @vuepress/plugin-register-components: 2.0.0-rc.112 → 2.0.0-rc.118
  - @vuepress/utils: 2.0.0-rc.24 → 2.0.0-rc.26
  - vuepress: 2.0.0-rc.24 → 2.0.0-rc.26
  - vuepress-theme-hope: 2.0.0-rc.94 → 2.0.0-rc.98
  - vue: 3.5.21 → 3.5.25

  Add serve script with configurable base path for local testing of production builds.

  Fix incorrect AppLoader.tsx path in documentation (@packages/cli/src/bin/dev-portal/AppLoader.tsx → @packages/dev-portal/src/AppLoader.tsx).

## 0.4.10

### Patch Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Improved all cookbook README documentation for better developer experience.

  All cookbook README files now feature:

  - Code examples matching actual implementations
  - Inline comments explaining patterns and concepts
  - Developer-friendly language for those new to Fusion Framework
  - Focus on what each cookbook demonstrates rather than generic setup
  - Proper TSDoc comments in code blocks
  - Removed installation sections in favor of teaching patterns

  This improves the learning experience for developers exploring framework features through the 18 available cookbooks.

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Reorganize MSAL v4 authentication documentation structure and add cookbook examples.

  **Changes:**

  - Moved authentication guide to `/guide/app/docs/msal.md` with direct link to module docs
  - Added new cookbooks section with MSAL authentication example
  - Updated navigation sidebar to reflect new documentation structure
  - Improved discoverability of MSAL authentication features

  This reorganization provides better navigation and examples for developers implementing MSAL v4 authentication.

## 0.4.9

### Patch Changes

- [#3637](https://github.com/equinor/fusion-framework/pull/3637) [`f5b88e7`](https://github.com/equinor/fusion-framework/commit/f5b88e7ff8e896624de67bdf29091ba44bf8a628) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: bump rollup from 4.52.4 to 4.52.5 to fix sourcemap debugId generation; no public API changes.

- [#3653](https://github.com/equinor/fusion-framework/pull/3653) [`693ec94`](https://github.com/equinor/fusion-framework/commit/693ec945b78cc2e55eaf1deef97c6e34e1e283e0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Security: Update mermaid from 11.12.0 to 11.12.1 to fix high-severity vulnerability GHSA-cc8p-78qf-8p7q in dagre-d3-es dependency. Includes additional security updates for dompurify, marked, and katex.

## 0.4.8

### Patch Changes

- [#3587](https://github.com/equinor/fusion-framework/pull/3587) [`8927882`](https://github.com/equinor/fusion-framework/commit/89278821d92b1d7a0847229f7892cc2c89e07d1a) Thanks [@odinr](https://github.com/odinr)! - Improved contributing documentation navigation by adding a dedicated "Contributing" section to the main navigation and reorganizing contributing guides into a structured sidebar with categories for Development, Code Quality, Process, and Documentation.

  - Added "Contributing" link to main navbar
  - Created organized sidebar structure for contributing guides
  - Grouped guides into logical categories: Development, Code Quality, Process, and Documentation
  - Made contributing guides more discoverable and accessible to users

## 0.4.7

### Patch Changes

- [#3534](https://github.com/equinor/fusion-framework/pull/3534) [`8049b43`](https://github.com/equinor/fusion-framework/commit/8049b43847370c73814939f258a86723329b6b3c) Thanks [@odinr](https://github.com/odinr)! - Updated documentation site navigation and added dev-server configuration guide.

  - Enhanced sidebar navigation with nested Dev Server section including Overview and Configuration
  - Added dev-server-config.md to the documentation site

  ref: [#3523](https://github.com/equinor/fusion-framework/issues/3523)

- [#3534](https://github.com/equinor/fusion-framework/pull/3534) [`8049b43`](https://github.com/equinor/fusion-framework/commit/8049b43847370c73814939f258a86723329b6b3c) Thanks [@odinr](https://github.com/odinr)! - Added telemetry module documentation to the vue-press documentation site.

  - Created dedicated telemetry module documentation under modules section
  - Updated sidebar navigation to include telemetry module in alphabetical order
  - Includes comprehensive documentation for telemetry configuration, usage, adapters, and measurements

  resolves: [#3523](https://github.com/equinor/fusion-framework/issues/3523)

## 0.4.6

### Patch Changes

- [#3377](https://github.com/equinor/fusion-framework/pull/3377) [`70638da`](https://github.com/equinor/fusion-framework/commit/70638da56c0dad3f349a2d063e8d8bcea3b71b12) Thanks [@odinr](https://github.com/odinr)! - Add comprehensive Creating Apps guide to documentation site.

  - Added new "Creating Apps" section to CLI documentation
  - Updated sidebar navigation to include creating-apps.md
  - Added detailed guide covering app creation, templates, and best practices
  - Included GitHub template integration links for alternative app creation methods
  - Added troubleshooting, configuration, and workflow guidance

  This provides users with complete documentation for the new create app functionality directly in the docs site.

## 0.4.5

### Patch Changes

- [#3362](https://github.com/equinor/fusion-framework/pull/3362) [`6151ff4`](https://github.com/equinor/fusion-framework/commit/6151ff429fc5dc221a4cb43f11362cf39c2a3136) Thanks [@odinr](https://github.com/odinr)! - Updated documentation site with dev-server docs and dependency updates.

  - Added dev-server documentation to CLI docs sidebar
  - Updated mermaid dependency from ^11.0.2 to ^11.11.0
  - Added dev-server documentation include file for vue-press

## 0.4.4

### Patch Changes

- [#3343](https://github.com/equinor/fusion-framework/pull/3343) [`33054ac`](https://github.com/equinor/fusion-framework/commit/33054ac27b309e9d0301dd1f1d63639dac27f00b) Thanks [@odinr](https://github.com/odinr)! - Reorganized authentication documentation to improve maintainability and user experience.

  - Removed local `libsecret.md` documentation file
  - Updated all libsecret references to point to centralized MSAL Node module documentation
  - Enhanced authentication guide with cross-references to underlying module documentation
  - Improved documentation structure by consolidating authentication docs in the appropriate module packages

  **Migration Notes:**

  - libsecret installation guide is now available at: https://equinor.github.io/fusion-framework/modules/auth/msal-node/docs/libsecret.html
  - All authentication-related documentation is now centralized in the MSAL Node module package

- [#3340](https://github.com/equinor/fusion-framework/pull/3340) [`ba147d8`](https://github.com/equinor/fusion-framework/commit/ba147d80cf99c3b998f8299774e2d1815cb392f7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated mermaid dependency from 11.10.1 to 11.11.0.

  - Added support for new participant types (`actor`, `boundary`, `control`, `entity`, `database`, `collections`, `queue`) in sequence diagrams
  - Improved mindmap rendering with multiple layouts and better edge intersections
  - Fixed newline rendering in class diagrams
  - Fixed arrow handling when auto number is enabled

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

- [#3343](https://github.com/equinor/fusion-framework/pull/3343) [`68dc22f`](https://github.com/equinor/fusion-framework/commit/68dc22f582bb68fbc94f29ad053122f81c049405) Thanks [@odinr](https://github.com/odinr)! - Enhanced documentation with comprehensive guides and improved developer experience.

  - **Complete documentation rewrite** with better structure and organization
  - **Added comprehensive API reference** with detailed interface documentation
  - **Enhanced configuration guide** with clear required/optional settings tables
  - **Added migration guide** for v4 breaking changes and module hoisting
  - **Improved troubleshooting section** with common issues and solutions
  - **Added quick start examples** with practical usage patterns
  - **Enhanced module hoisting documentation** explaining shared authentication state
  - **Added package description** for better npm package visibility

  **Key Improvements:**

  - Clear separation between required and optional configuration
  - Comprehensive API reference with TypeScript interfaces
  - Migration guidance for v4 breaking changes
  - Better developer onboarding with quick start examples
  - Enhanced troubleshooting with platform-specific solutions

- [#3343](https://github.com/equinor/fusion-framework/pull/3343) [`2e96f24`](https://github.com/equinor/fusion-framework/commit/2e96f24766e424f0b7d0f88dd21b8616bc95774c) Thanks [@odinr](https://github.com/odinr)! - Restructured documentation to create dedicated authentication section with improved navigation and module organization.

  - **Added new Authentication section** in sidebar navigation with dedicated auth module pages
  - **Created MSAL Browser module page** (`modules/auth/msal/`) with comprehensive documentation
  - **Created MSAL Node module page** (`modules/auth/msal-node/`) with detailed setup guides
  - **Added libsecret setup guide** (`modules/auth/msal-node/docs/libsecret.md`) for platform-specific credential storage
  - **Removed outdated MSAL placeholder** (`modules/msal/`) and replaced with proper authentication structure
  - **Enhanced navigation structure** with clear separation between browser and Node.js authentication modules

  **Documentation Structure:**

  - New `/modules/auth/` section with dedicated authentication module pages
  - Platform-specific setup guides for Windows, macOS, and Linux
  - Comprehensive module documentation with proper frontmatter and tags
  - Improved discoverability of authentication-related documentation

  **Migration Notes:**

  - Authentication documentation is now organized under `/modules/auth/`
  - MSAL Browser docs: `/modules/auth/msal/`
  - MSAL Node docs: `/modules/auth/msal-node/`
  - libsecret setup: `/modules/auth/msal-node/docs/libsecret.html`

## 0.4.3

### Patch Changes

- [`00c1851`](https://github.com/equinor/fusion-framework/commit/00c1851c1f80a89531796fb7487176867a4af533) Thanks [@odinr](https://github.com/odinr)! - fixed broken link in migration guide

## 0.4.2

### Patch Changes

- [#3309](https://github.com/equinor/fusion-framework/pull/3309) [`29efd10`](https://github.com/equinor/fusion-framework/commit/29efd10c48f9d11ba5aa7246d3217c5ea81ddc14) Thanks [@odinr](https://github.com/odinr)! - - Added or updated frontmatter in all CLI documentation Markdown files (`README.md`, `docs/application.md`, `docs/auth.md`, `docs/libsecret.md`, `docs/migration-v10-to-v11.md`, `docs/portal.md`) to include accurate `title`, `description`, `category`, and comprehensive `tags` reflecting the content and CLI features.
  - Synced documentation content with the latest CLI docs, ensuring all guides, migration notes, and troubleshooting sections are up-to-date.
  - Removed unused or obsolete CLI documentation files (`api-authentication.md`, `commands.md`, `configuration.md`, `guide/app/cli.md`).
  - Updated VuePress sidebar and theme configuration to reflect the new documentation structure and navigation.
  - Removed the deprecated `/roadmap` section and its assets from the documentation site.

## 0.4.1

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - update import path for defineAppConfig in app.config.ts files

## 0.4.1-next.1

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

## 0.4.1-next.0

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`7f852bd`](https://github.com/equinor/fusion-framework/commit/7f852bd2f91b980b5bf76f54943b99fa4615f41e) Thanks [@odinr](https://github.com/odinr)! - update import path for defineAppConfig in app.config.ts files

## 0.4.0

### Minor Changes

- [#2944](https://github.com/equinor/fusion-framework/pull/2944) [`ba22ea9`](https://github.com/equinor/fusion-framework/commit/ba22ea9899a78f4c1e8d019b352eaad1e8b31c60) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add docs about Context's new methods `setContextPathExtractor` and `setContextPathGenerator`

## 0.3.3

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

## 0.3.2

### Patch Changes

- [#2717](https://github.com/equinor/fusion-framework/pull/2717) [`cbf32e9`](https://github.com/equinor/fusion-framework/commit/cbf32e94333296e2ede8b5bf690e19845672eff7) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump mermaid from 11.0.2 to 11.4.1

## 0.3.1

### Patch Changes

- [#2626](https://github.com/equinor/fusion-framework/pull/2626) [`d6e7d62`](https://github.com/equinor/fusion-framework/commit/d6e7d62aaff295d53431a73a688bc2097f0a94f1) Thanks [@eikeland](https://github.com/eikeland)! - ### Changes

  - Update defineAppConfig function:
    - Change scope to var in the environment object.
    - Add scopes array to the api endpoint.
  - Update configure function:
    - Change configureClient to configureHttpClient.
    - Update the configuration to include baseUri and defaultScopes.
  - Update defineAppManifest function:
    - Add version to the build object.
  - Correct CLI command:
    - Change app pack to app build-pack.

## 0.3.0

### Minor Changes

- [#2577](https://github.com/equinor/fusion-framework/pull/2577) [`c3ba9f1`](https://github.com/equinor/fusion-framework/commit/c3ba9f109d9f96d6dc6ee2f0ddac00c8b3090982) Thanks [@eikeland](https://github.com/eikeland)! - Added doc for app settings

## 0.2.3

### Patch Changes

- [#2548](https://github.com/equinor/fusion-framework/pull/2548) [`5a0310d`](https://github.com/equinor/fusion-framework/commit/5a0310d2e7ac1d0941166537293c2db98e6727a9) Thanks [@eikeland](https://github.com/eikeland)! - Changing example of app-config.ts in cli docs

## 0.2.2

### Patch Changes

- [#2518](https://github.com/equinor/fusion-framework/pull/2518) [`f21d582`](https://github.com/equinor/fusion-framework/commit/f21d5826c0c9b5400bf1e35b658c229f3de127fc) Thanks [@eikeland](https://github.com/eikeland)! - ### Changes:

  - Fixed indentation in `ModuleBadge.vue`.
  - Updated `packageName` method in `ModuleBadge.vue` to replace all '/' with '-'.
  - Updated `ModuleBadge` component usage in various README files to use the correct module paths:
    - `modules/app`
    - `modules/feature-flag`
    - `modules/navigation`
    - `modules/service-discovery`
    - `modules/services`
    - `modules/widget`
  - Added `ModuleBadge` component to `feature-flag/module.md` and `feature-flag/react.md`.

## 0.2.1

### Patch Changes

- [#2517](https://github.com/equinor/fusion-framework/pull/2517) [`e78861a`](https://github.com/equinor/fusion-framework/commit/e78861a17cb0174ad96cd05e1b873e5fee42660f) Thanks [@eikeland](https://github.com/eikeland)! - Updated `getting-started.md` documentation to:

  - Correct JSON code block formatting.
  - Update `app.config.ts` example to use `defineAppConfig` directly without `mergeAppConfigs`.
  - Provide an example of configuring an HTTP client with endpoint details from environment configuration.

## 0.2.0

### Minor Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Documenting the new CLI commands in vue-press.

## 0.1.6

### Patch Changes

- [#2411](https://github.com/equinor/fusion-framework/pull/2411) [`257cd8d`](https://github.com/equinor/fusion-framework/commit/257cd8d171ede9e834f7fd4594ae84ae08bddfed) Thanks [@odinr](https://github.com/odinr)! - Bump dependencies

  | Package                                                                                                                           | From          | To            |
  | --------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- |
  | [@vuepress/bundler-vite](https://github.com/vuepress/core)                                                                        | `2.0.0-rc.14` | `2.0.0-rc.15` |
  | [@vuepress/cli](https://github.com/vuepress/core)                                                                                 | `2.0.0-rc.14` | `2.0.0-rc.15` |
  | [@vuepress/client](https://github.com/vuepress/core)                                                                              | `2.0.0-rc.14` | `2.0.0-rc.15` |
  | [@vuepress/plugin-register-components](https://github.com/vuejs/vuepress/tree/HEAD/packages/@vuepress/plugin-register-components) | `2.0.0-rc.37` | `2.0.0-rc.42` |
  | [@vuepress/utils](https://github.com/vuepress/core)                                                                               | `2.0.0-rc.14` | `2.0.0-rc.15` |
  | [vue](https://github.com/vuejs/core)                                                                                              | `3.4.34`      | `3.4.38`      |
  | [vuepress](https://github.com/vuejs/vuepress/tree/HEAD/packages/vuepress)                                                         | `2.0.0-rc.14` | `2.0.0-rc.15` |
  | [vuepress-theme-hope](https://github.com/vuepress-theme-hope/vuepress-theme-hope/tree/HEAD/packages/theme)                        | `2.0.0-rc.50` | `2.0.0-rc.52` |
  | [mermaid](https://github.com/mermaid-js/mermaid)                                                                                  | `10.9.1`      | `11.0.2`      |

## 0.1.5

### Patch Changes

- [#2324](https://github.com/equinor/fusion-framework/pull/2324) [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9) Thanks [@odinr](https://github.com/odinr)! - Updated documentation in `README.md` for http module.

  - added introduction to http module
  - added concepts section which highlights the key concepts of http module
  - added sequence diagram for http request execution
  - added examples for http module
  - improved documentation for configuring http module
  - improved documentation for working with http clients
  - improved the formatting of the documentation

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

- [#2321](https://github.com/equinor/fusion-framework/pull/2321) [`d760a49`](https://github.com/equinor/fusion-framework/commit/d760a49594ad09ad3de28517ad63b954fab85158) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bumps the docs with 8 updates:

  | Package                                                                                                                           | From          | To            |
  | --------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- |
  | [@vuepress/bundler-vite](https://github.com/vuepress/core)                                                                        | `2.0.0-rc.11` | `2.0.0-rc.14` |
  | [@vuepress/cli](https://github.com/vuepress/core)                                                                                 | `2.0.0-rc.11` | `2.0.0-rc.14` |
  | [@vuepress/client](https://github.com/vuepress/core)                                                                              | `2.0.0-rc.11` | `2.0.0-rc.14` |
  | [@vuepress/plugin-register-components](https://github.com/vuejs/vuepress/tree/HEAD/packages/@vuepress/plugin-register-components) | `2.0.0-rc.30` | `2.0.0-rc.37` |
  | [@vuepress/utils](https://github.com/vuepress/core)                                                                               | `2.0.0-rc.11` | `2.0.0-rc.14` |
  | [vue](https://github.com/vuejs/core)                                                                                              | `3.4.25`      | `3.4.31`      |
  | [vuepress](https://github.com/vuejs/vuepress/tree/HEAD/packages/vuepress)                                                         | `2.0.0-rc.11` | `2.0.0-rc.14` |
  | [vuepress-theme-hope](https://github.com/vuepress-theme-hope/vuepress-theme-hope/tree/HEAD/packages/theme)                        | `2.0.0-rc.43` | `2.0.0-rc.50` |

## 0.1.4

### Patch Changes

- [#2200](https://github.com/equinor/fusion-framework/pull/2200) [`d63b99e`](https://github.com/equinor/fusion-framework/commit/d63b99efa83b328354a0c437f70839ed733a63e4) Thanks [@odinr](https://github.com/odinr)! - **Updated the following dependencies:**

  - Bumped @vuepress/bundler-vite from 2.0.0-rc.9 to 2.0.0-rc.11
  - Bumped @vuepress/cli from 2.0.0-rc.9 to 2.0.0-rc.11
  - Bumped @vuepress/client from 2.0.0-rc.9 to 2.0.0-rc.11
  - Bumped @vuepress/plugin-register-components from 2.0.0-rc.21 to 2.0.0-rc.30
  - Bumped @vuepress/utils from 2.0.0-rc.9 to 2.0.0-rc.11
  - Bumped mermaid from ^10.9.0 to ^10.9.1
  - Bumped vuepress from 2.0.0-rc.9 to 2.0.0-rc.11
  - Bumped vuepress-theme-hope from 2.0.0-rc.37 to 2.0.0-rc.43

- [#2199](https://github.com/equinor/fusion-framework/pull/2199) [`c568a06`](https://github.com/equinor/fusion-framework/commit/c568a06ba1715d1294bf4e453c00c91e001a12c6) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-framework-docs

  Removed an outdated warning message about React version support in the Fusion Portal getting started guide.

  ### Why

  The warning message stated:

  > The Fusion Portal only supports React@17

  However, this is no longer accurate, as the Fusion Portal now supports newer versions of React beyond 17.

## 0.1.3

### Patch Changes

- [#2180](https://github.com/equinor/fusion-framework/pull/2180) [`060a1aa`](https://github.com/equinor/fusion-framework/commit/060a1aa7f4f2ce6b1ddef527a219bf267e488500) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-framework-docs

  Updated the "Getting started" guide with a new section about using environment variables.

## 0.1.2

### Patch Changes

- [#2119](https://github.com/equinor/fusion-framework/pull/2119) [`6f3dc37`](https://github.com/equinor/fusion-framework/commit/6f3dc3755b72c3928012b7010c5a61cc03213602) Thanks [@odinr](https://github.com/odinr)! - minor updates to doc

## 0.1.1

### Patch Changes

- [#2104](https://github.com/equinor/fusion-framework/pull/2104) [`35dd1fb`](https://github.com/equinor/fusion-framework/commit/35dd1fba61fb3ee0f3bfd0ecb81c53cff5f31142) Thanks [@odinr](https://github.com/odinr)! - bumped vue to 3.4.25

## 0.1.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

## 0.0.6

### Patch Changes

- [#1936](https://github.com/equinor/fusion-framework/pull/1936) [`1f6eced`](https://github.com/equinor/fusion-framework/commit/1f6ecede1f27698c725a4150181291d58704d638) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps-dev): bump vuepress-theme-hope from 2.0.0-rc.25 to 2.0.0-rc.31

## 0.0.5

### Patch Changes

- [#1912](https://github.com/equinor/fusion-framework/pull/1912) [`4deee68`](https://github.com/equinor/fusion-framework/commit/4deee6867f6df7b655afdad369c9e6d293b33300) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - add section for how to throw custom context error

## 0.0.4

### Patch Changes

- [#1868](https://github.com/equinor/fusion-framework/pull/1868) [`76a51bd`](https://github.com/equinor/fusion-framework/commit/76a51bdd7e6a503f8fb2583ac988bf2f4e11de60) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Upgrade vuepress to rc8

## 0.0.3

### Patch Changes

- [#1816](https://github.com/equinor/fusion-framework/pull/1816) [`7bb291d`](https://github.com/equinor/fusion-framework/commit/7bb291d6f789a61bdb0dd72e4325188ec2105d3a) Thanks [@odinr](https://github.com/odinr)! - Updated documentation for using static resources in runtime

## 0.0.2

### Patch Changes

- [#1777](https://github.com/equinor/fusion-framework/pull/1777) [`6279b40`](https://github.com/equinor/fusion-framework/commit/6279b40917c15c3005956432581106f87e8e905f) Thanks [@odinr](https://github.com/odinr)! - updated to vuepress rc2

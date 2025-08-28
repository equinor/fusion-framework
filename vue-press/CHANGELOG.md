# @equinor/fusion-framework-docs

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

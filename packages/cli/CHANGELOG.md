# Change Log

## 8.1.0

### Minor Changes

-   [#1173](https://github.com/equinor/fusion-framework/pull/1173) [`571046fe`](https://github.com/equinor/fusion-framework/commit/571046fe1305c02eda0c2da46d33796f1cbcf5f1) Thanks [@odinr](https://github.com/odinr)! - Remove emotion decencies from CLI

    align CLI with EDS and use style components instead of emotion 🥲
    prevent conflict of react types dependent on both emotion and eds

    -   remove @emotion/\*
    -   convert emotion to styled-components
    -   fix styling of cli
        -   convert main placeholder to grid
        -   remove unnecessary styling from header
        -   set dynamic width of context selector (min 25rem)

### Patch Changes

-   [#1184](https://github.com/equinor/fusion-framework/pull/1184) [`59982e55`](https://github.com/equinor/fusion-framework/commit/59982e55e24a49f06d37334f1cefcc0048894fe7) Thanks [@odinr](https://github.com/odinr)! - fixed bin resolve for pnpm

-   Updated dependencies []:
    -   @equinor/fusion-framework-app@7.1.2

## 8.0.1

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1130](https://github.com/equinor/fusion-framework/pull/1130) [`542356ee`](https://github.com/equinor/fusion-framework/commit/542356eecfcc1bc8b896e71377308a1de29f4ab9) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @emotion/styled from 11.10.6 to 11.11.0

-   [#1129](https://github.com/equinor/fusion-framework/pull/1129) [`f672d0bb`](https://github.com/equinor/fusion-framework/commit/f672d0bba71a7ea6cd08135778fda67ff38f3ac3) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/eds-core-react from 0.30.0 to 0.32.4

-   [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

    only dev deps updated should not affect any consumers

    see [react changelog](https://github.com/facebook/react/releases) for details

-   [#1122](https://github.com/equinor/fusion-framework/pull/1122) [`1a055b21`](https://github.com/equinor/fusion-framework/commit/1a055b21e07f84bc5d35cc891586aa9aa0bdf661) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update styled-components to [^6.0.7](https://github.com/styled-components/styled-components/releases/tag/v6.0.7)

    -   upgraded dev deps of `@equinor/fusion-framework-react-components-bookmark` to react 18, see style-components [changelog](https://github.com/styled-components/styled-components/releases/tag/v6.0.0)
    -   removed `@types/style-components` from `@equinor/fusion-framework-react-components-bookmark`

    see style-components [migration guide](https://styled-components.com/docs/faqs#what-do-i-need-to-do-to-migrate-to-v6)

-   [#1148](https://github.com/equinor/fusion-framework/pull/1148) [`46201069`](https://github.com/equinor/fusion-framework/commit/46201069505f2526d1bdec05c134da17012b6d31) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump vite from 4.2.3 to 4.4.9

    see [changelog](https://github.com/vitejs/vite/blob/create-vite@4.4.0/packages/create-vite/CHANGELOG.md)

-   [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

-   [#1156](https://github.com/equinor/fusion-framework/pull/1156) [`dfee1f79`](https://github.com/equinor/fusion-framework/commit/dfee1f79c9b70c2c2f27c12096000e6fc1e8ff7a) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump vite-tsconfig-paths from [4.0.7](https://github.com/aleclarson/vite-tsconfig-paths/releases/tag/v4.0.7) to [4.2.0](https://github.com/aleclarson/vite-tsconfig-paths/releases/tag/v4.2.0)

-   [#1087](https://github.com/equinor/fusion-framework/pull/1087) [`6887c016`](https://github.com/equinor/fusion-framework/commit/6887c0164102e17b4a6d6f16193d9e34a0f41149) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @vitejs/plugin-react from 3.1.0 to 4.0.4

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-observable@8.1.0
    -   @equinor/fusion-framework-app@7.1.1

## 8.0.0

### Major Changes

-   [#973](https://github.com/equinor/fusion-framework/pull/973) [`713c94d9`](https://github.com/equinor/fusion-framework/commit/713c94d9a493f5aecb9fefa44942f83bd30ae29c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump commander from [10.0.1](https://github.com/tj/commander.js/releases/tag/v10.0.1) to [11.0.0](https://github.com/tj/commander.js/releases/tag/v11.0.0)

    **Breaking**

    @equinor/fusion-framework-cli now requires Node.js v16 or higher

### Patch Changes

-   [#1047](https://github.com/equinor/fusion-framework/pull/1047) [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @typescript-eslint/eslint-plugin from 5.59.11 to 6.1.0

    only style semantics updated

-   Updated dependencies [[`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`0a785d5c`](https://github.com/equinor/fusion-framework/commit/0a785d5c339ceec7cbbe2a6ff9e16053c86ce511), [`38869a87`](https://github.com/equinor/fusion-framework/commit/38869a87788c340d363e9be1e7fc6ce0e29efa63)]:
    -   @equinor/fusion-observable@8.0.3
    -   @equinor/fusion-framework-app@7.1.0

## 7.1.0

### Minor Changes

-   [#1055](https://github.com/equinor/fusion-framework/pull/1055) [`6c2fd59e`](https://github.com/equinor/fusion-framework/commit/6c2fd59e66ff77629ce1b7ecd5fd47e799719b91) Thanks [@odinr](https://github.com/odinr)! - **Allow loading of custom vite config**

    When running the CLI, allow the user to provide custom [Vite config](https://vitejs.dev/config/).
    The provided config is merged with the built-in config (default generated by the CLI).

    updated [documentation](https://equinor.github.io/fusion-framework/guide/app/cli.html#config)

## 7.0.13

### Patch Changes

-   [#1002](https://github.com/equinor/fusion-framework/pull/1002) [`7f506120`](https://github.com/equinor/fusion-framework/commit/7f506120c702f157f95f477ddfc514a906176870) Thanks [@eikeland](https://github.com/eikeland)! - # Updating @equinor/fusion-react-styles

    Updating dependency @equinor/fusion-react-styles to version 0.5.6.

    This ads the correct equinor-font cdn link to the themeprovider.

## 7.0.12

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

-   Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
    -   @equinor/fusion-framework-app@7.0.16

## 7.0.11

### Patch Changes

-   [#910](https://github.com/equinor/fusion-framework/pull/910) [`d40951a3`](https://github.com/equinor/fusion-framework/commit/d40951a3f5044083e7aec416c065342d0207e5d5) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Removes requirement of leading slash in `main` attr in `package.json`, meaning
    both `"main": "src/index.ts"` and `"main": "/src/index.ts"` will resolve.

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    -   @equinor/fusion-framework-app@7.0.15

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

-   **module-context:** `ContextProvider.setCurrentContext` now returns an `Observable`

### Features

-   **module-context:** make setting context as an observable ([21e1c6b](https://github.com/equinor/fusion-framework/commit/21e1c6b64f541ec63dd6ea830410c7bb5cbdd84a))

## 6.1.0 (2023-04-24)

### Features

-   **cli:** added bookmark side sheet to cli and updated header ([d5da5eb](https://github.com/equinor/fusion-framework/commit/d5da5eb2c61983c8f038956a18e7a8c16a987450))

### Bug Fixes

-   **bookmark:** fix linting ([17b179f](https://github.com/equinor/fusion-framework/commit/17b179fbb25243730dd65cc116c86471074faabc))
-   cli package json ([966695a](https://github.com/equinor/fusion-framework/commit/966695a7701cbea9115053226f48d378a77d6af3))

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

-   :bug: fix incorrect height cli portal ([38aee24](https://github.com/equinor/fusion-framework/commit/38aee24011fe1d3c049d7667d777c91b19a02d2c))

## [5.1.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.13...@equinor/fusion-framework-cli@5.1.14) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.12...@equinor/fusion-framework-cli@5.1.13) (2023-04-11)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.11...@equinor/fusion-framework-cli@5.1.12) (2023-03-31)

### Bug Fixes

-   force build of cli ([3fdff80](https://github.com/equinor/fusion-framework/commit/3fdff80c69c769d789d00f7cec5895a080be3ccf))

## [5.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.9...@equinor/fusion-framework-cli@5.1.11) (2023-03-31)

### Bug Fixes

-   **cli:** contextSearch shows current context in selector ([52b4cc4](https://github.com/equinor/fusion-framework/commit/52b4cc4f2ade64e4f2722e16a2d27358d0121c05))
-   **cli:** moved vite-plugin-enviornment from dev-dependencie to dependecies ([1c42889](https://github.com/equinor/fusion-framework/commit/1c428894503cdd95c5bfc2b60c0148860491f305))
-   **cli:** update deps ([86cc317](https://github.com/equinor/fusion-framework/commit/86cc31728ce6d78ebd198eadc0ccddcaf16df55e))

## [5.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.9...@equinor/fusion-framework-cli@5.1.10) (2023-03-31)

### Bug Fixes

-   **cli:** contextSearch shows current context in selector ([52b4cc4](https://github.com/equinor/fusion-framework/commit/52b4cc4f2ade64e4f2722e16a2d27358d0121c05))
-   **cli:** moved vite-plugin-enviornment from dev-dependencie to dependecies ([1c42889](https://github.com/equinor/fusion-framework/commit/1c428894503cdd95c5bfc2b60c0148860491f305))
-   **cli:** update deps ([86cc317](https://github.com/equinor/fusion-framework/commit/86cc31728ce6d78ebd198eadc0ccddcaf16df55e))

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

-   **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [5.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.1...@equinor/fusion-framework-cli@5.1.2) (2023-03-21)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.1.0...@equinor/fusion-framework-cli@5.1.1) (2023-03-20)

### Bug Fixes

-   **cli:** add missing proxy target ([1f14f99](https://github.com/equinor/fusion-framework/commit/1f14f99290d6ee3c112115f29b9f28d1a6959b62))

## [5.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.8...@equinor/fusion-framework-cli@5.1.0) (2023-03-20)

### Features

-   **cli:** allow configuring portal host in cli ([9641b21](https://github.com/equinor/fusion-framework/commit/9641b215a1bff957687e9eda661679f000588a47))

## [5.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.7...@equinor/fusion-framework-cli@5.0.8) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.7...@equinor/fusion-framework-cli@5.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.6...@equinor/fusion-framework-cli@5.0.7) (2023-03-17)

### Bug Fixes

-   **cli:** use referer as proxy uri ([35edbdc](https://github.com/equinor/fusion-framework/commit/35edbdcae83d51595e013550303b8ea8b7e1c675))

## [5.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.5...@equinor/fusion-framework-cli@5.0.6) (2023-03-10)

### Bug Fixes

-   **cli:** fix mounting element in app loader ([0410c7f](https://github.com/equinor/fusion-framework/commit/0410c7f0ce7a1b9f25c7716e0206534a1d047529))

## 5.0.5 (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.3...@equinor/fusion-framework-cli@5.0.4) (2023-03-09)

### Bug Fixes

-   **cli:** include `NODE_ENV` environment in build ([28faf2a](https://github.com/equinor/fusion-framework/commit/28faf2abc1adb09cc52242e26abb61e2ddfeb6c1))

## [5.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.2...@equinor/fusion-framework-cli@5.0.3) (2023-03-06)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.1...@equinor/fusion-framework-cli@5.0.2) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [5.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@5.0.0...@equinor/fusion-framework-cli@5.0.1) (2023-02-20)

### Bug Fixes

-   **cli:** allow cli to read paths from tsconfig ([c78673f](https://github.com/equinor/fusion-framework/commit/c78673f7d85a2c3697798aa6a59ef1792ca53af6))

## [5.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@4.1.0...@equinor/fusion-framework-cli@5.0.0) (2023-02-13)

### ⚠ BREAKING CHANGES

-   **utils/observable:** `useObservableInputState` and `useObservableSelectorState` now return full state, not only value

### Bug Fixes

-   **utils/observable:** rename `next` to `value`from `useObservableState` ([4a08445](https://github.com/equinor/fusion-framework/commit/4a08445645af2488666564c2da716d32aa5e88c0))
-   **utils/observable:** when subject in useObservableState reset state ([9c5c041](https://github.com/equinor/fusion-framework/commit/9c5c041d3d8c0b01bd507ea7f672711d9f5cb653))

## [4.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@4.0.4...@equinor/fusion-framework-cli@4.1.0) (2023-02-09)

### Features

-   (framework): person provider ([d4a3936](https://github.com/equinor/fusion-framework/commit/d4a3936d6a60f093f71eac1dacc05cd60c7bf554))
-   **cli:** add react es lint for cli ([55137d7](https://github.com/equinor/fusion-framework/commit/55137d7baee9611fcb3e4bde4a4c0a954a8a68c6))

### Bug Fixes

-   **cli:** add custom element register ([3f30c34](https://github.com/equinor/fusion-framework/commit/3f30c34324ca43fcc947f9163919a31611471afd))
-   **cli:** update person resolver ([4ef99ae](https://github.com/equinor/fusion-framework/commit/4ef99ae5da870ec5d076041996ee98548fc18e5a))

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@4.0.4...@equinor/fusion-framework-cli@4.0.5) (2023-02-02)

### Bug Fixes

-   **cli:** add custom element register ([3f30c34](https://github.com/equinor/fusion-framework/commit/3f30c34324ca43fcc947f9163919a31611471afd))

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

-   hook has new return type

### Bug Fixes

-   references to useObservableState ([614a569](https://github.com/equinor/fusion-framework/commit/614a5691f856765f07f5d71e39708f80dea49a6e))

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.5...@equinor/fusion-framework-cli@3.1.0) (2023-02-01)

### Features

-   **equinorloader:** centered starprogress loader ([081226d](https://github.com/equinor/fusion-framework/commit/081226d4afa1bdbb9daca0304ce34bc13471e8d7))

### Bug Fixes

-   **cli:** fixing contextresolver ([41edf18](https://github.com/equinor/fusion-framework/commit/41edf18223aed93b393c0fab1e1f41797b7f06da)), closes [#591](https://github.com/equinor/fusion-framework/issues/591)

## [3.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.4...@equinor/fusion-framework-cli@3.0.5) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [3.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.3...@equinor/fusion-framework-cli@3.0.4) (2023-01-30)

### Bug Fixes

-   **cli:** disable 'x-powered-by' ([29cc4a8](https://github.com/equinor/fusion-framework/commit/29cc4a866f3f38a17a2df23eac047e7b82129696))

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.2...@equinor/fusion-framework-cli@3.0.3) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@3.0.1...@equinor/fusion-framework-cli@3.0.2) (2023-01-27)

### Bug Fixes

-   **cli:** named exports ([b03381b](https://github.com/equinor/fusion-framework/commit/b03381bde924db1979e9e5e870b356dc5db4b81d))

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

-   **module-app:** manifest prop rename

### Bug Fixes

-   **module-app:** rename `appKey` to `key` ([9ee97b1](https://github.com/equinor/fusion-framework/commit/9ee97b149b9167a3747da371de76490e287d9514))

## [1.2.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.13...@equinor/fusion-framework-cli@1.2.14) (2022-12-22)

### Bug Fixes

-   **utils/cli:** typo in import ([e4c3d0a](https://github.com/equinor/fusion-framework/commit/e4c3d0ac13f8a47ec4447cc07f7b9dc4210ba0c1))

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

-   **utils/cli:** update app-loader ([4b1d5e7](https://github.com/equinor/fusion-framework/commit/4b1d5e7a5ca1e7b9d7a34556799a7c9aa77b9440))

## [1.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.2.5...@equinor/fusion-framework-cli@1.2.6) (2022-12-14)

### Bug Fixes

-   **module-app:** make app module optional ([fa5c0ed](https://github.com/equinor/fusion-framework/commit/fa5c0ed0a9afc1f9ade3adb6e52e4425a59a7aa6))

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

-   **context:** method for contextParameterFn on enableContext ([398658d](https://github.com/equinor/fusion-framework/commit/398658de26355a8ca99aea291963b8c302df3ddc))

## [1.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@1.1.9...@equinor/fusion-framework-cli@1.2.0) (2022-12-12)

### Features

-   **utils/cli:** update context selector ([c091107](https://github.com/equinor/fusion-framework/commit/c09110735e019b47f16300332fedb360d3396cfc))

### Bug Fixes

-   **utils/cli:** fix layout of router outlet ([ac99033](https://github.com/equinor/fusion-framework/commit/ac99033061ae9867adf6c47f1293266fd20ab8ef))
-   **utils/cli:** update header of error view ([971b5e5](https://github.com/equinor/fusion-framework/commit/971b5e5ee8f3ec98e2ec41eb485bf01b35ee501e))
-   **utils/cli:** update loading of application ([4de3289](https://github.com/equinor/fusion-framework/commit/4de3289942f8e3d81f4ee5749311479f4f49b680))

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

-   **context-selector:** adds icon to orgchart result items ([90343d9](https://github.com/equinor/fusion-framework/commit/90343d9915cb85eaa9945012c8709a2d40f6f023))
-   **context-selector:** header type contextselector and appcheck ([8ab0a50](https://github.com/equinor/fusion-framework/commit/8ab0a50e3f7ea3487796735c868f2e65d84fecd2))
-   **contextselector:** cli context selector ([f414466](https://github.com/equinor/fusion-framework/commit/f4144668e4deee32ed229807d81a0ea08ba5a476))
-   fusionlogo component ([b02fe16](https://github.com/equinor/fusion-framework/commit/b02fe16d3bb723b13413115826df0bbbc2b46815))
-   header with contextselector and logo ([174ed3d](https://github.com/equinor/fusion-framework/commit/174ed3d14383b6a813d2264ad5dfd9397fe17185))

### Bug Fixes

-   **app:** adding type contextModule in event details for app package ([abea386](https://github.com/equinor/fusion-framework/commit/abea386c76c6297934a236d1bba9c71a12425065))
-   **cli:** contextselector improvements and comments ([bf8363e](https://github.com/equinor/fusion-framework/commit/bf8363e86909407632caa5ec46182643cbdd2205))
-   **cli:** updated dependencie versions ([12cb3c8](https://github.com/equinor/fusion-framework/commit/12cb3c8d56cad82986d910f45ec1933fe43bfd67))

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

-   **cli:** windows url path ([0176fa8](https://github.com/equinor/fusion-framework/commit/0176fa8ac1337025c584101ec2ceac8092eb0c13))

## 0.3.5 (2022-11-23)

### Bug Fixes

-   **cli:** relative path resolve windows ([0316c30](https://github.com/equinor/fusion-framework/commit/0316c30fd0e75d230893015c40c96dd369e8e472))

## [0.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.3...@equinor/fusion-framework-cli@0.3.4) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.2...@equinor/fusion-framework-cli@0.3.3) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.1...@equinor/fusion-framework-cli@0.3.2) (2022-11-18)

### Bug Fixes

-   basename in app render ([ae75815](https://github.com/equinor/fusion-framework/commit/ae75815877701c364f853413b29ad4f053d9c2c2))

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.3.0...@equinor/fusion-framework-cli@0.3.1) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.2.3...@equinor/fusion-framework-cli@0.3.0) (2022-11-17)

### Features

-   **module-navigation:** initial ([891e69d](https://github.com/equinor/fusion-framework/commit/891e69d9a98ba02ee1f9dd1c5b0cb31ff1b5fd0f))

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.2.2...@equinor/fusion-framework-cli@0.2.3) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.2.1...@equinor/fusion-framework-cli@0.2.2) (2022-11-17)

### Bug Fixes

-   **cli:** update dev scope for service discovery ([af1ff9c](https://github.com/equinor/fusion-framework/commit/af1ff9cb2eebb2a19b658549feef3b5822d8f8a3))

## [0.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.2.0...@equinor/fusion-framework-cli@0.2.1) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework-cli

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.15...@equinor/fusion-framework-cli@0.2.0) (2022-11-14)

### Features

-   add router and app loader ([f21661d](https://github.com/equinor/fusion-framework/commit/f21661d1255633848d1662dabb74e8e33ab629d5))
-   **cli:** add proxy routing for app and config ([b923830](https://github.com/equinor/fusion-framework/commit/b9238309a2f15a470d63411d2da0b58a1eb63e90))

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

-   **cli:** add dep @vitejs/plugin-react ([415dd9f](https://github.com/equinor/fusion-framework/commit/415dd9f466076f232e751bbbffa54a8b10c0bea4))

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.8...@equinor/fusion-framework-cli@0.1.9) (2022-11-07)

### Bug Fixes

-   **cli:** requires vite ([c512d9e](https://github.com/equinor/fusion-framework/commit/c512d9e0e413e515fe0dcb412af49996b04d2484))

## [0.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.7...@equinor/fusion-framework-cli@0.1.8) (2022-11-07)

### Bug Fixes

-   **cli:** allow overwrite on build ([8e648d7](https://github.com/equinor/fusion-framework/commit/8e648d7ea17518a3ec74f3bb366c4247b8f4fce9))
-   **cli:** set default dev-server logging to info ([5f302d4](https://github.com/equinor/fusion-framework/commit/5f302d4773abdca9e29660e8f9dd5c8d80e1ebe2))

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cli@0.1.6...@equinor/fusion-framework-cli@0.1.7) (2022-11-03)

### Bug Fixes

-   **cli:** allow default export of render app ([d27a336](https://github.com/equinor/fusion-framework/commit/d27a336874d918448389a79b1291b13a1b2f41d9))
-   **cli:** transform request to index.html ([e531958](https://github.com/equinor/fusion-framework/commit/e5319586598cf8567987040468f933438a4a7521))
-   deprecate useFramework from hooks ([d3d9b24](https://github.com/equinor/fusion-framework/commit/d3d9b24fe56937e2c9feba7de4228d8eb1cbbec5))

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

-   **cli:** initial commit ([#380](https://github.com/equinor/fusion-framework/issues/380)) ([775b74f](https://github.com/equinor/fusion-framework/commit/775b74f5cc8507cf5449a9f91e018d80a4ab50a1))

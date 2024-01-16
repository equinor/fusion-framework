# Change Log

## 0.3.3

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@5.3.9
    -   @equinor/fusion-framework-react-module-bookmark@2.0.28

## 0.3.2

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@5.3.8
    -   @equinor/fusion-framework-react-module-bookmark@2.0.27

## 0.3.1

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@5.3.7
    -   @equinor/fusion-framework-react-module-bookmark@2.0.26

## 0.3.0

### Minor Changes

-   [#1615](https://github.com/equinor/fusion-framework/pull/1615) [`750a7f5`](https://github.com/equinor/fusion-framework/commit/750a7f5f96104e33d4a436ff858044516e269c68) Thanks [@Noggling](https://github.com/Noggling)! - Implement a "No Content" message and relocate the "Loading" indicator to the bookmarks component. Additionally, incorporate an effect to handle cases where the "onBookmarksChanged" event is not triggered.

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@5.3.6
    -   @equinor/fusion-framework-react-module-bookmark@2.0.25

## 0.2.14

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@5.3.5
    -   @equinor/fusion-framework-react-module-bookmark@2.0.24

## 0.2.13

### Patch Changes

-   Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    -   @equinor/fusion-framework-react-module-bookmark@2.0.23
    -   @equinor/fusion-framework-react@5.3.4

## 0.2.12

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react-module-bookmark@2.0.22

## 0.2.11

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react-module-bookmark@2.0.21
    -   @equinor/fusion-framework-react@5.3.3

## 0.2.10

### Patch Changes

-   [#1348](https://github.com/equinor/fusion-framework/pull/1348) [`0acc8827`](https://github.com/equinor/fusion-framework/commit/0acc8827e5e2df8b5b2aeac5e1a2cd29c4384e78) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/eds-core-react from 0.32.4 to 0.33.0

    -   support for [styled-components@6](https://styled-components.com/releases#v6.0.0)

## 0.2.9

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react-module-bookmark@2.0.20
    -   @equinor/fusion-framework-react@5.3.2

## 0.2.8

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-react@5.3.1
    -   @equinor/fusion-framework-react-module-bookmark@2.0.19

## 0.2.7

### Patch Changes

-   Updated dependencies [[`3896fbec`](https://github.com/equinor/fusion-framework/commit/3896fbec3458dbe2ebd66e772465d5f89cd20658)]:
    -   @equinor/fusion-framework-react@5.3.0
    -   @equinor/fusion-framework-react-module-bookmark@2.0.18

## 0.2.6

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@5.2.7
    -   @equinor/fusion-framework-react-module-bookmark@2.0.17

## 0.2.5

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@5.2.6
    -   @equinor/fusion-framework-react-module-bookmark@2.0.16

## 0.2.4

### Patch Changes

-   [`18b70b98`](https://github.com/equinor/fusion-framework/commit/18b70b98454df296a2a06fa5281ae9b6556d9a67) Thanks [@odinr](https://github.com/odinr)! - test 3

## 0.2.3

### Patch Changes

-   [`c9b5f360`](https://github.com/equinor/fusion-framework/commit/c9b5f3605ff6ffe355eec9b709a5a6c5784355e5) Thanks [@odinr](https://github.com/odinr)! - test 2

## 0.2.2

### Patch Changes

-   [`f7db2499`](https://github.com/equinor/fusion-framework/commit/f7db249937212f876beb87d2941036f7e5f793d4) Thanks [@odinr](https://github.com/odinr)! - test release

## 0.2.1

### Patch Changes

-   [`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594) Thanks [@odinr](https://github.com/odinr)! - fix typo in styled components

-   Updated dependencies []:
    -   @equinor/fusion-framework-react-module-bookmark@2.0.15
    -   @equinor/fusion-framework-react@5.2.5

## 0.2.0

### Minor Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Removed emotion styling

    issues whit conflicting package when using 3x jss frameworks (mui, styled-components, emotion)

    _this might break jss class generation front-end, since classnames changes_

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1129](https://github.com/equinor/fusion-framework/pull/1129) [`f672d0bb`](https://github.com/equinor/fusion-framework/commit/f672d0bba71a7ea6cd08135778fda67ff38f3ac3) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/eds-core-react from 0.30.0 to 0.32.4

-   [#1122](https://github.com/equinor/fusion-framework/pull/1122) [`1a055b21`](https://github.com/equinor/fusion-framework/commit/1a055b21e07f84bc5d35cc891586aa9aa0bdf661) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update styled-components to [^6.0.7](https://github.com/styled-components/styled-components/releases/tag/v6.0.7)

    -   upgraded dev deps of `@equinor/fusion-framework-react-components-bookmark` to react 18, see style-components [changelog](https://github.com/styled-components/styled-components/releases/tag/v6.0.0)
    -   removed `@types/style-components` from `@equinor/fusion-framework-react-components-bookmark`

    see style-components [migration guide](https://styled-components.com/docs/faqs#what-do-i-need-to-do-to-migrate-to-v6)

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-react-module-bookmark@2.0.14
    -   @equinor/fusion-framework-react@5.2.4

## 0.1.16

### Patch Changes

-   [#1047](https://github.com/equinor/fusion-framework/pull/1047) [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @typescript-eslint/eslint-plugin from 5.59.11 to 6.1.0

    only style semantics updated

-   Updated dependencies [[`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c), [`1749da29`](https://github.com/equinor/fusion-framework/commit/1749da290c98c0a43b9fdf2253dfb224e4ccdcd0)]:
    -   @equinor/fusion-framework-react@5.2.3
    -   @equinor/fusion-framework-react-module-bookmark@2.0.13

## 0.1.15

### Patch Changes

-   [#958](https://github.com/equinor/fusion-framework/pull/958) [`e50acbb2`](https://github.com/equinor/fusion-framework/commit/e50acbb28ef10c83cf6e7913fa9f03ed971f0957) Thanks [@odinr](https://github.com/odinr)! - _refactor: only added missing deps for stand alone compile_

## 0.1.14

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 0.1.13

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    -   @equinor/fusion-framework-react-module-bookmark@2.0.12

## 0.1.12

### Patch Changes

-   727fb935: fix(react-module-bookmark): module can be undefined

    the bookmark module might not been enable, which makes the application crash.

    **TODO:**

    -   [ ] create a simpler hook for using bookmark
    -   [ ] create a hook for exposing the module
    -   [ ] create better documentation

-   Updated dependencies [727fb935]
    -   @equinor/fusion-framework-react-module-bookmark@2.0.11

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-components-bookmark@0.1.10...@equinor/fusion-framework-react-components-bookmark@0.1.11) (2023-05-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## [0.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-components-bookmark@0.1.9...@equinor/fusion-framework-react-components-bookmark@0.1.10) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-components-bookmark@0.1.8...@equinor/fusion-framework-react-components-bookmark@0.1.9) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## [0.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-components-bookmark@0.1.7...@equinor/fusion-framework-react-components-bookmark@0.1.8) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## 0.1.7 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-components-bookmark@0.1.5...@equinor/fusion-framework-react-components-bookmark@0.1.6) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-components-bookmark@0.1.4...@equinor/fusion-framework-react-components-bookmark@0.1.5) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-components-bookmark@0.1.3...@equinor/fusion-framework-react-components-bookmark@0.1.4) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## 0.1.3 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-components-bookmark@0.1.1...@equinor/fusion-framework-react-components-bookmark@0.1.2) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-components-bookmark@0.1.0...@equinor/fusion-framework-react-components-bookmark@0.1.1) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-components-bookmark

## 0.1.0 (2023-04-24)

### Features

-   **bookmark-component:** new bookmark component for creating and editing bookmarks initial commit ([bd3bfec](https://github.com/equinor/fusion-framework/commit/bd3bfeca877df6076ca711333d0b96a44504c888))

### Bug Fixes

-   **bookmark-component:** add group by context ([20291f3](https://github.com/equinor/fusion-framework/commit/20291f3cd8284ff5b0eb2db30f9e4040a870ba70))
-   **bookmark-component:** removed comment ([72c7147](https://github.com/equinor/fusion-framework/commit/72c7147609b229fb68576068c0f2944e5e3bbae0))
-   **bookmark-component:** styles update, added loading spinner and update with current view' ([d5e1143](https://github.com/equinor/fusion-framework/commit/d5e1143f125410beb46a462e92591e3f9bbb809d))
-   **bookmark:** fix linting ([17b179f](https://github.com/equinor/fusion-framework/commit/17b179fbb25243730dd65cc116c86471074faabc))
-   pull request feedback fixes ([a0d9aa6](https://github.com/equinor/fusion-framework/commit/a0d9aa69a5ffc4e6da5061df61969d860c4be909))

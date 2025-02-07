# Change Log

## 0.6.2

### Patch Changes

- Updated dependencies [[`0f87836`](https://github.com/equinor/fusion-framework/commit/0f878368780f57df07dc766bc0afb945ca1346ce), [`25dfe68`](https://github.com/equinor/fusion-framework/commit/25dfe68275c4da267cda9a0699dc123e5febc708)]:
    - @equinor/fusion-framework-cli@10.4.1
    - @equinor/fusion-framework-react-app@5.5.4

## 0.6.1

### Patch Changes

- [#2687](https://github.com/equinor/fusion-framework/pull/2687) [`22219ab`](https://github.com/equinor/fusion-framework/commit/22219ab3c07b5578c48a012632fe16d9a823a3bf) Thanks [@odinr](https://github.com/odinr)! - updated cookbook for ag-grid v33

- Updated dependencies [[`22219ab`](https://github.com/equinor/fusion-framework/commit/22219ab3c07b5578c48a012632fe16d9a823a3bf), [`22219ab`](https://github.com/equinor/fusion-framework/commit/22219ab3c07b5578c48a012632fe16d9a823a3bf)]:
    - @equinor/fusion-framework-react-app@5.5.3
    - @equinor/fusion-framework-module-ag-grid@33.0.0

## 0.6.0

### Minor Changes

- [#2532](https://github.com/equinor/fusion-framework/pull/2532) [`850ffee`](https://github.com/equinor/fusion-framework/commit/850ffee7b84aaaf43e63fd3691177c72ec031e7e) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump the ag-grid to 32.3

### Patch Changes

- Updated dependencies [[`850ffee`](https://github.com/equinor/fusion-framework/commit/850ffee7b84aaaf43e63fd3691177c72ec031e7e)]:
    - @equinor/fusion-framework-module-ag-grid@32.3.0

## 0.5.1

### Patch Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Cleaned up app config

    Removed `app.config.*` from the cookbook apps to prevent confusion when using the cookbook apps as a template for new apps.

## 0.5.0

### Minor Changes

- [#2467](https://github.com/equinor/fusion-framework/pull/2467) [`94659b2`](https://github.com/equinor/fusion-framework/commit/94659b2d8b350089841091a88754ca44b488acd2) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated Ag Grid to 32.1.0

### Patch Changes

- Updated dependencies [[`94659b2`](https://github.com/equinor/fusion-framework/commit/94659b2d8b350089841091a88754ca44b488acd2)]:
    - @equinor/fusion-framework-module-ag-grid@32.2.0

## 0.4.1

### Patch Changes

- [#2417](https://github.com/equinor/fusion-framework/pull/2417) [`034e3cc`](https://github.com/equinor/fusion-framework/commit/034e3cc05e9786cd19c0d3a89c92b5b79e3c090d) Thanks [@dependabot](https://github.com/apps/dependabot)! - upgraded @ag-grid-community/styles from 32.0.2 to 32.1.0

- Updated dependencies [[`80cc4e9`](https://github.com/equinor/fusion-framework/commit/80cc4e95a8f2dd8e8aae9752412faefdb457e9e2)]:
    - @equinor/fusion-framework-module-ag-grid@32.1.1

## 0.4.0

### Minor Changes

- [#2377](https://github.com/equinor/fusion-framework/pull/2377) [`401a10c`](https://github.com/equinor/fusion-framework/commit/401a10c2cfc13c73f874a40cf51c0f722ef2f629) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump AG Grid from 32.0.2 to 32.1.0

### Patch Changes

- Updated dependencies [[`401a10c`](https://github.com/equinor/fusion-framework/commit/401a10c2cfc13c73f874a40cf51c0f722ef2f629)]:
    - @equinor/fusion-framework-module-ag-grid@32.1.0

## 0.3.2

### Patch Changes

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

- Updated dependencies [[`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
    - @equinor/fusion-framework-module-ag-grid@32.0.1

## 0.3.1

### Patch Changes

- [#2314](https://github.com/equinor/fusion-framework/pull/2314) [`c416233`](https://github.com/equinor/fusion-framework/commit/c41623333a0f0b2be1bd3567b383f3ee5ca6fdbd) Thanks [@dependabot](https://github.com/apps/dependabot)! - # Upgrading to AG Grid 32 for React

    ## Summary

    AG Grid 32 introduces several new features and improvements for React applications, along with some breaking changes that developers need to be aware of when upgrading.

    ## Key Breaking Changes

    1. **Removal of deprecated APIs**
        - Several deprecated APIs have been removed, including some related to row models, column definitions, and grid options.
    2. **Changes to default behavior**
        - The default for `suppressMenuHide` is now `true`.
        - `applyColumnDefOrder` now defaults to `true`.
    3. **Typing changes**
        - Some TypeScript interfaces have been updated or removed, which may require code adjustments.
    4. **Removal of Internet Explorer 11 support**
        - AG Grid no longer supports Internet Explorer 11.
    5. **Changes to CSS classes**
        - Some CSS classes have been renamed or removed, which may affect custom styling.
    6. **Adjustments to event parameters**
        - Certain events now have different parameter structures.
    7. **Modifications to API methods**
        - Some API methods have been changed or removed.

    When upgrading to AG Grid 32, it's important to review the [full changelog](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-32/?ref=blog.ag-grid.com) and test your application thoroughly to ensure compatibility with the new version.
    The AG Grid team provides codemods to assist with some of the migration tasks, which can help automate parts of the upgrade process.

- Updated dependencies [[`c416233`](https://github.com/equinor/fusion-framework/commit/c41623333a0f0b2be1bd3567b383f3ee5ca6fdbd)]:
    - @equinor/fusion-framework-module-ag-grid@32.0.0

## 0.3.0

### Minor Changes

- [#2240](https://github.com/equinor/fusion-framework/pull/2240) [`211be8f`](https://github.com/equinor/fusion-framework/commit/211be8f24265725cc37b3b067109f6d99827ae7e) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Update cookbook with new look and latest AgGrid version

### Patch Changes

- [#2247](https://github.com/equinor/fusion-framework/pull/2247) [`1b11082`](https://github.com/equinor/fusion-framework/commit/1b1108256c7a0d4c9d69bb813c22e9c4c673b2c3) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Add code comment

## 0.2.3

### Patch Changes

- [#2207](https://github.com/equinor/fusion-framework/pull/2207) [`cc6b519`](https://github.com/equinor/fusion-framework/commit/cc6b519df0903c570e7ed2f4af9b8e5cf8d1fc7d) Thanks [@odinr](https://github.com/odinr)! - **@equinor/fusion-framework-module-ag-grid**

    Updated ag-grid dependencies to latest minor versions:

    - `@ag-grid-community/client-side-row-model` from `~31.2.0` to `~31.3.2`
    - `@ag-grid-community/core` from `~31.2.0` to `~31.3.2`
    - `@ag-grid-community/react` from `~31.2.0` to `~31.3.2`

- Updated dependencies [[`cc6b519`](https://github.com/equinor/fusion-framework/commit/cc6b519df0903c570e7ed2f4af9b8e5cf8d1fc7d)]:
    - @equinor/fusion-framework-module-ag-grid@31.3.0

## 0.2.2

### Patch Changes

- [#2182](https://github.com/equinor/fusion-framework/pull/2182) [`13d1ae4`](https://github.com/equinor/fusion-framework/commit/13d1ae4cf2147cd2a4527bad2a7023b4ac4b9bbb) Thanks [@odinr](https://github.com/odinr)! - updated all cookbooks to use `workspace:^` as a dependency version.

- Updated dependencies []:
    - @equinor/fusion-framework-module-ag-grid@31.2.1

## 0.2.1

### Patch Changes

- [#2037](https://github.com/equinor/fusion-framework/pull/2037) [`20d929f`](https://github.com/equinor/fusion-framework/commit/20d929f87e6b68e1d1df0de114dd46583502a871) Thanks [@odinr](https://github.com/odinr)! - updated @ag-grid-enterprise/core to 31.2.0

- Updated dependencies [[`20d929f`](https://github.com/equinor/fusion-framework/commit/20d929f87e6b68e1d1df0de114dd46583502a871)]:
    - @equinor/fusion-framework-module-ag-grid@31.2.1

## 0.2.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
    - @equinor/fusion-framework-module-ag-grid@31.2.0

## 0.1.6

### Patch Changes

- [#1885](https://github.com/equinor/fusion-framework/pull/1885) [`d6dbb5f`](https://github.com/equinor/fusion-framework/commit/d6dbb5fdeb683c64131de16fa79f3e714a7f552b) Thanks [@odinr](https://github.com/odinr)! - bumped ag-grid from 31.0.3 to 31.1.1

- Updated dependencies [[`d6dbb5f`](https://github.com/equinor/fusion-framework/commit/d6dbb5fdeb683c64131de16fa79f3e714a7f552b)]:
    - @equinor/fusion-framework-module-ag-grid@31.1.0

## 0.1.5

### Patch Changes

- [#1650](https://github.com/equinor/fusion-framework/pull/1650) [`36d18d5`](https://github.com/equinor/fusion-framework/commit/36d18d5779bcbe2f7b1c1c418cc28482632fdb18) Thanks [@odinr](https://github.com/odinr)! - update ag-grid to 31.0.1

- Updated dependencies [[`36d18d5`](https://github.com/equinor/fusion-framework/commit/36d18d5779bcbe2f7b1c1c418cc28482632fdb18)]:
    - @equinor/fusion-framework-module-ag-grid@31.0.1

## 0.1.4

### Patch Changes

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    - @equinor/fusion-framework-module-ag-grid@30.2.1

## 0.1.3

### Patch Changes

- [#1389](https://github.com/equinor/fusion-framework/pull/1389) [`7bf396c4`](https://github.com/equinor/fusion-framework/commit/7bf396c4803f2045777329520fa88752406e1b32) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/fusion-react-ag-grid-styles from 29.3.16 to 30.0.0

## 0.1.2

### Patch Changes

- [#1357](https://github.com/equinor/fusion-framework/pull/1357) [`17cfe9bb`](https://github.com/equinor/fusion-framework/commit/17cfe9bb86acd996a99c93ff0b8a8da6151a3f8f) Thanks [@odinr](https://github.com/odinr)! - update ag-grid cookbook

## 0.1.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

## 0.1.0

### Minor Changes

- [#1225](https://github.com/equinor/fusion-framework/pull/1225) [`31a4b06a`](https://github.com/equinor/fusion-framework/commit/31a4b06afcbb76b0a7584724a5bc061a3e2d98b3) Thanks [@odinr](https://github.com/odinr)! - updated ag-grid to 30.1

    see [ag-grid changelog](https://github.com/ag-grid/ag-grid/releases/tag/v30.1.0)

    see [📚doc](https://equinor.github.io/fusion-framework/modules/ag-grid/)

### Patch Changes

- Updated dependencies [[`31a4b06a`](https://github.com/equinor/fusion-framework/commit/31a4b06afcbb76b0a7584724a5bc061a3e2d98b3)]:
    - @equinor/fusion-framework-module-ag-grid@30.1.0

## 0.0.3

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

    only dev deps updated should not affect any consumers

    see [react changelog](https://github.com/facebook/react/releases) for details

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862)]:
    - @equinor/fusion-framework-module-ag-grid@30.0.1

## 0.0.2

### Patch Changes

- [#1060](https://github.com/equinor/fusion-framework/pull/1060) [`3a2c3107`](https://github.com/equinor/fusion-framework/commit/3a2c3107b436c1eef7bc03c8225c32d40ed27e74) Thanks [@odinr](https://github.com/odinr)! - chore: update ag-grid to ~30.0

- Updated dependencies [[`3a2c3107`](https://github.com/equinor/fusion-framework/commit/3a2c3107b436c1eef7bc03c8225c32d40ed27e74)]:
    - @equinor/fusion-framework-module-ag-grid@30.0.0

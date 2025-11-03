# Change Log

## 4.5.17-next.1

### Patch Changes

- [`895a49a`](https://github.com/equinor/fusion-framework/commit/895a49aaa815a6cd317e60f40875b1763bd6bded) Thanks [@odinr](https://github.com/odinr)! - relase next of all packages

- Updated dependencies [[`895a49a`](https://github.com/equinor/fusion-framework/commit/895a49aaa815a6cd317e60f40875b1763bd6bded)]:
  - @equinor/fusion-framework-module-navigation@6.0.1-next.0

## 4.5.17-next.0

### Patch Changes

- [#3693](https://github.com/equinor/fusion-framework/pull/3693) [`995dc50`](https://github.com/equinor/fusion-framework/commit/995dc5059fc8fa5121630b3d10a0d7ea833947e2) Thanks [@github-actions](https://github.com/apps/github-actions)! - Improved all cookbook README documentation for better developer experience.

  All cookbook README files now feature:

  - Code examples matching actual implementations
  - Inline comments explaining patterns and concepts
  - Developer-friendly language for those new to Fusion Framework
  - Focus on what each cookbook demonstrates rather than generic setup
  - Proper TSDoc comments in code blocks
  - Removed installation sections in favor of teaching patterns

  This improves the learning experience for developers exploring framework features through the 18 available cookbooks.

## 4.5.16

### Patch Changes

- [#3542](https://github.com/equinor/fusion-framework/pull/3542) [`2d4fd18`](https://github.com/equinor/fusion-framework/commit/2d4fd18394e8545b4616140a93a369d5ae77ccbc) Thanks [@eikeland](https://github.com/eikeland)! - Updated person component dependencies for improved functionality and bug fixes.

  - Updated `@equinor/fusion-react-person` from `^0.10.3` to `^0.10.10` in app-react-people cookbook
  - Updated `@equinor/fusion-wc-person` from `^3.1.8` to `^3.2.4` in dev-portal and people-resolver packages

## 4.5.15

### Patch Changes

- [#3400](https://github.com/equinor/fusion-framework/pull/3400) [`aed6c53`](https://github.com/equinor/fusion-framework/commit/aed6c5385df496a86d06dc0af9dacafc255ea605) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/eds-core-react from 0.45.1 to 0.49.0

  ### New Features

  - ✨ Always show "add new option" in Autocomplete when onAddNewOption is provided
  - ✨ Tabs call onChange with provided value if present
  - ✨ Add disabled prop to Tooltip
  - ✨ Autocomplete allow option-label prop to be used without type of object
  - ✨ Add support for adding new options in Autocomplete

  ### Bug Fixes

  - 🐛 Autocomplete - Don't call onOptionsChange when clicking "Add new"
  - 🐛 Table - Fix Firefox table header wrapping issue
  - 🐛 Tabs documentation type mismatch - update onChange parameter from number to number | string
  - 🐛 DatePicker Disable back button in year range based on year, not month
  - 🐛 Tabs now allow 'null' value as child element 'Tabs.List' and 'Tabs.Panel'
  - 🐛 Autocomplete prevent onAddNewOption from being called twice in Strict Mode
  - 🐛 Table export table row with pascal case
  - 🐛 Autocomplete: Improvements to placeholder text
  - 🐛 Menu: Ensure onClose is called when a MenuItem without onClick is clicked

  ### Links

  - [GitHub releases](https://github.com/equinor/design-system/releases/tag/eds-core-react%400.49.0)
  - [npm changelog](https://www.npmjs.com/package/@equinor/eds-core-react?activeTab=versions)

- [#3366](https://github.com/equinor/fusion-framework/pull/3366) [`daa362e`](https://github.com/equinor/fusion-framework/commit/daa362e7d92ad362e46d666c434d0f09687abad5) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update @equinor/eds-core-react from 0.48.0 to 0.49.0

  ### Changes

  - Updated @equinor/eds-core-react dependency to latest version across all packages
  - Fixed peerDependencies version mismatch in bookmark package
  - Includes bug fixes for Autocomplete and Table components
  - Adds new Autocomplete features for "add new option" functionality

  ### Affected Packages

  - packages/dev-portal
  - packages/react/components/bookmark
  - cookbooks/app-react-feature-flag
  - cookbooks/app-react-people

  ### Links

  - [GitHub releases](https://github.com/equinor/design-system/releases)
  - [Full Changelog](https://github.com/equinor/design-system/compare/eds-core-react@0.48.0...eds-core-react@0.49.0)

## 4.5.14

### Patch Changes

- [#3298](https://github.com/equinor/fusion-framework/pull/3298) [`6480bf1`](https://github.com/equinor/fusion-framework/commit/6480bf197db9428fed80299c235f0608db0ca6a3) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump @equinor/eds-core-react from 0.43.0 to 0.48.0

## 4.5.13

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-navigation@6.0.0

## 4.5.12

### Patch Changes

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-navigation@5.0.3

## 4.5.11

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module-navigation@5.0.2

## 4.5.10

### Patch Changes

- Updated dependencies [[`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module-navigation@5.0.1

## 4.5.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-navigation@5.0.0

## 4.5.8

### Patch Changes

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module-navigation@4.0.10

## 4.5.7

### Patch Changes

- [#2969](https://github.com/equinor/fusion-framework/pull/2969) [`cf67e87`](https://github.com/equinor/fusion-framework/commit/cf67e87c0bf83230fa77ff7a66254cd615675c34) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/eds-core-react from 0.43.0 to 0.45.0

## 4.5.6

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- [#2890](https://github.com/equinor/fusion-framework/pull/2890) [`1ad39f5`](https://github.com/equinor/fusion-framework/commit/1ad39f509a33627f2ad877a4125386a80ab8f510) Thanks [@odinr](https://github.com/odinr)! - refactor: adhere to self-closing tags for components

  - Updated `SelectorPage.tsx` to use self-closing tags for `PersonSelect` components.
  - Updated `Header.Actions.tsx` to use self-closing tags for `fwc-person-avatar` component.
  - Updated `FeatureSheetContent.tsx` to use self-closing tags for `Icon` and `Divider` components.

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237)]:
  - @equinor/fusion-framework-module-navigation@4.0.9

## 4.5.5

### Patch Changes

- [#2877](https://github.com/equinor/fusion-framework/pull/2877) [`b547618`](https://github.com/equinor/fusion-framework/commit/b547618f2dfbebc350f4285c36ab481f591c0c5c) Thanks [@odinr](https://github.com/odinr)! - update fusion react and web components

## 4.5.4

### Patch Changes

- [#2855](https://github.com/equinor/fusion-framework/pull/2855) [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1) Thanks [@odinr](https://github.com/odinr)! - fixed `useExhaustiveDependencies`

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`68b180c`](https://github.com/equinor/fusion-framework/commit/68b180c687ad1939d4f3df185c634f5046a55f63), [`1953dd2`](https://github.com/equinor/fusion-framework/commit/1953dd217d85fa4880856b2c97b6305fcbaf2e24), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module-navigation@4.0.8

## 4.5.3

### Patch Changes

- [#2690](https://github.com/equinor/fusion-framework/pull/2690) [`809bee0`](https://github.com/equinor/fusion-framework/commit/809bee089d5d84799a3834294ca02937eaa46a0e) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/eds-icons from 0.21.0 to 0.22.0

## 4.5.2

### Patch Changes

- [#2542](https://github.com/equinor/fusion-framework/pull/2542) [`29565b8`](https://github.com/equinor/fusion-framework/commit/29565b80d1fd2287a91009e3315da852665886ec) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump @equinor/fusion-wc-person from 3.0.1 to 3.0.3

## 4.5.1

### Patch Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Cleaned up app config

  Removed `app.config.*` from the cookbook apps to prevent confusion when using the cookbook apps as a template for new apps.

## 4.5.0

### Minor Changes

- [#2465](https://github.com/equinor/fusion-framework/pull/2465) [`eb11a19`](https://github.com/equinor/fusion-framework/commit/eb11a1952cfa5a1ec8ca40d8f53303ff7c675cbe) Thanks [@dependabot](https://github.com/apps/dependabot)! - updated @equinor/eds-core-react to 0.42.0

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-navigation@4.0.7

## 4.4.4

### Patch Changes

- Updated dependencies [[`80cc4e9`](https://github.com/equinor/fusion-framework/commit/80cc4e95a8f2dd8e8aae9752412faefdb457e9e2)]:
  - @equinor/fusion-framework-module-navigation@4.0.6

## 4.4.3

### Patch Changes

- [#2403](https://github.com/equinor/fusion-framework/pull/2403) [`67ea61d`](https://github.com/equinor/fusion-framework/commit/67ea61dad8f50e8b8b977008b26374c2f982eb4d) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump @equinor/eds-core-react from 0.40.1 to 0.41.2

  [see EDS changelog](https://github.com/equinor/design-system/blob/develop/packages/eds-core-react/CHANGELOG.md)

- Updated dependencies []:
  - @equinor/fusion-framework-module-navigation@4.0.5

## 4.4.2

### Patch Changes

- [#2389](https://github.com/equinor/fusion-framework/pull/2389) [`a3543e3`](https://github.com/equinor/fusion-framework/commit/a3543e31353c9eac25140842643cb8e27e9b187e) Thanks [@eikeland](https://github.com/eikeland)! - Updating fusion(react|wc)-person to fix issues with clearing component

- [#2350](https://github.com/equinor/fusion-framework/pull/2350) [`960ca34`](https://github.com/equinor/fusion-framework/commit/960ca34cae26f386e28c16bac00e7932f4f9199a) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/eds-core-react from 0.38.0 to 0.40.1

- Updated dependencies [[`1a215c4`](https://github.com/equinor/fusion-framework/commit/1a215c45c97d2dfdc8127dc752ec21951bb048be)]:
  - @equinor/fusion-framework-module-navigation@4.0.4

## 4.4.1

### Patch Changes

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

- Updated dependencies [[`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
  - @equinor/fusion-framework-module-navigation@4.0.3

## 4.4.0

### Minor Changes

- [#2197](https://github.com/equinor/fusion-framework/pull/2197) [`5426b23`](https://github.com/equinor/fusion-framework/commit/5426b232656ce7a87517fae61e50bb43743e6372) Thanks [@odinr](https://github.com/odinr)! - - Added documentation and examples for using components from the `@equinor/fusion-react-person` package.

  - Implemented a `useSearchPersons` hook to search for persons using the People API.
  - Added a `searchPerson` function to perform person searches with an HTTP client.
  - Created new types for the person search API response and error handling.
  - Updated the `HomePage` component with an overview of working with the People API.
  - Enhanced the `ListItemPage` component to fetch and display a list of persons based on a search query.

  The `@equinor/fusion-framework-cookbook-app-react-people` package lacked documentation and examples for consuming the `@equinor/fusion-react-person` components. The changes aim to provide clear guidance and showcase how to interact with the People API to fetch and display person information.

  By adding the `useSearchPersons` hook and `searchPerson` function, developers how to implement functionality to their applications. The new types for the API response and error handling improve type safety and provide a structured way to handle different error scenarios.

  The updates to the `HomePage` and `ListItemPage` components demonstrate practical usage of the People API and components, making it easier for developers to understand and implement similar functionality in their own applications.

### Patch Changes

- [#2205](https://github.com/equinor/fusion-framework/pull/2205) [`4e64552`](https://github.com/equinor/fusion-framework/commit/4e64552a3c1b0324e1deda93779eab16dbebbed3) Thanks [@odinr](https://github.com/odinr)! - Updated `@equinor/eds-core-react` dependency to version `^0.38.0`
  Updated `@equinor/eds-utils` dependency to version `^0.8.5`

## 4.3.4

### Patch Changes

- [#2182](https://github.com/equinor/fusion-framework/pull/2182) [`13d1ae4`](https://github.com/equinor/fusion-framework/commit/13d1ae4cf2147cd2a4527bad2a7023b4ac4b9bbb) Thanks [@odinr](https://github.com/odinr)! - updated all cookbooks to use `workspace:^` as a dependency version.

- Updated dependencies []:
  - @equinor/fusion-framework-module-navigation@4.0.2

## 4.3.3

### Patch Changes

- [#2135](https://github.com/equinor/fusion-framework/pull/2135) [`3cd63d5`](https://github.com/equinor/fusion-framework/commit/3cd63d58e4e3ffd15bccdebaa94b391e3e3d12f0) Thanks [@odinr](https://github.com/odinr)! - Updated the React people cookbook to handle content height correctly in the dev portal

  The React people cookbook previously had an issue where the content height was not calculated correctly when running in the dev portal environment. This changeset fixes that issue by adjusting the height calculation logic to work properly in the dev portal.

## 4.3.2

### Patch Changes

- [#2098](https://github.com/equinor/fusion-framework/pull/2098) [`5093391`](https://github.com/equinor/fusion-framework/commit/5093391eabda84873041ee89632f26770734b03c) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump @equinor/eds-core-react from 0.36.1 to 0.37.0

- Updated dependencies [[`0f95a74`](https://github.com/equinor/fusion-framework/commit/0f95a74b78cb5e86bc14c4a0f1f1715415746ef5)]:
  - @equinor/fusion-framework-module-navigation@4.0.1

## 4.3.1

### Patch Changes

- [#2050](https://github.com/equinor/fusion-framework/pull/2050) [`1cf4003`](https://github.com/equinor/fusion-framework/commit/1cf400389d8d15afbacdc33789130e268c492a0c) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Person component update

## 4.3.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module-navigation@4.0.0

## 4.2.2

### Patch Changes

- [#1926](https://github.com/equinor/fusion-framework/pull/1926) [`6f3315a`](https://github.com/equinor/fusion-framework/commit/6f3315a83ea43d5355a5d95c1e9e4caf6f6b7c72) Thanks [@eikeland](https://github.com/eikeland)! - Updating fusion-react-person component

## 4.2.1

### Patch Changes

- [#1902](https://github.com/equinor/fusion-framework/pull/1902) [`06d3739`](https://github.com/equinor/fusion-framework/commit/06d373990b481bcae361cfa4fa8a905b4256c7d8) Thanks [@eikeland](https://github.com/eikeland)! - Updates cli dep fwc-person and improve people cookbook

## 4.2.0

### Minor Changes

- [#1827](https://github.com/equinor/fusion-framework/pull/1827) [`91a5782`](https://github.com/equinor/fusion-framework/commit/91a5782d22b25c562a1c65cc702bee1c96b97737) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update @equinor/fusion-react-person to 0.7.0 and @equinor/fusion-wc-person to 2.4.0

## 4.1.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-navigation@3.1.4

## 4.1.6

### Patch Changes

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module-navigation@3.1.3

## 4.1.5

### Patch Changes

- Updated dependencies [[`a8f0f061`](https://github.com/equinor/fusion-framework/commit/a8f0f061dbde9efb3e2faf11fdb9c886d2277723)]:
  - @equinor/fusion-framework-module-navigation@3.1.2

## 4.1.4

### Patch Changes

- Updated dependencies [[`e2ec89f4`](https://github.com/equinor/fusion-framework/commit/e2ec89f457135037e2a333a61ba546fee6d99cd8)]:
  - @equinor/fusion-framework-module-navigation@3.1.1

## 4.1.3

### Patch Changes

- Updated dependencies [[`6f542d4c`](https://github.com/equinor/fusion-framework/commit/6f542d4c7c01ae94c28b7e82efba800a902a7633)]:
  - @equinor/fusion-framework-module-navigation@3.1.0

## 4.1.2

### Patch Changes

- [#1393](https://github.com/equinor/fusion-framework/pull/1393) [`f049479b`](https://github.com/equinor/fusion-framework/commit/f049479bfb51369a227eb432089d0da20be86529) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/fusion-react-person from 0.5.1 to 0.6.0

## 4.1.1

### Patch Changes

- [#1375](https://github.com/equinor/fusion-framework/pull/1375) [`f50ea5da`](https://github.com/equinor/fusion-framework/commit/f50ea5dab449ce7a5e3071f65fac4e800a619eec) Thanks [@odinr](https://github.com/odinr)! - update people deps

## 4.1.0

### Minor Changes

- [#1335](https://github.com/equinor/fusion-framework/pull/1335) [`5bad9c87`](https://github.com/equinor/fusion-framework/commit/5bad9c87d6ab6d0a9a518ba7525f3eb5b659a9c0) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - add cookbooks and documentation for people react components

## 4.0.23

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

## 4.0.22

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

## 4.0.21

### Patch Changes

- [#955](https://github.com/equinor/fusion-framework/pull/955) [`b0310b3b`](https://github.com/equinor/fusion-framework/commit/b0310b3b3668f72bdc973e5fee50118dbe17823f) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Remove leading `/` in package's main property for the cookbooks.

## 4.0.20

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 4.0.19

### Patch Changes

- [#943](https://github.com/equinor/fusion-framework/pull/943) [`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a) Thanks [@odinr](https://github.com/odinr)! - **add build script**
  this is not required, but nice to know that cookbooks builds...

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.17...@equinor/fusion-framework-cookbook-app-react-people@4.0.18) (2023-05-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.16...@equinor/fusion-framework-cookbook-app-react-people@4.0.17) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.15...@equinor/fusion-framework-cookbook-app-react-people@4.0.16) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.14...@equinor/fusion-framework-cookbook-app-react-people@4.0.15) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 4.0.14 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.12...@equinor/fusion-framework-cookbook-app-react-people@4.0.13) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.11...@equinor/fusion-framework-cookbook-app-react-people@4.0.12) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.10...@equinor/fusion-framework-cookbook-app-react-people@4.0.11) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.9...@equinor/fusion-framework-cookbook-app-react-people@4.0.10) (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.8...@equinor/fusion-framework-cookbook-app-react-people@4.0.9) (2023-05-09)

### Bug Fixes

- **cookbooks:** remove strict mode as it is not needed for React 18 ([eda33e4](https://github.com/equinor/fusion-framework/commit/eda33e4d0e6c67e3da964599167a9db6e1eadf0a))

## 4.0.8 (2023-05-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.6...@equinor/fusion-framework-cookbook-app-react-people@4.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.5...@equinor/fusion-framework-cookbook-app-react-people@4.0.6) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 4.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 4.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.2...@equinor/fusion-framework-cookbook-app-react-people@4.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.1...@equinor/fusion-framework-cookbook-app-react-people@4.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@4.0.0...@equinor/fusion-framework-cookbook-app-react-people@4.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.29...@equinor/fusion-framework-cookbook-app-react-people@4.0.0) (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.28...@equinor/fusion-framework-cookbook-app-react-people@3.0.29) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.25...@equinor/fusion-framework-cookbook-app-react-people@3.0.28) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.25...@equinor/fusion-framework-cookbook-app-react-people@3.0.27) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.25...@equinor/fusion-framework-cookbook-app-react-people@3.0.26) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.24...@equinor/fusion-framework-cookbook-app-react-people@3.0.25) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.23...@equinor/fusion-framework-cookbook-app-react-people@3.0.24) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.22...@equinor/fusion-framework-cookbook-app-react-people@3.0.23) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.21...@equinor/fusion-framework-cookbook-app-react-people@3.0.22) (2023-04-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.20...@equinor/fusion-framework-cookbook-app-react-people@3.0.21) (2023-03-31)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.18...@equinor/fusion-framework-cookbook-app-react-people@3.0.20) (2023-03-31)

### Bug Fixes

- **coockbooks:** pre-fixing package name with forward slash in package.json ([671785d](https://github.com/equinor/fusion-framework/commit/671785de0283b01c0852fe23d1231d30d295f4ec))

## [3.0.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.18...@equinor/fusion-framework-cookbook-app-react-people@3.0.19) (2023-03-31)

### Bug Fixes

- **coockbooks:** pre-fixing package name with forward slash in package.json ([671785d](https://github.com/equinor/fusion-framework/commit/671785de0283b01c0852fe23d1231d30d295f4ec))

## [3.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.17...@equinor/fusion-framework-cookbook-app-react-people@3.0.18) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.16...@equinor/fusion-framework-cookbook-app-react-people@3.0.17) (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.15...@equinor/fusion-framework-cookbook-app-react-people@3.0.16) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.14...@equinor/fusion-framework-cookbook-app-react-people@3.0.15) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.13...@equinor/fusion-framework-cookbook-app-react-people@3.0.14) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 3.0.13 (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 3.0.12 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.10...@equinor/fusion-framework-cookbook-app-react-people@3.0.11) (2023-03-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.9...@equinor/fusion-framework-cookbook-app-react-people@3.0.10) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.8...@equinor/fusion-framework-cookbook-app-react-people@3.0.9) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.7...@equinor/fusion-framework-cookbook-app-react-people@3.0.8) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.7...@equinor/fusion-framework-cookbook-app-react-people@3.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.6...@equinor/fusion-framework-cookbook-app-react-people@3.0.7) (2023-03-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.5...@equinor/fusion-framework-cookbook-app-react-people@3.0.6) (2023-03-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 3.0.5 (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.3...@equinor/fusion-framework-cookbook-app-react-people@3.0.4) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.2...@equinor/fusion-framework-cookbook-app-react-people@3.0.3) (2023-03-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.1...@equinor/fusion-framework-cookbook-app-react-people@3.0.2) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@3.0.0...@equinor/fusion-framework-cookbook-app-react-people@3.0.1) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.13...@equinor/fusion-framework-cookbook-app-react-people@3.0.0) (2023-02-13)

### ⚠ BREAKING CHANGES

- **utils/observable:** `useObservableInputState` and `useObservableSelectorState` now return full state, not only value

### Bug Fixes

- **utils/observable:** rename `next` to `value`from `useObservableState` ([4a08445](https://github.com/equinor/fusion-framework/commit/4a08445645af2488666564c2da716d32aa5e88c0))

## [2.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.11...@equinor/fusion-framework-cookbook-app-react-people@2.0.13) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.11...@equinor/fusion-framework-cookbook-app-react-people@2.0.12) (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 2.0.11 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.9...@equinor/fusion-framework-cookbook-app-react-people@2.0.10) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.7...@equinor/fusion-framework-cookbook-app-react-people@2.0.9) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.7...@equinor/fusion-framework-cookbook-app-react-people@2.0.8) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.6...@equinor/fusion-framework-cookbook-app-react-people@2.0.7) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.5...@equinor/fusion-framework-cookbook-app-react-people@2.0.6) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.4...@equinor/fusion-framework-cookbook-app-react-people@2.0.5) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.3...@equinor/fusion-framework-cookbook-app-react-people@2.0.4) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.2...@equinor/fusion-framework-cookbook-app-react-people@2.0.3) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@2.0.1...@equinor/fusion-framework-cookbook-app-react-people@2.0.2) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 2.0.1 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.39...@equinor/fusion-framework-cookbook-app-react-people@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.39...@equinor/fusion-framework-cookbook-app-react-people@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.39](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.38...@equinor/fusion-framework-cookbook-app-react-people@1.1.39) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 1.1.38 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.37](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.36...@equinor/fusion-framework-cookbook-app-react-people@1.1.37) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.36](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.35...@equinor/fusion-framework-cookbook-app-react-people@1.1.36) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 1.1.35 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.34](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.33...@equinor/fusion-framework-cookbook-app-react-people@1.1.34) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.33](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.32...@equinor/fusion-framework-cookbook-app-react-people@1.1.33) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 1.1.32 (2023-01-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.31](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.30...@equinor/fusion-framework-cookbook-app-react-people@1.1.31) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.30](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.29...@equinor/fusion-framework-cookbook-app-react-people@1.1.30) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.28...@equinor/fusion-framework-cookbook-app-react-people@1.1.29) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.27...@equinor/fusion-framework-cookbook-app-react-people@1.1.28) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.26...@equinor/fusion-framework-cookbook-app-react-people@1.1.27) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.25...@equinor/fusion-framework-cookbook-app-react-people@1.1.26) (2022-12-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.24...@equinor/fusion-framework-cookbook-app-react-people@1.1.25) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.23...@equinor/fusion-framework-cookbook-app-react-people@1.1.24) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.22...@equinor/fusion-framework-cookbook-app-react-people@1.1.23) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.21...@equinor/fusion-framework-cookbook-app-react-people@1.1.22) (2022-12-19)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.20...@equinor/fusion-framework-cookbook-app-react-people@1.1.21) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.19...@equinor/fusion-framework-cookbook-app-react-people@1.1.20) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.18...@equinor/fusion-framework-cookbook-app-react-people@1.1.19) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.17...@equinor/fusion-framework-cookbook-app-react-people@1.1.18) (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.16...@equinor/fusion-framework-cookbook-app-react-people@1.1.17) (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.15...@equinor/fusion-framework-cookbook-app-react-people@1.1.16) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.14...@equinor/fusion-framework-cookbook-app-react-people@1.1.15) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.13...@equinor/fusion-framework-cookbook-app-react-people@1.1.14) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.12...@equinor/fusion-framework-cookbook-app-react-people@1.1.13) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.11...@equinor/fusion-framework-cookbook-app-react-people@1.1.12) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.10...@equinor/fusion-framework-cookbook-app-react-people@1.1.11) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.9...@equinor/fusion-framework-cookbook-app-react-people@1.1.10) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.8...@equinor/fusion-framework-cookbook-app-react-people@1.1.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.7...@equinor/fusion-framework-cookbook-app-react-people@1.1.8) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.6...@equinor/fusion-framework-cookbook-app-react-people@1.1.7) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.5...@equinor/fusion-framework-cookbook-app-react-people@1.1.6) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.4...@equinor/fusion-framework-cookbook-app-react-people@1.1.5) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.3...@equinor/fusion-framework-cookbook-app-react-people@1.1.4) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.2...@equinor/fusion-framework-cookbook-app-react-people@1.1.3) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.1...@equinor/fusion-framework-cookbook-app-react-people@1.1.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-people@1.1.0...@equinor/fusion-framework-cookbook-app-react-people@1.1.1) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-people

## 1.1.0 (2022-12-05)

### Features

- **cookbook:** create a app for searching for people ([4580ebc](https://github.com/equinor/fusion-framework/commit/4580ebc1a71c834420dba38f8e2d621129887790))

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.25...@equinor/fusion-framework-cookbook-app-react@2.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.25...@equinor/fusion-framework-cookbook-app-react@2.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.24...@equinor/fusion-framework-cookbook-app-react@1.3.25) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.23...@equinor/fusion-framework-cookbook-app-react@1.3.24) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.22...@equinor/fusion-framework-cookbook-app-react@1.3.23) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.21...@equinor/fusion-framework-cookbook-app-react@1.3.22) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.20...@equinor/fusion-framework-cookbook-app-react@1.3.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.19...@equinor/fusion-framework-cookbook-app-react@1.3.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.18...@equinor/fusion-framework-cookbook-app-react@1.3.19) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.17...@equinor/fusion-framework-cookbook-app-react@1.3.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.16...@equinor/fusion-framework-cookbook-app-react@1.3.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.15...@equinor/fusion-framework-cookbook-app-react@1.3.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.14...@equinor/fusion-framework-cookbook-app-react@1.3.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.13...@equinor/fusion-framework-cookbook-app-react@1.3.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.12...@equinor/fusion-framework-cookbook-app-react@1.3.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.11...@equinor/fusion-framework-cookbook-app-react@1.3.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.10...@equinor/fusion-framework-cookbook-app-react@1.3.11) (2022-11-23)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.9...@equinor/fusion-framework-cookbook-app-react@1.3.10) (2022-11-23)

### Bug Fixes

- **cookbooks:** update render initialize ([dedcfea](https://github.com/equinor/fusion-framework/commit/dedcfea1099adf380cc84418feb899dfe53fcd92))

## [1.3.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.8...@equinor/fusion-framework-cookbook-app-react@1.3.9) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.7...@equinor/fusion-framework-cookbook-app-react@1.3.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.6...@equinor/fusion-framework-cookbook-app-react@1.3.7) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.5...@equinor/fusion-framework-cookbook-app-react@1.3.6) (2022-11-18)

### Bug Fixes

- **cookbooks:** update cookbooks ([bd4c1a7](https://github.com/equinor/fusion-framework/commit/bd4c1a792ccdbae8415b0d8d83ff9bf77071f931))

## [1.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.4...@equinor/fusion-framework-cookbook-app-react@1.3.5) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.3...@equinor/fusion-framework-cookbook-app-react@1.3.4) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.2...@equinor/fusion-framework-cookbook-app-react@1.3.3) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.1...@equinor/fusion-framework-cookbook-app-react@1.3.2) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.0...@equinor/fusion-framework-cookbook-app-react@1.3.1) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.2.4...@equinor/fusion-framework-cookbook-app-react@1.3.0) (2022-11-14)

### Features

- **cookbook:** add sample config file ([0c3a4f6](https://github.com/equinor/fusion-framework/commit/0c3a4f64da505775974a0483769864ef032bb03a))

## 1.2.4 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.2.2...@equinor/fusion-framework-cookbook-app-react@1.2.3) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.2.1...@equinor/fusion-framework-cookbook-app-react@1.2.2) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.2.0...@equinor/fusion-framework-cookbook-app-react@1.2.1) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.1.2...@equinor/fusion-framework-cookbook-app-react@1.2.0) (2022-11-11)

### Features

- **cookbook:** add docker image ([2a51535](https://github.com/equinor/fusion-framework/commit/2a515350bd193fc789f9726eb1528b29ad2d7dbd))

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.1.1...@equinor/fusion-framework-cookbook-app-react@1.1.2) (2022-11-07)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.1.0...@equinor/fusion-framework-cookbook-app-react@1.1.1) (2022-11-07)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 1.1.0 (2022-11-07)

### Features

- **cookbook:** create initial app ([64682fa](https://github.com/equinor/fusion-framework/commit/64682fabd4f17f3d2df51e0d829f73fb2a85b90a))

### Bug Fixes

- **cookbook:** remove build ([dc4d9ae](https://github.com/equinor/fusion-framework/commit/dc4d9aeb3506c844e212f06ec7452c719598ff38))

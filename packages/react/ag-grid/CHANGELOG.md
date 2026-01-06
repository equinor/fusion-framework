# @equinor/fusion-framework-react-ag-grid

## 34.2.4-cli-search-index.1

### Patch Changes

- [#3757](https://github.com/equinor/fusion-framework/pull/3757) [`fd26636`](https://github.com/equinor/fusion-framework/commit/fd266363fc6d0445733b16a9e25b303ec6fe4a50) Thanks [@odinr](https://github.com/odinr)! - preview before pr

- Updated dependencies [[`fd26636`](https://github.com/equinor/fusion-framework/commit/fd266363fc6d0445733b16a9e25b303ec6fe4a50)]:
  - @equinor/fusion-framework-react-module@3.1.14-cli-search-index.1
  - @equinor/fusion-framework-module-ag-grid@34.2.3-cli-search-index.1

## 34.4.0

### Minor Changes

- [#3816](https://github.com/equinor/fusion-framework/pull/3816) [`7c57951`](https://github.com/equinor/fusion-framework/commit/7c57951c57763f567a1284e81f903dd892a023ed) Thanks [@odinr](https://github.com/odinr)! - Add new `./charts` export path for AG Charts React components and enterprise module.

  The package now exports `AgCharts` and `AgChartsEnterpriseModule` from a dedicated `./charts` export path. This provides a cleaner separation from the enterprise exports.

  ```typescript
  import {
    AgCharts,
    AgChartsEnterpriseModule,
  } from "@equinor/fusion-framework-react-ag-grid/charts";
  ```

  Note: Charts exports are still available from `./enterprise` for backward compatibility but will be removed in a future minor release.

  Fixes: https://github.com/equinor/fusion-framework/issues/747

### Patch Changes

- Updated dependencies [[`7c57951`](https://github.com/equinor/fusion-framework/commit/7c57951c57763f567a1284e81f903dd892a023ed)]:
  - @equinor/fusion-framework-module-ag-grid@34.4.0

## 34.3.0

### Minor Changes

- [#3639](https://github.com/equinor/fusion-framework/pull/3639) [`31f94be`](https://github.com/equinor/fusion-framework/commit/31f94becb9da9387624e8f8ab9e64b0f1a7e3b18) Thanks [@dependabot](https://github.com/apps/dependabot)! - Upgrade AG Grid to 34.3.1 and ag-charts-enterprise to 12.3.1.

  Highlights in AG Grid 34.3.x:

  - Performance and stability improvements in community and enterprise
  - Minor feature refinements; no breaking API changes noted
  - React bindings remain compatible (React 18/19)

  Release notes: https://github.com/ag-grid/ag-grid/releases/tag/v34.3.1

  Consumer impact: dependency upgrades with improved stability/features; public APIs unchanged.

  Related PR: https://github.com/equinor/fusion-framework/pull/3639

### Patch Changes

- Updated dependencies [[`31f94be`](https://github.com/equinor/fusion-framework/commit/31f94becb9da9387624e8f8ab9e64b0f1a7e3b18)]:
  - @equinor/fusion-framework-module-ag-grid@34.3.0

## 34.2.3

### Patch Changes

- [#3686](https://github.com/equinor/fusion-framework/pull/3686) [`d6465bc`](https://github.com/equinor/fusion-framework/commit/d6465bc2787a37465e22964803501e44f6b19517) Thanks [@odinr](https://github.com/odinr)! - Fix repository directory path and reorganize AG Grid dependencies. Move AG Grid packages from peerDependencies to direct dependencies for better compatibility. Add themes export for enhanced theme customization support.

- Updated dependencies [[`d6465bc`](https://github.com/equinor/fusion-framework/commit/d6465bc2787a37465e22964803501e44f6b19517)]:
  - @equinor/fusion-framework-module-ag-grid@34.2.2

## 34.2.2

### Patch Changes

- [#3556](https://github.com/equinor/fusion-framework/pull/3556) [`3522425`](https://github.com/equinor/fusion-framework/commit/3522425790e5ce25e28ba40f3636c4a7168afe5b) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Add React 19 support and AgChartsEnterpriseModule demonstration

  ## React 19 Compatibility

  - **Updated peerDependencies**: AG Grid React package now supports React 17, 18, and 19
  - **Version Range**: Extended React support from `^17.0.0 || ^18.0.0` to `^17.0.0 || ^18.0.0 || ^19.0.0`
  - **Forward Compatibility**: Ensures compatibility with latest React features and improvements

  ## Enhanced AG Grid Cookbook

  Enhanced the AG Grid cookbook with comprehensive charts functionality demonstration:

  ### New Features

  - **Charts Enterprise Tab**: Added dedicated tab showcasing AgChartsEnterpriseModule integration
  - **Interactive Demo**: Real-world sales data with chart creation instructions
  - **Business Scenarios**: Multiple chart examples including:
    - Total Sales by Region (bar chart)
    - Market Share by Region (pie chart)
    - Quarterly Sales Chart (multi-series column chart)

  ### Components Added

  - **ChartsExample**: New component demonstrating enterprise charting capabilities
  - **Regional Sales Data**: 7 unique regions with comprehensive sales metrics
  - **Interactive Buttons**: One-click chart generation for different business scenarios

  ### Configuration Updates

  - **AgChartsEnterpriseModule**: Added to module configuration alongside existing enterprise modules
  - **Chart-Optimized Data**: Structured data for effective chart demonstrations
  - **Enhanced Grid Props**: Simplified configuration focusing on charting capabilities

  ## Usage

  The cookbook now provides a complete reference for integrating AG Charts Enterprise features:

  - Interactive chart creation via context menu and buttons
  - Multiple chart types (bar, column, pie) demonstration
  - Data filtering and aggregation examples
  - Enterprise chart features showcase

  This serves as both a functional demo and implementation reference for developers using AG Grid with enterprise charting in React 19 applications.

- [#3556](https://github.com/equinor/fusion-framework/pull/3556) [`3522425`](https://github.com/equinor/fusion-framework/commit/3522425790e5ce25e28ba40f3636c4a7168afe5b) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Add AgChartsEnterpriseModule support for charting

  - **Added AgChartsEnterpriseModule export**: Now available from `@equinor/fusion-framework-react-ag-grid/enterprise`
  - **New dependency**: Added `ag-charts-enterprise` as direct dependency (12.2.0)
  - Updated enterprise.ts to include AG Charts Enterprise module alongside existing AG Grid enterprise modules

  ## Usage

  Users can now import and use the AgChartsEnterpriseModule for advanced charting features:

  ```ts
  import {
    IntegratedChartsModule,
    AgChartsEnterpriseModule,
  } from "@equinor/fusion-framework-react-ag-grid/enterprise";

  // Use in AG Grid configuration
  enableAgGrid(configurator, (builder) => {
    builder.addModule(IntegratedChartsModule.with(AgChartsEnterpriseModule));
  });
  ```

## 34.2.1

### Patch Changes

- [#3357](https://github.com/equinor/fusion-framework/pull/3357) [`e24cd15`](https://github.com/equinor/fusion-framework/commit/e24cd15175a322cbdd4d40a5dfa9933a3f55d624) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated ag-grid dependencies to version 34.2.0

  - Updated ag-grid-community from 34.1.2 to 34.2.0
  - Updated ag-grid-enterprise from 34.1.2 to 34.2.0
  - Updated ag-grid-react from 34.1.2 to 34.2.0

  This patch update includes bug fixes and improvements. See the [ag-grid changelog](https://www.ag-grid.com/changelog/?fixVersion=34.2.0) for detailed release notes.

  **Key changes in 34.2.0:**

  - RTI-3075: Ensure API stop/cancel succeed
  - RTI-3073: Enter during batch shouldn't end batch
  - RTI-3070: Only create strategies when editing
  - RTI-3054: Ensure API call succeeds
  - Various bug fixes and improvements

- Updated dependencies [[`e24cd15`](https://github.com/equinor/fusion-framework/commit/e24cd15175a322cbdd4d40a5dfa9933a3f55d624)]:
  - @equinor/fusion-framework-module-ag-grid@34.2.1

## 34.0.2

### Patch Changes

- [#3281](https://github.com/equinor/fusion-framework/pull/3281) [`34aa93c`](https://github.com/equinor/fusion-framework/commit/34aa93cdbba337797ec20391390a5ca1038b6006) Thanks [@dependabot](https://github.com/apps/dependabot)! - - Updates `ag-grid-community` from 34.1.1 to 34.1.2
  - Updates `ag-grid-enterprise` from 34.1.1 to 34.1.2
- Updated dependencies [[`34aa93c`](https://github.com/equinor/fusion-framework/commit/34aa93cdbba337797ec20391390a5ca1038b6006)]:
  - @equinor/fusion-framework-module-ag-grid@34.1.2

## 34.0.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-ag-grid@35.0.0

## 34.0.0

### Major Changes

- [`be5b478`](https://github.com/equinor/fusion-framework/commit/be5b4782928824e3d479f5e23ea66f46a45f6c5d) Thanks [@odinr](https://github.com/odinr)! - Upgrade ag-grid from version 33.2.4 to 34.1.1.

## 33.3.0

### Minor Changes

- [#3268](https://github.com/equinor/fusion-framework/pull/3268) [`7ef5afc`](https://github.com/equinor/fusion-framework/commit/7ef5afc96a8c2cebecedc85703be820d84e3885a) Thanks [@odinr](https://github.com/odinr)! - Upgrade `ag-grid` from version 33.2.4 to 34.1.1.

  > this upgrade may include new features, bug fixes, and breaking changes. Please review the ag-grid release notes for details: https://github.com/ag-grid/ag-grid/releases

### Patch Changes

- Updated dependencies [[`7ef5afc`](https://github.com/equinor/fusion-framework/commit/7ef5afc96a8c2cebecedc85703be820d84e3885a)]:
  - @equinor/fusion-framework-module-ag-grid@34.1.0

## 33.2.8

### Patch Changes

- [#3176](https://github.com/equinor/fusion-framework/pull/3176) [`3ac52b3`](https://github.com/equinor/fusion-framework/commit/3ac52b3c74a8b2d860346fe3ae35b5d02354d27b) Thanks [@EdwardBrunton](https://github.com/EdwardBrunton)! - Exports AgGridReactProps to allow consumers to use ag-grid-react without installing the package directly

## 33.2.7

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions

  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

## 33.2.6

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module-ag-grid@34.0.2

## 33.2.5

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module-ag-grid@34.0.1

## 33.2.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-ag-grid@34.0.0

## 33.2.3

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module-ag-grid@33.2.3

## 33.2.2

### Patch Changes

- [#2998](https://github.com/equinor/fusion-framework/pull/2998) [`2261a46`](https://github.com/equinor/fusion-framework/commit/2261a46407f186f219270f46fb0414a0ac08d754) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update deps `ag-grid-community`, `ag-grid-enterprise` and `ag-grid-react` to 33.2.4

- [#2966](https://github.com/equinor/fusion-framework/pull/2966) [`f1aabc3`](https://github.com/equinor/fusion-framework/commit/f1aabc3729ffce35fc510ea690418067e0cc8ab0) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump the ag-grid from 33.2.1 to 33.2.2

- Updated dependencies [[`2261a46`](https://github.com/equinor/fusion-framework/commit/2261a46407f186f219270f46fb0414a0ac08d754), [`f1aabc3`](https://github.com/equinor/fusion-framework/commit/f1aabc3729ffce35fc510ea690418067e0cc8ab0)]:
  - @equinor/fusion-framework-module-ag-grid@33.2.2

## 33.2.1

### Patch Changes

- Updated dependencies [[`40127f5`](https://github.com/equinor/fusion-framework/commit/40127f59d3b88adc17fad944ba5589eefb739ca8)]:
  - @equinor/fusion-framework-module-ag-grid@33.2.1

## 33.2.0

### Minor Changes

- [#2925](https://github.com/equinor/fusion-framework/pull/2925) [`fc54cdf`](https://github.com/equinor/fusion-framework/commit/fc54cdfcacc8b05ffb1c024478133f414f73de19) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: update ag-grid to v33.2.1

### Patch Changes

- Updated dependencies [[`fc54cdf`](https://github.com/equinor/fusion-framework/commit/fc54cdfcacc8b05ffb1c024478133f414f73de19)]:
  - @equinor/fusion-framework-module-ag-grid@33.2.0

## 33.1.2

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237)]:
  - @equinor/fusion-framework-module-ag-grid@33.1.2

## 33.1.1

### Patch Changes

- Updated dependencies [[`6eacdcc`](https://github.com/equinor/fusion-framework/commit/6eacdccbe29ed0da21a217f6e593e39e29de3eea)]:
  - @equinor/fusion-framework-module-ag-grid@33.1.1

## 33.1.0

### Minor Changes

- [#2859](https://github.com/equinor/fusion-framework/pull/2859) [`78ec0ed`](https://github.com/equinor/fusion-framework/commit/78ec0edcf9d3578a79654696c6fdaaefd59b5fe4) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump the ag-grid from 33.0.3 to 33.1.1

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`78ec0ed`](https://github.com/equinor/fusion-framework/commit/78ec0edcf9d3578a79654696c6fdaaefd59b5fe4), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module-ag-grid@33.1.0

## 33.0.1

### Patch Changes

- Updated dependencies [[`92bbb30`](https://github.com/equinor/fusion-framework/commit/92bbb30954b87d9fec19411e698916ff81224933)]:
  - @equinor/fusion-framework-module-ag-grid@33.0.2

## 33.0.0

### Major Changes

- [#2802](https://github.com/equinor/fusion-framework/pull/2802) [`6277eef`](https://github.com/equinor/fusion-framework/commit/6277eefe89444fee150f01c11b1d01348e024ca3) Thanks [@odinr](https://github.com/odinr)! - Created a new package for AG Grid integration with Fusion Framework React.
  This package is a wrapper for `ag-grid-react`, `ag-grid-community` and `ag-grid-enterprise` packages.

  ## Features

  - Consolidated AG Grid dependencies into a single package.
  - Method for enabling Fusion Framework AG Grid module
  - Utilities for extending Fusion themes

  ## Getting started

  To install the package, run:

  ```sh
  pnpm i @equinor/fusion-framework-react-ag-grid
  ```

  To enable the AG Grid module, add the following to your `config.ts`:

  ```ts
  import { enableAgGrid } from "@equinor/fusion-framework-react-ag-grid";

  const configure = (config: Config) => {
    enableAgGrid(config);
  };
  ```

  See more in [packages/react/ag-grid/README.md](https://github.com/equinor/fusion-framework/blob/main/packages/react/ag-grid/README.md)

### Patch Changes

- Updated dependencies [[`6277eef`](https://github.com/equinor/fusion-framework/commit/6277eefe89444fee150f01c11b1d01348e024ca3)]:
  - @equinor/fusion-framework-module-ag-grid@33.0.1

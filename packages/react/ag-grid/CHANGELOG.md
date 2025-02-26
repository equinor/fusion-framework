# @equinor/fusion-framework-react-ag-grid

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

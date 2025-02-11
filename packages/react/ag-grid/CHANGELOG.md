# @equinor/fusion-framework-react-ag-grid

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
    import { enableAgGrid } from '@equinor/fusion-framework-react-ag-grid';

    const configure = (config: Config) => {
        enableAgGrid(config);
    };
    ```

    See more in [packages/react/ag-grid/README.md](https://github.com/equinor/fusion-framework/blob/main/packages/react/ag-grid/README.md)

### Patch Changes

- Updated dependencies [[`6277eef`](https://github.com/equinor/fusion-framework/commit/6277eefe89444fee150f01c11b1d01348e024ca3)]:
    - @equinor/fusion-framework-module-ag-grid@33.0.1

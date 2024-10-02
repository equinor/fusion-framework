# @equinor/fusion-framework-react-widget

## 1.1.17

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework@7.2.8
    -   @equinor/fusion-framework-module-widget@8.0.0
    -   @equinor/fusion-framework-widget@1.1.17
    -   @equinor/fusion-framework-react@7.2.3

## 1.1.16

### Patch Changes

-   Updated dependencies [[`15152e4`](https://github.com/equinor/fusion-framework/commit/15152e413c054a5f57af93211a470c98c7696caa), [`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
    -   @equinor/fusion-framework-widget@1.1.16
    -   @equinor/fusion-framework-module@4.3.5
    -   @equinor/fusion-framework@7.2.7
    -   @equinor/fusion-framework-module-widget@7.0.0
    -   @equinor/fusion-framework-react@7.2.2
    -   @equinor/fusion-framework-react-module@3.1.6

## 1.1.15

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-widget@6.0.4
    -   @equinor/fusion-framework-react@7.2.1
    -   @equinor/fusion-framework-widget@1.1.15
    -   @equinor/fusion-framework@7.2.6

## 1.1.14

### Patch Changes

-   Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9), [`843edd9`](https://github.com/equinor/fusion-framework/commit/843edd96f2a01ebd814766105902977cdc1cdf8e)]:
    -   @equinor/fusion-framework-module@4.3.4
    -   @equinor/fusion-framework-react@7.2.0
    -   @equinor/fusion-framework@7.2.5
    -   @equinor/fusion-framework-module-widget@6.0.3
    -   @equinor/fusion-framework-react-module@3.1.5
    -   @equinor/fusion-framework-widget@1.1.14

## 1.1.13

### Patch Changes

-   Updated dependencies [[`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
    -   @equinor/fusion-framework-module@4.3.3
    -   @equinor/fusion-framework-module-widget@6.0.2
    -   @equinor/fusion-framework-react@7.1.4
    -   @equinor/fusion-framework@7.2.4
    -   @equinor/fusion-framework-widget@1.1.13
    -   @equinor/fusion-framework-react-module@3.1.4

## 1.1.12

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework@7.2.3
    -   @equinor/fusion-framework-module-widget@6.0.1
    -   @equinor/fusion-framework-react@7.1.3
    -   @equinor/fusion-framework-widget@1.1.12

## 1.1.11

### Patch Changes

-   [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

-   [#2320](https://github.com/equinor/fusion-framework/pull/2320) [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee) Thanks [@odinr](https://github.com/odinr)! - Removed the `removeComments` option from the `tsconfig.base.json` file.

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

-   Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
    -   @equinor/fusion-framework-module@4.3.2
    -   @equinor/fusion-framework-react-module@3.1.3
    -   @equinor/fusion-framework-react@7.1.2
    -   @equinor/fusion-framework-module-widget@6.0.0
    -   @equinor/fusion-framework@7.2.2
    -   @equinor/fusion-framework-widget@1.1.11

## 1.1.10

### Patch Changes

-   Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb), [`da9dd83`](https://github.com/equinor/fusion-framework/commit/da9dd83c9352def5365b6c962dc8443589ac9526)]:
    -   @equinor/fusion-framework-module-widget@5.0.1
    -   @equinor/fusion-framework-react@7.1.1
    -   @equinor/fusion-framework-widget@1.1.10
    -   @equinor/fusion-framework@7.2.1

## 1.1.9

### Patch Changes

-   Updated dependencies [[`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8)]:
    -   @equinor/fusion-framework@7.2.0
    -   @equinor/fusion-framework-react@7.1.0
    -   @equinor/fusion-framework-module-widget@5.0.0
    -   @equinor/fusion-framework-widget@1.1.9

## 1.1.8

### Patch Changes

-   Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
    -   @equinor/fusion-framework-module@4.3.1
    -   @equinor/fusion-framework@7.1.8
    -   @equinor/fusion-framework-module-widget@4.0.8
    -   @equinor/fusion-framework-react@7.0.8
    -   @equinor/fusion-framework-react-module@3.1.2
    -   @equinor/fusion-framework-widget@1.1.8

## 1.1.7

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-widget@4.0.7
    -   @equinor/fusion-framework-react@7.0.7
    -   @equinor/fusion-framework@7.1.7
    -   @equinor/fusion-framework-widget@1.1.7

## 1.1.6

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-widget@4.0.6
    -   @equinor/fusion-framework-react@7.0.6
    -   @equinor/fusion-framework@7.1.6
    -   @equinor/fusion-framework-widget@1.1.6

## 1.1.5

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-widget@4.0.5
    -   @equinor/fusion-framework-react@7.0.5
    -   @equinor/fusion-framework@7.1.5
    -   @equinor/fusion-framework-widget@1.1.5

## 1.1.4

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework@7.1.4
    -   @equinor/fusion-framework-module-widget@4.0.4
    -   @equinor/fusion-framework-widget@1.1.4
    -   @equinor/fusion-framework-react@7.0.4

## 1.1.3

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-widget@4.0.3
    -   @equinor/fusion-framework-react@7.0.3
    -   @equinor/fusion-framework-widget@1.1.3
    -   @equinor/fusion-framework@7.1.3

## 1.1.2

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework@7.1.2
    -   @equinor/fusion-framework-module-widget@4.0.2
    -   @equinor/fusion-framework-widget@1.1.2
    -   @equinor/fusion-framework-react@7.0.2

## 1.1.1

### Patch Changes

-   [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

-   Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
    -   @equinor/fusion-framework-react-module@3.1.1
    -   @equinor/fusion-framework-react@7.0.1
    -   @equinor/fusion-framework@7.1.1
    -   @equinor/fusion-framework-widget@1.1.1
    -   @equinor/fusion-framework-module-widget@4.0.1

## 1.1.0

### Minor Changes

-   [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

-   Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
    -   @equinor/fusion-framework-module@4.3.0
    -   @equinor/fusion-framework-react-module@3.1.0
    -   @equinor/fusion-framework-react@7.0.0
    -   @equinor/fusion-framework-module-widget@4.0.0
    -   @equinor/fusion-framework@7.1.0
    -   @equinor/fusion-framework-widget@1.1.0

## 1.0.3

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework@7.0.33
    -   @equinor/fusion-framework-react@6.0.5
    -   @equinor/fusion-framework-widget@1.0.32

## 1.0.2

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@6.0.4
    -   @equinor/fusion-framework@7.0.32
    -   @equinor/fusion-framework-widget@1.0.31

## 1.0.1

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@6.0.3
    -   @equinor/fusion-framework@7.0.31
    -   @equinor/fusion-framework-widget@1.0.30

## 1.0.0

### Major Changes

-   [#1746](https://github.com/equinor/fusion-framework/pull/1746) [`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86) Thanks [@Noggling](https://github.com/Noggling)! - Widget has had a complete makeover all from the loading Component to the Module itself.
    -   adding events to widget module some include `onWidgetInitialized` , `onWidgetInitializeFailure` and `onWidgetScriptLoaded` and more.
    -   Enabling for multiple widget loading.
    -   Complex overhaul on the widget configuration utilizing th new BaseConfigBuilder class.
    -   Now able to configure baseImport url and widgetClient
    -   New widget component for loading of widgets
    -   Updated documentation

### Patch Changes

-   Updated dependencies [[`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86)]:
    -   @equinor/fusion-framework-module-widget@3.0.0
    -   @equinor/fusion-framework-widget@1.0.29

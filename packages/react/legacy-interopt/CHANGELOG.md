# Change Log

## 5.0.2

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 5.0.0

### Major Changes

-   [#935](https://github.com/equinor/fusion-framework/pull/935) [`710c337f`](https://github.com/equinor/fusion-framework/commit/710c337f2fa4ce834de4673c9805c2e0d07e7fef) Thanks [@odinr](https://github.com/odinr)! - **hotfix** provide legacy app manifest to `createLegacyRender`

    all application should have a `render` method for connecting to the framework, minimal effort for getting end-of-life application to run just a little longer...🌈

    **How to migrate**

    > as a app developer, you should not be using this package! 🙄

    as a portal developer, see code below 😎

    _current_

    ```ts
    // before change
    createLegacyRender(
        manifest.key,
        manifest.AppComponent as React.FunctionComponent,
        legacyFusion // fusion context container
    );
    ```

    _after_

    ```ts
    createLegacyRender(
        manifest, // mutated legacy manifest
        legacyFusion // fusion context container
    );
    ```

## 4.0.14

### Patch Changes

-   [#929](https://github.com/equinor/fusion-framework/pull/929) [`32f4f5a3`](https://github.com/equinor/fusion-framework/commit/32f4f5a3073a703f536188da9f7cb548a1ae6b3e) Thanks [@odinr](https://github.com/odinr)! - **Prevent app registration death spiral**

    Currently the application can register it self with a shared function in the fusion context (window), this modifies the manifest. if the portal and application has different app containers _(which they do if application bundle with a different version of fusion-api than the fusion-cli 🤯)_.

    The 2 containers are connected threw a message bus and localStorage, which batch on `requestAnimationFrame`, which means that if there are miss-match between the application manifests, this would do a tic-toc as fast as your computer can render🧨

    after this update only a few manifest properties will be checked:

    -   `render`
    -   `AppComponent`
    -   `tags`
    -   `category`
    -   `publishedDate`

    > we suggest that application ony register `appKey` plus `render` or `AppComponent` _(☠️ deprecated soon)_
    >
    > ```ts
    > registerApp('my-app', { render: myRenderMethod });
    > ```

## 4.0.13

### Patch Changes

-   [#927](https://github.com/equinor/fusion-framework/pull/927) [`8bc4c5d6`](https://github.com/equinor/fusion-framework/commit/8bc4c5d6ed900e424efcab5572047c106d7ec04a) Thanks [@odinr](https://github.com/odinr)! - update loading of legacy applications

    -   when an application load from CJS with `registerApp` the manifest is mutated and should update in legacy app container
    -   add strict `undefined` check of manifest app component
    -   add check if miss match of appKey, output warn and error if current app is not in scope

## 4.0.12

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   [`d6671bc5`](https://github.com/equinor/fusion-framework/commit/d6671bc526179f18a5290049728c9c5ac72da671) Thanks [@odinr](https://github.com/odinr)! - added missing [exhausted-deps](https://legacy.reactjs.org/docs/hooks-rules.html), this might cause rerender, since `ReactRouterDom.createBrowserHistory` might create history dynamicly.

    this should be tested in portal when updating the `@equinor/fusion-framework-legacy-interopt`

    https://github.com/equinor/fusion-framework/blob/7c0a475174f61ba02570614c237d5cfb3b009cb1/packages/react/legacy-interopt/src/create-legacy-render.tsx#L59

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.10...@equinor/fusion-framework-legacy-interopt@4.0.11) (2023-05-24)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.9...@equinor/fusion-framework-legacy-interopt@4.0.10) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.8...@equinor/fusion-framework-legacy-interopt@4.0.9) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.7...@equinor/fusion-framework-legacy-interopt@4.0.8) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.6...@equinor/fusion-framework-legacy-interopt@4.0.7) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.5...@equinor/fusion-framework-legacy-interopt@4.0.6) (2023-05-12)

### Bug Fixes

-   **legacy-interopt:** fix router ([c904ff2](https://github.com/equinor/fusion-framework/commit/c904ff295ddf0da14f6cb2da77710baae95f05b7))

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.4...@equinor/fusion-framework-legacy-interopt@4.0.5) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.3...@equinor/fusion-framework-legacy-interopt@4.0.4) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.2...@equinor/fusion-framework-legacy-interopt@4.0.3) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 4.0.2 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.0...@equinor/fusion-framework-legacy-interopt@4.0.1) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@3.0.5...@equinor/fusion-framework-legacy-interopt@4.0.0) (2023-05-05)

### ⚠ BREAKING CHANGES

-   **legacy-interopt:** portal need to implement navigation when context changes

### Features

-   **legacy-interopt:** create tooling for legacy app wrapper ([815fead](https://github.com/equinor/fusion-framework/commit/815fead99a9d59ea3bb77b9db25deba4e33a5f0a))
-   **legacy-interopt:** remove navigation from context manager ([4c5518f](https://github.com/equinor/fusion-framework/commit/4c5518f619174b9423f4c751da805d7c88e5cbd4))
-   **react-legacy-interopt:** add support for legacy application to change context ([3262bde](https://github.com/equinor/fusion-framework/commit/3262bde423315d44881b5bca0e03ecbddf3f4a4d))
-   **react-legacy-interopt:** update legacy context app init ([e29cdf2](https://github.com/equinor/fusion-framework/commit/e29cdf2fdb0169b3fd9bbaaa685d47b4bfb677dd))

### Bug Fixes

-   **react-legacy-interopt:** fix fallback url path ([44204c1](https://github.com/equinor/fusion-framework/commit/44204c17a9b025bff041bfebd8f5000cb51b0a20))
-   **react-legacy-interopt:** fix initial context url ([31f113a](https://github.com/equinor/fusion-framework/commit/31f113aebc2ad09e6a446997e95ecfeef3da2fff))
-   **react-legacy-interopt:** fix legacy url resolving ([8082ad5](https://github.com/equinor/fusion-framework/commit/8082ad599c71b07c017fc0a9f32ee0dc21683087))
-   **react-legacy-interopt:** keep leading slash in pathname ([34e9b75](https://github.com/equinor/fusion-framework/commit/34e9b7508e98f938e0996448444173e7a9d641a8))
-   **react-legacy-interopt:** monitor current context changes ([a6b703a](https://github.com/equinor/fusion-framework/commit/a6b703a0d0d31a3d0d20cd52d6a1e4caef022f9d))
-   **react-legacy-interopt:** remove context from suggest url when clearing context ([a04c80c](https://github.com/equinor/fusion-framework/commit/a04c80c94b19b9d9abc27965dec2fb22ed19dedd))

## 3.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 3.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@3.0.2...@equinor/fusion-framework-legacy-interopt@3.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@3.0.1...@equinor/fusion-framework-legacy-interopt@3.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [3.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@3.0.0...@equinor/fusion-framework-legacy-interopt@3.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.22 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.21 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.20 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.18...@equinor/fusion-framework-legacy-interopt@2.1.19) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.18 (2023-04-11)

### Bug Fixes

-   **legacy-interopt:** react 17.0.2 as dependecy not 17.0.52 since it fails fusion-cli ([d7edcd2](https://github.com/equinor/fusion-framework/commit/d7edcd203f6ecaac8baa53425804ecd95e4eace5))

## 2.1.17 (2023-04-11)

### Bug Fixes

-   **legacy-interopt:** react 17.0.2 as dependecy not 17.0.52 since it fails fusion-cli ([d7edcd2](https://github.com/equinor/fusion-framework/commit/d7edcd203f6ecaac8baa53425804ecd95e4eace5))

## [2.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.16...@equinor/fusion-framework-legacy-interopt@2.1.17) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.16 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.14...@equinor/fusion-framework-legacy-interopt@2.1.15) (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.14 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.12...@equinor/fusion-framework-legacy-interopt@2.1.13) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.12 (2023-03-20)

### Bug Fixes

-   **legacyContext:** removed ensurecontextidinurl, and navigation on contextchange ([f56c5d9](https://github.com/equinor/fusion-framework/commit/f56c5d9d001988454c7337e25e93399ce829bb90))

## [2.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.10...@equinor/fusion-framework-legacy-interopt@2.1.11) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.9...@equinor/fusion-framework-legacy-interopt@2.1.10) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.8...@equinor/fusion-framework-legacy-interopt@2.1.9) (2023-03-09)

### Bug Fixes

-   **react/legact-interopt:** check if app manifest exists when current app changes ([8ad2a93](https://github.com/equinor/fusion-framework/commit/8ad2a930d0279cd48929141f4bd20ea975dba6b7))

## [2.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.7...@equinor/fusion-framework-legacy-interopt@2.1.8) (2023-03-06)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.6...@equinor/fusion-framework-legacy-interopt@2.1.7) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.5...@equinor/fusion-framework-legacy-interopt@2.1.6) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.4...@equinor/fusion-framework-legacy-interopt@2.1.5) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.3...@equinor/fusion-framework-legacy-interopt@2.1.4) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.2...@equinor/fusion-framework-legacy-interopt@2.1.3) (2023-02-06)

### Bug Fixes

-   **legacy-iternopt:** remove logging ([76b2cfa](https://github.com/equinor/fusion-framework/commit/76b2cfa47bce288c53f49d856661bb027757347d))

## 2.1.2 (2023-02-06)

### Bug Fixes

-   **navigation:** fix subscription of listener ([f76eee1](https://github.com/equinor/fusion-framework/commit/f76eee19327c9ef805232ca7a3271a4a06e94b6f))

## [2.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.0...@equinor/fusion-framework-legacy-interopt@2.1.1) (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.0.6...@equinor/fusion-framework-legacy-interopt@2.1.0) (2023-02-01)

### Features

-   **legacy-interopt:** allow wrapper befaore main content ([818aa43](https://github.com/equinor/fusion-framework/commit/818aa4309fe3ae9899c7e624c6de3bbf53d8c10b))

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.0.5...@equinor/fusion-framework-legacy-interopt@2.0.6) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.0.3...@equinor/fusion-framework-legacy-interopt@2.0.5) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.0.3...@equinor/fusion-framework-legacy-interopt@2.0.4) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.0.3 (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.0.2 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.0.1 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.6...@equinor/fusion-framework-legacy-interopt@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.6...@equinor/fusion-framework-legacy-interopt@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.5...@equinor/fusion-framework-legacy-interopt@1.0.6) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 1.0.5 (2023-01-19)

### Bug Fixes

-   update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.3...@equinor/fusion-framework-legacy-interopt@1.0.4) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.2...@equinor/fusion-framework-legacy-interopt@1.0.3) (2023-01-16)

### Bug Fixes

-   **legacy-interopt:** register legacy auth token resolve ([24ee4ea](https://github.com/equinor/fusion-framework/commit/24ee4eab42d4f472c8f4c8b959ce73f8f5b4dc1c))
-   **legacy-interopt:** remove yalc ([8f32e52](https://github.com/equinor/fusion-framework/commit/8f32e521de5b0cfde14309ec77f5c7a5e996456b))

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.1...@equinor/fusion-framework-legacy-interopt@1.0.2) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.0...@equinor/fusion-framework-legacy-interopt@1.0.1) (2023-01-16)

### Bug Fixes

-   **legacy-import:** add build references ([5ecea04](https://github.com/equinor/fusion-framework/commit/5ecea04b9db6546751e7bc02ec176596249f5339))

## 1.0.0 (2023-01-16)

### Features

-   **legacy-interopt:** create a package for interopt between framework and fusion-api ([280868a](https://github.com/equinor/fusion-framework/commit/280868a072c6e4c5b28219c7248cbf327fcf6efa))

### Bug Fixes

-   **legacy-interopt:** fix minor typos and imports ([3d36f86](https://github.com/equinor/fusion-framework/commit/3d36f866a17876dd605cb78c57b2be664c2f0f95))

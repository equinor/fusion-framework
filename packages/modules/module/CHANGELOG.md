# Change Log

## 4.2.1

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 4.2.0

### Minor Changes

-   [#902](https://github.com/equinor/fusion-framework/pull/902) [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5) Thanks [@odinr](https://github.com/odinr)! - **Feat(module)** add base module class

    As a module developer there should be a base provider class to extend, which handles basic wireing.

    Some aspects of providers should be the same for all, like `version` handling.

    These new features does not change any existing code, only tooling for future development

-   [#882](https://github.com/equinor/fusion-framework/pull/882) [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898) Thanks [@odinr](https://github.com/odinr)! - Add possibility to add multilevel config for module

    ```ts
    type MyModuleConfig = {
        foo: string;
        bar?: number;
        nested?: { up: boolean };
    };

    class MyModuleConfigurator extends BaseConfigBuilder<MyModuleConfig> {
        public setFoo(cb: ModuleConfigCallback<string>) {
            this._set('foo', cb);
        }

        public setBar(cb: ModuleConfigCallback<number>) {
            this._set('bar', cb);
        }

        public setUp(cb: ModuleConfigCallback<boolean>) {
            this._set('nested.up', cb);
        }
    }
    ```

-   [#902](https://github.com/equinor/fusion-framework/pull/902) [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5) Thanks [@odinr](https://github.com/odinr)! - **Feat(module): add semver**

    In some cases other modules might require features in sibling modules

    ```ts
    if (modules.context.version.satisfies('>=7.2')) {
        // do some code
    } else {
        throw Error(
            'this feature requires ContextModule of 7.2 or higher, please update depencies'
        );
    }
    ```

    Usage:

    -   log telemetry about module usage and outdated application
    -   debug code runtime by knowing version of implementation
    -   write inter-opt when breaking changes accour

### Patch Changes

-   [#907](https://github.com/equinor/fusion-framework/pull/907) [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9) Thanks [@odinr](https://github.com/odinr)! - export `lib` assets:

    -   SemanticVersion
    -   ModuleProvider

-   [#913](https://github.com/equinor/fusion-framework/pull/913) [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d) Thanks [@odinr](https://github.com/odinr)! - **Change base behavior of BaseModuleProvider**

    because of weird limitations of JavaScript, private fields are not accessible until all constructors are initialized (from ancestor to current child).
    This causes the `abstract` init function could not access private members when overridden.

    -   **removed** `init` from `BaseModuleProvider`
        -   _this is a breaking change, but not yet published, yet the `patch` version_
        -   https://github.com/equinor/fusion-framework/blob/43854d9538ade189483c43e04b52eff7e1aa3b0c/packages/modules/module/src/lib/provider/BaseModuleProvider.ts#L31
    -   **added** `provider` sub-scope for package

    > The usage when extending `BaseModuleProvider` is not as 😘, but now works

-   [#907](https://github.com/equinor/fusion-framework/pull/907) [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9) Thanks [@odinr](https://github.com/odinr)! - allow `SemanticVersion` as `version` in ctor args for `BaseModuleProvider`

-   [#924](https://github.com/equinor/fusion-framework/pull/924) [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - fix(module): add config builder callback args to process config method so that

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 4.1.0 (2023-05-23)

### Features

-   **module:** create base configurator ([f94b51e](https://github.com/equinor/fusion-framework/commit/f94b51e53d6ae235456e2ea2b5a82db5aa1a18f0))

## 4.0.0 (2023-05-05)

### ⚠ BREAKING CHANGES

-   **modules:** postInitialize no longer support void function, should not affect any application, only used internally

### Features

-   **modules:** change postInitialize to return ObservableInput ([f1c2f56](https://github.com/equinor/fusion-framework/commit/f1c2f5644c6db2405bf5747a1094548e1723cce1))

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@2.0.0...@equinor/fusion-framework-module@2.0.1) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.3.0...@equinor/fusion-framework-module@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.3.0...@equinor/fusion-framework-module@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.3.0 (2023-01-26)

### Features

-   **module:** add base module config builder ([5a897b7](https://github.com/equinor/fusion-framework/commit/5a897b762a3a9139a1de025d1b1f4ae162079028))

## 1.2.10 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.2.9 (2022-11-11)

### Bug Fixes

-   **module-msal:** await redirect handling ([92686d2](https://github.com/equinor/fusion-framework/commit/92686d2ae054d7f507093b839edb2fe5775c7449))

## 1.2.8 (2022-11-03)

### Bug Fixes

-   **module:** allow debug logging ([315f845](https://github.com/equinor/fusion-framework/commit/315f845e78469a05f27793a56dd281832e7b5dd7))

## 1.2.7 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.2.6 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.2.5 (2022-10-21)

### Bug Fixes

-   **module:** update typing ([9428770](https://github.com/equinor/fusion-framework/commit/9428770eca39d5e5afe00b94d0d09a688fc821b0))

## [1.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.2.3...@equinor/fusion-framework-module@1.2.4) (2022-10-17)

### Bug Fixes

-   expose init interface for modules ([208cf79](https://github.com/equinor/fusion-framework/commit/208cf792b83d093a0c9ba1cdf919b4196e442989))

## 1.2.3 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.2.1...@equinor/fusion-framework-module@1.2.2) (2022-09-29)

### Bug Fixes

-   **module:** update interface for logging ([fc23ea3](https://github.com/equinor/fusion-framework/commit/fc23ea3602c0b18b3f54de584773f76ffe63617c))

## 1.2.1 (2022-09-27)

### Bug Fixes

-   update registering of configuration ([20942ce](https://github.com/equinor/fusion-framework/commit/20942ce1c7a853ea3b55c031a242646e378db8c9))

## 1.2.0 (2022-09-20)

### Features

-   **module:** add has module check ([e32cf7b](https://github.com/equinor/fusion-framework/commit/e32cf7b751854ae8e306bb1d6a84260099752714))

## [1.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.1.2...@equinor/fusion-framework-module@1.1.3) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.1.1...@equinor/fusion-framework-module@1.1.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.1.0...@equinor/fusion-framework-module@1.1.1) (2022-09-13)

### Bug Fixes

-   update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.0.1...@equinor/fusion-framework-module@1.1.0) (2022-09-13)

### Features

-   **module:** allow setting log levels ([017b5b3](https://github.com/equinor/fusion-framework/commit/017b5b34645aa001297f37e7aef5557e9027beee))

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.0.1-next.1...@equinor/fusion-framework-module@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.0.1-next.0...@equinor/fusion-framework-module@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.0.0...@equinor/fusion-framework-module@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.0.0 (2022-09-12)

### ⚠ BREAKING CHANGES

-   **module:** initialize modules now takes configurator object as argument.

### Features

-   **module:** rewrite config to object ([74566f3](https://github.com/equinor/fusion-framework/commit/74566f36eb73c63e1e25df05d89f6f6490dc8272))

### Bug Fixes

-   **module:** await all creation of configs ([25649a4](https://github.com/equinor/fusion-framework/commit/25649a4a6bc4249f2fe996c0bdf735a7ebd42186))
-   **module:** expose logger ([c88574a](https://github.com/equinor/fusion-framework/commit/c88574a61d368841dd648c511d80cad2e5efd7c6))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.4.4...@equinor/fusion-framework-module@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

-   **module:** initialize modules now takes configurator object as argument.

### Features

-   **module:** rewrite config to object ([74566f3](https://github.com/equinor/fusion-framework/commit/74566f36eb73c63e1e25df05d89f6f6490dc8272))

### Bug Fixes

-   **module:** await all creation of configs ([25649a4](https://github.com/equinor/fusion-framework/commit/25649a4a6bc4249f2fe996c0bdf735a7ebd42186))
-   **module:** expose logger ([c88574a](https://github.com/equinor/fusion-framework/commit/c88574a61d368841dd648c511d80cad2e5efd7c6))

## 0.4.4 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 0.4.3 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 0.4.2 (2022-08-19)

### Performance Improvements

-   improve logging of initializing modules ([f313bca](https://github.com/equinor/fusion-framework/commit/f313bca19103356f9d1a2bc09b57d4ff975e46a0))

## [0.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.4.0...@equinor/fusion-framework-module@0.4.1) (2022-08-15)

### Bug Fixes

-   enhance post initialize ([4d10184](https://github.com/equinor/fusion-framework/commit/4d10184bf89d8968360be726ec3885444999ef8f))

# 0.4.0 (2022-08-11)

-   feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

-   module.initialize now has object as arg

# [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.8...@equinor/fusion-framework-module@0.3.0) (2022-08-04)

-   feat(module)!: allow requireing module instnce (#190) ([3a7e67e](https://github.com/equinor/fusion-framework/commit/3a7e67e9accb5185100325c92d5850a44626e498)), closes [#190](https://github.com/equinor/fusion-framework/issues/190)

### BREAKING CHANGES

-   `deps` prop is remove from module object, use `await require('MODULE')`;

-   feat(module)!: allow requireing module instnce

when module initiates it should be allowed to await an required module.

-   add method for awaiting required module
-   add typing for config in initialize fase

-   update service discovery to await http module
-   add service discovery client
-   allow configuration of service discovery client

*   `deps` prop is remove from module object, use `await require('MODULE')`;

*   fix(module-http): add default interface for HttpClientOptions

## 0.2.8 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.6...@equinor/fusion-framework-module@0.2.7) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.5...@equinor/fusion-framework-module@0.2.6) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.4...@equinor/fusion-framework-module@0.2.5) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.3...@equinor/fusion-framework-module@0.2.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.2...@equinor/fusion-framework-module@0.2.3) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.1...@equinor/fusion-framework-module@0.2.2) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 0.2.1 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module

# 0.2.0 (2022-06-10)

### Features

-   **module:** allow modules to have deps ([#128](https://github.com/equinor/fusion-framework/issues/128)) ([2466b1a](https://github.com/equinor/fusion-framework/commit/2466b1ad9d43aa472da9daf8c59b350844c0dae9))

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module

# 0.1.0 (2022-02-07)

### Bug Fixes

-   **react-app:** fix AppConfigurator interface ([e5a8a21](https://github.com/equinor/fusion-framework/commit/e5a8a21ff6a558876e3db9a2596e891d9abea0cd))

### Features

-   add package for creating framework modules ([4020a1e](https://github.com/equinor/fusion-framework/commit/4020a1e444d990e62f5fd4371302fff01b73616c))
-   **framework:** allow registering config, init hooks from config ([5f12718](https://github.com/equinor/fusion-framework/commit/5f1271817b73dccbb5c0b69389877c4278e6920e))
-   **reat-app:** add default modules ([74bf60e](https://github.com/equinor/fusion-framework/commit/74bf60ec07ea9573901d4160de5d4252e6e9c167))

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.0.0...@equinor/fusion-framework-module@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module





## 1.0.0 (2022-09-12)


### ⚠ BREAKING CHANGES

* **module:** initialize modules now takes configurator object as argument.

### Features

* **module:** rewrite config to object ([74566f3](https://github.com/equinor/fusion-framework/commit/74566f36eb73c63e1e25df05d89f6f6490dc8272))


### Bug Fixes

* **module:** await all creation of configs ([25649a4](https://github.com/equinor/fusion-framework/commit/25649a4a6bc4249f2fe996c0bdf735a7ebd42186))
* **module:** expose logger ([c88574a](https://github.com/equinor/fusion-framework/commit/c88574a61d368841dd648c511d80cad2e5efd7c6))



## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.4.4...@equinor/fusion-framework-module@1.0.0-alpha.0) (2022-09-12)


### ⚠ BREAKING CHANGES

* **module:** initialize modules now takes configurator object as argument.

### Features

* **module:** rewrite config to object ([74566f3](https://github.com/equinor/fusion-framework/commit/74566f36eb73c63e1e25df05d89f6f6490dc8272))


### Bug Fixes

* **module:** await all creation of configs ([25649a4](https://github.com/equinor/fusion-framework/commit/25649a4a6bc4249f2fe996c0bdf735a7ebd42186))
* **module:** expose logger ([c88574a](https://github.com/equinor/fusion-framework/commit/c88574a61d368841dd648c511d80cad2e5efd7c6))



## 0.4.4 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module





## 0.4.3 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module





## 0.4.2 (2022-08-19)


### Performance Improvements

* improve logging of initializing modules ([f313bca](https://github.com/equinor/fusion-framework/commit/f313bca19103356f9d1a2bc09b57d4ff975e46a0))





## [0.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.4.0...@equinor/fusion-framework-module@0.4.1) (2022-08-15)


### Bug Fixes

* enhance post initialize ([4d10184](https://github.com/equinor/fusion-framework/commit/4d10184bf89d8968360be726ec3885444999ef8f))





# 0.4.0 (2022-08-11)


* feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))


### BREAKING CHANGES

* module.initialize now has object as arg





# [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.8...@equinor/fusion-framework-module@0.3.0) (2022-08-04)


* feat(module)!: allow requireing module instnce (#190) ([3a7e67e](https://github.com/equinor/fusion-framework/commit/3a7e67e9accb5185100325c92d5850a44626e498)), closes [#190](https://github.com/equinor/fusion-framework/issues/190)


### BREAKING CHANGES

* `deps` prop is remove from module object, use `await require('MODULE')`;

* feat(module)!: allow requireing module instnce

when module initiates it should be allowed to await an required module.

- add method for awaiting required module
- add typing for config in initialize fase

- update service discovery to await http module
- add service discovery client
- allow configuration of service discovery client
* `deps` prop is remove from module object, use `await require('MODULE')`;

* fix(module-http): add default interface for HttpClientOptions





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

* **module:** allow modules to have deps ([#128](https://github.com/equinor/fusion-framework/issues/128)) ([2466b1a](https://github.com/equinor/fusion-framework/commit/2466b1ad9d43aa472da9daf8c59b350844c0dae9))





## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module





# 0.1.0 (2022-02-07)


### Bug Fixes

* **react-app:** fix AppConfigurator interface ([e5a8a21](https://github.com/equinor/fusion-framework/commit/e5a8a21ff6a558876e3db9a2596e891d9abea0cd))


### Features

* add package for creating framework modules ([4020a1e](https://github.com/equinor/fusion-framework/commit/4020a1e444d990e62f5fd4371302fff01b73616c))
* **framework:** allow registering config, init hooks from config ([5f12718](https://github.com/equinor/fusion-framework/commit/5f1271817b73dccbb5c0b69389877c4278e6920e))
* **reat-app:** add default modules ([74bf60e](https://github.com/equinor/fusion-framework/commit/74bf60ec07ea9573901d4160de5d4252e6e9c167))

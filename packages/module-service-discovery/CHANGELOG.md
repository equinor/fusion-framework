# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.5...@equinor/fusion-framework-module-service-discovery@1.0.6) (2022-09-16)


### Bug Fixes

* **module-service-discovery:** fix typing ([29941ba](https://github.com/equinor/fusion-framework/commit/29941baa3682ade7f1e15c0322b7c976488599e6))



## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.4...@equinor/fusion-framework-module-service-discovery@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.3...@equinor/fusion-framework-module-service-discovery@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.2...@equinor/fusion-framework-module-service-discovery@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.1...@equinor/fusion-framework-module-service-discovery@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.1-next.1...@equinor/fusion-framework-module-service-discovery@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.1-next.0...@equinor/fusion-framework-module-service-discovery@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.0...@equinor/fusion-framework-module-service-discovery@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## 1.0.0 (2022-09-12)


### ⚠ BREAKING CHANGES

* **module-service-discovery:** update config

### Bug Fixes

* **module-service-discovery:** update config ([9998981](https://github.com/equinor/fusion-framework/commit/9998981bbcb1ed283dba7c77268e2c55a8e3fb83))



## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.7.2...@equinor/fusion-framework-module-service-discovery@1.0.0-alpha.0) (2022-09-12)


### ⚠ BREAKING CHANGES

* **module-service-discovery:** update config

### Bug Fixes

* **module-service-discovery:** update config ([9998981](https://github.com/equinor/fusion-framework/commit/9998981bbcb1ed283dba7c77268e2c55a8e3fb83))



## 0.7.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## 0.7.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## 0.7.0 (2022-08-29)


### ⚠ BREAKING CHANGES

* rename fetch

* fix(module-service-discovery): update http client consumer

* build: update allowed branches

* build: add conventional commit

* build: use conventionalcommits

* build(module-http): push major

* build: update deps

### Features

* rename fetch method ([#226](https://github.com/equinor/fusion-framework/issues/226)) ([f02df7c](https://github.com/equinor/fusion-framework/commit/f02df7cdd2b9098b0da49c5ea56ac3b6a17e9e32))



## 0.6.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.6.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.6.0...@equinor/fusion-framework-module-service-discovery@0.6.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





# [0.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.5.0...@equinor/fusion-framework-module-service-discovery@0.6.0) (2022-08-11)


* feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))


### BREAKING CHANGES

* module.initialize now has object as arg





# 0.5.0 (2022-08-08)


### Features

* **module-service-discovery:** resolve service to config ([3fa088d](https://github.com/equinor/fusion-framework/commit/3fa088d2ced8136447df6949928f1af9fc83407a))





# [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.12...@equinor/fusion-framework-module-service-discovery@0.4.0) (2022-08-04)


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





## [0.3.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.11...@equinor/fusion-framework-module-service-discovery@0.3.12) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## 0.3.11 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.9...@equinor/fusion-framework-module-service-discovery@0.3.10) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.3.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.8...@equinor/fusion-framework-module-service-discovery@0.3.9) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.7...@equinor/fusion-framework-module-service-discovery@0.3.8) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.6...@equinor/fusion-framework-module-service-discovery@0.3.7) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.3.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.5...@equinor/fusion-framework-module-service-discovery@0.3.6) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.4...@equinor/fusion-framework-module-service-discovery@0.3.5) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.3...@equinor/fusion-framework-module-service-discovery@0.3.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## 0.3.3 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.1...@equinor/fusion-framework-module-service-discovery@0.3.2) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.0...@equinor/fusion-framework-module-service-discovery@0.3.1) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





# [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.2.4...@equinor/fusion-framework-module-service-discovery@0.3.0) (2022-06-13)


### Features

* **nodules-service-discovery:** make http-module dependency ([001dc2a](https://github.com/equinor/fusion-framework/commit/001dc2acbcd2e9a31a19fe9e7c9cd903fb20b2a1))





## 0.2.4 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## 0.2.3 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





## 0.2.2 (2022-05-31)


### Bug Fixes

* **module-service-discovery:** update interfaces ([e1b6864](https://github.com/equinor/fusion-framework/commit/e1b686466ae28204e1d605cce0441dab69787e48))





## 0.2.1 (2022-03-14)


### Bug Fixes

* **service-discovery:** include uri in service ([#46](https://github.com/equinor/fusion-framework/issues/46)) ([3287d69](https://github.com/equinor/fusion-framework/commit/3287d69e23a5bccce8a9e762886340733f9c5447))





# [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.1.1...@equinor/fusion-framework-module-service-discovery@0.2.0) (2022-02-15)


### Features

* **module-service-discovery:** allow custom service discovery ([8917e4e](https://github.com/equinor/fusion-framework/commit/8917e4e3053b824ac8d878b0bfbe6a22efd56c3b))





## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery





# 0.1.0 (2022-02-07)


### Bug Fixes

* allow create callback on configure ([a76ebb0](https://github.com/equinor/fusion-framework/commit/a76ebb057f7b06a7ff737af6e3c29a000a5f0791))
* **module-service-discovery:** add default scopes ([b52af12](https://github.com/equinor/fusion-framework/commit/b52af1236d619f451f8d002a31548fd4706bc6c7))
* **module-service-discovery:** remove base url ([e4740ba](https://github.com/equinor/fusion-framework/commit/e4740ba90f1d499e572023a5a90137669a9d20bc))


### Features

* add module for service discovery ([8714495](https://github.com/equinor/fusion-framework/commit/871449527f06661b0ee784df87bfd6eeef2a37fc))
* **module-service-discovery:** add baseurl config ([2bb569f](https://github.com/equinor/fusion-framework/commit/2bb569f62952c127ca74bc7b818181cb5b3ac986))
* **module-service-discovery:** add method for configuring client ([2b99a21](https://github.com/equinor/fusion-framework/commit/2b99a2119dd0b335ff26f983426f41bf1f8c7511))

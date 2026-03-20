# portal-analytics

## 0.4.9

### Patch Changes

- @equinor/fusion-framework-cli@14.0.2

## 0.4.8

### Patch Changes

- Updated dependencies [9fceca5]
  - @equinor/fusion-framework-cli@14.0.1

## 0.4.7

### Patch Changes

- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [ae92f13]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [aaa3f74]
- Updated dependencies [8f30948]
- Updated dependencies [c123c39]
- Updated dependencies [3de232c]
- Updated dependencies [32bcf83]
  - @equinor/fusion-framework@8.0.0
  - @equinor/fusion-framework-app@11.0.0
  - @equinor/fusion-framework-cli@14.0.0
  - @equinor/fusion-framework-module-analytics@2.0.0
  - @equinor/fusion-framework-module-app@8.0.0
  - @equinor/fusion-framework-module-bookmark@4.0.0
  - @equinor/fusion-framework-module-context@8.0.0
  - @equinor/fusion-framework-module-navigation@7.0.0
  - @equinor/fusion-framework-module-service-discovery@10.0.0
  - @equinor/fusion-framework-react@8.0.0
  - @equinor/fusion-framework-react-app@10.0.0
  - @equinor/fusion-framework-react-module-context@7.0.0
  - @equinor/fusion-observable@9.0.0
  - @equinor/fusion-query@7.0.0

## 0.4.6

### Patch Changes

- Updated dependencies [[`35afdc9`](https://github.com/equinor/fusion-framework/commit/35afdc9d818818f86d2dc8f985466771cd05e7e5)]:
  - @equinor/fusion-framework-cli@13.3.18

## 0.4.5

### Patch Changes

- Updated dependencies [[`e2fb579`](https://github.com/equinor/fusion-framework/commit/e2fb579f82bf54c3631ac736583d6766450d9d8e)]:
  - @equinor/fusion-framework-cli@13.3.17

## 0.4.4

### Patch Changes

- [#4157](https://github.com/equinor/fusion-framework/pull/4157) [`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581) Thanks [@Noggling](https://github.com/Noggling)! - Internal: patch release to align TypeScript types across packages for consistent type compatibility.

- Updated dependencies [[`0a3a23c`](https://github.com/equinor/fusion-framework/commit/0a3a23c230778d64c23fa3008d59d80908d44f45), [`5cc81f5`](https://github.com/equinor/fusion-framework/commit/5cc81f58ad159f9308b1fe028f04629c407dac37), [`9d4d520`](https://github.com/equinor/fusion-framework/commit/9d4d520e9d3c3a3c4ef68a96952fbbc6f6d34720), [`40328c3`](https://github.com/equinor/fusion-framework/commit/40328c3a1489ad29c7bbc03fa283e1daa9a9ee2e), [`0dc5e05`](https://github.com/equinor/fusion-framework/commit/0dc5e058d4adb28ee72a1aac6dbdbc4da84741e9), [`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581), [`390b1b3`](https://github.com/equinor/fusion-framework/commit/390b1b3f014a8af9900a6589911f65f068a1e9c0)]:
  - @equinor/fusion-framework-cli@13.3.16
  - @equinor/fusion-framework-app@10.4.9
  - @equinor/fusion-framework@7.4.13
  - @equinor/fusion-framework-module-analytics@1.0.2
  - @equinor/fusion-framework-module-app@7.4.1
  - @equinor/fusion-framework-module-bookmark@3.0.6
  - @equinor/fusion-framework-module-context@7.0.3
  - @equinor/fusion-framework-module-navigation@6.0.1
  - @equinor/fusion-framework-module-service-discovery@9.1.1
  - @equinor/fusion-framework-react-app@9.0.8
  - @equinor/fusion-framework-react@7.4.20
  - @equinor/fusion-framework-react-module-context@6.2.34
  - @equinor/fusion-observable@8.5.8
  - @equinor/fusion-query@6.0.4

## 0.4.3

### Patch Changes

- Updated dependencies [[`c0f86d0`](https://github.com/equinor/fusion-framework/commit/c0f86d00e939e00e08871aa6a7db3b51b7305220)]:
  - @equinor/fusion-framework-module-analytics@1.0.1
  - @equinor/fusion-framework-react-app@9.0.7
  - @equinor/fusion-framework-cli@13.3.15

## 0.4.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-cli@13.3.14

## 0.4.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@10.4.8
  - @equinor/fusion-framework@7.4.12
  - @equinor/fusion-framework-react-app@9.0.7
  - @equinor/fusion-framework-cli@13.3.13

## 0.4.0

### Minor Changes

- [#4119](https://github.com/equinor/fusion-framework/pull/4119) [`4e2ae5c`](https://github.com/equinor/fusion-framework/commit/4e2ae5cf55c4d7924d40f7cef0f0c563246132e8) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - `ContextSelectedCollector` now accepts an `AppModuleProvider` as a second
  constructor argument and includes the currently active application key
  (`appKey`) in the event attributes.

  This allows analytics consumers to correlate context-change events with the app
  that was active when the context switch occurred.

  **Breaking change for direct users of `ContextSelectedCollector`:** the
  constructor now requires a second argument:

  ```typescript
  // Before
  new ContextSelectedCollector(contextProvider);
  // After
  new ContextSelectedCollector(contextProvider, appProvider);
  ```

  The emitted event attributes schema is extended accordingly:

  ```typescript
  // attributes shape
  {
    previous: ContextMetadata | null | undefined;
    appKey?: string; // newly added — the appKey of the active app at the time of the context change
  }
  ```

### Patch Changes

- Updated dependencies [[`4e2ae5c`](https://github.com/equinor/fusion-framework/commit/4e2ae5cf55c4d7924d40f7cef0f0c563246132e8)]:
  - @equinor/fusion-framework-module-analytics@1.0.0
  - @equinor/fusion-framework-cli@13.3.12
  - @equinor/fusion-framework-react-app@9.0.6

## 0.3.0

### Minor Changes

- [#4103](https://github.com/equinor/fusion-framework/pull/4103) [`cb94ac2`](https://github.com/equinor/fusion-framework/commit/cb94ac24744304a5cf61fc6e19d4217c92fa8a5c) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Change log reader table to show all the log records for each entry.

  Add link to LCI Analytics report for testing PBI reports.

  Also enables the bookmark module for the portal-analytics cookbook - to make
  PBI report load correctly.

### Patch Changes

- Updated dependencies [[`cb94ac2`](https://github.com/equinor/fusion-framework/commit/cb94ac24744304a5cf61fc6e19d4217c92fa8a5c)]:
  - @equinor/fusion-framework-module-analytics@0.3.0
  - @equinor/fusion-framework-cli@13.3.11
  - @equinor/fusion-framework@7.4.11
  - @equinor/fusion-framework-react-app@9.0.6
  - @equinor/fusion-framework-app@10.4.7

## 0.2.21

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react-app@9.0.5
  - @equinor/fusion-framework-cli@13.3.10

## 0.2.20

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react-app@9.0.5
  - @equinor/fusion-framework-cli@13.3.9

## 0.2.19

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@10.4.6
  - @equinor/fusion-framework@7.4.10
  - @equinor/fusion-framework-react-app@9.0.5
  - @equinor/fusion-framework-cli@13.3.8

## 0.2.18

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@10.4.5
  - @equinor/fusion-framework@7.4.9
  - @equinor/fusion-framework-react-app@9.0.4
  - @equinor/fusion-framework-cli@13.3.7

## 0.2.17

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@10.4.4
  - @equinor/fusion-framework@7.4.8
  - @equinor/fusion-framework-react-app@9.0.3
  - @equinor/fusion-framework-cli@13.3.6

## 0.2.16

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@10.4.3
  - @equinor/fusion-framework@7.4.7
  - @equinor/fusion-framework-react-app@9.0.2
  - @equinor/fusion-framework-cli@13.3.5

## 0.2.15

### Patch Changes

- Updated dependencies [[`bd539b5`](https://github.com/equinor/fusion-framework/commit/bd539b5355db0cdec7569e9a09f4e8dce2a9a05c)]:
  - @equinor/fusion-framework-react-app@9.0.1

## 0.2.14

### Patch Changes

- Updated dependencies [[`1b62bd9`](https://github.com/equinor/fusion-framework/commit/1b62bd99410265aff08a3f77996d456d49bfc23d)]:
  - @equinor/fusion-framework-app@10.4.2
  - @equinor/fusion-framework-cli@13.3.4

## 0.2.13

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-cli@13.3.3
  - @equinor/fusion-framework-app@10.4.1
  - @equinor/fusion-framework@7.4.6

## 0.2.12

### Patch Changes

- Updated dependencies [[`5f6831f`](https://github.com/equinor/fusion-framework/commit/5f6831f0032ea5667bb1935883c85b6870133a5d), [`434ce70`](https://github.com/equinor/fusion-framework/commit/434ce707d237b399f8438eebe742641b2a81b11f)]:
  - @equinor/fusion-framework-cli@13.3.2
  - @equinor/fusion-framework-module-service-discovery@9.1.0
  - @equinor/fusion-framework-app@10.4.0
  - @equinor/fusion-framework@7.4.5

## 0.2.11

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@10.3.2
  - @equinor/fusion-framework@7.4.4
  - @equinor/fusion-framework-module-analytics@0.2.3
  - @equinor/fusion-framework-module-app@7.4.0
  - @equinor/fusion-framework-module-context@7.0.2
  - @equinor/fusion-framework-react-app@9.0.0
  - @equinor/fusion-framework-react@7.4.19
  - @equinor/fusion-framework-cli@13.3.1

## 0.2.10

### Patch Changes

- Updated dependencies [[`8719068`](https://github.com/equinor/fusion-framework/commit/8719068b723975db90a1b4bee59808734eb87e20), [`8719068`](https://github.com/equinor/fusion-framework/commit/8719068b723975db90a1b4bee59808734eb87e20)]:
  - @equinor/fusion-framework-cli@13.3.0
  - @equinor/fusion-framework-app@10.3.1
  - @equinor/fusion-framework@7.4.3
  - @equinor/fusion-framework-module-app@7.4.0
  - @equinor/fusion-framework-react-app@9.0.0
  - @equinor/fusion-framework-react@7.4.19

## 0.2.9

### Patch Changes

- Updated dependencies [[`5211e98`](https://github.com/equinor/fusion-framework/commit/5211e98f65edb5292345d45757c5af740e04fffc), [`69b658a`](https://github.com/equinor/fusion-framework/commit/69b658a7bc0741512b0a8fb56d6424405701d336)]:
  - @equinor/fusion-framework-cli@13.2.1

## 0.2.8

### Patch Changes

- Updated dependencies [[`54702d7`](https://github.com/equinor/fusion-framework/commit/54702d78e8d868d490817c015471e11ee648a98a)]:
  - @equinor/fusion-framework-module-app@7.4.0
  - @equinor/fusion-framework-cli@13.2.0

## 0.2.7

### Patch Changes

- Updated dependencies [[`343f5f9`](https://github.com/equinor/fusion-framework/commit/343f5f9cc0acbd8e69b62cc73dda577c9015a620), [`5121c48`](https://github.com/equinor/fusion-framework/commit/5121c48020accfa0b91415ddafb61ea82b3b24b6), [`62be8e9`](https://github.com/equinor/fusion-framework/commit/62be8e95e752e0237a15834facf3c01c7aaabc11), [`343f5f9`](https://github.com/equinor/fusion-framework/commit/343f5f9cc0acbd8e69b62cc73dda577c9015a620)]:
  - @equinor/fusion-framework-module-app@7.3.0
  - @equinor/fusion-framework-app@10.3.0
  - @equinor/fusion-framework-cli@13.2.0
  - @equinor/fusion-framework-module-analytics@0.2.2

## 0.2.6

### Patch Changes

- Updated dependencies [[`d34ebd8`](https://github.com/equinor/fusion-framework/commit/d34ebd82c93acabc88f88e44a725f084af3af5ec), [`37f63d5`](https://github.com/equinor/fusion-framework/commit/37f63d5b9646d0b19c98041e0897d6e1abf69dcf), [`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da)]:
  - @equinor/fusion-framework-cli@13.1.1
  - @equinor/fusion-framework-module-analytics@0.2.1
  - @equinor/fusion-framework-module-app@7.2.2
  - @equinor/fusion-framework-module-service-discovery@9.0.5

## 0.2.5

### Patch Changes

- Updated dependencies [[`4eae807`](https://github.com/equinor/fusion-framework/commit/4eae8070c1ad48eaa7d83a9aecfe5588c6aec41c), [`19ee28f`](https://github.com/equinor/fusion-framework/commit/19ee28fc0f6108fc59f0098b449a511221d2d860), [`8796e99`](https://github.com/equinor/fusion-framework/commit/8796e994173ff1757b557d096a7a95915785dcc1), [`b8ab0b7`](https://github.com/equinor/fusion-framework/commit/b8ab0b72d422996d38fae3e6d82cecfa77686487), [`9fff06a`](https://github.com/equinor/fusion-framework/commit/9fff06a2327fe569a62418eb2b65a0ec9e2e69f5), [`f382399`](https://github.com/equinor/fusion-framework/commit/f38239914070dce4f5701c09f6c28336ad5ed73a), [`15aaa87`](https://github.com/equinor/fusion-framework/commit/15aaa87e6a8b391c0672db0dcdca4c1cac3b50a7)]:
  - @equinor/fusion-framework-cli@13.1.0

## 0.2.4

### Patch Changes

- Updated dependencies [[`037e2e2`](https://github.com/equinor/fusion-framework/commit/037e2e29b6696e8925f054f5a1656ece24e55878), [`528c7d7`](https://github.com/equinor/fusion-framework/commit/528c7d7f4fd93a72878e38843a2efb011a976ae6), [`8667a2d`](https://github.com/equinor/fusion-framework/commit/8667a2db65539b2f04ab99ccc58e255d31618c8f)]:
  - @equinor/fusion-framework-cli@13.0.1
  - @equinor/fusion-query@6.0.3

## 0.2.3

### Patch Changes

- [#3849](https://github.com/equinor/fusion-framework/pull/3849) [`7caca57`](https://github.com/equinor/fusion-framework/commit/7caca573584ae4daedfb17e287d0329c2633771a) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add example usage of `trackFeature` hook with optional `data`

- Updated dependencies [[`7caca57`](https://github.com/equinor/fusion-framework/commit/7caca573584ae4daedfb17e287d0329c2633771a)]:
  - @equinor/fusion-framework-module-analytics@0.2.0
  - @equinor/fusion-framework-react-app@8.2.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`e2d2a76`](https://github.com/equinor/fusion-framework/commit/e2d2a76d08b86c3a9d8783fed1606551df9d5633)]:
  - @equinor/fusion-framework-cli@13.0.0

## 0.2.1

### Patch Changes

- [#3845](https://github.com/equinor/fusion-framework/pull/3845) [`5114ac4`](https://github.com/equinor/fusion-framework/commit/5114ac4f71a60935d0194b9b2766f95adff0ba1e) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Fix tsconfig references

- Updated dependencies [[`5114ac4`](https://github.com/equinor/fusion-framework/commit/5114ac4f71a60935d0194b9b2766f95adff0ba1e)]:
  - @equinor/fusion-framework-module-analytics@0.1.1
  - @equinor/fusion-framework-module-app@7.2.1
  - @equinor/fusion-framework-react-app@8.1.1
  - @equinor/fusion-framework-app@10.2.1
  - @equinor/fusion-framework-cli@12.5.1

## 0.2.0

### Minor Changes

- [#3842](https://github.com/equinor/fusion-framework/pull/3842) [`d38cd60`](https://github.com/equinor/fusion-framework/commit/d38cd60472380d60282c2a5672dc6e3bba3e7ca9) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add cookbook for fusion-framework-module-analytics

### Patch Changes

- Updated dependencies [[`d38cd60`](https://github.com/equinor/fusion-framework/commit/d38cd60472380d60282c2a5672dc6e3bba3e7ca9)]:
  - @equinor/fusion-framework-module-analytics@0.1.0
  - @equinor/fusion-framework-module-app@7.2.0
  - @equinor/fusion-framework-react-app@8.1.0
  - @equinor/fusion-framework-app@10.2.0
  - @equinor/fusion-framework-cli@12.5.0

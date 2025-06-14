# Change Log

## 3.2.14

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module-event@4.3.6
  - @equinor/fusion-framework-react-module@3.1.12

## 3.2.13

### Patch Changes

- Updated dependencies [[`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module-event@4.3.5
  - @equinor/fusion-framework-react-module@3.1.11

## 3.2.12

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-event@4.3.4
  - @equinor/fusion-framework-react-module@3.1.10

## 3.2.11

### Patch Changes

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module-event@4.3.3
  - @equinor/fusion-framework-react-module@3.1.9

## 3.2.10

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237)]:
  - @equinor/fusion-framework-react-module@3.1.8
  - @equinor/fusion-framework-module-event@4.3.2

## 3.2.9

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-react-module@3.1.7
  - @equinor/fusion-framework-module-event@4.3.1

## 3.2.8

### Patch Changes

- Updated dependencies [[`a551b01`](https://github.com/equinor/fusion-framework/commit/a551b01d552b9b9770d1f5132803f92cc91d4bc6)]:
  - @equinor/fusion-framework-module-event@4.3.0

## 3.2.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-event@4.2.4
  - @equinor/fusion-framework-react-module@3.1.6

## 3.2.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-event@4.2.3
  - @equinor/fusion-framework-react-module@3.1.5

## 3.2.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-event@4.2.2
  - @equinor/fusion-framework-react-module@3.1.4

## 3.2.4

### Patch Changes

- Updated dependencies [[`736ef31`](https://github.com/equinor/fusion-framework/commit/736ef310ee101738f9022d581a2b3189b30a2646)]:
  - @equinor/fusion-framework-module-event@4.2.1

## 3.2.3

### Patch Changes

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

- [#2320](https://github.com/equinor/fusion-framework/pull/2320) [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee) Thanks [@odinr](https://github.com/odinr)! - Removed the `removeComments` option from the `tsconfig.base.json` file.

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

- Updated dependencies [[`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`b628e90`](https://github.com/equinor/fusion-framework/commit/b628e90500b62e0185c09eb665ce31025bc9b541), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
  - @equinor/fusion-framework-react-module@3.1.3
  - @equinor/fusion-framework-module-event@4.2.0

## 3.2.2

### Patch Changes

- Updated dependencies [[`9a91bb7`](https://github.com/equinor/fusion-framework/commit/9a91bb737d3452e697c047c0f5c7caa2adfd535d)]:
  - @equinor/fusion-framework-module-event@4.1.2
  - @equinor/fusion-framework-react-module@3.1.2

## 3.2.1

### Patch Changes

- [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework-react-module@3.1.1
  - @equinor/fusion-framework-module-event@4.1.1

## 3.2.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-react-module@3.1.0
  - @equinor/fusion-framework-module-event@4.1.0

## 3.1.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-event@4.0.8
  - @equinor/fusion-framework-react-module@3.0.8

## 3.1.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-event@4.0.7
  - @equinor/fusion-framework-react-module@3.0.7

## 3.1.3

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module-event@4.0.6
  - @equinor/fusion-framework-react-module@3.0.6

## 3.1.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-event@4.0.5
  - @equinor/fusion-framework-react-module@3.0.5

## 3.1.1

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-react-module@3.0.4
  - @equinor/fusion-framework-module-event@4.0.4

## 3.1.0

### Minor Changes

- [#1074](https://github.com/equinor/fusion-framework/pull/1074) [`40f41c58`](https://github.com/equinor/fusion-framework/commit/40f41c58533431a11f9b3ce7c11cd4a7054caa05) Thanks [@odinr](https://github.com/odinr)! - Expose the `IEventModuleProvider`

  Add functionality for controlling which event provider which is used within the event hooks

  - create context for controlling the `IEventModuleProvider`
  - create a hook for using `IEventModuleProvider`,
    - uses the `IEventModuleProvider` from the `EventProvider` context
    - _fallbacks to event module from current module context_
  - update the `useEventHandler` to use `useEventProvider`
    - previously resolving `IEventModuleProvider` from module context
  - create a hook `useEventModuleProvider` which resolves `IEventModuleProvider` from module context

  example app:

  ```tsx
  import { EventProvider, EventConsumer } = from '@equinor/fusion-framework-react-module-event';
  import { useFramework } = from '@equinor/fusion-framework-react-app/framework';
  const Content = () => {
    const framework = useFramework().modules.event;
    return (
      <EventProvider value={framework.modules.event}>
        <EventLogger />
        <InlineEventConsumer />
      <EventProvider>
    );
  };
  ```

  ```tsx
  import { useEventHandler } = from '@equinor/fusion-framework-react-module-event';

  const eventHandler = (event: FrameworkEventMap['some_event']) => {
    console.log(event.detail);
  };

  const EventLogger = () => useEventHandler('some_event', eventHandler);
  ```

  ```tsx
  import { EventConsumer } = from '@equinor/fusion-framework-react-module-event';

  const InlineEventConsumer = () => (
    <EventConsumer>
      {
        (provider) => provider.dispatch(
          'some_event'),
          { detail: { foo: 'bar' } }
      }
    </EventConsumer>
  )
  ```

- [#1076](https://github.com/equinor/fusion-framework/pull/1076) [`7aee3cf0`](https://github.com/equinor/fusion-framework/commit/7aee3cf01764a272e7b0a09045ff674575b15035) Thanks [@odinr](https://github.com/odinr)! - Add hook for observing event streams

  ```ts
  /* observe stream of events */
  const someEvent$ = useEventStream(
    "some_event",
    useCallback((event$) =>
      event$.pipe(
        // only some events
        filter((e) => e.detail.foo === dep.foo),
        // mutate data
        map((e) => e.detail)
      )
    ),
    [dep]
  );
  /* use state of stream */
  const someEvent = useObservableState(someEvent$);
  ```

### Patch Changes

- Updated dependencies [[`7aee3cf0`](https://github.com/equinor/fusion-framework/commit/7aee3cf01764a272e7b0a09045ff674575b15035), [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c)]:
  - @equinor/fusion-framework-module-event@4.0.3

## 3.0.3

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
  - @equinor/fusion-framework-react-module@3.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 3.0.2 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 3.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@2.0.1...@equinor/fusion-framework-react-module-event@2.0.2) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.1.5...@equinor/fusion-framework-react-module-event@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.1.5...@equinor/fusion-framework-react-module-event@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.1.5 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.1.4 (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.1.3 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.1.2 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.1.1 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.1.0 (2022-11-17)

### Features

- update typing of useModule hook ([958dd04](https://github.com/equinor/fusion-framework/commit/958dd0401667e9ebb1a51bced128ae43369cd6c4))

## 1.0.19 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.0.18 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.16...@equinor/fusion-framework-react-module-event@1.0.17) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.0.16 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.14...@equinor/fusion-framework-react-module-event@1.0.15) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.0.14 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.0.13 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.11...@equinor/fusion-framework-react-module-event@1.0.12) (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.0.11 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.9...@equinor/fusion-framework-react-module-event@1.0.10) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.0.9 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.7...@equinor/fusion-framework-react-module-event@1.0.8) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.0.7 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.0.6 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.4...@equinor/fusion-framework-react-module-event@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.3...@equinor/fusion-framework-react-module-event@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.2...@equinor/fusion-framework-react-module-event@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.1...@equinor/fusion-framework-react-module-event@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.1-next.1...@equinor/fusion-framework-react-module-event@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.1-next.0...@equinor/fusion-framework-react-module-event@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@1.0.0...@equinor/fusion-framework-react-module-event@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 1.0.0 (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@0.2.3...@equinor/fusion-framework-react-module-event@1.0.0-alpha.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@0.2.2...@equinor/fusion-framework-react-module-event@0.2.3) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-event@0.2.1...@equinor/fusion-framework-react-module-event@0.2.2) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

## 0.2.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-event

# 0.2.0 (2022-08-23)

### Features

- **react-module-event:** create hook for handling events ([d05f539](https://github.com/equinor/fusion-framework/commit/d05f539cd48d19f113dc5b73a34b225d191796e5))

# @equinor/fusion-framework-module-analytics

## 1.0.3-next.0

### Patch Changes

- Updated dependencies [[`9461f76`](https://github.com/equinor/fusion-framework/commit/9461f768a4e790b94da9fd02272d139d5b354ea8), [`cc9e7eb`](https://github.com/equinor/fusion-framework/commit/cc9e7ebbf1b92d067d8d799e55430d57ccb2e095)]:
  - @equinor/fusion-observable@8.5.9-next.0
  - @equinor/fusion-framework-module-app@7.4.2-next.0
  - @equinor/fusion-framework-module-context@7.0.4-next.0
  - @equinor/fusion-framework-module-event@5.0.2-next.0
  - @equinor/fusion-framework-module-http@7.0.9-next.0
  - @equinor/fusion-framework-module@5.0.7-next.0

## 1.0.2

### Patch Changes

- [#4157](https://github.com/equinor/fusion-framework/pull/4157) [`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581) Thanks [@Noggling](https://github.com/Noggling)! - Internal: patch release to align TypeScript types across packages for consistent type compatibility.

- [#4066](https://github.com/equinor/fusion-framework/pull/4066) [`390b1b3`](https://github.com/equinor/fusion-framework/commit/390b1b3f014a8af9900a6589911f65f068a1e9c0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: update the analytics module OpenTelemetry logging packages to 0.212.x/2.5.1 for upstream exporter and resource handling fixes without changing the module API.

- Updated dependencies [[`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581)]:
  - @equinor/fusion-framework-module-app@7.4.1
  - @equinor/fusion-framework-module-context@7.0.3
  - @equinor/fusion-framework-module-event@5.0.1
  - @equinor/fusion-framework-module-http@7.0.8
  - @equinor/fusion-framework-module@5.0.6
  - @equinor/fusion-observable@8.5.8

## 1.0.1

### Patch Changes

- [#4149](https://github.com/equinor/fusion-framework/pull/4149) [`c0f86d0`](https://github.com/equinor/fusion-framework/commit/c0f86d00e939e00e08871aa6a7db3b51b7305220) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Fix `extractContextMetadata` to use nullish coalescing (`?? undefined`) for
  optional fields (`externalId`, `title`, `source`), ensuring `null` values from
  `ContextItem` are coerced to `undefined` to comply with the Zod context schema.

## 1.0.0

### Major Changes

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

## 0.3.0

### Minor Changes

- [#4103](https://github.com/equinor/fusion-framework/pull/4103) [`cb94ac2`](https://github.com/equinor/fusion-framework/commit/cb94ac24744304a5cf61fc6e19d4217c92fa8a5c) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Change the log processor from SimpleLogProcessor to BatchLogProcessor.

  This will accumulate all events happening within 5 seconds and send them as a
  batch. This will improve performance.

## 0.2.3

### Patch Changes

- Updated dependencies [[`1f5a8e4`](https://github.com/equinor/fusion-framework/commit/1f5a8e475ea30fa1e0f32c7dab885a5a42c50bba)]:
  - @equinor/fusion-framework-module-event@5.0.0
  - @equinor/fusion-framework-module-app@7.4.0
  - @equinor/fusion-framework-module-context@7.0.2

## 0.2.2

### Patch Changes

- [#3948](https://github.com/equinor/fusion-framework/pull/3948) [`62be8e9`](https://github.com/equinor/fusion-framework/commit/62be8e95e752e0237a15834facf3c01c7aaabc11) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: update OpenTelemetry dependencies to latest versions (api-logs, exporter-logs-otlp-http, otlp-exporter-base, otlp-transformer, resources, sdk-logs). Includes bug fixes for circular reference handling in logs and improved error retry logic. No public API changes.

- Updated dependencies [[`343f5f9`](https://github.com/equinor/fusion-framework/commit/343f5f9cc0acbd8e69b62cc73dda577c9015a620), [`122752b`](https://github.com/equinor/fusion-framework/commit/122752b075113b206583ec2c46240997162329b8)]:
  - @equinor/fusion-framework-module-app@7.3.0
  - @equinor/fusion-framework-module-event@4.4.1

## 0.2.1

### Patch Changes

- [#3866](https://github.com/equinor/fusion-framework/pull/3866) [`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: Dedupe zod dependency to 4.3.5

  Deduplicated zod dependency to version 4.3.5 across all packages using `pnpm dedupe`. This aligns all packages (AI plugins upgraded from v3.25.76, other packages consolidated from v4.1.8/v4.1.11) to use the same latest stable version, improving consistency and reducing bundle size. All builds, tests, and linting pass successfully.

- Updated dependencies [[`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da)]:
  - @equinor/fusion-framework-module-app@7.2.2
  - @equinor/fusion-framework-module-http@7.0.6

## 0.2.0

### Minor Changes

- [#3849](https://github.com/equinor/fusion-framework/pull/3849) [`7caca57`](https://github.com/equinor/fusion-framework/commit/7caca573584ae4daedfb17e287d0329c2633771a) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - `trackFeature` now has an extra optional argument for passing additional analytics
  data.

  Example

  ```typescript
  const trackFeature = useTrackFeature();

  // Without extra data
  trackFeature("SomeComponent:loaded");

  // Send additional data
  trackFeature("some:feature:happened", {
    extra: "data",
    foo: "bar",
  });
  ```

## 0.1.1

### Patch Changes

- [#3845](https://github.com/equinor/fusion-framework/pull/3845) [`5114ac4`](https://github.com/equinor/fusion-framework/commit/5114ac4f71a60935d0194b9b2766f95adff0ba1e) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Fix tsconfig references

- Updated dependencies [[`5114ac4`](https://github.com/equinor/fusion-framework/commit/5114ac4f71a60935d0194b9b2766f95adff0ba1e)]:
  - @equinor/fusion-framework-module-app@7.2.1

## 0.1.0

### Minor Changes

- [#3842](https://github.com/equinor/fusion-framework/pull/3842) [`d38cd60`](https://github.com/equinor/fusion-framework/commit/d38cd60472380d60282c2a5672dc6e3bba3e7ca9) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add module fusion-framework-module-analytics

### Patch Changes

- Updated dependencies [[`d38cd60`](https://github.com/equinor/fusion-framework/commit/d38cd60472380d60282c2a5672dc6e3bba3e7ca9)]:
  - @equinor/fusion-framework-module-app@7.2.0

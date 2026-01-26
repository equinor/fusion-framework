# @equinor/fusion-framework-module-analytics

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

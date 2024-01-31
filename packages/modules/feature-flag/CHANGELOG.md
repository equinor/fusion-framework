# @equinor/fusion-framework-module-feature-flag

## 1.0.0

### Major Changes

- [#1747](https://github.com/equinor/fusion-framework/pull/1747) [`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e) Thanks [@odinr](https://github.com/odinr)! - - removed function `enableCgi`, must be enabled by adding plugin _(see [URL](#url))_

  - removed function `enableApi`, must be enabled by adding plugin _(see [Local](#local))_
  - added ability to provide order _(`int`)_ to the plugin

    - initial values will be merged in the order which plugins are sorted by

  - added getter for current features
  - added function for providing callback handler of `onFeatureToggle`
  - simplified `getFeature`
    - now only takes key of feature for selection
    - will now return the feature flag from current state
    - allow value type hint in template
  - simplified `getFeatures`
    - will now return the feature flags from current state
  - added `EventModule`
    - `onFeatureFlagToggle` - before feature is toggled _(cancelable)_
    - `onFeatureFlagsToggled` - after features are toggled _(state has changed)_

  > [!CAUTION] > `getFeature` and `getFeatures` no longer returns a stream, but current state.
  > See [Selectors](#selectors)

  removed plugin CGI, since confusing naming, see [URL](#url)

  ```ts
  featureConfigurator.addPlugin(
    /** array of IFeatureFlag */
    createUrlPlugin(flags),
  );
  ```

  > [!WARNING]
  > the new url plugin does not have any storage, see [Local](#local)

  Added a plugin for handling local flags _(store toggle state to session or local storage)_

  ```ts
  featureConfigurator.addPlugin(
    createLocalStoragePlugin(flags, {
      name: `uniq-name`,
      // type: 'local' | 'local'
    }),
  );
  ```

  > [!TIP]
  > session storage kan be enabled by options

  renamed and refactored feature flag control by URL

  > [!IMPORTANT]
  > URL plugin should should only have keys of features to toggle, this plugin is meant in peer with either `API` or `local`

  simplified usage by removing required `name`

  > [!WARNING]
  > the `namespace` must be uniq for each implementation

  moved selectors from `FeatureFlagProvider.selector.ts`

  ```ts
  import { findFeature } from "@equinor/fusion-framework-module-feature-flag/selectors";
  const feature$ = provider.feature$.pipe(findFeature("my-feature"));
  ```

  ```ts
  import { filterFeatures } from "@equinor/fusion-framework-module-feature-flag/selectors";
  const features$ = provider.feature$.pipe(filterFeatures((x) => x.enabled));
  ```

## 0.0.1

### Patch Changes

- [#1215](https://github.com/equinor/fusion-framework/pull/1215) [`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d) Thanks [@odinr](https://github.com/odinr)! - Adding PersonSidesheet to cli with featuretoggler

- [#1215](https://github.com/equinor/fusion-framework/pull/1215) [`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d) Thanks [@odinr](https://github.com/odinr)! - - Added imports for createApiPlugin and createCgiPlugin from the ./plugins module.
  - Updated the IFeatureFlagConfigurator interface with new method signatures.
    - The addPlugin method now has a JSDoc comment describing its usage.
    - The enableCgi method now has a JSDoc comment and parameter description.
    - The enableApi method now has a JSDoc comment and parameter description.
  - Modified the FeatureFlagConfigurator class:
    - Added implemented interface IFeatureFlagConfigurator.
    - Added a private property #plugins as an array of FeatureFlagPluginConfigCallback.
    - Updated the addPlugin method to append the new plugin handler to the #plugins array.
    - Added the enableCgi method, which calls createCgiPlugin with the passed arguments and adds the result to the #plugins array.
    - Added the enableApi method, which does the same for createApiPlugin.
    - Updated the \_processConfig method with additional type annotations and comments.
    - Added a JSDoc comment for the plugins$ observable.
    - Added a JSDoc comment for the initial$ observable.
    - Added a JSDoc comment for the config$ observable.
    - Updated the return statement to return config$.

---
"@equinor/fusion-framework-module-feature-flag": major
---

- removed function `enableCgi`, must be enabled by adding plugin _(see [URL](#url))_
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

> [!CAUTION] 
> `getFeature` and `getFeatures` no longer returns a stream, but current state.
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

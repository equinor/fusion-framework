---
'@equinor/fusion-framework-legacy-interopt': major
---

**hotfix** provide legacy app manifest to `createLegacyRender`

all application should have a `render` method for connecting to the framework, minimal effort for getting end-of-life application to run just a little longer...🌈

__How to migrate__

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